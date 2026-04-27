import { getDatabase } from "../data/database/database";
import { Validators } from "../utils/validators";
import { SessionService } from "./sessionService";
import * as Crypto from 'expo-crypto';

const db = getDatabase();

export interface User {
    id: number;
    username: string;
    email: string;
}

export const AuthService = {
    

    login: async (email: string, password: string, keepSession: boolean = false) => {
        try {
            const cleanEmail = Validators.sanitizeText(email);
            if (!Validators.isValidEmail(cleanEmail)) {
                return { success: false, error: "Formato de correo inválido." };
            }

            const hashedPassword = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                password
            );

            const user = await db.getFirstAsync<User>(
                'SELECT id, username, email FROM Users WHERE email = ? AND password = ?',
                [cleanEmail, hashedPassword] 
            );

            if (user) {
                await SessionService.createSession(user.id, keepSession);
                return { success: true, user };
            } else {
                return { success: false, error: "Correo o contraseña incorrectos." };
            }
        } catch (error) {
            console.error("Error en login:", error);
            return { success: false, error: "Problema al conectar con la base de datos." };
        }
    },


    register: async (username: string, email: string, password: string) => {
        try {
            const cleanEmail = Validators.sanitizeText(email);
            const cleanUsername = Validators.sanitizeText(username);


            if (!Validators.isValidEmail(cleanEmail)) {
                return { success: false, error: "Formato de correo inválido." };
            }
            
            if (!Validators.isValidLength(cleanUsername, 64)) {
                return { success: false, error: "El nombre es obligatorio." };
            }

            const existingUser = await db.getFirstAsync(
                'SELECT id FROM Users WHERE email = ?',
                [cleanEmail]
            );

            if (existingUser) {
                return { success: false, error: "El correo electrónico ya está registrado." };
            }

            if (!Validators.isValidPasswordStrength(password)) {
                return { success: false, error: "La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número." };
            }

            const hashedPassword = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                password 
            );

            const result = await db.runAsync(
                'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
                [cleanUsername, cleanEmail, hashedPassword]
            );
            
            await SessionService.createSession(result.lastInsertRowId, true);

            return { success: true, userId: result.lastInsertRowId };
        } catch (error) {
            console.error("Error en registro:", error);
            return { success: false, error: "Error técnico al crear la cuenta." };
        }
    },

    logout: async () => {
        await SessionService.clearSession();
    }
};