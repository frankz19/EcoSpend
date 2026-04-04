import { getDatabase } from "../data/database/database";
import { Validators } from "../utils/validators";

const db =  getDatabase();

export const CategoryService = {
    // Editar categoría
    updateCategory: async (id: number, name: string, icon: string, color: string) => {
        const cleanName = Validators.sanitizeText(name);
  
        if (!Validators.isValidLength(cleanName, 64) || !Validators.isAlphaWithAccents(cleanName)) {
            return { isValid: false, errorMessage: "Nombre inválido (solo letras, máx 64 caracteres)." };
        }
  
        try {
        const existing = await db.getFirstAsync(
            'SELECT id FROM Categories WHERE LOWER(name) = LOWER(?) AND id != ?',
            [cleanName, id]
        );
  
        if (existing) {
            return { success: false, error: "Ya existe otra categoría con ese nombre." };
        }
  
        await db.runAsync(
            'UPDATE Categories SET name = ?, icon = ?, color = ? WHERE id = ?',
            [cleanName, icon, color, id]
        );
        
        return { success: true };

      } catch (error) {
        return { success: false, error: "Error técnico al actualizar categoría." };
      }
    },
  
    //Eliminar categoría
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