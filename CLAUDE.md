# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Start on Android emulator/device
npm run ios        # Start on iOS simulator
npm run web        # Start in browser
```

There is no test suite configured. TypeScript checking runs through the Expo toolchain.

## Architecture

**EcoSpend** is a React Native personal finance app built with Expo SDK 54 (React Native 0.81, React 19). It uses a custom screen-stack navigator implemented in `App.tsx` — there is no React Navigation; screen transitions are managed with a `currentScreen` string state and a `switch` in `renderScreen()`.

### Data layer

All persistence is local via **expo-sqlite** (`src/data/database/`):

- `schema.ts` — single `CREATE TABLE IF NOT EXISTS` string with all 5 tables: `Users`, `Accounts`, `Categories`, `Transactions`, `Reminders`.
- `database.ts` — opens the DB singleton with `openDatabaseSync`, runs `initDatabase()` which calls `execSync(createTablesQuery)` then applies additive migrations via `ALTER TABLE ... ADD COLUMN` wrapped in try/catch (safe to re-run).

Schema migrations are done inline in `initDatabase()` — new columns are added by appending another try/catch block there. Do not use a versioned migration system.

### Services

All business logic lives in `src/services/` as plain objects (no classes, no DI):

| Service | Responsibility |
|---|---|
| `authService` | Login/register with `Validators` sanitization |
| `transactionService` | CRUD + balance updates inside `withTransactionAsync`; enforces insufficient-balance guard and category monthly limit warnings |
| `accountService` | Account CRUD |
| `categoryService` | Category CRUD with optional `limit_amount` |
| `currencyService` | USD/VES conversion helpers |
| `reminderService` | Reminder CRUD + `expo-notifications` scheduling/cancellation; supports recurrence (`semanal`, `quincenal`, `mensual`, `anual`) |
| `notificationService` | Permission requests for push notifications |
| `validationDuplicates` | Duplicate-detection helpers |

`Validators` (`src/utils/validators.ts`) is used by services before DB writes — always run input through it at the service layer.

### Screen structure

Screens are grouped under `src/screens/` by domain: `auth/`, `accounts/`, `categories/`, `transactions/`, `reports/`, `reminders/`. Each screen receives navigation via callback props (e.g. `onBack`, `onAdd`). The `userId` from login is threaded down as a prop to every authenticated screen.

### Key domain rules

- `Accounts.current_balance` is kept in sync by `transactionService` inside SQLite transactions — never update it directly.
- `Categories.type` is either `'Ingreso'` or `'Gasto'` (Spanish); `Accounts.type` is one of `'Efectivo' | 'Banco' | 'Tarjeta' | 'Otro'`.
- Currency is per-account (`USD` or `VES`); the `currencyService` handles conversion for display.
- Reminders with `reminder_type = 'alarma'` schedule an `expo-notifications` local notification; `'agenda'` entries are display-only calendar items.
