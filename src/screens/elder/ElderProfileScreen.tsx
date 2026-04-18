import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components/common/Avatar';
import { AppCard } from '../../components/common/AppCard';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useCheckIn } from '../../hooks/useCheckIn';

interface ProfileRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function ProfileRow({ icon, label, value }: ProfileRowProps): React.JSX.Element {
  return (
    <View style={styles.profileRow}>
      <View style={styles.profileIconWrap}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.profileRowContent}>
        <Text style={styles.profileLabel}>{label}</Text>
        <Text style={styles.profileValue}>{value}</Text>
      </View>
    </View>
  );
}

export function ElderProfileScreen(): React.JSX.Element {
  const { user, signOut, isLoading } = useAuth();
  const { todayCheckIn } = useCheckIn();

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }

  if (!user) return <View />;

  const checkInCountToday = todayCheckIn ? 1 : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <Avatar name={user.name} size={88} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>Elder</Text>
        </View>

        {/* Profile Info */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Account Info</Text>
          <ProfileRow icon="call" label="Phone" value={user.phone} />
          <ProfileRow icon="person-circle" label="Role" value="Elder / Senior" />
          <ProfileRow
            icon="checkmark-done-circle"
            label="Check-ins today"
            value={checkInCountToday === 1 ? '1 completed' : 'None yet'}
          />
        </AppCard>

        {/* About CareSignal */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutRow}>
            <Ionicons name="heart" size={18} color={Colors.urgent} />
            <Text style={styles.aboutText}>CareSignal™ v{require('../../../package.json').version}</Text>
          </View>
          <Text style={styles.aboutDesc}>
            CareSignal keeps your family informed about your wellbeing with simple daily check-ins.
            Your privacy is always protected.
          </Text>
        </AppCard>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          disabled={isLoading}
          activeOpacity={0.78}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.urgent} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  name: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  role: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  profileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: '#EBF5FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileRowContent: { flex: 1 },
  profileLabel: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileValue: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeightMedium,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  aboutText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  aboutDesc: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSizeSm * 1.6,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.urgent,
    borderRadius: Radius.xl,
    marginTop: Spacing.md,
  },
  signOutText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.urgent,
  },
});
