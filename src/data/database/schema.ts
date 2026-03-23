// src/data/database/schema.ts

export const createTablesQuery = `
  PRAGMA foreign_keys = ON;

  -- Tabla de Usuario
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'VES'
  );

  -- Tabla de Cuentas
  CREATE TABLE IF NOT EXISTS Accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    current_balance REAL NOT NULL DEFAULT 0 CHECK (current_balance >= 0),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  );

  -- Tabla de Categorías
  CREATE TABLE IF NOT EXISTS Categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT,
    type TEXT NOT NULL CHECK(type IN ('Ingreso', 'Gasto')),
    icon TEXT,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  );

  -- Tabla de Transacciones
  CREATE TABLE IF NOT EXISTS Transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE
  );
`;