import * as SQLite from 'expo-sqlite';
import { createTablesQuery } from './schema';

const db = SQLite.openDatabaseSync('ecospend.db');

export const initDatabase = async () => {
  db.execSync(createTablesQuery);

  // Migraciones: ALTER TABLE falla si la columna ya existe — se ignora por migración
  try {
    db.execSync(`ALTER TABLE Accounts ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';`);
  } catch (_) {}

  try {
    db.execSync(`ALTER TABLE Categories ADD COLUMN limit_amount REAL DEFAULT 0;`);
  } catch (_) {}

  try {
    db.execSync(`ALTER TABLE Reminders ADD COLUMN reminder_type TEXT DEFAULT 'alarma';`);
  } catch (_) {}

  try {
    db.execSync(`ALTER TABLE Reminders ADD COLUMN recurrence TEXT;`);
  } catch (_) {}
};

export const getDatabase = () => db;