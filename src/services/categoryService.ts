import { getDatabase } from "../data/database/database";
import { Validators } from "../utils/validators";

const db = getDatabase();


export interface Category {
    id: number;
    name: string;
    type: 'Ingreso' | 'Gasto';
    icon: string;
    color: string;
    limit_amount: number;
    user_id: number;
}

export const CategoryService = {

    getCategories: async (userId: number): Promise<Category[]> => {
        try {
            return await db.getAllAsync<Category>(
                'SELECT * FROM Categories WHERE user_id = ? ORDER BY name ASC',
                [userId]
            );
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            return [];
        }
    },


    createCategory: async (userId: number, name: string, type: 'Ingreso' | 'Gasto', icon: string, color: string, limitAmount: number = 0) => {
        const cleanName = Validators.sanitizeText(name);
        
        if (!Validators.isValidLength(cleanName, 64) || !Validators.isValidFreeText(cleanName)) {
            return { success: false, error: "Nombre inválido (solo letras, máx 64 caracteres)." };
        }
        
        try {
            const existing = await db.getFirstAsync(
                'SELECT id FROM Categories WHERE LOWER(name) = LOWER(?) AND user_id = ?',
                [cleanName, userId]
            );
            
            if (existing) {
                return { success: false, error: "Ya tienes una categoría con ese nombre." };
            }
            
            await db.runAsync(
                'INSERT INTO Categories (name, type, icon, color, limit_amount, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                [cleanName, type, icon, color, limitAmount, userId]
            );
            return { success: true };
        } catch (error) {
            return { success: false, error: "Error técnico al crear categoría." };
        }
    },


    updateCategory: async (id: number, userId: number, name: string, icon: string, color: string, limitAmount: number = 0) => {
        const cleanName = Validators.sanitizeText(name);

        if (!Validators.isValidLength(cleanName, 64) || !Validators.isValidFreeText(cleanName)) {
            return { isValid: false, errorMessage: "Nombre inválido." };
        }

        try {
            const existing = await db.getFirstAsync(
                'SELECT id FROM Categories WHERE LOWER(name) = LOWER(?) AND user_id = ? AND id != ?',
                [cleanName, userId, id]
            );

            if (existing) {
                return { success: false, error: "Ya existe otra categoría con ese nombre." };
            }

            await db.runAsync(
                'UPDATE Categories SET name = ?, icon = ?, color = ?, limit_amount = ? WHERE id = ? AND user_id = ?',
                [cleanName, icon, color, limitAmount, id, userId]
            );
            
            return { success: true };
        } catch (error) {
            return { success: false, error: "Error técnico al actualizar categoría." };
        }
    },


    deleteCategory: async (id: number) => {
        try {

            const usage = await db.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM Transactions WHERE category_id = ?',
                [id]
            );

            if (usage && usage.count > 0) {
                return { 
                    success: false, 
                    error: `No se puede eliminar: Tiene ${usage.count} transacciones asociadas.` 
                };
            }


            await db.runAsync('DELETE FROM Categories WHERE id = ?', [id]);
            return { success: true };
        } catch (error) {
            return { success: false, error: "Error al eliminar la categoría." };
        }
    }
};