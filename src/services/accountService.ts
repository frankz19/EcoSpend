import { getDatabase } from "../data/database/database";

const db = getDatabase();

export interface Account {
    id: number;
    user_id: number;
    name: string;
    type: string;
    current_balance: number;
    currency: string;
}

export const AccountService = {

    // Obtener todas las cuentas de un usuario
    getAccounts: async (userId: number): Promise<Account[]> => {
        try {
            return await db.getAllAsync<Account>(
                'SELECT * FROM Accounts WHERE user_id = ? ORDER BY name ASC',
                [userId]
            );
        } catch (error) {
            console.error('Error al obtener cuentas:', error);
            return [];
        }
    },

    // Crear nueva cuenta
    createAccount: async (
        userId: number, 
        name: string, 
        type: string, 
        initialBalance: number
    ) => {
        try {
            // Insertamos la cuenta. El current_balance se inicializa con el monto que el usuario defina.
            await db.runAsync(
                `INSERT INTO Accounts (user_id, name, type, current_balance) 
                 VALUES (?, ?, ?, ?)`,
                [userId, name, type, initialBalance]
            );
            return { success: true };
        } catch (error) {
            console.error('Error al crear cuenta:', error);
            return { success: false, error: "No se pudo guardar la cuenta en la base de datos." };
        }
    },
    // Editar cuenta
    updateAccountSmart: async (
        id: number, 
        newName: string, 
        newType: string, 
        newBalance: number
    ) => {
        try {
            // 1. Verificamos si la cuenta tiene transacciones asociadas
            const result = await db.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM Transactions WHERE account_id = ?',
                [id]
            );
    
            const hasTransactions = result && result.count > 0;
    
            if (hasTransactions) {
                // 2a. Si hay transacciones, SOLO actualizamos nombre y tipo
                await db.runAsync(
                    'UPDATE Accounts SET name = ?, type = ? WHERE id = ?',
                    [newName, newType, id]
                );
                return { 
                    success: true, 
                    message: "Se actualizó el nombre, pero el saldo no se cambió porque ya tienes movimientos registrados." 
                };
            } else {
                // 2b. Si está limpia, permitimos editar el saldo inicial también
                await db.runAsync(
                    'UPDATE Accounts SET name = ?, type = ?, current_balance = ? WHERE id = ?',
                    [newName, newType, newBalance, id]
                );
                return { success: true, message: "Cuenta actualizada correctamente." };
            }
        } catch (error) {
            console.error('Error en updateAccountSmart:', error);
            return { success: false, error: "Error al intentar actualizar la cuenta." };
        }
    },

    // Eliminar cuenta
    deleteAccount: async (id: number) => {
        try {
            const txCount = await db.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM Transactions WHERE account_id = ?',
                [id]
            );

            await db.runAsync('DELETE FROM Accounts WHERE id = ?', [id]);

            return {
                success: true,
                message: `Cuenta eliminada. Se borraron ${txCount?.count || 0} transacciones asociadas.`
            };
        } catch (error) {
            console.error(error);
            return { success: false, error: "No se pudo eliminar la cuenta." };
        }
    }
};