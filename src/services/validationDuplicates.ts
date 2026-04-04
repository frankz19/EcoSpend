import { Validators, ValidationResult } from '../utils/validators';

// Cumplir con la Regla de Negocio de Unicidad (de nombre)
export const ValidationDuplicates = {
  
  isNameUnique: async (db: any, name: string): Promise<ValidationResult> => {
    
    const cleanName = Validators.sanitizeText(name);
    
    if (!Validators.isValidLength(cleanName, 64)) {
      return { 
        isValid: false, 
        errorMessage: "El nombre debe tener entre 1 y 64 caracteres." 
      };
    }

    if (!Validators.isAlphaWithAccents(cleanName)) {
      return {
        isValid: false,
        errorMessage: "El nombre solo puede contener letras y acentos."
      };
    }

    try {
      const result = await db.getFirstAsync(
        'SELECT id FROM Categories WHERE LOWER(name) = LOWER(?)',
        [cleanName]
      );

      if (result) {
        return { 
          isValid: false, 
          errorMessage: "Ya existe una categoría con ese nombre" 
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error("Error en validación de unicidad:", error);
      return { 
        isValid: false, 
        errorMessage: "Error técnico al verificar el nombre" 
      };
    }
  }
};