import React, { useCallback, useEffect, useState } from 'react';
import { extractApiError } from '../../../shared/utils';
import { View, ScrollView, TouchableOpacity, Pressable, Text as RNText, ActivityIndicator, RefreshControl } from 'react-native';
import { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Settings as SettingsIcon, LogOut, ChevronDown, ChevronUp, Bell, BellRing, Link as LinkIcon, Info } from 'lucide-react-native';
import { Screen, SkeletonBlock, SkeletonGroup } from '../../../shared/components';
import { familyDashboardStyles as styles } from "./FamilyDashboardScreen.styles";
import { figmaColor, figmaFont, figmaRadius, spacing } from '../../../shared/design';
import { LogoCard } from '../../../shared/components';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { seniorService } from '../../../services/senior.service';
import { alertSettingsService } from '../../../services/alertSettings.service';
import type { AlertSettings, CareStatus, SeniorStatusResult } from '../../../types';

// Care status → presentation ────────────────────────────────────────────────
const careStatusPresentation = (s: CareStatus): { label: string; bg: string; care: string; nextStep: string; nextStepHint: string } => {
  switch (s) {
    case 'checked_in_ok':
      return { label: 'OK', bg: figmaColor.green, care: 'Doing Well', nextStep: 'No Action', nextStepHint: 'Status is currently stable' };
    case 'needs_help':
      return { label: 'Help', bg: figmaColor.amber, care: 'Needs Help', nextStep: 'Reach out', nextStepHint: 'Senior asked for help today' };
    case 'urgent':
      return { label: 'Urgent', bg: figmaColor.red, care: 'Urgent', nextStep: 'Call now', nextStepHint: 'Senior flagged urgent help' };
    case 'not_checked_in':
      return { label: 'Late', bg: figmaColor.amber, care: 'Not checked in', nextStep: 'Check in', nextStepHint: "No check-in yet today" };
  }
};

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Comma-list of enabled channels
const channelList = (s: AlertSettings | null, kind: 'needs' | 'urgent'): string => {
  if (!s) return '—';
  const channels: string[] = [];
  if (kind === 'needs') {
    if (s.needs_help_email) channels.push('Email');
    if (s.needs_help_text) channels.push('Text');
    if (s.needs_help_phone) channels.push('Phone call');
  } else {
    if (s.urgent_help_email) channels.push('Email');
    if (s.urgent_help_text) channels.push('Text');
    if (s.urgent_help_phone) channels.push('Phone call');
    if (s.urgent_auto_call_senior) channels.push('Auto-call senior');
  }
  return channels.length ? channels.join(', ') : 'None configured';
};

// ── Subcomponents ───────────────────────────────────────────────────────────
const HeaderIconButton = ({ Icon, onPress }: { Icon: any; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconBtn} hitSlop={6}>
    <Icon size={20} color={figmaColor.titleNavy} strokeWidth={2.2} />
  </TouchableOpacity>
);

const StatCard = ({ eyebrow, value, hint }: { eyebrow: string; value: string; hint: string }) => (
  <View style={styles.statCard}>
    <RNText style={styles.statEyebrow}>{eyebrow}</RNText>
    <RNText style={styles.statValue}>{value}</RNText>
    <RNText style={styles.statHint}>{hint}</RNText>
  </View>
);

const ResponseRow = ({ Icon, label, value }: { Icon: any; label: string; value: string }) => (
  <View style={styles.responseRow}>
    <Icon size={18} color={figmaColor.titleNavy} strokeWidth={2.2} />
    <RNText style={styles.responseLabel} numberOfLines={1}>
      {label} : <RNText style={styles.responseValue}>{value}</RNText>
    </RNText>
  </View>
);

// ── Screen ──────────────────────────────────────────────────────────────────
export const FamilyDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { state, dispatch, logout } = useAuth();
  const user = state.user;

  const [status, setStatus] = useState<SeniorStatusResult | null>(null);
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noLink, setNoLink] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const fetchAll = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true); else setRefreshing(true);
    setLoadError(null);

    // Run both in parallel — settings is best-effort and shouldn't block the dashboard.
    const statusP = seniorService.getStatus().then(
      (r) => ({ ok: true as const, value: r }),
      (e) => ({ ok: false as const, error: e })
    );
    const settingsP = alertSettingsService.get().then(
      (r) => r,
      () => null
    );

    try {
      const [statusResult, settingsResult] = await Promise.all([statusP, settingsP]);
      if (statusResult.ok) {
        setStatus(statusResult.value);
        setNoLink(false);
      } else {
        const ax = statusResult.error as AxiosError<{ error?: string }>;
        const apiMsg = extractApiError(statusResult.error, 'Could not load status');
        if (ax?.response?.status === 403) {
          setNoLink(true);
          setStatus(null);
        } else if (/profile.*not.*found|senior.*not.*found/i.test(apiMsg)) {
          // Backend has the link record (active) but its join to the senior's
          // Profile returns nothing. The senior's profile exists (they were
          // able to generate the invite); the join in `/senior/status`
          // appears to use the wrong key. Backend bug — flag to API team.
          setLoadError(
            "Your account is linked, but the dashboard couldn't load the senior's status. " +
              "Pull to refresh in a moment, or contact support if this persists."
          );
        } else {
          setLoadError(apiMsg);
        }
      }
      setAlertSettings(settingsResult);
    } finally {
      if (mode === 'initial') setLoading(false); else setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll('initial'); }, [fetchAll]);

  const handleLogout = async () => {
    await logout();
    dispatch({ type: 'LOGOUT' });
  };

  const seniorName = status ? `${status.senior.first_name} ${status.senior.last_name}`.trim() : '';
  const careStatus: CareStatus = status?.care_status ?? 'not_checked_in';
  const presentation = careStatusPresentation(careStatus);
  const lastCheckInTime = status?.check_in?.checked_in_at ? formatTime(status.check_in.checked_in_at) : '—';

  return (
    <Screen style={{ backgroundColor: figmaColor.pageBg, padding: 0 }}>
      {/* White header */}
      <View style={styles.header}>
        <View style={styles.logoSlot}>
          <LogoCard showSeparator={false} />
        </View>
        <View style={styles.headerRow}>
          <RNText style={styles.dailyCheckin}>Daily Checkin</RNText>
          <View style={styles.headerActions}>
            <HeaderIconButton Icon={SettingsIcon} onPress={() => navigation.navigate('FamilySettings')} />
            <View style={{ width: spacing[8] }} />
            <HeaderIconButton Icon={LogOut} onPress={handleLogout} />
          </View>
        </View>
        <View style={styles.shadowFade1} />
        <View style={styles.shadowFade2} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll('refresh')} />}
      >
        {loading ? (
          <SkeletonGroup gap={16}>
            {/* Today's Status row */}
            <SkeletonBlock width={120} height={12} radius="fieldSm" />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <SkeletonBlock width={160} height={22} radius="fieldSm" />
              <SkeletonBlock width={72} height={28} radius="pill" />
            </View>
            {/* About card */}
            <SkeletonBlock height={88} radius="card" />
            {/* 2x2 stat grid */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonBlock height={92} radius="card" style={{ flex: 1 }} />
              <SkeletonBlock height={92} radius="card" style={{ flex: 1 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonBlock height={92} radius="card" style={{ flex: 1 }} />
              <SkeletonBlock height={92} radius="card" style={{ flex: 1 }} />
            </View>
            {/* Response rating + routing */}
            <SkeletonBlock height={120} radius="card" />
            <SkeletonBlock height={140} radius="card" />
          </SkeletonGroup>
        ) : noLink ? (
          <View style={[styles.card, { padding: spacing[20] }]}>
            <RNText style={styles.h1}>Get linked to a senior</RNText>
            <View style={{ height: spacing[8] }} />
            <RNText style={styles.bodyMuted}>
              You're not linked to a senior yet. Ask them for an invite code, then accept it to start seeing their daily check-ins.
            </RNText>
            <View style={{ height: spacing[16] }} />
            <TouchableOpacity onPress={() => navigation.navigate('Pairing')} style={styles.primaryBtn}>
              <RNText style={styles.primaryBtnText}>Accept invite</RNText>
            </TouchableOpacity>
          </View>
        ) : loadError ? (
          <View style={[styles.card, { padding: spacing[20], borderLeftWidth: 4, borderLeftColor: figmaColor.red }]}>
            <RNText style={[styles.bodyMuted, { color: figmaColor.red }]}>{loadError}</RNText>
            <View style={{ height: spacing[12] }} />
            <TouchableOpacity onPress={() => fetchAll('initial')} style={styles.primaryBtn}>
              <RNText style={styles.primaryBtnText}>Retry</RNText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Today's status */}
            <RNText style={styles.smallEyebrow}>Today's Status</RNText>
            <View style={styles.statusRow}>
              <RNText style={styles.statusName}>{seniorName || '—'}</RNText>
              <View style={[styles.statusPill, { backgroundColor: presentation.bg }]}>
                <RNText style={styles.statusPillText}>{presentation.label}</RNText>
              </View>
            </View>

            <View style={{ height: spacing[16] }} />

            {/* About the app — expandable */}
            <Pressable onPress={() => setAboutOpen((v) => !v)} style={styles.aboutBtn}>
              <Info size={18} color={figmaColor.titleNavy} strokeWidth={2.2} />
              <RNText style={styles.aboutLabel}>About the App</RNText>
              {aboutOpen ? <ChevronUp size={18} color={figmaColor.titleNavy} /> : <ChevronDown size={18} color={figmaColor.titleNavy} />}
            </Pressable>
            {aboutOpen && (
              <View style={styles.aboutBody}>
                <RNText style={styles.bodyMuted}>
                  CareSignal gives family members a simple daily pulse between visits, so they can quickly understand whether things are steady, need support, or require immediate escalation.
                </RNText>
              </View>
            )}

            <View style={{ height: spacing[16] }} />

            {/* 2x2 stat grid */}
            <View style={styles.grid}>
              <View style={styles.gridRow}>
                <StatCard eyebrow="Care Status" value={presentation.care} hint="Signal from Experience" />
                <View style={{ width: spacing[12] }} />
                <StatCard eyebrow="Morning Check-In" value={lastCheckInTime} hint="Primary daily touchpoint" />
              </View>
              <View style={{ height: spacing[12] }} />
              <View style={styles.gridRow}>
                <StatCard eyebrow="Next Step" value={presentation.nextStep} hint={presentation.nextStepHint} />
                <View style={{ width: spacing[12] }} />
                <StatCard eyebrow="Status" value={presentation.label} hint="Primary daily touchpoint" />
              </View>
            </View>

            <View style={{ height: spacing[20] }} />

            {/* Response Rating */}
            <View style={[styles.card, { padding: spacing[16] }]}>
              <RNText style={[styles.eyebrowMd, { marginBottom: spacing[12] }]}>Response Rating</RNText>
              <ResponseRow Icon={Bell} label="Family Alert Status" value="STANDING BY" />
              <View style={{ height: spacing[8] }} />
              <ResponseRow Icon={BellRing} label="Emergency Contact" value="NOT ENGAGED" />
              <View style={{ height: spacing[8] }} />
              <ResponseRow
                Icon={LinkIcon}
                label="Linked account"
                value={seniorName ? `CONNECTED TO ${seniorName.split(' ')[0]?.toUpperCase()}` : 'NOT CONNECTED'}
              />
            </View>

            <View style={{ height: spacing[20] }} />

            {/* Current Alert Routing */}
            <RNText style={[styles.smallEyebrow, { marginBottom: spacing[12] }]}>Current Alert Routing</RNText>
            <View style={styles.routingCard}>
              <RNText style={styles.routingEyebrow}>I Need Help</RNText>
              <RNText style={styles.routingValue}>{channelList(alertSettings, 'needs')}</RNText>
            </View>
            <View style={{ height: spacing[12] }} />
            <View style={styles.routingCard}>
              <RNText style={styles.routingEyebrow}>Urgent Help</RNText>
              <RNText style={styles.routingValue}>{channelList(alertSettings, 'urgent')}</RNText>
            </View>
          </>
        )}

        <View style={{ height: spacing[40] }} />
      </ScrollView>
    </Screen>
  );
};
