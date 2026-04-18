import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const Config = {
  apiUrl: extra['EXPO_PUBLIC_API_URL'] ?? 'https://api.caresignal.app/v1',
  appEnv: extra['EXPO_PUBLIC_APP_ENV'] ?? 'development',
  appVersion: Constants.expoConfig?.version ?? '1.0.0',

  otpLength: 6,
  otpResendSeconds: 60,

  defaultGraceLate: 30,
  defaultGraceMissed: 120,

  maxFamilyMembers: 3,
} as const;

export const SlotLabels: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

export const SlotDefaultTimes: Record<string, string> = {
  morning: '09:00',
  afternoon: '14:00',
  evening: '19:00',
};
