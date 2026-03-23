import * as SQLite from 'expo-sqlite';
import { createTablesQuery } from './schema';

const db = SQLite.openDatabaseSync('ecospend.db');

/**
 * Función que inicializa la base de datos ejecutando el esquema.
 * Debe llamarse en el punto de entrada de la aplicación (App.tsx).
 */
export const initDatabase = () => {
  try {
    db.execSync(createTablesQuery);
    console.log('success');
  } catch (error) {
    console.error('error');
  }
};

export const getDatabase = () => db;