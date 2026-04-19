// src/data/database/schema.ts

export const createTablesQuery = `
-- Habilitar claves foráneas para integridad referencial
PRAGMA foreign_keys = ON;

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE CUENTAS
CREATE TABLE IF NOT EXISTS Accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('Efectivo', 'Banco', 'Tarjeta', 'Otro')) NOT NULL,
    current_balance REAL DEFAULT 0.0 CHECK(current_balance >= 0), -- Evita saldos negativos por error
    currency TEXT DEFAULT 'USD',
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 3. TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS Categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('Ingreso', 'Gasto')) NOT NULL,
    icon TEXT,
    color TEXT,
    user_id INTEGER NOT NULL,
    limit_amount REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4. TABLA DE TRANSACCIONES
CREATE TABLE IF NOT EXISTS Transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0),
    description TEXT,
    date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES Accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE RESTRICT
);

-- 5. TABLA DE RECORDATORIOS (ALARMAS)
CREATE TABLE IF NOT EXISTS Reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    amount REAL,
    due_date DATETIME NOT NULL,
    is_paid INTEGER DEFAULT 0 CHECK(is_paid IN (0, 1)),
    notification_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 6. ÍNDICES DE RENDIMIENTO (Optimización para consultas rápidas)
-- Optimiza la búsqueda de movimientos por fecha (Pantalla Historial)
CREATE INDEX IF NOT EXISTS idx_transaction_date ON Transactions(date);

-- Optimiza el filtrado por categoría (Gráficos de Torta de Gastos/Ingresos)
CREATE INDEX IF NOT EXISTS idx_transaction_category ON Transactions(category_id);

-- Optimiza la carga de transacciones por cuenta específica
CREATE INDEX IF NOT EXISTS idx_transaction_account ON Transactions(account_id);

-- Optimiza la búsqueda de cuentas por usuario
CREATE INDEX IF NOT EXISTS idx_account_user ON Accounts(user_id);

-- Optimiza la carga de recordatorios pendientes por usuario
CREATE INDEX IF NOT EXISTS idx_reminder_user_due ON Reminders(user_id, due_date);
`;