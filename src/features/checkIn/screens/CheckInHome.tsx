import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Text as RNText,
  useWindowDimensions,
  Linking,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { checkInHomeStyles as styles } from './CheckInHome.styles';
import {
  Volume2,
  Laugh as Smile,
  AlertTriangle,
  BellPlus as BellRing,
  Camera,
  Save,
  Settings as SettingsIcon,
  Link2,
  LogOut,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Spacer } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useSettings } from '../../../shared/contexts/SettingsContext';
import { useVoiceAssistant } from '../../../shared/hooks';
import {
  NeuButton,
  NeuCard,
  useColors,
  spacing,
  borderRadius,
  colors as staticColors,
} from '../../../shared/design';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';
// Cross-feature import: the auth feature owns the OutlinedSelect/OutlinedField
// components. Promote to shared/components when a third feature needs them.
import { OutlinedSelect, OutlinedField } from '../../../shared/components';
import { LogoCard } from '../../../shared/components';
import { checkInsService } from '../../../services/checkins.service';
import { vitalsService } from '../../../services/vitals.service';
import { CheckInSuccessOverlay } from './CheckInSuccessOverlay';
import {
  CheckIn,
  CheckInStatus,
  DEFAULT_VITAL_UNIT,
  VitalType,
  VitalInputMethod,
} from '../../../types';

/** Best-effort error-message extraction for axios responses + Error throws. */
import { extractApiError } from '../../../shared/utils';

const TABLET_BREAKPOINT = 768;
const FORM_MAX_WIDTH = 480;
const NAVY = staticColors.text.primary;

const VOICE_TYPE_OPTIONS = [
  { label: 'Warm Voice', value: 'warm' },
  { label: 'Clarity Voice', value: 'clarity' },
];
const VITAL_TYPE_OPTIONS = [
  { label: 'Blood Sugar', value: 'blood_sugar' },
  { label: 'Blood Pressure', value: 'blood_pressure' },
];
const INPUT_METHOD_OPTIONS = [
  { label: 'Camera Capture', value: 'camera' },
  { label: 'Manual Entry', value: 'manual' },
];

// Per-status palette for the rich status cards (matches the senior design).
const STATUS_THEME = {
  ok: { bg: '#E6F4EA', fg: '#2E7D32' },
  needs_help: { bg: '#FBF0DA', fg: '#B7791F' },
  urgent: { bg: '#FBE3E0', fg: '#D32F2F' },
} as const;

interface StatusActionButtonProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  status: CheckInStatus;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}

/**
 * Full-width colored pill: icon (left) + title + subtitle.
 * Spring-scale press feedback matches the Figma prototype interaction.
 */
const StatusActionButton = ({
  icon: Icon,
  title,
  subtitle,
  status,
  loading,
  disabled,
  onPress,
}: StatusActionButtonProps) => {
  const theme = STATUS_THEME[status];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      friction: 8,
      tension: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 60,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.statusCard, { backgroundColor: theme.bg }, disabled && { opacity: 0.6 }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        <View style={styles.statusIconWrap}>
          {loading ? (
            <ActivityIndicator color={theme.fg} />
          ) : (
            <Icon size={30} color={theme.fg} strokeWidth={2.2} />
          )}
        </View>
        <View style={styles.statusTextCol}>
          <RNText style={[styles.statusTitle, { color: theme.fg }]}>{title}</RNText>
          <RNText style={styles.statusSubtitle}>{subtitle}</RNText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const CheckInHome = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useAuth();
  const { state: settingsState } = useSettings();
  const colors = useColors();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const user = state.user;

  const [voiceOn, setVoiceOn] = useState(true);
  const [voiceType, setVoiceType] = useState('warm');
  const [vitalType, setVitalType] = useState<VitalType>('blood_sugar');
  const [inputMethod, setInputMethod] = useState<VitalInputMethod>('camera');
  const [vitalValue, setVitalValue] = useState('');
  const [vitalError, setVitalError] = useState<string | undefined>(undefined);

  // Today's check-in (loaded on mount). null = no check-in yet today; undefined = loading.
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null | undefined>(undefined);
  const [submittingStatus, setSubmittingStatus] = useState<CheckInStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  // State 2: success overlay. When set, the full-screen checkmark+confetti card shows.
  const [successStatus, setSuccessStatus] = useState<CheckInStatus | null>(null);
  // transition: 0 = collapsed pill invisible, 1 = fully visible.
  // Animated from 0→1 when the success overlay dismisses (State 2 → State 3).
  const transition = useRef(new Animated.Value(0)).current;

  const [savingVital, setSavingVital] = useState(false);
  const [vitalSavedAt, setVitalSavedAt] = useState<number | null>(null);
  // Remember which input method was used for the most recent save so the
  // success line can show it back to the user (proof that the selection
  // they made actually shipped in the payload — test 2.14).
  const [lastSavedMethod, setLastSavedMethod] = useState<VitalInputMethod | null>(null);

  const { speak: speakRaw } = useVoiceAssistant(voiceOn);

  // Pick two distinct system voices once on mount, so Warm and Clarity sound
  // unambiguously different to the listener (test 2.9 caught that pitch/rate
  // alone was too subtle to perceive). Voice IDs vary across iOS versions, so
  // we enumerate at runtime and pick a sensible pair by name heuristic.
  const [warmVoiceId, setWarmVoiceId] = useState<string | undefined>(undefined);
  const [clarityVoiceId, setClarityVoiceId] = useState<string | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const Speech = await import('expo-speech');
        const voices = await Speech.getAvailableVoicesAsync();
        if (cancelled) return;
        const enVoices = voices.filter((v) => v.language?.toLowerCase().startsWith('en'));
        // Heuristic: prefer typically-warmer-sounding female voices for "warm"
        // (Samantha, Karen, Moira, Ava) and crisper voices (Daniel, Alex, Tom,
        // Aaron) for "clarity". Falls back to the first two distinct voices.
        const warmNames = ['samantha', 'karen', 'moira', 'ava', 'allison'];
        const clarityNames = ['daniel', 'alex', 'tom', 'aaron', 'fred', 'oliver'];
        const findBy = (names: string[]) =>
          enVoices.find((v) => names.some((n) => v.identifier?.toLowerCase().includes(n)));
        const warm = findBy(warmNames) ?? enVoices[0];
        const clarity =
          findBy(clarityNames) ?? enVoices.find((v) => v.identifier !== warm?.identifier) ?? enVoices[1];
        setWarmVoiceId(warm?.identifier);
        setClarityVoiceId(clarity?.identifier);
      } catch {
        // Silently ignore — falls back to pitch/rate-only differentiation.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * Wraps `speak` so the voice profile selected in the UI ("warm" vs
   * "clarity") actually influences how lines are read. Combines two levers
   * for maximum perceptible contrast:
   *   1. A distinct system voice identifier (picked above at mount).
   *   2. Pitch + rate tweaks — warm = deeper & slower, clarity = brighter &
   *      slightly faster.
   * Voice ID is the main signal; pitch/rate is the safety net for devices
   * where only one voice is installed.
   */
  const speak = React.useCallback(
    (text: string, options?: { force?: boolean }) => {
      const isClarity = voiceType === 'clarity';
      const pitch = isClarity ? 1.3 : 0.7;
      const rate = isClarity ? 1.05 : 0.78;
      const voiceId = isClarity ? clarityVoiceId : warmVoiceId;
      // Only set `voice` when we actually have an id (strict optional props).
      const profile = voiceId
        ? { pitch, rate, voice: voiceId }
        : { pitch, rate };
      return speakRaw(text, { ...profile, ...(options ?? {}) });
    },
    [voiceType, speakRaw, warmVoiceId, clarityVoiceId],
  );

  // Greet on first mount.
  useEffect(() => {
    const name = user?.name?.split(' ')[0] || 'Eleanor';
    speak(`Good morning, ${name}. How are you today?`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch today's check-in once on mount. If one exists, the status buttons
  // render in a disabled "already checked in" state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const checkIn = await checkInsService.getTodayCheckIn();
        if (!cancelled) setTodayCheckIn(checkIn);
      } catch (err) {
        // Non-fatal — leave it as undefined so buttons stay enabled. The user
        // can still attempt a check-in; the API will reject duplicates.
        // eslint-disable-next-line no-console
        console.warn('Failed to load today check-in:', err);
        if (!cancelled) setTodayCheckIn(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // If the user already checked in before this session, skip the animation.
  const hasSetTransition = useRef(false);
  useEffect(() => {
    if (todayCheckIn === undefined) return;
    if (hasSetTransition.current) return;
    hasSetTransition.current = true;
    if (todayCheckIn !== null) {
      transition.setValue(1); // jump straight to collapsed, no animation
    }
  // transition ref is stable — exclude from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayCheckIn]);

  const handleLogout = () => {
    speak('Logging out');
    dispatch({ type: 'LOGOUT' });
  };

  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openSettings = () => {
    setSettingsSheetOpen(true);
    Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true, friction: 9, tension: 65 }).start();
  };
  const closeSettings = () => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setSettingsSheetOpen(false);
    });
  };

  /** Re-speak the greeting line (the "Replay Voice" bottom button). */
  const replayVoice = () => {
    const name = user?.name?.split(' ')[0] || 'Eleanor';
    speak(`Good morning, ${name}. How are you today?`, { force: true });
  };

  /**
   * Submit today's check-in. Optimistically `speak()`s the appropriate message
   * before the network round-trip so the senior gets immediate feedback (the
   * voice line was already the design); rolls back on error.
   */
  const handleStatusReport = async (status: CheckInStatus) => {
    if (submittingStatus || todayCheckIn) return;

    const messages: Record<CheckInStatus, string> = {
      ok: "I'm glad to hear you are doing well. Your status has been reported as OK.",
      needs_help:
        "I've notified your support circle that you need help. Stay calm, assistance is on the way.",
      urgent: settingsState.urgentHelpConfig.autoCall
        ? 'Alerting urgent help and initiating emergency call now.'
        : 'Alerting urgent help immediately. Help is coming now.',
    };
    speak(messages[status]);

    setSubmittingStatus(status);
    setStatusError(null);

    let successCheckIn: CheckIn | null = null;
    let apiError: string | null = null;

    try {
      successCheckIn = await checkInsService.createCheckIn({ status });

      // If the senior tapped Urgent Help AND auto-call is on in settings,
      // fire the device's phone dialer to 911 right after the check-in
      // submits. Best-effort — Linking.openURL throws on unsupported
      // devices (tablets without cellular), but the check-in is already
      // logged so the family will still be alerted via push/email/SMS.
      if (status === 'urgent' && settingsState.urgentHelpConfig.autoCall) {
        try {
          await Linking.openURL('tel:911');
        } catch (err) {
          console.warn('[checkin] could not open phone dialer for autoCall', err);
        }
      }
    } catch (err) {
      apiError = extractApiError(err, 'Failed to submit check-in. Please try again.');
    } finally {
      setSubmittingStatus(null);
    }

    if (apiError) {
      setStatusError(apiError);
      return;
    }

    if (successCheckIn) {
      // Show State 2: checkmark + confetti overlay.
      // The overlay auto-dismisses after 3 s and calls onDone, which fades
      // the collapsed pill + vital section in (State 3).
      setTodayCheckIn(successCheckIn);
      setSuccessStatus(status);
    }
  };

  /**
   * Save a vital reading. Validates the value is a positive number; uses the
   * default unit for the selected vital type.
   */
  const handleSaveReading = async () => {
    const trimmed = vitalValue.trim();
    if (!trimmed) {
      setVitalError('Enter a reading.');
      return;
    }
    const numericValue = Number(trimmed);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setVitalError('Enter a valid positive number.');
      return;
    }

    setVitalError(undefined);
    setSavingVital(true);
    speak(`Saving your ${vitalType.replace('_', ' ')} reading of ${trimmed}`);

    try {
      await vitalsService.createVital({
        vital_type: vitalType,
        value: numericValue,
        unit: DEFAULT_VITAL_UNIT[vitalType],
        input_method: inputMethod,
      });
      setVitalValue('');
      setVitalSavedAt(Date.now());
      setLastSavedMethod(inputMethod);
    } catch (err) {
      setVitalError(extractApiError(err, 'Failed to save reading. Please try again.'));
    } finally {
      setSavingVital(false);
    }
  };

  // Map today's check-in status to the corresponding label + icon below.
  const checkedIn = todayCheckIn != null;
  const checkedInStatus = todayCheckIn?.status;

  const greetingName = user?.name?.split(' ')[0] || 'Eleanor';

  const statusLabel =
    checkedInStatus === 'ok'
      ? "I'm OK"
      : checkedInStatus === 'needs_help'
        ? 'I Need Help'
        : 'Urgent Help';

  return (
    <>
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─────────────── Header: logo + Settings pill ──────────────── */}
        <View style={[styles.header, isTablet && styles.constrainTablet]}>
          {__DEV__ ? (
            <TouchableOpacity
              activeOpacity={1}
              onLongPress={async () => {
                const { devTestPush } = await import(
                  '../../../shared/notifications/devTestPush'
                );
                await devTestPush.selfRemote({
                  title: 'CareSignal test',
                  body: 'This came from devTestPush.selfRemote',
                  channel: 'help',
                  data: { type: 'help' },
                });
              }}
              delayLongPress={1500}
            >
              <LogoCard showSeparator={false} />
            </TouchableOpacity>
          ) : (
            <LogoCard showSeparator={false} />
          )}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={openSettings}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <SettingsIcon size={18} color={NAVY} strokeWidth={2.2} />
            <RNText style={styles.settingsBtnText}>Settings</RNText>
          </TouchableOpacity>
        </View>

        {/* ─────────────────────── Page content ──────────────────────── */}
        <View
          style={[
            styles.pageContent,
            { paddingHorizontal: isTablet ? spacing[32] : spacing[20] },
          ]}
        >
          <View style={[styles.constrain, isTablet && styles.constrainTablet]}>
            <>
            {/* ─────────── Greeting + voice card ─────────── */}
            <NeuCard style={styles.greetingCard}>
              <RNText style={styles.eyebrow}>Daily Check-In</RNText>
              <RNText style={styles.greeting}>Good Morning, {greetingName}</RNText>
              <RNText style={styles.greetingSub}>
                {checkedIn ? 'Status :' : 'How are you doing today?'}
              </RNText>
              {checkedIn && !successStatus ? (
                /* State 3: collapsed status pill lives INSIDE the greeting card
                   (design OK_Reading) — voice controls are hidden once checked in.
                   Hidden during the State-2 success overlay to avoid a duplicate. */
                <>
                  <Spacer y="sm" />
                  <View
                    style={[
                      styles.collapsedStatus,
                      { backgroundColor: STATUS_THEME[checkedInStatus ?? 'ok'].bg },
                    ]}
                  >
                    <View style={styles.statusIconWrap}>
                      {checkedInStatus === 'ok' ? (
                        <Smile size={28} color={STATUS_THEME.ok.fg} strokeWidth={2.2} />
                      ) : checkedInStatus === 'needs_help' ? (
                        <AlertTriangle size={28} color={STATUS_THEME.needs_help.fg} strokeWidth={2.2} />
                      ) : (
                        <BellRing size={28} color={STATUS_THEME.urgent.fg} strokeWidth={2.2} />
                      )}
                    </View>
                    <View style={styles.statusTextCol}>
                      <RNText
                        style={[styles.statusTitle, { color: STATUS_THEME[checkedInStatus ?? 'ok'].fg }]}
                      >
                        {statusLabel}
                      </RNText>
                    </View>
                  </View>
                </>
              ) : !checkedIn ? (
                <>
                  <Spacer y="md" />
                  <RNText style={styles.voiceReady}>Voice assistant ready</RNText>
                  <View style={{ height: height * 0.025 }} />
                  <View style={styles.voicePillRow}>
                    <View style={styles.voiceCol}>
                      <TouchableOpacity
                        style={styles.voicePill}
                        onPress={() => {
                          const next = !voiceOn;
                          setVoiceOn(next);
                          if (next) speak('Voice assistance enabled', { force: true });
                        }}
                        activeOpacity={0.8}
                      >
                        <Volume2 size={18} color={NAVY} strokeWidth={2.2} />
                        <RNText style={styles.voicePillText}>
                          {voiceOn ? 'Voice ON' : 'Voice OFF'}
                        </RNText>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.voiceDropdownWrap}>
                      <OutlinedSelect
                        options={VOICE_TYPE_OPTIONS}
                        value={voiceType}
                        onValueChange={(v) => {
                          setVoiceType(v);
                          speak('Testing the selected voice', { force: true });
                        }}
                        fieldStyle={styles.voiceSelectField}
                        style={styles.voiceSelectOuter}
                        valueStyle={styles.voicePillText}
                        chevronColor={NAVY}
                        chevronSize={18}
                      />
                    </View>
                  </View>
                </>
              ) : null}
            </NeuCard>

            <Spacer y="lg" />

            {/* ── State 2: full-screen checkmark + confetti overlay ──────── */}
            {successStatus ? (
              <CheckInSuccessOverlay
                status={successStatus}
                name={greetingName}
                onDone={() => {
                  setSuccessStatus(null);
                  // State 2 → 3: fade the collapsed pill + vital section in.
                  Animated.timing(transition, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false,
                  }).start();
                }}
              />
            ) : checkedIn ? (
              /* State 3: the collapsed status pill now lives inside the greeting
                 card above; nothing extra here — vital capture follows below. */
              null
            ) : (
              /* ── State 1: three action buttons ────────────────────────── */
              <View>
                <StatusActionButton
                  icon={Smile}
                  title="I'm OK"
                  subtitle="Quick Daily Confirmation"
                  status="ok"
                  loading={submittingStatus === 'ok'}
                  disabled={submittingStatus !== null}
                  onPress={() => handleStatusReport('ok')}
                />
                <Spacer y="md" />
                <StatusActionButton
                  icon={AlertTriangle}
                  title="I Need Help"
                  subtitle="Notify my Support Circle"
                  status="needs_help"
                  loading={submittingStatus === 'needs_help'}
                  disabled={submittingStatus !== null}
                  onPress={() => handleStatusReport('needs_help')}
                />
                <Spacer y="md" />
                <StatusActionButton
                  icon={BellRing}
                  title="Urgent Help"
                  subtitle="Escalate Right Away"
                  status="urgent"
                  loading={submittingStatus === 'urgent'}
                  disabled={submittingStatus !== null}
                  onPress={() => handleStatusReport('urgent')}
                />
                {statusError ? (
                  <>
                    <Spacer y="sm" />
                    <RNText style={styles.errorText}>{statusError}</RNText>
                  </>
                ) : null}

                <View style={{ height: height * 0.035 }} />

                {/* Bottom row: Replay Voice */}
                <View style={styles.bottomRow}>
                  <TouchableOpacity
                    style={styles.bottomBtn}
                    onPress={replayVoice}
                    activeOpacity={0.8}
                  >
                    <Volume2 size={20} color={NAVY} strokeWidth={2.2} />
                    <RNText style={styles.bottomBtnText}>Replay Voice</RNText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ───────────── Vital capture (shown after check-in) ───────── */}
            {checkedIn && !successStatus ? (
              <Animated.View style={{ opacity: transition }}>
                <Spacer y="lg" />
                {/* Design wraps the whole vital-capture section in a soft card. */}
                <NeuCard style={styles.vitalCaptureCard}>
                <RNText style={styles.vitalEyebrow}>Optional Vital Capture</RNText>
                <Spacer y="xs" />
                <RNText style={styles.vitalTitle}>
                  Capture blood sugar or blood pressure
                </RNText>

                <Spacer y="md" />

                <View style={styles.vitalSelectsRow}>
                  <View style={styles.vitalCol}>
                    <RNText style={styles.selectLabel}>Vital Type</RNText>
                    <OutlinedSelect
                      options={VITAL_TYPE_OPTIONS}
                      value={vitalType}
                      onValueChange={(v) => setVitalType(v as VitalType)}
                      placeholder="Blood Sugar"
                      disabled={savingVital}
                    />
                  </View>
                  <View style={{ width: spacing[12] }} />
                  <View style={styles.vitalCol}>
                    <RNText style={styles.selectLabel}>Input Method</RNText>
                    <OutlinedSelect
                      options={INPUT_METHOD_OPTIONS}
                      value={inputMethod}
                      onValueChange={(v) => setInputMethod(v as VitalInputMethod)}
                      placeholder="Camera Capture"
                      disabled={savingVital}
                    />
                  </View>
                </View>

                <View style={styles.vitalInputRow}>
                  <View style={{ flex: 1 }}>
                    <OutlinedField
                      placeholder={`E.g. 108 ${DEFAULT_VITAL_UNIT[vitalType]}`}
                      value={vitalValue}
                      onChangeText={(v) => {
                        setVitalValue(v);
                        if (vitalError) setVitalError(undefined);
                      }}
                      keyboardType="numeric"
                      editable={!savingVital}
                      error={vitalError}
                    />
                  </View>
                  <View style={{ width: spacing[12] }} />
                  <NeuButton
                    title="Scan"
                    icon={Camera}
                    size="md"
                    disabled={savingVital}
                    onPress={() => speak('Opening camera to scan reading')}
                    style={styles.scanBtn}
                  />
                </View>

                <NeuButton
                  title="Save Reading"
                  icon={Save}
                  size="lg"
                  loading={savingVital}
                  disabled={!vitalValue.trim() || savingVital}
                  onPress={handleSaveReading}
                  style={styles.saveBtn}
                />

                {vitalSavedAt ? (
                  <>
                    <Spacer y="sm" />
                    <RNText style={styles.successText}>
                      Saved at {new Date(vitalSavedAt).toLocaleTimeString()}
                      {lastSavedMethod
                        ? ` · via ${lastSavedMethod === 'camera' ? 'Camera Capture' : 'Manual Entry'}`
                        : ''}
                      .
                    </RNText>
                  </>
                ) : null}
                </NeuCard>
              </Animated.View>
            ) : null}

            </>

            <Spacer y="xxl" />
          </View>
        </View>
      </ScrollView>
    </Screen>

    {/* ── Settings Bottom Sheet ──────────────────────────────────────── */}
    <Modal
      visible={settingsSheetOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSettings}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.35)',
          justifyContent: 'flex-end',
        }}
        onPress={closeSettings}
      >
        <Animated.View
          style={{
            backgroundColor: '#E8EFF6',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 40,
            paddingTop: 12,
            paddingHorizontal: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 14,
            transform: [{
              translateY: sheetAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            }],
          }}
        >
          {/* Handle bar */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D0D5DD' }} />
          </View>

          {/* Title row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <RNText style={{ fontSize: 20, fontFamily: interFamilyForWeight(700), color: NAVY }}>
              Settings
            </RNText>
            <TouchableOpacity onPress={closeSettings} hitSlop={12}>
              <X size={22} color={NAVY} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Family Linking — neumorphic raised card */}
          <View style={{
            borderRadius: 16,
            marginBottom: 14,
            shadowColor: '#FFFFFF',
            shadowOffset: { width: -4, height: -4 },
            shadowOpacity: 0.9,
            shadowRadius: 8,
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: '#F0F4F8',
                paddingVertical: 18,
                paddingHorizontal: 20,
                borderRadius: 16,
                shadowColor: '#B0C4D8',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 8,
                elevation: 5,
              }}
              activeOpacity={0.85}
              onPress={() => {
                closeSettings();
                // @ts-expect-error — Pairing exists on the Elder stack
                setTimeout(() => navigation.navigate('Pairing'), 250);
              }}
            >
              <View style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#E8EFF6',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#B0C4D8',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.35,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <Link2 size={20} color={NAVY} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <RNText style={{ fontSize: 16, fontFamily: interFamilyForWeight(600), color: NAVY }}>
                  Family Linking
                </RNText>
                <RNText style={{ fontSize: 13, fontFamily: interFamilyForWeight(400), color: '#6B7280', marginTop: 2 }}>
                  Connect with your family member
                </RNText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Log Out — neumorphic raised card */}
          <View style={{
            borderRadius: 16,
            shadowColor: '#FFFFFF',
            shadowOffset: { width: -4, height: -4 },
            shadowOpacity: 0.9,
            shadowRadius: 8,
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: '#F0F4F8',
                paddingVertical: 18,
                paddingHorizontal: 20,
                borderRadius: 16,
                shadowColor: '#B0C4D8',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 8,
                elevation: 5,
              }}
              activeOpacity={0.85}
              onPress={() => {
                closeSettings();
                setTimeout(handleLogout, 250);
              }}
            >
              <View style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: '#FDECEC',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#E8B4B4',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <LogOut size={20} color="#DC2626" strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <RNText style={{ fontSize: 16, fontFamily: interFamilyForWeight(600), color: '#DC2626' }}>
                  Log Out
                </RNText>
                <RNText style={{ fontSize: 13, fontFamily: interFamilyForWeight(400), color: '#6B7280', marginTop: 2 }}>
                  Sign out of your account
                </RNText>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
    </>
  );
};

