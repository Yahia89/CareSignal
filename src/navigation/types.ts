import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTP: { phoneNumber: string };
  Confirm: { token_hash: string; type: 'signup' | 'email' | 'recovery' };
  ResetPassword: { token_hash: string };
};

export type ElderStackParamList = {
  CheckInHome: { slot?: string };
  CheckInSuccess: undefined;
  Pairing: undefined;
};

export type FamilyStackParamList = {
  FamilyDashboard: undefined;
  FamilySettings: undefined;
  Pairing: undefined;
  Alerts: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Elder: NavigatorScreenParams<ElderStackParamList>;
  Family: NavigatorScreenParams<FamilyStackParamList>;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
