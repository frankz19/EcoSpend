import { getDatabase } from "../data/database/database";
import { Validators } from "../utils/validators";

const db = getDatabase();

// 1. Definimos la interfaz para que TypeScript no se queje
export interface Category {
    id: number;
    name: string;
    type: 'Ingreso' | 'Gasto';
    icon: string;
    color: string;
    user_id: number;
}

export const CategoryService = {
    // 2. EL FIX CRÍTICO: Obtener las categorías del usuario
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

    // 3. Crear nueva categoría (faltaba para que la pantalla funcione)
    createCategory: async (userId: number, name: string, type: 'Ingreso' | 'Gasto', icon: string, color: string) => {
        const cleanName = Validators.sanitizeText(name);
        
        if (!Validators.isValidLength(cleanName, 64) || !Validators.isAlphaWithAccents(cleanName)) {
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
                'INSERT INTO Categories (name, type, icon, color, user_id) VALUES (?, ?, ?, ?, ?)',
                [cleanName, type, icon, color, userId]
            );
            return { success: true };
        } catch (error) {
            return { success: false, error: "Error técnico al crear categoría." };
        }
    },

    // 4. Editar categoría (Lo que ya tenían los chicos, pero ajustado al userId)
    updateCategory: async (id: number, userId: number, name: string, icon: string, color: string) => {
        const cleanName = Validators.sanitizeText(name);

        if (!Validators.isValidLength(cleanName, 64) || !Validators.isAlphaWithAccents(cleanName)) {
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
                'UPDATE Categories SET name = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?',
                [cleanName, icon, color, id, userId]
            );
            
            return { success: true };
        } catch (error) {
            return { success: false, error: "Error técnico al actualizar categoría." };
        }
    },

    // 5. Eliminar categoría (Lo que ya tenían los chicos)
    deleteCategory: async (id: number) => {
        try {
            // Verifica si hay transacciones asociadas a esa categoría
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

            // Eliminar si está huérfana
            await db.runAsync('DELETE FROM Categories WHERE id = ?', [id]);
            return { success: true };
        } catch (error) {
            return { success: false, error: "Error al eliminar la categoría." };
        }
    }
};