import React from 'react';
import { Screen, Text, Card, Spacer, StatusBadge } from '../../../shared/components';

export const DashboardScreen = () => {
  return (
    <Screen style={{ padding: 16 }}>
      <Text variant="title">Family Dashboard</Text>
      <Spacer y="lg" />
      <Card>
        <Text variant="heading">John Doe</Text>
        <Spacer y="sm" />
        <StatusBadge status="ok" />
        <Spacer y="md" />
        <Text>Last check-in: Today, 9:00 AM</Text>
      </Card>
    </Screen>
  );
};
