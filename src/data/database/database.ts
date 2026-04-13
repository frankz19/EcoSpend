import * as SQLite from 'expo-sqlite';
import { createTablesQuery } from './schema';

const db = SQLite.openDatabaseSync('ecospend.db');

export const initDatabase = async () => {
  try {
    db.execSync(createTablesQuery);
  } catch (error) {
    console.error(error);
  }
};

export const getDatabase = () => db;