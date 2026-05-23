import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTP: { phoneNumber: string };
  /**
   * Email-confirm / recovery deep link. The backend page now hands us either:
   *  (a) a fully-issued Supabase session via `access_token` + `refresh_token`
   *      (signup / email-change) — we just finalize and log the user in, or
   *  (b) a `token_hash` + `type` (recovery / legacy) — we verify it server-side
   *      and then either log in or hand off to ResetPassword.
   * All fields optional because the screen branches on whichever set is present.
   */
  Confirm: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: string;
    token_hash?: string;
    type?: 'signup' | 'email' | 'recovery';
  };
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
