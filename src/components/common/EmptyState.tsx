import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = 'information-circle-outline',
  title,
  subtitle,
  action,
}: EmptyStateProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={Colors.textDisabled} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  title: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSizeMd * Typography.lineHeightNormal,
  },
  action: {
    marginTop: Spacing.xl,
  },
});
