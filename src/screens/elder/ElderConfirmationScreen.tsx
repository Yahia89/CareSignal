import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ElderStackParamList, CheckInStatus } from '../../types';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<ElderStackParamList, 'ElderConfirmation'>;

const CONFIG: Record<CheckInStatus, {
  bg: string;
  iconBg: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  info?: string;
  replayBg: string;
}> = {
  ok: {
    bg: '#E8F7EF',
    iconBg: '#D0EFDF',
    icon: 'fitness-outline',
    iconColor: Colors.primary,
    title: 'Wonderful. Have a great day.',
    subtitle: 'Wonderful. Have a great day.',
    badge: 'Checked in and doing well',
    badgeBg: '#D0EFDF',
    badgeColor: Colors.primary,
    replayBg: Colors.primary,
  },
  help: {
    bg: '#FEF8EA',
    iconBg: '#FDECC8',
    icon: 'hand-left-outline',
    iconColor: Colors.warning,
    title: 'Help is on its way.',
    subtitle: 'Help is on its way.',
    badge: 'Help request sent',
    badgeBg: '#FDECC8',
    badgeColor: Colors.warningDark,
    info: 'Alerts sent via Email, Text.',
    replayBg: Colors.warning,
  },
  urgent: {
    bg: '#FDECEA',
    iconBg: '#FAD4D4',
    icon: 'shield-outline',
    iconColor: Colors.urgent,
    title: 'Emergency support has been contacted.',
    subtitle: "I've contacted emergency assistance. Help is on its way.",
    badge: 'Urgent alert escalated',
    badgeBg: '#FAD4D4',
    badgeColor: Colors.urgent,
    info: 'Alerts sent via Email, Text, Phone Call, Auto Call Senior.',
    replayBg: Colors.urgent,
  },
};

export function ElderConfirmationScreen({ navigation, route }: Props): React.JSX.Element {
  const { status, firstName } = route.params;
  const { user, signOut } = useAuth();
  const cfg = CONFIG[status];

  const displayName = user?.name ?? firstName;
  const userBadge = `${(user?.name ?? 'User').split(' ')[0].toLowerCase()} - Senior App`;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: cfg.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="fitness-outline" size={16} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.logoName}>MEDTECH CARE</Text>
            <Text style={styles.logoSub}>CareSignal</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>{userBadge}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
            <Ionicons name="log-out-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: cfg.iconBg }]}>
          <Ionicons name={cfg.icon} size={40} color={cfg.iconColor} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{cfg.title}</Text>
        <Text style={styles.subtitle}>{cfg.subtitle}</Text>

        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: cfg.badgeBg }]}>
          <Text style={[styles.badgeText, { color: cfg.badgeColor }]}>{cfg.badge}</Text>
        </View>

        {/* Info box */}
        {cfg.info && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{cfg.info}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.replace('ElderHome')}
          >
            <Text style={styles.homeBtnText}>Back Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.replayBtn, { backgroundColor: cfg.replayBg }]}>
            <Text style={styles.replayBtnText}>Replay Voice</Text>
          </TouchableOpacity>
        </View>

        {/* Family view link */}
        <TouchableOpacity style={styles.familyLink}>
          <Text style={styles.familyLinkText}>Open Family View</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoName: {
    fontSize: 9,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: 1.2,
    color: Colors.primary,
  },
  logoSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userBadge: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userBadgeText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeightSemiBold,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  infoText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.xl,
  },
  homeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  homeBtnText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  replayBtn: {
    flex: 1,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  replayBtnText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
  },
  familyLink: {
    paddingVertical: Spacing.sm,
  },
  familyLinkText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
    textDecorationLine: 'underline',
  },
});
