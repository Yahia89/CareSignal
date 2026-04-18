import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ElderStackParamList, CheckInStatus, CheckInSlot } from '../../types';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useCheckIn } from '../../hooks/useCheckIn';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

type Props = NativeStackScreenProps<ElderStackParamList, 'ElderHome'>;

type VoiceType = 'Warm Voice' | 'Calm Voice' | 'Bright Voice';
type VitalType = 'Blood Sugar' | 'Blood Pressure';
type InputMethod = 'Camera Capture' | 'Manual Entry';

function getCurrentSlot(): CheckInSlot {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function ElderHomeScreen({ navigation }: Props): React.JSX.Element {
  const { user, signOut } = useAuth();
  const { isSubmitting, submitCheckIn } = useCheckIn();

  const [voiceOn, setVoiceOn] = useState(true);
  const [voiceType, setVoiceType] = useState<VoiceType>('Warm Voice');
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [vitalType, setVitalType] = useState<VitalType>('Blood Sugar');
  const [inputMethod, setInputMethod] = useState<InputMethod>('Camera Capture');
  const [vitalValue, setVitalValue] = useState('');

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const userBadge = `${(user?.name ?? 'User').split(' ')[0].toLowerCase()} - Senior App`;

  const handleCheckIn = useCallback(
    async (status: CheckInStatus) => {
      try {
        await submitCheckIn(status, getCurrentSlot());
        navigation.replace('ElderConfirmation', { status, firstName });
      } catch (err) {
        Alert.alert('Error', (err as Error).message ?? 'Failed to submit check-in. Try again.');
      }
    },
    [submitCheckIn, firstName, navigation],
  );

  if (isSubmitting) {
    return <LoadingOverlay message="Sending check-in..." />;
  }

  return (
    <SafeAreaView style={styles.safe}>
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={styles.checkInLabel}>Daily Check-In</Text>
        <Text style={styles.greeting}>
          {getGreeting()}, {firstName}
        </Text>
        <Text style={styles.questionText}>How are you today?</Text>

        {/* Voice controls */}
        <View style={styles.voiceRow}>
          <View style={styles.voiceReadyRow}>
            <View style={styles.voiceDot} />
            <Text style={styles.voiceReadyText}>Voice assistant ready</Text>
          </View>
          <View style={styles.voiceControls}>
            <TouchableOpacity
              style={[styles.voiceOnBtn, !voiceOn && styles.voiceOffBtn]}
              onPress={() => setVoiceOn((v) => !v)}
            >
              <Ionicons
                name={voiceOn ? 'volume-high' : 'volume-mute'}
                size={14}
                color={Colors.textInverse}
              />
              <Text style={styles.voiceOnText}>
                {voiceOn ? 'Voice On' : 'Voice Off'}
              </Text>
            </TouchableOpacity>

            <View style={styles.voiceTypeWrap}>
              <TouchableOpacity
                style={styles.voiceTypePill}
                onPress={() => setShowVoiceDropdown((v) => !v)}
              >
                <Text style={styles.voiceTypeText}>{voiceType}</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.primary} />
              </TouchableOpacity>
              {showVoiceDropdown && (
                <View style={styles.voiceDropdown}>
                  {(['Warm Voice', 'Calm Voice', 'Bright Voice'] as VoiceType[]).map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={styles.voiceDropdownItem}
                      onPress={() => {
                        setVoiceType(v);
                        setShowVoiceDropdown(false);
                      }}
                    >
                      {voiceType === v && (
                        <Ionicons name="checkmark" size={14} color={Colors.primary} />
                      )}
                      <Text style={[styles.voiceDropdownText, voiceType === v && styles.voiceDropdownActive]}>
                        {v}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Check-in buttons */}
        <View style={styles.checkInButtons}>
          <TouchableOpacity
            style={[styles.checkInBtn, { backgroundColor: Colors.primary }]}
            onPress={() => handleCheckIn('ok')}
            activeOpacity={0.85}
          >
            <View style={styles.checkInBtnLeft}>
              <View style={styles.checkInIconWrap}>
                <Ionicons name="checkmark-circle" size={26} color={Colors.textInverse} />
              </View>
              <View>
                <Text style={styles.checkInBtnLabel}>I'm OK</Text>
                <Text style={styles.checkInBtnSub}>Quick daily confirmation</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkInBtn, { backgroundColor: Colors.warning }]}
            onPress={() => handleCheckIn('help')}
            activeOpacity={0.85}
          >
            <View style={styles.checkInBtnLeft}>
              <View style={styles.checkInIconWrap}>
                <Ionicons name="hand-left" size={26} color={Colors.textInverse} />
              </View>
              <View>
                <Text style={styles.checkInBtnLabel}>I Need Help</Text>
                <Text style={styles.checkInBtnSub}>Notify my support circle</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkInBtn, { backgroundColor: Colors.urgent }]}
            onPress={() => handleCheckIn('urgent')}
            activeOpacity={0.85}
          >
            <View style={styles.checkInBtnLeft}>
              <View style={styles.checkInIconWrap}>
                <Ionicons name="alert-circle" size={26} color={Colors.textInverse} />
              </View>
              <View>
                <Text style={styles.checkInBtnLabel}>Urgent Help</Text>
                <Text style={styles.checkInBtnSub}>Escalate right away</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Optional Vital Capture */}
        <View style={styles.vitalSection}>
          <View style={styles.vitalHeader}>
            <Text style={styles.vitalTitle}>Optional Vital Capture</Text>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalBadgeText}>Optional</Text>
            </View>
          </View>
          <Text style={styles.vitalSubtitle}>Capture blood sugar or blood pressure</Text>

          <View style={styles.vitalDropdowns}>
            <TouchableOpacity style={styles.vitalDropdown}>
              <Text style={styles.vitalDropdownLabel}>Vital Type</Text>
              <View style={styles.vitalDropdownRow}>
                <Text style={styles.vitalDropdownValue}>{vitalType}</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vitalDropdown}>
              <Text style={styles.vitalDropdownLabel}>Input Method</Text>
              <View style={styles.vitalDropdownRow}>
                <Text style={styles.vitalDropdownValue} numberOfLines={1}>
                  {inputMethod === 'Camera Capture' ? 'Camera Captu...' : 'Manual Entry'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.vitalInputRow}>
            <TextInput
              style={styles.vitalInput}
              placeholder={
                vitalType === 'Blood Sugar'
                  ? 'Use camera to capture blood sugar'
                  : 'Use camera to capture blood pressure'
              }
              placeholderTextColor={Colors.textDisabled}
              value={vitalValue}
              onChangeText={setVitalValue}
              keyboardType="numeric"
              multiline
            />
            <TouchableOpacity style={styles.saveVitalBtn}>
              <Text style={styles.saveVitalText}>Save{'\n'}Vital</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer links */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerLink}>
            <Ionicons name="volume-high-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.footerLinkText}>Replay Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkTextTeal}>Family View</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.card },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
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

  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  // Greeting
  checkInLabel: {
    fontSize: Typography.fontSizeSm,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
    marginBottom: Spacing.xs,
  },
  greeting: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  questionText: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // Voice controls
  voiceRow: {
    marginBottom: Spacing.xl,
  },
  voiceReadyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  voiceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  voiceReadyText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
  },
  voiceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  voiceOnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  voiceOffBtn: {
    backgroundColor: Colors.textSecondary,
  },
  voiceOnText: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
  },
  voiceTypeWrap: {
    position: 'relative',
  },
  voiceTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  voiceTypeText: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.primary,
  },
  voiceDropdown: {
    position: 'absolute',
    top: 36,
    left: 0,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 130,
  },
  voiceDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  voiceDropdownText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textPrimary,
  },
  voiceDropdownActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
  },

  // Check-in buttons
  checkInButtons: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  checkInBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkInIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInBtnLabel: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
  },
  checkInBtnSub: {
    fontSize: Typography.fontSizeXs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Vital capture
  vitalSection: {
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  vitalTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  optionalBadge: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  optionalBadgeText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
  },
  vitalSubtitle: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  vitalDropdowns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  vitalDropdown: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  vitalDropdownLabel: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textDisabled,
    marginBottom: 2,
  },
  vitalDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vitalDropdownValue: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeightSemiBold,
    flex: 1,
  },
  vitalInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  vitalInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  saveVitalBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    width: 64,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveVitalText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
    textAlign: 'center',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLinkText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
  },
  footerLinkTextTeal: {
    fontSize: Typography.fontSizeSm,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
  },
});
