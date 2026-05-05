import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export const cache = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      logger.error('Error saving to async storage', e);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      logger.error('Error reading from async storage', e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      logger.error('Error removing from async storage', e);
    }
  }
};
