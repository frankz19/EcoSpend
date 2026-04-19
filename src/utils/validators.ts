// Representa el resultado de una operación de validación
export interface ValidationResult {
    // Indica si la validación fue exitosa
    isValid: boolean;
    // Mensaje explicativo en caso de que isValid sea false
    errorMessage?: string;
}

// Contenedor de funciones de validación 
export const Validators = {
    
    // No Negatividad de Montos
    isValidAmount: (amount: number): boolean => {
      return amount > 0;
    },
  
    // Validación de Dato finito
    isNumeric: (value: any): boolean => {
      if (typeof value === 'number') return !isNaN(value) && isFinite(value);
      if (typeof value === 'string') return !isNaN(parseFloat(value)) && isFinite(Number(value));
      return false;
    },
  
    // No fechas futuras
    isNotFutureDate: (selectedDate: Date): boolean => {
      const now = new Date();
      // Ponemos ambas fechas a la medianoche para evitar que horas/minutos causen falsos positivos
      now.setHours(0, 0, 0, 0);
      const checkDate = new Date(selectedDate);
      checkDate.setHours(0, 0, 0, 0);
      
      return checkDate <= now;
    },
  
    // Borra los espacios en blanco
    sanitizeText: (text: string): string => {
      return text.trim();
    },
  
    // Valida que el texto no esté vacío y no exceda el límite del diseño
    isValidLength: (text: string, maxLength: number): boolean => {
      const cleanedText = text.trim();
      return cleanedText.length > 0 && cleanedText.length <= maxLength;
    },

    // Solo permite letras, espacios y acentos (uso interno)
    isAlphaWithAccents: (text: string): boolean => {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return regex.test(text);
    },

    // Permite letras, números, espacios, acentos y puntuación común (nombres y descripciones)
    isValidFreeText: (text: string): boolean => {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,\-\/\(\)&+#:_]+$/;
      return regex.test(text);
    },

    // Valida un email
    isValidEmail: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  
    // Función para validar un formulario de transacción completo
    validateTransactionForm: (amount: any, date: Date, description: string): ValidationResult => {
      if (!Validators.isNumeric(amount)) {
        return { isValid: false, errorMessage: "El monto debe ser un valor numérico" };
      }
      
      const numAmount = parseFloat(amount);
      if (!Validators.isValidAmount(numAmount)) {
        return { isValid: false, errorMessage: "El monto debe ser mayor a cero" };
      }
  
      if (!Validators.isNotFutureDate(date)) {
        return { isValid: false, errorMessage: "No se permiten transacciones con fechas futuras" };
      }
  
      if (description) {
        const cleanDesc = Validators.sanitizeText(description);
        
        if (!Validators.isValidFreeText(cleanDesc)) {
          return { isValid: false, errorMessage: "La descripción contiene caracteres no permitidos" };
        }

        if (!Validators.isValidLength(cleanDesc, 180)) {
          return { isValid: false, errorMessage: "La descripción es demasiado larga (máximo 180 caracteres)" };
        }
      }
  
      return { isValid: true };
    },

    validateUserForm: (email: string, name: string): ValidationResult => {
      const cleanEmail = Validators.sanitizeText(email);
      const cleanName = Validators.sanitizeText(name);

      if (!Validators.isValidEmail(cleanEmail)) {
        return { isValid: false, errorMessage: "El formato del correo es incorrecto" };
      }

      if (!Validators.isValidLength(cleanName, 64)) {
        return { isValid: false, errorMessage: "El nombre es obligatorio (máx 64 caracteres)" };
      }

    return { isValid: true };
    }

};

  