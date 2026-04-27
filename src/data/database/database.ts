import * as SQLite from 'expo-sqlite';
import { createTablesQuery } from './schema';

// Abrimos la conexión de forma síncrona como venías haciendo
const db = SQLite.openDatabaseSync('ecospend.db');

export const initDatabase = async () => {
  //Activación de Foreign Keys
  db.execSync(`PRAGMA foreign_keys = ON;`);

  // Creación de tablas iniciales
  db.execSync(createTablesQuery);

  // Migración para soportar múltiples monedas
  try {
    db.execSync(`ALTER TABLE Accounts ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';`);
  } catch (_) {
    // La columna ya existe, ignoramos el error
  }

  // Migración para presupuestos (límites) en categorías
  try {
    db.execSync(`ALTER TABLE Categories ADD COLUMN limit_amount REAL DEFAULT 0;`);
  } catch (_) {
    // La columna ya existe, ignoramos el error
  }
};

export const executeTransaction = async (action: () => Promise<void>) => {
  try {
    await db.withTransactionAsync(async () => {
      await action();
    });
  } catch (error) {
    console.error("Error de integridad: Transacción abortada.", error);
    throw error; // Re-lanzamos para que la UI pueda manejar el error
  }
};

export const getDatabase = () => db;