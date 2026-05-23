import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Text } from './Text';

export type StatusType = 'ok' | 'help' | 'urgent' | 'late' | 'missed';

export interface StatusBadgeProps {
  status: StatusType;
}

export const StatusBadge = memo(({ status }: StatusBadgeProps) => {
  const theme = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'ok':
        return { bg: '#E6F4F1', label: 'OK', text: '#008471' };
      case 'help':
        return { bg: '#FFF7ED', label: 'Help Needed', text: '#9A3412' };
      case 'urgent':
        return { bg: '#FEF2F2', label: 'Urgent', text: '#991B1B' };
      case 'late':
        return { bg: '#FFF7ED', label: 'Late', text: '#9A3412' };
      case 'missed':
        return { bg: '#FEF2F2', label: 'Missed', text: '#991B1B' };
      default:
        return { bg: theme.colors.border, label: 'Unknown', text: theme.colors.text };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderRadius: theme.radii.full }]}>
      <Text variant="caption" color={config.text} style={{ fontWeight: '600' }}>
        {config.label}
      </Text>
    </View>
  );
});

StatusBadge.displayName = 'StatusBadge';

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});
