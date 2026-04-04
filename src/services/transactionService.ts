import { getDatabase } from "../data/database/database";
import { Validators } from "../utils/validators";

const db = getDatabase();

export const TransactionService = {
    // Eliminar trasacción 
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
    
                if (!tx) throw new Error("Transacción no encontrada");

                // Se calcula el ajuste
                const adjustment = tx.type === 'Gasto' ? tx.amount : -tx.amount;
    
                await db.runAsync(
                    'UPDATE Accounts SET current_balance = current_balance + ? WHERE id = ?',
                    [adjustment, tx.account_id]
                );
    
                await db.runAsync('DELETE FROM Transactions WHERE id = ?', [transactionId]);
            });
          
            return { success: true };
        } catch (error) {
            console.error("Error al eliminar:", error);
            return { success: false, error: "No se pudo eliminar la transacción" };
        }
    },
    
    // Editar la transacción
    updateTransaction: async (id: number, newData: { amount: number, category_id: number, description: string, date: string }) => {
        
        // Validar datos 
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
    
                if (!oldTx) throw new Error("Transacción original no encontrada");
    
                // se revierte el saldo antiguo
                const revertAdjustment = oldTx.type === 'Gasto' ? oldTx.amount : -oldTx.amount;
            
           
                const newCat = await db.getFirstAsync<{ type: string }>(
                    'SELECT type FROM Categories WHERE id = ?', [newData.category_id]
                );
                
                const applyAdjustment = newCat?.type === 'Gasto' ? -newData.amount : newData.amount;
    
            
                const totalAdjustment = revertAdjustment + applyAdjustment;
            
                await db.runAsync(
                    'UPDATE Accounts SET current_balance = current_balance + ? WHERE id = ?',
                    [totalAdjustment, oldTx.account_id]
                );
    
            
                await db.runAsync(
                    `UPDATE Transactions 
                    SET amount = ?, category_id = ?, description = ?, date = ? 
                    WHERE id = ?`,
                    [newData.amount, newData.category_id, newData.description, newData.date, id]
                );
            });
    
            return { success: true };
        } catch (error) {
            console.error("Error al actualizar:", error);
            return { success: false, error: "Error al actualizar la transacción" };
        }
    }
}