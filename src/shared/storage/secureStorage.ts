import * as SecureStore from 'expo-secure-store';
import { logger } from '../utils/logger';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      logger.error('Error saving to secure store', e);
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      logger.error('Error reading from secure store', e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      logger.error('Error removing from secure store', e);
    }
  }
};
