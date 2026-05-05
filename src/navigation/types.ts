import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  OTP: { phoneNumber: string };
};

export type ElderStackParamList = {
  CheckInHome: { slot?: string };
  CheckInSuccess: undefined;
};

export type FamilyStackParamList = {
  FamilyDashboard: undefined;
  FamilySettings: undefined;
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
