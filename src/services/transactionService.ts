import { getDatabase } from "../data/database/database";
import { Validators } from "../utils/validators";

const db = getDatabase();

export interface TransactionWithDetails {
    id: number;
    account_id: number;
    category_id: number;
    amount: number;
    description: string;
    date: string;
    created_at: string;
    category_name: string;
    category_icon: string;
    category_color: string;
    category_type: 'Ingreso' | 'Gasto';
    account_name: string;
    account_currency: 'USD' | 'VES';
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
                if (!cat) throw new Error('Categoría no encontrada');

                if (cat.type === 'Gasto') {
                    const account = await db.getFirstAsync<{ current_balance: number }>(
                        'SELECT current_balance FROM Accounts WHERE id = ?', [accountId]
                    );
                    if (account && account.current_balance < amount) {
                        throw new Error('SALDO_INSUFICIENTE');
                    }

                    if (cat.limit_amount > 0) {
                        const monthlySpentRow = await db.getFirstAsync<{ total: number }>(
                            `SELECT COALESCE(SUM(amount), 0) AS total 
                             FROM Transactions 
                             WHERE category_id = ? 
                             AND strftime('%Y-%m', date) = strftime('%Y-%m', ?)`,
                            [categoryId, date]
                        );

                        const totalSoFar = monthlySpentRow?.total || 0;
                        const totalWithNew = totalSoFar + amount;

                        if (totalWithNew > cat.limit_amount) {
                            warningMessage = `Has excedido el límite de $${cat.limit_amount} para la categoría ${cat.name}. (Gasto total mes: $${totalWithNew.toFixed(2)})`;
                        }
                    }
                }

                await db.runAsync(
                    'INSERT INTO Transactions (account_id, category_id, amount, description, date) VALUES (?, ?, ?, ?, ?)',
                    [accountId, categoryId, amount, description, date]
                );

                const balanceChange = cat.type === 'Ingreso' ? amount : -amount;
                await db.runAsync(
                    'UPDATE Accounts SET current_balance = current_balance + ? WHERE id = ?',
                    [balanceChange, accountId]
                );
            });

            return { 
                success: true, 
                warning: warningMessage 
            };

        } catch (error: any) {
            if (error?.message === 'SALDO_INSUFICIENTE') {
                return { success: false, error: 'Saldo insuficiente en la cuenta seleccionada.' };
            }
            console.error('Error al crear transacción:', error);
            return { success: false, error: 'No se pudo guardar la transacción.' };
        }
    },


    getTransactions: async (userId: number, limit = 100): Promise<TransactionWithDetails[]> => {
        try {
            return await db.getAllAsync<TransactionWithDetails>(
                `SELECT
                    t.id, t.account_id, t.category_id, t.amount, t.description, t.date, t.created_at,
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
            console.error('Error al obtener transacciones:', error);
            return [];
        }
    },


    getDashboardSummary: async (userId: number): Promise<DashboardSummary> => {
        try {
            const balanceRow = await db.getFirstAsync<{ total: number }>(
                'SELECT COALESCE(SUM(current_balance), 0) AS total FROM Accounts WHERE user_id = ?',
                [userId]
            );

            const incomeRow = await db.getFirstAsync<{ total: number }>(
                `SELECT COALESCE(SUM(t.amount), 0) AS total
                FROM Transactions t
                JOIN Categories c ON t.category_id = c.id
                JOIN Accounts   a ON t.account_id  = a.id
                WHERE a.user_id = ? AND c.type = 'Ingreso'
                  AND strftime('%Y-%m', t.date) = strftime('%Y-%m', 'now')`,
                [userId]
            );

            const expensesRow = await db.getFirstAsync<{ total: number }>(
                `SELECT COALESCE(SUM(t.amount), 0) AS total
                FROM Transactions t
                JOIN Categories c ON t.category_id = c.id
                JOIN Accounts   a ON t.account_id  = a.id
                WHERE a.user_id = ? AND c.type = 'Gasto'
                  AND strftime('%Y-%m', t.date) = strftime('%Y-%m', 'now')`,
                [userId]
            );

            return {
                totalBalance:    balanceRow?.total    ?? 0,
                monthlyIncome:   incomeRow?.total     ?? 0,
                monthlyExpenses: expensesRow?.total   ?? 0,
            };
        } catch (error) {
            console.error('Error al obtener resumen:', error);
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

                if (!tx) throw new Error('Transacción no encontrada');

                const adjustment = tx.type === 'Gasto' ? tx.amount : -tx.amount;

                await db.runAsync(
                    'UPDATE Accounts SET current_balance = current_balance + ? WHERE id = ?',
                    [adjustment, tx.account_id]
                );

                await db.runAsync('DELETE FROM Transactions WHERE id = ?', [transactionId]);
            });

            return { success: true };
        } catch (error) {
            console.error('Error al eliminar:', error);
            return { success: false, error: 'No se pudo eliminar la transacción' };
        }
    },


    updateTransaction: async (id: number, newData: { amount: number, category_id: number, description: string, date: string }) => {
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

                if (!oldTx) throw new Error('Transacción original no encontrada');

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
                    `UPDATE Transactions SET amount = ?, category_id = ?, description = ?, date = ? WHERE id = ?`,
                    [newData.amount, newData.category_id, newData.description, newData.date, id]
                );
            });

            return { success: true };
        } catch (error) {
            console.error('Error al actualizar:', error);
            return { success: false, error: 'Error al actualizar la transacción' };
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
                    t.id, t.account_id, t.category_id, t.amount, t.description, t.date, t.created_at,
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

            // Filtro por tipo (Ingreso/Gasto)
            if (filters.type) {
                query += ` AND c.type = ?`;
                params.push(filters.type);
            }

            // Filtro por Cuenta específica
            if (filters.accountId) {
                query += ` AND t.account_id = ?`;
                params.push(filters.accountId);
            }

            // Filtro por Categoría específica
            if (filters.categoryId) {
                query += ` AND t.category_id = ?`;
                params.push(filters.categoryId);
            }

            // Búsqueda por descripción
            if (filters.search) {
                query += ` AND (t.description LIKE ? OR c.name LIKE ?)`;
                params.push(`%${filters.search}%`, `%${filters.search}%`);
            }


            query += ` ORDER BY t.date DESC, t.created_at DESC`;

            return await db.getAllAsync<TransactionWithDetails>(query, params);
        } catch (error) {
            console.error('Error en búsqueda avanzada:', error);
            return [];
        }
    },
    
};