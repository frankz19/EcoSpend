import { getDatabase } from '../data/database/database';
import { TransactionService } from './transactionService';
import { CategoryService } from './categoryService';

const db = getDatabase();

export type Currency = 'USD' | 'VES' | 'COP' | 'EUR';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: string;
  current_balance: number;
  currency: Currency;
}

export const AccountService = {
  async getAccounts(userId: number): Promise<Account[]> {
    const db = getDatabase();
    return await db.getAllAsync<Account>(
      'SELECT * FROM Accounts WHERE user_id = ?',
      [userId]
    );
  },

  async createAccount(userId: number, name: string, type: string, initialBalance: number, currency: Currency = 'USD', initialExchangeRate: number = 1.0) {
    const db = getDatabase();
    const result = await db.runAsync(
      'INSERT INTO Accounts (user_id, name, type, current_balance, currency) VALUES (?, ?, ?, ?, ?)',
      [userId, name, type, 0.0, currency]
    );

    const newAccountId = result.lastInsertRowId;

    if (initialBalance !== 0) {
      let cat = await db.getFirstAsync<{id: number}>('SELECT id FROM Categories WHERE name = ? AND user_id = ?', ['Saldo Inicial', userId]);
      
      if (!cat) {
        await CategoryService.createCategory(userId, 'Saldo Inicial', 'Ingreso', 'bank', '#9E9E9E', 0);
        cat = await db.getFirstAsync<{id: number}>('SELECT id FROM Categories WHERE name = ? AND user_id = ?', ['Saldo Inicial', userId]);
      }

      if (cat) {
        await TransactionService.createTransaction(
          newAccountId,
          cat.id,
          Math.abs(initialBalance), 
          initialExchangeRate,
          'Saldo inicial de cuenta',
          new Date().toISOString()
        );
      }
    }
    return result;
  },

  updateAccount: async (id: number, newName: string) => {
    try {
      await db.runAsync(
        'UPDATE Accounts SET name = ? WHERE id = ?',
        [newName, id]
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: 'No se pudo renombrar la cuenta' };
    }
  },

  deleteAccount: async (id: number) => {
    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM Accounts WHERE id = ?', [id]);
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al eliminar la cuenta' };
    }
  }
};