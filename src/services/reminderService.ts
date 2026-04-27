import * as Notifications from 'expo-notifications';
import { getDatabase } from '../data/database/database';

export interface Reminder {
  id: number;
  user_id: number;
  title: string;
  amount: number | null;
  due_date: string;
  is_paid: number;
  notification_id: string | null;
  recurrence: string;
}

export const ReminderService = {
  async getReminders(userId: number): Promise<Reminder[]> {
    const db = getDatabase();
    return await db.getAllAsync<Reminder>(
      'SELECT * FROM Reminders WHERE user_id = ? ORDER BY is_paid ASC, due_date ASC',
      [userId]
    );
  },

  async addReminder(userId: number, title: string, amount: number, dueDate: Date, recurrence: string = 'none') {
    let notificationId = null;

    if (dueDate.getTime() > Date.now()) {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio de Pago',
          body: `No olvides pagar: ${title} ${amount > 0 ? `($${amount})` : ''}`,
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
      'INSERT INTO Reminders (user_id, title, amount, due_date, notification_id, recurrence) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, amount, dueDate.toISOString(), notificationId, recurrence]
    );

    return result;
  },

  async markAsPaid(reminder: Reminder) {
    const db = getDatabase();
    
    await db.runAsync('UPDATE Reminders SET is_paid = 1 WHERE id = ?', [reminder.id]);

    if (reminder.notification_id) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notification_id);
    }

    if (reminder.recurrence && reminder.recurrence !== 'none') {
      const nextDate = new Date(reminder.due_date);
      
      if (reminder.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
      if (reminder.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      if (reminder.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      if (reminder.recurrence === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

      await this.addReminder(
        reminder.user_id,
        reminder.title,
        reminder.amount || 0,
        nextDate,
        reminder.recurrence
      );
    }
  },

  async deleteReminder(reminderId: number, notificationId: string | null) {
    const db = getDatabase();
    
    await db.runAsync('DELETE FROM Reminders WHERE id = ?', [reminderId]);

    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  }
};