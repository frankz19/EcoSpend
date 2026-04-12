import { getDatabase } from "../data/database/database";
import { Validators } from "../utils/validators";

const db = getDatabase();

export interface Category {
    id: number;
    name: string;
    type: 'Ingreso' | 'Gasto';
    icon: string;
    color: string;
    user_id: number;
}

export const CategoryService = {

    // Obtener todas las categorías de un usuario
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

    // Obtener una categoría por ID
    getCategoryById: async (id: number): Promise<Category | null> => {
        try {
            return await db.getFirstAsync<Category>(
                'SELECT * FROM Categories WHERE id = ?',
                [id]
            ) ?? null;
        } catch (error) {
            console.error('Error al obtener categoría:', error);
            return null;
        }
    },

    // Crear categoría
    createCategory: async (
        userId: number,
        name: string,
        type: 'Ingreso' | 'Gasto',
        icon: string,
        color: string
    ) => {
        const cleanName = Validators.sanitizeText(name);

        if (!Validators.isValidLength(cleanName, 64) || !Validators.isAlphaWithAccents(cleanName)) {
            return { success: false, error: "Nombre inválido (solo letras y espacios, máx 64 caracteres)." };
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
            return { success: false, error: "Error al crear la categoría." };
        }
    },

    // Editar categoría
    updateCategory: async (
        id: number,
        name: string,
        type: 'Ingreso' | 'Gasto',
        icon: string,
        color: string
    ) => {
        const cleanName = Validators.sanitizeText(name);

        if (!Validators.isValidLength(cleanName, 64) || !Validators.isAlphaWithAccents(cleanName)) {
            return { success: false, error: "Nombre inválido (solo letras y espacios, máx 64 caracteres)." };
        }

        try {
            const existing = await db.getFirstAsync(
                'SELECT id FROM Categories WHERE LOWER(name) = LOWER(?) AND id != ? AND user_id = (SELECT user_id FROM Categories WHERE id = ?)',
                [cleanName, id, id]
            );

            if (existing) {
                return { success: false, error: "Ya existe otra categoría con ese nombre." };
            }

            await db.runAsync(
                'UPDATE Categories SET name = ?, type = ?, icon = ?, color = ? WHERE id = ?',
                [cleanName, type, icon, color, id]
            );

            return { success: true };
        } catch (error) {
            return { success: false, error: "Error técnico al actualizar categoría." };
        }
    },

    // Eliminar categoría
    deleteCategory: async (id: number) => {
        try {
            const usage = await db.getFirstAsync<{ count: number }>(
                'SELECT COUNT(*) as count FROM Transactions WHERE category_id = ?',
                [id]
            );

            if (usage && usage.count > 0) {
                return {
                    success: false,
                    error: `No se puede eliminar: tiene ${usage.count} transacción(es) asociada(s).`
                };
            }

            await db.runAsync('DELETE FROM Categories WHERE id = ?', [id]);
            return { success: true };
        } catch (error) {
            return { success: false, error: "Error al eliminar la categoría." };
        }
    },
};