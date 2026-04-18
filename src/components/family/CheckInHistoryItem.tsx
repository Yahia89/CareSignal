import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CheckIn, CheckInStatus } from '../../types';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { SlotLabels } from '../../constants/config';

interface CheckInHistoryItemProps {
  checkIn: CheckIn;
  isLast?: boolean;
}

const statusConfig: Record<CheckInStatus, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  ok: { color: Colors.success, icon: 'checkmark-circle', label: 'OK' },
  help: { color: Colors.warning, icon: 'warning', label: 'Needed Help' },
  urgent: { color: Colors.urgent, icon: 'alert-circle', label: 'Urgent Help' },
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function CheckInHistoryItem({
  checkIn,
  isLast = false,
}: CheckInHistoryItemProps): React.JSX.Element {
  const cfg = statusConfig[checkIn.status];

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.dot, { backgroundColor: cfg.color }]}>
          <Ionicons name={cfg.icon} size={14} color={Colors.textInverse} />
        </View>
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={[styles.card, isLast && styles.cardLast]}>
        <View style={styles.row}>
          <Text style={styles.date}>{formatDate(checkIn.timestamp)}</Text>
          <Text style={[styles.status, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.slot}>{SlotLabels[checkIn.slot]} check-in</Text>
          <Text style={styles.time}>{formatTime(checkIn.timestamp)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timeline: {
    alignItems: 'center',
    width: 28,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 4,
    minHeight: 20,
  },
  card: {
    flex: 1,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardLast: {
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  date: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  status: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
  },
  slot: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
  },
  time: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
  },
});
