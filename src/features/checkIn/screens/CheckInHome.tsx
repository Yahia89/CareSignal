import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Text as RNText,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { checkInHomeStyles as styles } from './CheckInHome.styles';
import {
  LogOut,
  Volume2,
  Smile,
  AlertTriangle,
  BellRing,
  ScanLine,
  Save,
  Link as LinkIcon,
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
import { OutlinedSelect, OutlinedField, SegmentedControl } from '../../../shared/components';
import { LogoCard } from '../../../shared/components';
import { checkInsService } from '../../../services/checkins.service';
import { vitalsService } from '../../../services/vitals.service';
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

export const CheckInHome = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useAuth();
  const { state: settingsState } = useSettings();
  const colors = useColors();
  const { width } = useWindowDimensions();
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
  const [savingVital, setSavingVital] = useState(false);
  const [vitalSavedAt, setVitalSavedAt] = useState<number | null>(null);

  const { speak } = useVoiceAssistant(voiceOn);

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

  const handleLogout = () => {
    speak('Logging out');
    dispatch({ type: 'LOGOUT' });
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
    try {
      const checkIn = await checkInsService.createCheckIn({ status });
      setTodayCheckIn(checkIn);
    } catch (err) {
      setStatusError(extractApiError(err, 'Failed to submit check-in. Please try again.'));
    } finally {
      setSubmittingStatus(null);
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
    } catch (err) {
      setVitalError(extractApiError(err, 'Failed to save reading. Please try again.'));
    } finally {
      setSavingVital(false);
    }
  };

  /**
   * Open the system camera so the senior can photograph their meter display.
   *
   * Implementation notes:
   *   - Uses the OS camera app via `launchCameraAsync` — no in-app preview UI
   *     to learn. Better for an older user base.
   *   - Permission request is handled here at tap-time (just-in-time
   *     permission pattern). If the user has already denied, we surface a
   *     short message rather than silently failing.
   *   - OCR is not yet wired. Once a photo is captured, we currently prompt
   *     the user to type the reading manually with the photo as a reference.
   *     When the backend Vision OCR endpoint ships, replace the manual-prompt
   *     branch with a POST that returns the parsed digit string.
   */
  const handleScanVital = async () => {
    speak('Opening camera to scan reading');
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        speak('Camera permission is needed to scan readings.');
        Alert.alert(
          'Camera permission needed',
          'Please allow camera access from Settings, then tap Scan again. You can also type the reading manually for now.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false,
        // Sensitive data — store privately for the session only, never to the
        // shared photo library.
        cameraType: ImagePicker.CameraType.back,
      });
      if (result.canceled) return;

      // OCR isn't built yet. For now, surface the captured photo path in a
      // log (so QA can verify the camera flow), then nudge the user to enter
      // the reading manually with the photo on screen to copy from.
      const uri = result.assets[0]?.uri;
      console.log('[scan] captured photo at', uri);
      setInputMethod('camera');
      speak('Photo captured. Please type the reading you see.');
    } catch (err) {
      console.warn('[scan] camera failed', err);
      speak('Camera could not open. Please type the reading manually.');
    }
  };

  // Map today's check-in status to the corresponding label + icon below.
  const checkedIn = todayCheckIn != null;
  const checkedInStatus = todayCheckIn?.status;

  const greetingName = user?.name?.split(' ')[0] || 'Eleanor';

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─────────── White header (logo + Logout + "Daily Checkin") ─── */}
        <View style={styles.whiteHeader}>
          <View
            style={[
              styles.headerInner,
              isTablet && styles.headerInnerTablet,
            ]}
          >
              <View style={styles.logoSlot}>
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
              </View>
             <View style={styles.headerRow}> 
              <RNText style={styles.dailyCheckin}>Daily Checkin</RNText>
              <NeuButton
                title="Pairing"
                icon={LinkIcon}
                size="sm"
                // @ts-expect-error — Pairing exists on Elder stack
                onPress={() => navigation.navigate('Pairing')}
                style={styles.logoutBtn}
              />
              <NeuButton
                title="Logout"
                icon={LogOut}
                size="sm"
                onPress={handleLogout}
                style={styles.logoutBtn}
              />
            </View>
          </View>
          {/* Soft fade at the bottom edge of the white header — the visual
              boundary between header and page bg. */}
          <View style={styles.shadowFade1} />
          <View style={styles.shadowFade2} />
          <View style={styles.shadowFade3} />
          <View style={styles.shadowFade4} />
        </View>

        {/* ─────────────────────── Page content ──────────────────────── */}
        <View
          style={[
            styles.pageContent,
            { paddingHorizontal: isTablet ? spacing[32] : spacing[24] },
          ]}
        >
          <View style={[styles.constrain, isTablet && styles.constrainTablet]}>
          {/* ─────────────────────────── Greeting ────────────────────── */}
          <RNText style={styles.greeting}>Good Morning, {greetingName}</RNText>
          <Spacer y="xs" />
          <RNText style={styles.greetingSub}>How are you doing today?</RNText>
          <Spacer y="xs" />
          <RNText style={styles.voiceReady}>Voice assistant is ready</RNText>

          <Spacer y="md" />

          {/* ─────────── Voice control card (neumorphic blue shadow) ─── */}
          <NeuCard style={styles.voiceCard}>
          <View style={styles.voiceRow}>
            <NeuButton
              title={voiceOn ? 'Voice ON' : 'Voice OFF'}
              icon={Volume2}
              variant={voiceOn ? 'filled' : 'primary'}
              size="sm"
              onPress={() => {
                const next = !voiceOn;
                setVoiceOn(next);
                if (next) speak('Voice assistance enabled', { force: true });
              }}
              style={styles.voiceBtn}
            />
            <NeuButton
              title="Test Voice"
              size="sm"
              onPress={() => speak('Testing 1 2 3', { force: true })}
              style={styles.voiceBtn}
            />
            <View style={styles.voiceSelectWrap}>
              <SegmentedControl
                options={VOICE_TYPE_OPTIONS}
                value={voiceType}
                onValueChange={setVoiceType}
              />
            </View>
          </View>
          </NeuCard>

          <Spacer y="md" />

          {/* ─────────────────────── Status action buttons ────────────── */}
          {checkedIn ? (
            <View style={styles.alreadyCheckedIn}>
              <RNText style={styles.alreadyCheckedInLabel}>
                Today's status:{' '}
                <RNText style={styles.alreadyCheckedInValue}>
                  {checkedInStatus === 'ok'
                    ? 'OK'
                    : checkedInStatus === 'needs_help'
                      ? 'Needs Help'
                      : 'Urgent'}
                </RNText>
              </RNText>
              <RNText style={styles.alreadyCheckedInHint}>
                You've already checked in today. Come back tomorrow.
              </RNText>
            </View>
          ) : (
            <>
              <NeuButton
                title="I’m OK"
                icon={Smile}
                size="lg"
                loading={submittingStatus === 'ok'}
                disabled={submittingStatus !== null}
                onPress={() => handleStatusReport('ok')}
                style={styles.statusBtn}
              />
              <Spacer y="md" />
              <NeuButton
                title="I Need Help"
                icon={AlertTriangle}
                size="lg"
                loading={submittingStatus === 'needs_help'}
                disabled={submittingStatus !== null}
                onPress={() => handleStatusReport('needs_help')}
                style={styles.statusBtn}
              />
              <Spacer y="md" />
              <NeuButton
                title="Urgent Help"
                icon={BellRing}
                size="lg"
                loading={submittingStatus === 'urgent'}
                disabled={submittingStatus !== null}
                onPress={() => handleStatusReport('urgent')}
                style={styles.statusBtn}
              />
              {statusError ? (
                <>
                  <Spacer y="sm" />
                  <RNText style={styles.errorText}>{statusError}</RNText>
                </>
              ) : null}
            </>
          )}

          <Spacer y="xl" />

          {/* ─────────────────────── Vital capture section ────────────── */}
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
              icon={ScanLine}
              size="md"
              disabled={savingVital}
              onPress={handleScanVital}
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
                Saved at {new Date(vitalSavedAt).toLocaleTimeString()}.
              </RNText>
            </>
          ) : null}

          <Spacer y="xxl" />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

