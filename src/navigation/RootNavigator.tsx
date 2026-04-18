import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { ElderNavigator } from './ElderNavigator';
import { FamilyNavigator } from './FamilyNavigator';

export default function RootNavigator(): React.JSX.Element {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  if (user.role === 'elder') {
    return (
      <NavigationContainer>
        <ElderNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <FamilyNavigator />
    </NavigationContainer>
  );
}
