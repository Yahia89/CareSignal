import React, { useCallback, useEffect, useState } from 'react';
import { extractApiError } from '../../../shared/utils';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Text as RNText,
  RefreshControl,
} from 'react-native';
import { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import {
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  ChevronUp,
  Activity,
  Droplets,
  Info,
  Trash2,
  Save,
} from 'lucide-react-native';
import { Screen, SkeletonBlock, SkeletonGroup } from '../../../shared/components';
import { familyDashboardStyles as styles } from './FamilyDashboardScreen.styles';
import { figmaColor, spacing } from '../../../shared/design';
import { LogoCard } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { seniorService } from '../../../services/senior.service';
import { alertSettingsService } from '../../../services/alertSettings.service';
// vitalsService is senior-only; family accesses senior's vitals via seniorService.getVitals()
import type { AlertSettings, CareStatus, SeniorStatusResult, Vital } from '../../../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const careStatusPresentation = (
  s: CareStatus,
): { label: string; bg: string; care: string; nextStep: string; nextStepHint: string } => {
  switch (s) {
    case 'checked_in_ok':
      return { label: 'OK', bg: figmaColor.green, care: 'Doing Well', nextStep: 'No Action', nextStepHint: 'Status is currently stable' };
    case 'needs_help':
      return { label: 'Help', bg: figmaColor.amber, care: 'Needs Help', nextStep: 'Reach out', nextStepHint: 'Senior asked for help today' };
    case 'urgent':
      return { label: 'Urgent', bg: figmaColor.red, care: 'Urgent', nextStep: 'Call now', nextStepHint: 'Senior flagged urgent help' };
    case 'not_checked_in':
      return { label: 'Late', bg: figmaColor.amber, care: 'Not checked in', nextStep: 'Check in', nextStepHint: 'No check-in yet today' };
  }
};

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const vitalDisplayLabel = (type: string): string =>
  type === 'blood_pressure' ? 'Blood Pressure' : 'Blood Sugar';

// ── Sub-components ───────────────────────────────────────────────────────────

const HeaderIconButton = ({
  Icon,
  onPress,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.iconBtn} hitSlop={6}>
    <Icon size={20} color={figmaColor.titleNavy} strokeWidth={2.2} />
  </TouchableOpacity>
);

const StatCard = ({
  eyebrow,
  value,
  hint,
}: {
  eyebrow: string;
  value: string;
  hint: string;
}) => (
  <View style={styles.statCard}>
    <RNText style={styles.statEyebrow}>{eyebrow}</RNText>
    <RNText style={styles.statValue}>{value}</RNText>
    <RNText style={styles.statHint}>{hint}</RNText>
  </View>
);

const VitalCard = ({ vital }: { vital: Vital }) => {
  const isBP = vital.vital_type === 'blood_pressure';
  const Icon = isBP ? Activity : Droplets;

  return (
    <View style={styles.vitalCard}>
      {/* ── Info row: icon + label/value + image thumbnail ── */}
      <View style={styles.vitalCardRow}>
        <View style={styles.vitalIconWrap}>
          <Icon size={20} color={figmaColor.titleNavy} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing[12] }}>
          <RNText style={styles.vitalCardLabel}>{vitalDisplayLabel(vital.vital_type)}</RNText>
          <RNText style={styles.vitalCardValue}>{vital.value}/{vital.unit}</RNText>
        </View>
        {/* Image thumbnail — blood pressure cuff visual */}
        <View style={styles.vitalCardThumb}>
          <View style={styles.vitalCardThumbInner}>
            <Icon size={26} color={figmaColor.titleNavy} strokeWidth={1.5} />
          </View>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={styles.vitalDivider} />

      {/* ── Delete / Save button row ── */}
      <View style={styles.vitalActions}>
        <TouchableOpacity style={styles.vitalActionBtn} activeOpacity={0.7}>
          <Trash2 size={17} color={figmaColor.titleNavy} strokeWidth={2} />
          <RNText style={styles.vitalActionText}>Delete</RNText>
        </TouchableOpacity>
        <View style={styles.vitalActionSep} />
        <TouchableOpacity style={styles.vitalActionBtn} activeOpacity={0.7}>
          <Save size={17} color={figmaColor.titleNavy} strokeWidth={2} />
          <RNText style={styles.vitalActionText}>Save</RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────

export const FamilyDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { dispatch, logout } = useAuth();

  const [status, setStatus] = useState<SeniorStatusResult | null>(null);
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noLink, setNoLink] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [responsiveRatingOpen, setResponsiveRatingOpen] = useState(false);

  const fetchAll = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true); else setRefreshing(true);
    setLoadError(null);

    const statusP = seniorService.getStatus().then(
      (r) => ({ ok: true as const, value: r }),
      (e) => ({ ok: false as const, error: e }),
    );
    const settingsP = alertSettingsService.get().then((r) => r, () => null);
    // Family-accessible vitals via /senior/vitals — falls back to [] on any error.
    const vitalsP = seniorService.getVitals(5);

    try {
      const [statusResult, settingsResult, vitalsResult] = await Promise.all([
        statusP,
        settingsP,
        vitalsP,
      ]);

      if (statusResult.ok) {
        setStatus(statusResult.value);
        setNoLink(false);
      } else {
        const ax = statusResult.error as AxiosError<{ error?: string }>;
        const apiMsg = extractApiError(statusResult.error, 'Could not load status');
        if (ax?.response?.status === 403) {
          setNoLink(true);
          setStatus(null);
        } else {
          setLoadError(apiMsg);
        }
      }
      setAlertSettings(settingsResult);
      setVitals(vitalsResult);
    } finally {
      if (mode === 'initial') setLoading(false); else setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll('initial'); }, [fetchAll]);

  const handleLogout = async () => {
    await logout();
    dispatch({ type: 'LOGOUT' });
  };

  const seniorName = status
    ? `${status.senior.first_name} ${status.senior.last_name}`.trim()
    : '';
  const careStatus: CareStatus = status?.care_status ?? 'not_checked_in';
  const presentation = careStatusPresentation(careStatus);
  const lastCheckInTime = status?.check_in?.checked_in_at
    ? formatTime(status.check_in.checked_in_at)
    : '—';

  return (
    <Screen style={{ backgroundColor: figmaColor.pageBg, padding: 0 }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.logoSlot}>
          <LogoCard showSeparator={false} />
        </View>
        <View style={styles.headerRow}>
          <RNText style={styles.dailyCheckin}>Daily Checkin</RNText>
          <View style={styles.headerActions}>
            <HeaderIconButton
              Icon={SettingsIcon}
              onPress={() => navigation.navigate('FamilySettings')}
            />
            <View style={{ width: spacing[8] }} />
            <HeaderIconButton Icon={LogOut} onPress={handleLogout} />
          </View>
        </View>
        <View style={styles.shadowFade1} />
        <View style={styles.shadowFade2} />
      </View>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchAll('refresh')} />
        }
      >
        {loading ? (
          <SkeletonGroup gap={16}>
            <SkeletonBlock width={120} height={12} radius="fieldSm" />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <SkeletonBlock width={160} height={22} radius="fieldSm" />
              <SkeletonBlock width={72} height={28} radius="pill" />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonBlock height={92} radius="card" style={{ flex: 1 }} />
              <SkeletonBlock height={92} radius="card" style={{ flex: 1 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonBlock height={92} radius="card" style={{ flex: 1 }} />
              <SkeletonBlock height={92} radius="card" style={{ flex: 1 }} />
            </View>
            <SkeletonBlock height={52} radius="card" />
            <SkeletonBlock height={120} radius="card" />
          </SkeletonGroup>
        ) : noLink ? (
          /* ── Not linked ──────────────────────────────────────────────── */
          <View style={[styles.card, { padding: spacing[20] }]}>
            <RNText style={styles.h1}>Get linked to a senior</RNText>
            <View style={{ height: spacing[8] }} />
            <RNText style={styles.bodyMuted}>
              You're not linked to a senior yet. Ask them for an invite code, then accept it to
              start seeing their daily check-ins.
            </RNText>
            <View style={{ height: spacing[16] }} />
            <TouchableOpacity
              onPress={() => navigation.navigate('Pairing')}
              style={styles.primaryBtn}
            >
              <RNText style={styles.primaryBtnText}>Accept invite</RNText>
            </TouchableOpacity>
          </View>
        ) : loadError ? (
          /* ── Load error ──────────────────────────────────────────────── */
          <View
            style={[
              styles.card,
              { padding: spacing[20], borderLeftWidth: 4, borderLeftColor: figmaColor.red },
            ]}
          >
            <RNText style={[styles.bodyMuted, { color: figmaColor.red }]}>{loadError}</RNText>
            <View style={{ height: spacing[12] }} />
            <TouchableOpacity onPress={() => fetchAll('initial')} style={styles.primaryBtn}>
              <RNText style={styles.primaryBtnText}>Retry</RNText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── Today's Status ─────────────────────────────────────────── */}
            <RNText style={styles.smallEyebrow}>Today's Status</RNText>
            <View style={styles.statusRow}>
              <RNText style={styles.statusName} numberOfLines={1}>
                {seniorName || '—'}
              </RNText>
              <View style={[styles.statusPill, { backgroundColor: presentation.bg }]}>
                <RNText style={styles.statusPillText}>{presentation.label}</RNText>
              </View>
            </View>

            <View style={{ height: spacing[20] }} />

            {/* ── 2 × 2 Stat grid ────────────────────────────────────────── */}
            <View style={styles.gridRow}>
              <StatCard
                eyebrow="Care Status"
                value={presentation.care}
                hint="Signal from Experience"
              />
              <View style={{ width: spacing[12] }} />
              <StatCard
                eyebrow="Morning Check-In"
                value={lastCheckInTime}
                hint="Primary daily touchpoint"
              />
            </View>
            <View style={{ height: spacing[12] }} />
            <View style={styles.gridRow}>
              <StatCard
                eyebrow="Next Step"
                value={presentation.nextStep}
                hint={presentation.nextStepHint}
              />
              <View style={{ width: spacing[12] }} />
              <StatCard
                eyebrow="Status"
                value={presentation.label}
                hint="Primary daily touchpoint"
              />
            </View>

            <View style={{ height: spacing[20] }} />

            {/* ── Responsive Rating — collapsible ────────────────────────── */}
            <Pressable
              onPress={() => setResponsiveRatingOpen((v) => !v)}
              style={[
                styles.collapsibleBtn,
                responsiveRatingOpen && styles.collapsibleBtnOpen,
              ]}
            >
              <Info size={18} color={figmaColor.titleNavy} strokeWidth={2.2} />
              <RNText style={styles.collapsibleLabel}>Responsive Rating</RNText>
              {responsiveRatingOpen ? (
                <ChevronUp size={18} color={figmaColor.titleNavy} />
              ) : (
                <ChevronDown size={18} color={figmaColor.titleNavy} />
              )}
            </Pressable>
            {responsiveRatingOpen && (
              <View style={styles.collapsibleBody}>
                <View style={styles.ratingRow}>
                  <View style={[styles.ratingDot, { backgroundColor: figmaColor.green }]} />
                  <RNText style={styles.ratingRowLabel}>Family Alert Status</RNText>
                  <RNText style={styles.ratingRowValue}>STANDING BY</RNText>
                </View>
                <View style={styles.ratingDivider} />
                <View style={styles.ratingRow}>
                  <View
                    style={[
                      styles.ratingDot,
                      { backgroundColor: careStatus === 'urgent' ? figmaColor.red : figmaColor.amber },
                    ]}
                  />
                  <RNText style={styles.ratingRowLabel}>Emergency Contact</RNText>
                  <RNText style={styles.ratingRowValue}>
                    {careStatus === 'urgent' ? 'ENGAGED' : 'NOT ENGAGED'}
                  </RNText>
                </View>
                <View style={styles.ratingDivider} />
                <View style={styles.ratingRow}>
                  <View
                    style={[
                      styles.ratingDot,
                      { backgroundColor: seniorName ? figmaColor.green : figmaColor.textMuted },
                    ]}
                  />
                  <RNText style={styles.ratingRowLabel}>Linked Account</RNText>
                  <RNText style={styles.ratingRowValue}>
                    {seniorName
                      ? `CONNECTED TO ${(seniorName.split(' ')[0] ?? '').toUpperCase()}`
                      : 'NOT CONNECTED'}
                  </RNText>
                </View>
              </View>
            )}

            {/* ── Vitals Snapshot ────────────────────────────────────────── */}
            <View style={{ height: spacing[20] }} />
            <RNText style={styles.sectionTitle}>Vitals Snapshot</RNText>
            <View style={{ height: spacing[12] }} />
            {vitals.length > 0 ? (
              vitals.map((v) => (
                <React.Fragment key={v.id}>
                  <VitalCard vital={v} />
                  <View style={{ height: spacing[12] }} />
                </React.Fragment>
              ))
            ) : (
              <View style={styles.vitalsEmptyCard}>
                <RNText style={styles.vitalsEmptyText}>
                  No vitals available. Once the senior logs a blood sugar or blood pressure reading,
                  it will appear here.
                </RNText>
              </View>
            )}
          </>
        )}

        <View style={{ height: spacing[40] }} />
      </ScrollView>
    </Screen>
  );
};
