# 🗄️ Esquema de Base de Datos - EcoSpend

Este documento describe la estructura de la base de datos relacional de **EcoSpend**, implementada en **SQLite**. El diseño sigue las reglas de normalización para asegurar la integridad de los datos financieros.

---
## 👤 Tabla: Users

Almacena la información de perfil y credenciales del usuario.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :---: | :--- | :--- |
| **id** | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único. |
| **username** | TEXT | NOT NULL | Nombre del usuario. |
| **email** | TEXT | UNIQUE NOT NULL | Correo electrónico (identificador de login). |
| **password** | TEXT | NOT NULL | Hash de la contraseña. |

---
## 💳 Tabla: Accounts

Representa los orígenes o destinos de fondos (Bancos, Efectivo, etc.).

| Campo | Tipo | Restricciones | Descripción |
| :--- | :---: | :--- | :--- |
| **id** | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único. |
| **user_id** | INTEGER | FOREIGN KEY (Users.id) | Propietario de la cuenta. |
| **name** | TEXT | NOT NULL | Nombre de la cuenta (ej. "Banesco"). |
| **type** | TEXT | NOT NULL | Tipo de cuenta (Efectivo, Débito). |
| **current_balance** | REAL | DEFAULT 0.0 | Saldo actual en moneda local. |
| **currency** | TEXT | CHECK (USD, VES, COP, EUR) | Moneda base de la cuenta. |

---

## 🏷️ Tabla: Categories

Clasificaciones para transacciones.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :---: | :--- | :--- |
| **id** | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único. |
| **user_id** | INTEGER | FOREIGN KEY (Users.id) | Creador de la categoría. |
| **name** | TEXT | NOT NULL | Nombre (ej. "Alimentación"). |
| **icon** | TEXT | NOT NULL | Nombre del glifo del icono. |
| **color** | TEXT | NOT NULL | Código hexadecimal del color. |
| **type** | TEXT | CHECK (Ingreso, Gasto) | Naturaleza de la categoría. |
| **limit_amount** | REAL | DEFAULT 0.0 | Presupuesto máximo mensual (en USD). |

---

## 💸 Tabla: Transactions

El registro histórico de todos los movimientos de dinero.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :---: | :--- | :--- |
| **id** | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único. |
| **account_id** | INTEGER | FOREIGN KEY (Accounts.id) ON DELETE CASCADE | Cuenta afectada. |
| **category_id** | INTEGER | FOREIGN KEY (Categories.id) | Categoría del movimiento. |
| **amount** | REAL | NOT NULL | Monto en moneda original. |
| **exchange_rate** | REAL | NOT NULL | Tasa de cambio respecto al USD en ese momento. |
| **description** | TEXT | - | Nota opcional del usuario. |
| **date** | TEXT | DEFAULT CURRENT_TIMESTAMP | Fecha de la transacción (ISO 8601). |


---

## ⏰ Tabla: Reminders

Programación de pagos y recordatorios recurrentes.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :---: | :--- | :--- |
| **id** | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único. |
| **user_id** | INTEGER | FOREIGN KEY (Users.id) | Propietario del recordatorio. |
| **title** | TEXT | NOT NULL | Título del recordatorio. |
| **amount** | REAL | - | Monto estimado del pago. |
| **due_date** | TEXT | NOT NULL | Fecha y hora programada. |
| **is_paid** | INTEGER | DEFAULT 0 | Estado del pago (0: No, 1: Sí). |
| **recurrence** | TEXT | DEFAULT 'none' | Frecuencia (daily, weekly, monthly, yearly). |
| **notification_id** | TEXT | - | ID interno del sistema de notificaciones. |
