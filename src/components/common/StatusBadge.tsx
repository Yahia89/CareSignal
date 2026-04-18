import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ElderStatusType } from '../../types';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const STATUS_CONFIG: Record<ElderStatusType, StatusConfig> = {
  ok: { label: 'OK', bg: '#D4EDDA', text: Colors.success, icon: 'checkmark-circle' },
  help: { label: 'Needs Help', bg: '#FFF3CD', text: Colors.warning, icon: 'warning' },
  urgent: { label: 'Urgent', bg: '#F8D7DA', text: Colors.urgent, icon: 'alert-circle' },
  late: { label: 'Late', bg: '#FFF3CD', text: Colors.late, icon: 'time' },
  missed: { label: 'Missed', bg: '#E9ECEF', text: Colors.missed, icon: 'close-circle' },
  pending: { label: 'Pending', bg: '#E9ECEF', text: Colors.pending, icon: 'ellipsis-horizontal-circle' },
};

interface StatusBadgeProps {
  status: ElderStatusType;
  size?: 'sm' | 'md' | 'lg';
}

const sizeFontMap = {
  sm: Typography.fontSizeXs,
  md: Typography.fontSizeSm,
  lg: Typography.fontSizeMd,
};

const sizeIconMap = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps): React.JSX.Element {
  const cfg = STATUS_CONFIG[status];
  const fontSize = sizeFontMap[size];
  const iconSize = sizeIconMap[size];

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={iconSize} color={cfg.text} />
      <Text style={[styles.label, { color: cfg.text, fontSize }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    gap: 4,
  },
  label: {
    fontWeight: Typography.fontWeightSemiBold,
  },
});
