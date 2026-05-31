import React, { useCallback, useEffect, useRef, useState } from 'react';
import { extractApiError } from '../../../shared/utils';
import { View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Pressable, Text as RNText } from 'react-native';
import { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Screen } from '../../../shared/components';
import { settingsScreenStyles as styles } from "./SettingsScreen.styles";
import { spacing, borderRadius, figmaColor, figmaFont, figmaRadius } from '../../../shared/design';
import { LogoCard } from '../../../shared/components';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { alertSettingsService } from '../../../services/alertSettings.service';
import type { AlertSettings } from '../../../types';
import { DEFAULT_ALERT_SETTINGS } from '../../../types';

type SettingKey = keyof AlertSettings;

// Pill toggle ───────────────────────────────────────────────────────────────
const PillToggle = ({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <Pressable
    onPress={() => !disabled && onChange(!value)}
    style={[
      styles.toggleTrack,
      { backgroundColor: value ? figmaColor.green : figmaColor.toggleOff, opacity: disabled ? 0.5 : 1 },
    ]}
  >
    <View style={[styles.toggleKnob, value ? styles.toggleKnobOn : styles.toggleKnobOff]} />
  </Pressable>
);

// Checkbox row ──────────────────────────────────────────────────────────────
const CheckboxRow = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <Pressable
    onPress={() => !disabled && onChange(!value)}
    style={[styles.checkboxRow, { opacity: disabled ? 0.6 : 1 }]}
  >
    <RNText style={styles.checkboxLabel}>{label}</RNText>
    <View style={[styles.checkbox, value && styles.checkboxOn]}>
      {value ? <Check size={16} color="#FFF" /> : null}
    </View>
  </Pressable>
);

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { dispatch, logout } = useAuth();

  const [settings, setSettings] = useState<AlertSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConfirmed = useRef<AlertSettings | null>(null);

  const fetchSettings = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true); else setRefreshing(true);
    setLoadError(null);
    try {
      const result = await alertSettingsService.get();
      setSettings(result);
      lastConfirmed.current = result;
    } catch (err) {
      const ax = err as AxiosError<{ error?: string }>;
      if (ax?.response?.status === 404) {
        setSettings(DEFAULT_ALERT_SETTINGS);
        lastConfirmed.current = DEFAULT_ALERT_SETTINGS;
      } else {
        setLoadError(extractApiError(err, 'Could not load settings'));
      }
    } finally {
      if (mode === 'initial') setLoading(false); else setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSettings('initial'); }, [fetchSettings]);

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const persist = useCallback(async (snapshot: AlertSettings) => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await alertSettingsService.update(snapshot);
      setSettings(updated);
      lastConfirmed.current = updated;
    } catch (err) {
      setSaveError(extractApiError(err, 'Could not save changes'));
      if (lastConfirmed.current) setSettings(lastConfirmed.current);
    } finally {
      setSaving(false);
    }
  }, []);

  const handleToggle = (key: SettingKey) => (next: boolean) => {
    if (!settings) return;
    const optimistic: AlertSettings = { ...settings, [key]: next };
    setSettings(optimistic);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { persist(optimistic); }, 400);
  };

  const handleLogout = async () => {
    await logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <Screen style={{ backgroundColor: figmaColor.pageBg, padding: 0 }}>
      {/* White header — logo + "← Alert Settings" title */}
      <View style={styles.header}>
        <View style={styles.logoSlot}>
          <LogoCard showSeparator={false} />
        </View>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={22} color={figmaColor.titleNavy} strokeWidth={2.5} />
          <RNText style={styles.headerTitle}>Alert Settings</RNText>
        </TouchableOpacity>
        <View style={styles.shadowFade1} />
        <View style={styles.shadowFade2} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchSettings('refresh')} />}
      >
        <RNText style={styles.eyebrow}>Family Alert Settings</RNText>
        <RNText style={styles.heading}>Configure how help alerts are delivered per response type</RNText>

        <View style={{ height: spacing[20] }} />

        {loading ? (
          <View style={{ paddingVertical: spacing[40], alignItems: 'center' }}>
            <ActivityIndicator color={figmaColor.titleNavy} />
          </View>
        ) : loadError ? (
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: figmaColor.red }]}>
            <RNText style={[styles.bodyText, { color: figmaColor.red }]}>{loadError}</RNText>
            <View style={{ height: spacing[12] }} />
            <TouchableOpacity onPress={() => fetchSettings('initial')} style={styles.retryBtn}>
              <RNText style={styles.retryBtnText}>Retry</RNText>
            </TouchableOpacity>
          </View>
        ) : settings ? (
          <>
            {saveError && (
              <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: figmaColor.red, marginBottom: spacing[12] }]}>
                <RNText style={[styles.bodyText, { color: figmaColor.red }]}>{saveError}</RNText>
              </View>
            )}

            {/* Senior App Settings — pill toggle */}
            <View style={styles.card}>
              <RNText style={styles.cardEyebrow}>Senior App Settings</RNText>
              <View style={styles.vitalRow}>
                <View style={{ flex: 1, paddingRight: spacing[16] }}>
                  <RNText style={styles.vitalTitle}>Optional Vital Capture</RNText>
                  <RNText style={styles.vitalDescription}>
                    Allow the senior to optionally enter blood sugar or blood pressure during daily check-in
                  </RNText>
                </View>
                <PillToggle
                  value={settings.vital_capture_enabled}
                  disabled={saving}
                  onChange={handleToggle('vital_capture_enabled')}
                />
              </View>
            </View>

            <View style={{ height: spacing[16] }} />

            {/* I Need Help */}
            <View style={styles.card}>
              <RNText style={styles.sectionTitle}>I Need Help</RNText>
              <CheckboxRow label="Email Alert" value={settings.needs_help_email} disabled={saving} onChange={handleToggle('needs_help_email')} />
              <CheckboxRow label="Text Alert" value={settings.needs_help_text} disabled={saving} onChange={handleToggle('needs_help_text')} />
              <CheckboxRow label="Phone Call Alert" value={settings.needs_help_phone} disabled={saving} onChange={handleToggle('needs_help_phone')} />
            </View>

            <View style={{ height: spacing[16] }} />

            {/* Urgent Help */}
            <View style={styles.card}>
              <RNText style={styles.sectionTitle}>Urgent Help</RNText>
              <CheckboxRow label="Email Alert" value={settings.urgent_help_email} disabled={saving} onChange={handleToggle('urgent_help_email')} />
              <CheckboxRow label="Text Alert" value={settings.urgent_help_text} disabled={saving} onChange={handleToggle('urgent_help_text')} />
              <CheckboxRow label="Phone Call Alert" value={settings.urgent_help_phone} disabled={saving} onChange={handleToggle('urgent_help_phone')} />
              <CheckboxRow label="Auto-call Senior" value={settings.urgent_auto_call_senior} disabled={saving} onChange={handleToggle('urgent_auto_call_senior')} />
            </View>

            {saving && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[12] }}>
                <ActivityIndicator size="small" color={figmaColor.textMuted} />
                <RNText style={[styles.smallMuted, { marginLeft: 6 }]}>Saving…</RNText>
              </View>
            )}

            <View style={{ height: spacing[24] }} />

            <TouchableOpacity onPress={() => navigation.navigate('Alerts')} style={styles.linkBtn}>
              <RNText style={styles.linkBtnText}>View alert history</RNText>
            </TouchableOpacity>
            <View style={{ height: spacing[12] }} />
            <TouchableOpacity onPress={handleLogout} style={styles.linkBtn}>
              <RNText style={styles.linkBtnText}>Logout</RNText>
            </TouchableOpacity>
          </>
        ) : null}

        <View style={{ height: spacing[40] }} />
      </ScrollView>
    </Screen>
  );
};
