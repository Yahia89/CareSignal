import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SlotConfig, CheckInSlot } from '../../types';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { SlotLabels } from '../../constants/config';

interface ScheduleToggleProps {
  slot: CheckInSlot;
  config: SlotConfig;
  onToggle: (enabled: boolean) => void;
  onTimeChange?: (time: string) => void;
}

const slotIcons: Record<CheckInSlot, keyof typeof Ionicons.glyphMap> = {
  morning: 'sunny',
  afternoon: 'partly-sunny',
  evening: 'moon',
};

function formatDisplayTime(time24: string): string {
  const [hourStr, minStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const min = minStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${min} ${ampm}`;
}

export function ScheduleToggle({
  slot,
  config,
  onToggle,
}: ScheduleToggleProps): React.JSX.Element {
  const icon = slotIcons[slot];

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: config.enabled ? '#EBF5FB' : '#F3F4F6' }]}>
        <Ionicons
          name={icon}
          size={20}
          color={config.enabled ? Colors.primary : Colors.textDisabled}
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.slotName, !config.enabled && styles.dimmed]}>
          {SlotLabels[slot]}
        </Text>
        <Text style={[styles.time, !config.enabled && styles.dimmed]}>
          {config.enabled ? formatDisplayTime(config.time) : 'Disabled'}
        </Text>
      </View>
      <Switch
        value={config.enabled}
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={config.enabled ? Colors.primary : Colors.textDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  slotName: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  time: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dimmed: {
    color: Colors.textDisabled,
  },
});
