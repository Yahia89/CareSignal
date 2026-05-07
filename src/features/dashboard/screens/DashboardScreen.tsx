import React from 'react';
import { Screen, Text, Spacer, StatusBadge } from '../../../shared/components';
import { NeuCard, useColors, spacing } from '../../../shared/design';

export const DashboardScreen = () => {
  const colors = useColors();

  return (
    <Screen style={{ padding: spacing[16], backgroundColor: colors.background }}>
      <Text variant="title">Family Dashboard</Text>
      <Spacer y="lg" />
      <NeuCard>
        <Text variant="heading">John Doe</Text>
        <Spacer y="sm" />
        <StatusBadge status="ok" />
        <Spacer y="md" />
        <Text>Last check-in: Today, 9:00 AM</Text>
      </NeuCard>
    </Screen>
  );
};
