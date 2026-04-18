import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Elder } from '../../types';
import { Avatar } from '../common/Avatar';
import { StatusBadge } from '../common/StatusBadge';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SlotLabels } from '../../constants/config';

interface ElderCardProps {
  elder: Elder;
  onPress: () => void;
}

const statusBorderColor: Record<string, string> = {
  ok: Colors.success,
  help: Colors.warning,
  urgent: Colors.urgent,
  late: Colors.late,
  missed: Colors.missed,
  pending: Colors.border,
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function ElderCard({ elder, onPress }: ElderCardProps): React.JSX.Element {
  const { status } = elder;
  const borderColor = statusBorderColor[status.type] ?? Colors.border;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={styles.row}>
        <Avatar name={elder.name} size={52} />
        <View style={styles.info}>
          <Text style={styles.name}>{elder.name}</Text>
          <StatusBadge status={status.type} size="sm" />
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </View>

      <View style={styles.footer}>
        {status.lastCheckIn && (
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>
              Last check-in: {formatRelativeTime(status.lastCheckIn.timestamp)}
            </Text>
          </View>
        )}
        {status.nextSlot && status.nextCheckInTime && (
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>
              Next: {SlotLabels[status.nextSlot]} at {formatTime(status.nextCheckInTime)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    ...Shadows.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  footer: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
  },
});
