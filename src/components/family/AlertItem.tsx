import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert, AlertSeverity } from '../../types';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

interface AlertItemProps {
  alert: Alert;
  onPress?: () => void;
}

const severityConfig: Record<AlertSeverity, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  urgent: { color: Colors.urgent, bg: '#FFF0EE', icon: 'alert-circle' },
  warning: { color: Colors.warning, bg: '#FFFBF0', icon: 'warning' },
  info: { color: Colors.primary, bg: '#EBF5FB', icon: 'information-circle' },
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function AlertItem({ alert, onPress }: AlertItemProps): React.JSX.Element {
  const cfg = severityConfig[alert.severity];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cfg.bg, opacity: alert.read ? 0.7 : 1 }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${cfg.color}20` }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{alert.message}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(alert.timestamp)}</Text>
      </View>
      {!alert.read && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeightMedium,
    lineHeight: Typography.fontSizeMd * 1.4,
  },
  timestamp: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
});
