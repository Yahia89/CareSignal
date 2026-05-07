import React from 'react';
import { Screen, Text, Spacer } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { NeuButton, useColors, spacing } from '../../../shared/design';

export const SettingsScreen = () => {
  const { dispatch } = useAuth();
  const colors = useColors();

  return (
    <Screen style={{ padding: spacing[16], backgroundColor: colors.background }}>
      <Text variant="title">Settings</Text>
      <Spacer y="xl" />
      <NeuButton
        title="Logout"
        variant="secondary"
        onPress={() => dispatch({ type: 'LOGOUT' })}
        size="md"
      />
    </Screen>
  );
};
