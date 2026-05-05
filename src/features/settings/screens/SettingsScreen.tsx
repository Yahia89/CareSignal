import React from 'react';
import { Screen, Text, Button, Spacer } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const SettingsScreen = () => {
  const { dispatch } = useAuth();
  
  return (
    <Screen style={{ padding: 16 }}>
      <Text variant="title">Settings</Text>
      <Spacer y="xl" />
      <Button title="Logout" variant="ghost" onPress={() => dispatch({ type: 'LOGOUT' })} />
    </Screen>
  );
};
