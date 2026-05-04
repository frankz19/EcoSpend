import { getDatabase } from "../data/database/database";
import { Validators } from "../utils/validators";

const db = getDatabase();

export interface TransactionWithDetails {
    id: number;
    account_id: number;
    category_id: number;
    amount: number;
    exchange_rate: number;
    description: string;
    date: string;
    created_at: string;
    category_name: string;
    category_icon: string;
    category_color: string;
    category_type: 'Ingreso' | 'Gasto';
    account_name: string;
    account_currency: 'USD' | 'VES' | 'COP' | 'EUR';
}

export interface DashboardSummary {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
}

export const TransactionService = {
    createTransaction: async (
        accountId: number,
        categoryId: number,
        amount: number,
        exchangeRate: number,
        description: string,
        date: string
    ): Promise<{ success: boolean; warning?: string; error?: string }> => {
        const validation = Validators.validateTransactionForm(amount, new Date(date), description);
        if (!validation.isValid) return { success: false, error: validation.errorMessage };

        try {
            let warningMessage: string | undefined = undefined; 

            await db.withTransactionAsync(async () => {
                const cat = await db.getFirstAsync<{ type: string, limit_amount: number, name: string }>(
                    'SELECT type, limit_amount, name FROM Categories WHERE id = ?', [categoryId]
                );
                if (!cat) throw new Error('CAT_NOT_FOUND');

                if (cat.type === 'Gasto') {
                    const account = await db.getFirstAsync<{ current_balance: number }>(
                        'SELECT current_balance FROM Accounts WHERE id = ?', [accountId]
                    );
                    if (account && account.current_balance < amount) {
                        throw new Error('SALDO_INSUFICIENTE');
                    }

                    if (cat.limit_amount > 0) {
                        const monthlySpentRow = await db.getFirstAsync<{ total: number }>(
                            `SELECT COALESCE(SUM(amount / exchange_rate), 0) AS total 
                             FROM Transactions 
                             WHERE category_id = ? 
                             AND strftime('%Y-%m', date) = strftime('%Y-%m', ?)`,
                            [categoryId, date]
                        );

                        const totalSoFar = monthlySpentRow?.total || 0;
                        const amountInUSD = amount / exchangeRate;
                        const totalWithNew = totalSoFar + amountInUSD;

                        if (totalWithNew > cat.limit_amount) {
                            warningMessage = `Has excedido el limite de $${cat.limit_amount} para la categoria ${cat.name}. (Gasto total mes: $${totalWithNew.toFixed(2)})`;
                        }
                    }
                }

                await db.runAsync(
                    'INSERT INTO Transactions (account_id, category_id, amount, exchange_rate, description, date) VALUES (?, ?, ?, ?, ?, ?)',
                    [accountId, categoryId, amount, exchangeRate, description, date]
                );

                const balanceChange = cat.type === 'Ingreso' ? amount : -amount;
                await db.runAsync(
                    'UPDATE Accounts SET current_balance = current_balance + ? WHERE id = ?',
                    [balanceChange, accountId]
                );
            });

            return { success: true, warning: warningMessage };
        } catch (error: any) {
            if (error?.message === 'SALDO_INSUFICIENTE') {
                return { success: false, error: 'Saldo insuficiente en la cuenta seleccionada.' };
            }
            return { success: false, error: 'No se pudo guardar la transaccion.' };
        }
    },

    getTransactions: async (userId: number, limit = 100): Promise<TransactionWithDetails[]> => {
        try {
            return await db.getAllAsync<TransactionWithDetails>(
                `SELECT
                    t.id, t.account_id, t.category_id, t.amount, t.exchange_rate, t.description, t.date, t.created_at,
                    c.name     AS category_name,
                    c.icon     AS category_icon,
                    c.color    AS category_color,
                    c.type     AS category_type,
                    a.name     AS account_name,
                    a.currency AS account_currency
                FROM Transactions t
                JOIN Categories c ON t.category_id = c.id
                JOIN Accounts   a ON t.account_id  = a.id
                WHERE a.user_id = ?
                ORDER BY t.date DESC, t.created_at DESC
                LIMIT ?`,
                [userId, limit]
            );
        } catch (error) {
            return [];
        }
    },

    getDashboardSummary: async (userId: number): Promise<DashboardSummary> => {
        try {
            const incomeRow = await db.getFirstAsync<{ total: number }>(
                `SELECT COALESCE(SUM(t.amount / t.exchange_rate), 0) AS total
                FROM Transactions t
                JOIN Categories c ON t.category_id = c.id
                JOIN Accounts   a ON t.account_id  = a.id
                WHERE a.user_id = ? AND c.type = 'Ingreso'
                  AND strftime('%Y-%m', t.date) = strftime('%Y-%m', 'now')`,
                [userId]
            );

            const expensesRow = await db.getFirstAsync<{ total: number }>(
                `SELECT COALESCE(SUM(t.amount / t.exchange_rate), 0) AS total
                FROM Transactions t
                JOIN Categories c ON t.category_id = c.id
                JOIN Accounts   a ON t.account_id  = a.id
                WHERE a.user_id = ? AND c.type = 'Gasto'
                  AND strftime('%Y-%m', t.date) = strftime('%Y-%m', 'now')`,
                [userId]
            );

            return {
                totalBalance: 0, 
                monthlyIncome:   incomeRow?.total     ?? 0,
                monthlyExpenses: expensesRow?.total   ?? 0,
            };
        } catch (error) {
            return { totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0 };
        }
    },

    deleteTransaction: async (transactionId: number) => {
        try {
            await db.withTransactionAsync(async () => {
                const tx = await db.getFirstAsync<{ amount: number, account_id: number, type: string }>(
                    `SELECT t.amount, t.account_id, c.type
                    FROM Transactions t
                    JOIN Categories c ON t.category_id = c.id
                    WHERE t.id = ?`,
                    [transactionId]
                );

                if (!tx) throw new Error('TX_NOT_FOUND');

                const adjustment = tx.type === 'Gasto' ? tx.amount : -tx.amount;

                await db.runAsync(
                    'UPDATE Accounts SET current_balance = current_balance + ? WHERE id = ?',
                    [adjustment, tx.account_id]
                );

                await db.runAsync('DELETE FROM Transactions WHERE id = ?', [transactionId]);
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: 'No se pudo eliminar la transaccion' };
        }
    },

    updateTransaction: async (id: number, newData: { amount: number, exchange_rate: number, category_id: number, account_id:number, description: string, date: string }) => {
        const validation = Validators.validateTransactionForm(newData.amount, new Date(newData.date), newData.description);
        if (!validation.isValid) return { success: false, error: validation.errorMessage };

        try {
            await db.withTransactionAsync(async () => {
                const oldTx = await db.getFirstAsync<{ amount: number, account_id: number, type: string }>(
                    `SELECT t.amount, t.account_id, c.type
                    FROM Transactions t
                    JOIN Categories c ON t.category_id = c.id
                    WHERE t.id = ?`,
                    [id]
                );

                if (!oldTx) throw new Error('TX_NOT_FOUND');

                const revertAdjustment = oldTx.type === 'Gasto' ? oldTx.amount : -oldTx.amount;

                const newCat = await db.getFirstAsync<{ type: string }>(
                    'SELECT type FROM Categories WHERE id = ?', [newData.category_id]
                );

                const applyAdjustment = newCat?.type === 'Gasto' ? -newData.amount : newData.amount;

                await db.runAsync(
                    'UPDATE Accounts SET current_balance = current_balance + ? WHERE id = ?',
                    [revertAdjustment + applyAdjustment, oldTx.account_id]
                );

                await db.runAsync(
                    `UPDATE Transactions SET amount = ?, exchange_rate = ?, category_id = ?, account_id = ?, description = ?, date = ? WHERE id = ?`,
                    [newData.amount, newData.exchange_rate, newData.category_id, newData.account_id, newData.description, newData.date, id]
                );
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Error al actualizar la transaccion' };
        }
    },

    getFilteredTransactions: async (
        userId: number, 
        filters: {
            search?: string,
            type?: 'Ingreso' | 'Gasto',
            accountId?: number,
            categoryId?: number,
            startDate?: string,
            endDate?: string
        }
    ): Promise<TransactionWithDetails[]> => {
        try {
            let query = `
                SELECT
                    t.id, t.account_id, t.category_id, t.amount, t.exchange_rate, t.description, t.date, t.created_at,
                    c.name     AS category_name,
                    c.icon     AS category_icon,
                    c.color    AS category_color,
                    c.type     AS category_type,
                    a.name     AS account_name,
                    a.currency AS account_currency
                FROM Transactions t
                JOIN Categories c ON t.category_id = c.id
                JOIN Accounts   a ON t.account_id  = a.id
                WHERE a.user_id = ?
            `;
            
            const params: any[] = [userId];

            if (filters.type) {
                query += ` AND c.type = ?`;
                params.push(filters.type);
            }

            if (filters.accountId) {
                query += ` AND t.account_id = ?`;
                params.push(filters.accountId);
            }

            if (filters.categoryId) {
                query += ` AND t.category_id = ?`;
                params.push(filters.categoryId);
            }

            if (filters.search) {
                query += ` AND (t.description LIKE ? OR c.name LIKE ?)`;
                params.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            query += ` ORDER BY t.date DESC, t.created_at DESC`;

            return await db.getAllAsync<TransactionWithDetails>(query, params);
        } catch (error) {
            return [];
        }
    },
};