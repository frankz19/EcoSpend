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
}

export const ReminderService = {

  async getReminders(userId: number): Promise<Reminder[]> {
    const db = getDatabase();
    return await db.getAllAsync<Reminder>(
      'SELECT * FROM Reminders WHERE user_id = ? ORDER BY due_date ASC',
      [userId]
    );
  },

  async addReminder(userId: number, title: string, amount: number, dueDate: Date) {
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
      'INSERT INTO Reminders (user_id, title, amount, due_date, notification_id) VALUES (?, ?, ?, ?, ?)',
      [userId, title, amount, dueDate.toISOString(), notificationId]
    );

    return result;
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
  }
};