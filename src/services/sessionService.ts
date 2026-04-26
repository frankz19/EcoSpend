import { SecureStoreService } from './securityService';
import * as Device from 'expo-device';

// Generamos un ID único por dispositivo para vincular la sesión al hardware
const getDeviceFingerprint = () => {
    return `${Device.brand}-${Device.modelName}-${Device.osInternalBuildId}`;
};

export const SessionService = {
  async createSession(userId: number, keepSessionActive: boolean = false): Promise<void> {
    // Si el usuario quiere mantener la sesión, le damos 24h (o más), si no, 2h.
    const expirationHours = keepSessionActive ? 24 : 2; 
    
    const sessionData = {
      userId,
      fingerprint: getDeviceFingerprint(),
      expiresAt: Date.now() + (expirationHours * 60 * 60 * 1000)
    };

    // Guardamos el objeto como un string cifrado en el hardware del teléfono
    await SecureStoreService.saveToken('eco_session_jwt', JSON.stringify(sessionData));
  },

  async validateCurrentSession(): Promise<number | null> {
    const sessionStr = await SecureStoreService.getToken('eco_session_jwt');
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      
      // 1. Integridad: ¿La sesión expiró?
      if (Date.now() > session.expiresAt) {
        await this.clearSession();
        return null;
      }

      // 2. Integridad: ¿Es el mismo teléfono físico?
      if (session.fingerprint !== getDeviceFingerprint()) {
        await this.clearSession();
        return null;
      }

      return session.userId;
    } catch (error) {
      await this.clearSession();
      return null;
    }
  },

  async clearSession(): Promise<void> {
    await SecureStoreService.deleteToken('eco_session_jwt');
  }
};