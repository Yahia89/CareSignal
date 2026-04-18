import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleConfig, CheckInSlot, FamilyMember } from '../../types';
import { ScheduleToggle } from '../../components/family/ScheduleToggle';
import { AppCard } from '../../components/common/AppCard';
import { Avatar } from '../../components/common/Avatar';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useHousehold } from '../../hooks/useHousehold';
import { useAuth } from '../../hooks/useAuth';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

const SLOTS: CheckInSlot[] = ['morning', 'afternoon', 'evening'];
const GRACE_OPTIONS = [15, 30, 45, 60];
const MISSED_OPTIONS = [60, 90, 120, 180];

export function FamilySettingsScreen(): React.JSX.Element {
  const { signOut, isLoading: authLoading, user } = useAuth();
  const {
    schedule,
    gracePeriod,
    familyMembers,
    isLoading,
    fetchHousehold,
    updateSchedule,
    updateGracePeriod,
  } = useHousehold();

  const [localSchedule, setLocalSchedule] = useState<ScheduleConfig | null>(null);
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  useEffect(() => {
    if (schedule && !localSchedule) {
      setLocalSchedule(schedule);
    }
  }, [schedule, localSchedule]);

  const handleSlotToggle = useCallback(
    async (slot: CheckInSlot, enabled: boolean) => {
      if (!localSchedule) return;
      const updated: ScheduleConfig = {
        ...localSchedule,
        [slot]: { ...localSchedule[slot], enabled },
      };
      setLocalSchedule(updated);
      setSavingSchedule(true);
      try {
        await updateSchedule(updated);
      } catch {
        // revert on error
        setLocalSchedule(localSchedule);
      } finally {
        setSavingSchedule(false);
      }
    },
    [localSchedule, updateSchedule],
  );

  const handleGraceChange = useCallback(
    async (lateAfterMinutes: number) => {
      if (!gracePeriod) return;
      try {
        await updateGracePeriod({ ...gracePeriod, lateAfterMinutes });
      } catch {
        Alert.alert('Error', 'Failed to update grace period.');
      }
    },
    [gracePeriod, updateGracePeriod],
  );

  const handleMissedChange = useCallback(
    async (missedAfterMinutes: number) => {
      if (!gracePeriod) return;
      try {
        await updateGracePeriod({ ...gracePeriod, missedAfterMinutes });
      } catch {
        Alert.alert('Error', 'Failed to update missed threshold.');
      }
    },
    [gracePeriod, updateGracePeriod],
  );

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  if (isLoading && !localSchedule) {
    return <LoadingOverlay message="Loading settings..." fullScreen={false} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        {savingSchedule && (
          <Text style={styles.saving}>Saving...</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Schedule Section */}
        {localSchedule && (
          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>Check-in Schedule</Text>
            <Text style={styles.sectionSubtitle}>
              Choose when your elder receives daily check-in reminders.
            </Text>
            {SLOTS.map((slot, i) => (
              <View key={slot}>
                <ScheduleToggle
                  slot={slot}
                  config={localSchedule[slot]}
                  onToggle={(enabled) => handleSlotToggle(slot, enabled)}
                />
                {i < SLOTS.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </AppCard>
        )}

        {/* Grace Period */}
        {gracePeriod && (
          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>Grace Periods</Text>

            <Text style={styles.graceLabel}>Mark as "Late" after</Text>
            <View style={styles.pillRow}>
              {GRACE_OPTIONS.map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.pill,
                    gracePeriod.lateAfterMinutes === min && styles.pillActive,
                  ]}
                  onPress={() => handleGraceChange(min)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      gracePeriod.lateAfterMinutes === min && styles.pillTextActive,
                    ]}
                  >
                    {min}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.graceLabel, { marginTop: Spacing.lg }]}>
              Mark as "Missed" after
            </Text>
            <View style={styles.pillRow}>
              {MISSED_OPTIONS.map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.pill,
                    gracePeriod.missedAfterMinutes === min && styles.pillActive,
                  ]}
                  onPress={() => handleMissedChange(min)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      gracePeriod.missedAfterMinutes === min && styles.pillTextActive,
                    ]}
                  >
                    {min >= 60 ? `${min / 60}h` : `${min}m`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </AppCard>
        )}

        {/* Family Members */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Notification Recipients</Text>
          <Text style={styles.sectionSubtitle}>
            Up to 3 family members can receive alerts.
          </Text>
          {familyMembers.map((member, i) => (
            <FamilyMemberRow key={member.id} member={member} isLast={i === familyMembers.length - 1} />
          ))}
          {familyMembers.length === 0 && (
            <Text style={styles.emptyMembers}>No family members added yet.</Text>
          )}
        </AppCard>

        {/* Account */}
        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>
          {user && (
            <View style={styles.accountRow}>
              <Avatar name={user.name} size={44} />
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{user.name}</Text>
                <Text style={styles.accountPhone}>{user.phone}</Text>
              </View>
            </View>
          )}
        </AppCard>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          disabled={authLoading}
          activeOpacity={0.78}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.urgent} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FamilyMemberRow({ member, isLast }: { member: FamilyMember; isLast: boolean }) {
  return (
    <View style={[styles.memberRow, isLast && { borderBottomWidth: 0 }]}>
      <Avatar name={member.name} size={40} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberPhone}>{member.phone}</Text>
      </View>
      <View style={styles.memberToggles}>
        <View style={styles.toggleLabel}>
          <Ionicons name="notifications" size={14} color={Colors.textSecondary} />
          <Switch
            value={member.notifyPush}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={member.notifyPush ? Colors.primary : Colors.textDisabled}
            style={styles.miniSwitch}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  saving: {
    fontSize: Typography.fontSizeXs,
    color: Colors.primary,
    fontWeight: Typography.fontWeightMedium,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  card: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSizeSm * 1.5,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  graceLabel: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  pillActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EBF5FB',
  },
  pillText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeightMedium,
  },
  pillTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeightBold,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  memberPhone: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  memberToggles: { flexDirection: 'row', gap: Spacing.sm },
  toggleLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniSwitch: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
  emptyMembers: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  accountInfo: { flex: 1 },
  accountName: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  accountPhone: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginTop: 2,
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
    marginTop: Spacing.sm,
  },
  signOutText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.urgent,
  },
});
