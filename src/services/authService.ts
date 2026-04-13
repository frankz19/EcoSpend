import { getDatabase } from "../data/database/database";
import { Validators } from "../utils/validators";

const db = getDatabase();

export interface User {
    id: number;
    username: string;
    email: string;
}

export const AuthService = {

    login: async (email: string, password: string) => {
        try {
            const cleanEmail = Validators.sanitizeText(email);
            if (!Validators.isValidEmail(cleanEmail)) {
                return { success: false, error: "Formato de correo inválido." };
            }


            const user = await db.getFirstAsync<User>(
                'SELECT id, username, email FROM Users WHERE email = ? AND password = ?',
                [cleanEmail, password]
            );

            if (user) {
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


            const result = await db.runAsync(
                'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
                [cleanUsername, cleanEmail, password]
            );

            return { success: true, userId: result.lastInsertRowId };
        } catch (error) {
            console.error("Error en registro:", error);
            return { success: false, error: "Error técnico al crear la cuenta." };
        }
    }
};