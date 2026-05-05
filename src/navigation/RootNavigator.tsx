import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../shared/contexts/AuthContext';
import { linking } from './linking';
import { RootStackParamList, AuthStackParamList, ElderStackParamList, FamilyStackParamList } from './types';

// We will import actual navigators once implemented
import { View, Text } from 'react-native';

import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { SignUpScreen } from '../features/auth/screens/SignUpScreen';
import { CheckInHome } from '../features/checkIn/screens/CheckInHome';
import { FamilyDashboardScreen } from '../features/dashboard/screens/FamilyDashboardScreen';
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const ElderStackNav = createNativeStackNavigator<ElderStackParamList>();
const FamilyStackNav = createNativeStackNavigator<FamilyStackParamList>();

const AuthStack = () => (
  <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
    <AuthStackNav.Screen name="Login" component={LoginScreen as any} />
    <AuthStackNav.Screen name="SignUp" component={SignUpScreen as any} />
  </AuthStackNav.Navigator>
);

const ElderStack = () => (
  <ElderStackNav.Navigator screenOptions={{ headerShown: true }}>
    <ElderStackNav.Screen name="CheckInHome" component={CheckInHome} options={{ title: 'Daily Check-In' }} />
  </ElderStackNav.Navigator>
);

const FamilyStack = () => (
  <FamilyStackNav.Navigator screenOptions={{ headerShown: false }}>
    <FamilyStackNav.Screen name="FamilyDashboard" component={FamilyDashboardScreen} options={{ title: 'Dashboard' }} />
    <FamilyStackNav.Screen name="FamilySettings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </FamilyStackNav.Navigator>
);


export const RootNavigator = () => {
  const { state } = useAuth();

  return (
    <NavigationContainer linking={linking}>
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
