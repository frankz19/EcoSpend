import { getDatabase } from "../data/database/database";

const db =  getDatabase();

export const AccountService = {

    //Eliminar cuenta
    deleteAccount: async (id: number) => {
        try {
        // Número de transacciones asociadas a esa cuenta
            const txCount = await db.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM Transactions WHERE account_id = ?',
                [id]
            );
  
            // Proceder con la eliminación
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