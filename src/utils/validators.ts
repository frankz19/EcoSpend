// Representa el resultado de una operación de validación
export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

export const Validators = {
    
    // --- VALIDACIONES NUMÉRICAS Y FECHAS ---
    isValidAmount: (amount: number): boolean => amount > 0,
  
    isNumeric: (value: any): boolean => {
      if (typeof value === 'number') return !isNaN(value) && isFinite(value);
      if (typeof value === 'string') return !isNaN(parseFloat(value)) && isFinite(Number(value));
      return false;
    },
  
    isNotFutureDate: (selectedDate: Date): boolean => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const checkDate = new Date(selectedDate);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate <= now;
    },

    // --- SEGURIDAD Y LIMPIEZA ---

    // Limpieza básica (espacios)
    sanitizeText: (text: string): string => text.trim(),

    // Limpieza ESTRICTA (Previene XSS e Inyecciones de código)
    strictSanitize: (text: string): string => {
      if (!text) return '';
      return text
          .trim()
          .replace(/<[^>]*>?/gm, '') // Elimina etiquetas HTML como <script>
          .replace(/[&<>"'/]/g, (s) => { // Escapa caracteres peligrosos
              const entityMap: { [key: string]: string } = {
                  '&': '&amp;', '<': '&lt;', '>': '&gt;',
                  '"': '&quot;', "'": '&#39;', '/': '&#x2F;'
              };
              return entityMap[s];
          });
    },

    // Fortaleza de contraseña: mín 8 caracteres, una mayúscula, una minúscula y un número
    isValidPasswordStrength: (password: string): boolean => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
      return passwordRegex.test(password);
  },

    // --- VALIDACIONES DE TEXTO ---

    isValidLength: (text: string, maxLength: number): boolean => {
      const cleanedText = text.trim();
      return cleanedText.length > 0 && cleanedText.length <= maxLength;
    },

    isAlphaWithAccents: (text: string): boolean => {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      return regex.test(text);
    },

    isValidFreeText: (text: string): boolean => {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.,\-\/\(\)&+#:_]+$/;
      return regex.test(text);
    },

    isValidEmail: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  
    // --- VALIDACIÓN DE FORMULARIOS ---

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
        // Usamos strictSanitize para la descripción por seguridad
        const cleanDesc = Validators.strictSanitize(description);
        
        if (!Validators.isValidLength(cleanDesc, 180)) {
          return { isValid: false, errorMessage: "La descripción es demasiado larga (máx 180)" };
        }
      }
  
      return { isValid: true };
    },

    validateUserForm: (email: string, name: string, password?: string): ValidationResult => {
      const cleanEmail = Validators.sanitizeText(email);
      const cleanName = Validators.sanitizeText(name);

      if (!Validators.isValidEmail(cleanEmail)) {
        return { isValid: false, errorMessage: "El formato del correo es incorrecto" };
      }

      if (!Validators.isValidLength(cleanName, 64)) {
        return { isValid: false, errorMessage: "El nombre es obligatorio (máx 64 caracteres)" };
      }

      // Si se provee contraseña (en registro), validamos su fuerza
      if (password && !Validators.isValidPasswordStrength(password)) {
        return { 
            isValid: false, 
            errorMessage: "La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número." 
        };
      }

      return { isValid: true };
    }
};