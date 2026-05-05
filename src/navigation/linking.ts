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
        },
      },
    },
  },
};
