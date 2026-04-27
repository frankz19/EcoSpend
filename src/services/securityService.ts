import * as SecurityService from 'expo-secure-store';

export const SecureStoreService = {
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecurityService.setItemAsync(key, value);
    } catch (error) {
      console.error('Error guardando en SecurityService:', error);
    }
  },

  async getToken(key: string): Promise<string | null> {
    try {
      return await SecurityService.getItemAsync(key);
    } catch (error) {
      console.error('Error leyendo de SecurityService:', error);
      return null;
    }
  },

  async deleteToken(key: string): Promise<void> {
    try {
      await SecurityService.deleteItemAsync(key);
    } catch (error) {
      console.error('Error eliminando de SecurityService:', error);
    }
  }
};