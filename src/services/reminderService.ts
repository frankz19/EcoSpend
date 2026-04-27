import * as Notifications from 'expo-notifications';
import { getDatabase } from '../data/database/database';

export type ReminderType = 'alarma' | 'agenda';
export type Recurrence = 'semanal' | 'quincenal' | 'mensual' | 'anual';

export interface Reminder {
  id: number;
  user_id: number;
  title: string;
  amount: number | null;
  due_date: string;
  is_paid: number;
  notification_id: string | null;
  reminder_type: ReminderType;
  recurrence: Recurrence | null;
}

function computeNextDate(from: Date, recurrence: Recurrence): Date {
  const next = new Date(from);
  switch (recurrence) {
    case 'semanal':    next.setDate(next.getDate() + 7); break;
    case 'quincenal':  next.setDate(next.getDate() + 15); break;
    case 'mensual':    next.setMonth(next.getMonth() + 1); break;
    case 'anual':      next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}

export const ReminderService = {

  async getReminders(userId: number): Promise<Reminder[]> {
    const db = getDatabase();
    return await db.getAllAsync<Reminder>(
      'SELECT * FROM Reminders WHERE user_id = ? ORDER BY due_date ASC',
      [userId]
    );
  },

  async addReminder(
    userId: number,
    title: string,
    amount: number,
    dueDate: Date,
    reminderType: ReminderType = 'alarma',
    recurrence: Recurrence | null = null,
  ) {
    let notificationId = null;

    if (dueDate.getTime() > Date.now()) {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminderType === 'agenda' ? 'Recordatorio de Agenda' : 'Recordatorio de Pago',
          body: `No olvides: ${title} ${amount > 0 ? `($${amount})` : ''}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dueDate,
        },
      });
    }

    const db = getDatabase();
    const result = await db.runAsync(
      'INSERT INTO Reminders (user_id, title, amount, due_date, notification_id, reminder_type, recurrence) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title, amount, dueDate.toISOString(), notificationId, reminderType, recurrence]
    );

    return result;
  },

  async rescheduleReminder(reminder: Reminder) {
    const recurrence = reminder.recurrence;
    const baseDate = new Date(reminder.due_date);
    const nextDate = recurrence
      ? computeNextDate(baseDate, recurrence)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // fallback: +1 mes desde ahora

    await ReminderService.deleteReminder(reminder.id, reminder.notification_id);
    await ReminderService.addReminder(
      reminder.user_id,
      reminder.title,
      reminder.amount ?? 0,
      nextDate,
      reminder.reminder_type,
      recurrence,
    );

    return nextDate;
  },

  async markAsPaid(reminderId: number, notificationId: string | null) {
    const db = getDatabase();
    await db.runAsync('UPDATE Reminders SET is_paid = 1 WHERE id = ?', [reminderId]);

    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  },

  async deleteReminder(reminderId: number, notificationId: string | null) {
    const db = getDatabase();
    await db.runAsync('DELETE FROM Reminders WHERE id = ?', [reminderId]);

    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  },

  async updateReminder(
    reminderId: number,
    oldNotificationId: string | null,
    title: string,
    amount: number,
    dueDate: Date,
    reminderType: ReminderType,
    recurrence: Recurrence | null,
  ) {
    if (oldNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(oldNotificationId);
    }

    let notificationId: string | null = null;
    if (dueDate.getTime() > Date.now()) {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminderType === 'agenda' ? 'Recordatorio de Agenda' : 'Recordatorio de Pago',
          body: `No olvides: ${title} ${amount > 0 ? `($${amount})` : ''}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dueDate,
        },
      });
    }

    const db = getDatabase();
    await db.runAsync(
      'UPDATE Reminders SET title = ?, amount = ?, due_date = ?, notification_id = ?, reminder_type = ?, recurrence = ? WHERE id = ?',
      [title, amount, dueDate.toISOString(), notificationId, reminderType, recurrence, reminderId]
    );
  },
};
