import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types';
import * as Linking from 'expo-linking';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      Elder: {
        screens: {
          CheckInHome: 'checkin/:slot',
        },
      },
      Family: {
        screens: {
          FamilyDashboard: 'dashboard',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          // Backend's verify page hands the app one of:
          //   caresignal://auth?access_token=...&refresh_token=...&expires_in=3600
          //     (signup / email-change — Supabase session already issued)
          //   caresignal://auth?token_hash=xxx&type=signup|email|recovery
          //     (legacy / recovery — app verifies server-side)
          Confirm: 'auth',
          // caresignal://auth/reset?token_hash=xxx (used internally after Confirm)
          ResetPassword: 'auth/reset',
        },
      },
    },
  },
};
