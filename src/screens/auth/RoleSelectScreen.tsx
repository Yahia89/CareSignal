import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../../types';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'family',
    title: 'Family Member',
    description:
      'Monitor your loved one\'s daily check-ins, receive alerts, and manage notification settings.',
    icon: 'people',
    color: Colors.primary,
    bg: '#EBF5FB',
  },
  {
    role: 'elder',
    title: 'Elder / Senior',
    description:
      'Check in daily to let your family know you\'re safe. Large buttons, simple interface.',
    icon: 'person',
    color: Colors.success,
    bg: '#D4EDDA',
  },
];

export function RoleSelectScreen(): React.JSX.Element {
  const { selectRole, isLoading } = useAuth();

  async function handleSelect(role: UserRole) {
    try {
      await selectRole(role);
      // RootNavigator will auto-redirect based on new role
    } catch (err) {
      Alert.alert('Error', (err as Error).message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {isLoading && <LoadingOverlay message="Setting up your account..." />}

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>How will you use CareSignal?</Text>
          <Text style={styles.subtitle}>
            Choose your role to personalize your experience. You can change this later in settings.
          </Text>
        </View>

        <View style={styles.options}>
          {ROLE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.role}
              style={styles.card}
              onPress={() => handleSelect(option.role)}
              activeOpacity={0.78}
              disabled={isLoading}
            >
              <View style={[styles.iconCircle, { backgroundColor: option.bg }]}>
                <Ionicons name={option.icon} size={36} color={option.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.huge,
  },
  header: { marginBottom: Spacing.xxxl },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: Typography.fontSizeMd * 1.55,
  },
  options: { gap: Spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
    ...Shadows.md,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSizeSm * 1.5,
  },
});
