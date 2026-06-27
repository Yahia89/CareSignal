import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../shared/contexts/AuthContext';
import { linking } from './linking';
import { RootStackParamList, AuthStackParamList, ElderStackParamList, FamilyStackParamList } from './types';

// We will import actual navigators once implemented
import { View, Text } from 'react-native';

import { useRegisterDevice } from '../shared/notifications/hooks/useRegisterDevice';
import { useNotificationListener } from '../shared/notifications/hooks/useNotificationListener';
import { useInactivityReset } from './hooks/useInactivityReset';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { SignUpScreen } from '../features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { ConfirmDeepLinkScreen } from '../features/auth/screens/ConfirmDeepLinkScreen';
import { ResetPasswordScreen } from '../features/auth/screens/ResetPasswordScreen';
import { CheckInHome } from '../features/checkIn/screens/CheckInHome';
import { FamilyDashboardScreen } from '../features/dashboard/screens/FamilyDashboardScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { PairingScreen } from '../features/links/screens/PairingScreen';
import { AlertsScreen } from '../features/alerts/screens/AlertsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const ElderStackNav = createNativeStackNavigator<ElderStackParamList>();
const FamilyStackNav = createNativeStackNavigator<FamilyStackParamList>();

const AuthStack = () => (
  <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
    <AuthStackNav.Screen name="Login" component={LoginScreen as any} />
    <AuthStackNav.Screen name="SignUp" component={SignUpScreen as any} />
    <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStackNav.Screen name="Confirm" component={ConfirmDeepLinkScreen} />
    <AuthStackNav.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </AuthStackNav.Navigator>
);

const ElderStack = () => (
  // Header hidden — CheckInHome renders its own header (logo + Logout +
  // "Daily Checkin" title) per the Figma design.
  <ElderStackNav.Navigator screenOptions={{ headerShown: false }}>
    <ElderStackNav.Screen name="CheckInHome" component={CheckInHome} />
    <ElderStackNav.Screen name="Pairing" component={PairingScreen} options={{ headerShown: true, title: 'Pairing' }} />
  </ElderStackNav.Navigator>
);

const FamilyStack = () => (
  <FamilyStackNav.Navigator screenOptions={{ headerShown: false }}>
    <FamilyStackNav.Screen name="FamilyDashboard" component={FamilyDashboardScreen} options={{ title: 'Dashboard' }} />
    <FamilyStackNav.Screen name="FamilySettings" component={SettingsScreen} options={{ title: 'Settings' }} />
    <FamilyStackNav.Screen name="Pairing" component={PairingScreen} options={{ headerShown: true, title: 'Pairing' }} />
    <FamilyStackNav.Screen name="Alerts" component={AlertsScreen} options={{ headerShown: true, title: 'Alerts' }} />
  </FamilyStackNav.Navigator>
);


/**
 * Mounted inside NavigationContainer so `useNotificationListener` can call
 * `useNavigation()`. Both hooks are no-ops when there's no authed user
 * (useRegisterDevice gates internally on userId; the listener is harmless
 * pre-auth but we only mount this component once authenticated to keep
 * intent obvious).
 *
 * Also runs the 24-hour inactivity reset — if the user has been away for
 * 24+ hours the navigation stack is reset to the role's first screen.
 */
const NotificationsShell = ({ role }: { role: 'elder' | 'family' }) => {
  useRegisterDevice();
  useNotificationListener();
  useInactivityReset(role);
  return null;
};

export const RootNavigator = () => {
  const { state } = useAuth();
  const userRole = state.user?.role === 'elder' ? 'elder' : 'family';

  return (
    <NavigationContainer linking={linking}>
      {state.isAuthenticated ? (
        <NotificationsShell role={userRole} />
      ) : null}
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!state.isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : state.user?.role === 'elder' ? (
          <RootStack.Screen name="Elder" component={ElderStack} />
        ) : (
          <RootStack.Screen name="Family" component={FamilyStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
