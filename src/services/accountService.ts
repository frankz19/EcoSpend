import { getDatabase } from '../data/database/database';
import { TransactionService } from './transactionService';
import { CategoryService } from './categoryService';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: string;
  current_balance: number;
}

export const AccountService = {
  async getAccounts(userId: number): Promise<Account[]> {
    const db = getDatabase();
    return await db.getAllAsync<Account>(
      'SELECT * FROM Accounts WHERE user_id = ?',
      [userId]
    );
  },

  async createAccount(userId: number, name: string, type: string, initialBalance: number) {
    const db = getDatabase();
    const result = await db.runAsync(
      'INSERT INTO Accounts (user_id, name, type, current_balance) VALUES (?, ?, ?, ?)',
      [userId, name, type, initialBalance]
    );

    if (initialBalance !== 0) {
      let cat = await db.getFirstAsync<{id: number}>('SELECT id FROM Categories WHERE name = ? AND user_id = ?', ['Saldo Inicial', userId]);
      
      if (!cat) {
        await CategoryService.createCategory(userId, 'Saldo Inicial', 'Ingreso', 'A', '#9E9E9E');
        cat = await db.getFirstAsync<{id: number}>('SELECT id FROM Categories WHERE name = ? AND user_id = ?', ['Saldo Inicial', userId]);
      }

      if (cat) {
        await TransactionService.createTransaction(
          result.lastInsertRowId,
          cat.id,
          initialBalance,
          'Saldo inicial de cuenta',
          new Date().toISOString()
        );
      }
    }
    return result;
  }
};