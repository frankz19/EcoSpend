import * as SQLite from 'expo-sqlite';
import { createTablesQuery } from './schema';

const db = SQLite.openDatabaseSync('ecospend.db');

export const initDatabase = async () => {
  db.execSync(`PRAGMA foreign_keys = ON;`);
  db.execSync(createTablesQuery);


  try { db.execSync(`ALTER TABLE Accounts ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';`); } catch (_) {}


  try { db.execSync(`ALTER TABLE Categories ADD COLUMN limit_amount REAL DEFAULT 0;`); } catch (_) {}


  try { db.execSync(`ALTER TABLE Transactions ADD COLUMN exchange_rate REAL DEFAULT 1.0;`); } catch (_) {}


  try { db.execSync(`ALTER TABLE Reminders ADD COLUMN recurrence TEXT DEFAULT 'none';`); } catch (_) {}
};

export const executeTransaction = async (action: () => Promise<void>) => {
  try {
    await db.withTransactionAsync(async () => {
      await action();
    });
  } catch (error) {
    console.error("Error de integridad: Transacción abortada.", error);
    throw error;
  }
};

export const getDatabase = () => db;