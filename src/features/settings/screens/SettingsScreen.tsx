import React, { useCallback, useEffect, useRef, useState } from 'react';
import { extractApiError } from '../../../shared/utils';
import { View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Pressable, Text as RNText } from 'react-native';
import { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check, Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Screen } from '../../../shared/components';
import { settingsScreenStyles as styles } from "./SettingsScreen.styles";
import { spacing, borderRadius, figmaColor, figmaFont, figmaRadius } from '../../../shared/design';
import { LogoCard } from '../../../shared/components';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';
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

  const [aboutOpen, setAboutOpen] = useState(false);
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
      // Defensive merge — backend may return a partial object as the schema
      // evolves. We need every field present to PUT later, so fill any
      // missing keys from DEFAULT_ALERT_SETTINGS.
      const complete: AlertSettings = { ...DEFAULT_ALERT_SETTINGS, ...result };
      setSettings(complete);
      lastConfirmed.current = complete;
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
    // Always send a fully-populated payload. The PUT contract is "full
    // replacement" — sending a partial would clobber unrelated fields with
    // undefined and the server would either 422 or persist the wrong shape.
    const complete: AlertSettings = { ...DEFAULT_ALERT_SETTINGS, ...snapshot };
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await alertSettingsService.update(complete);
      const merged: AlertSettings = { ...DEFAULT_ALERT_SETTINGS, ...updated };
      setSettings(merged);
      lastConfirmed.current = merged;
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

  /**
   * Manual save fallback — fires immediately, skipping the debounce timer.
   * Useful when the user wants explicit confirmation that changes saved, or
   * when auto-save was interrupted by a navigation away from the screen.
   */
  const handleSaveNow = useCallback(() => {
    if (!settings) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    persist(settings);
  }, [settings, persist]);

  // Has the user changed anything that hasn't been confirmed by the server?
  const isDirty =
    !!settings &&
    !!lastConfirmed.current &&
    JSON.stringify(settings) !== JSON.stringify(lastConfirmed.current);

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

        {/* About the App — collapsible ─────────────────────────────────── */}
        <Pressable
          onPress={() => setAboutOpen((v) => !v)}
          style={[styles.aboutBtn, aboutOpen && styles.aboutBtnOpen]}
        >
          <Info size={18} color={figmaColor.titleNavy} strokeWidth={2.2} />
          <RNText style={styles.aboutLabel}>About the App</RNText>
          {aboutOpen
            ? <ChevronUp size={18} color={figmaColor.titleNavy} />
            : <ChevronDown size={18} color={figmaColor.titleNavy} />}
        </Pressable>
        {aboutOpen && (
          <View style={styles.aboutBody}>
            <RNText style={styles.bodyText}>
              CareSignal gives family members a simple daily pulse between visits, so they can
              quickly understand whether things are steady, need support, or require immediate
              escalation.
            </RNText>
          </View>
        )}

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

            {/* Current Alert Routing — summary display */}
            <RNText style={styles.routingHeading}>Current Alert Routing</RNText>
            <View style={{ height: spacing[8] }} />
            <View style={styles.routingCard}>
              <RNText style={styles.routingEyebrow}>I Need Help</RNText>
              <RNText style={styles.routingValue}>
                {[
                  settings.needs_help_email && 'Email',
                  settings.needs_help_text && 'Text',
                  settings.needs_help_phone && 'Phone call',
                ].filter(Boolean).join(', ') || 'None configured'}
              </RNText>
            </View>
            <View style={{ height: spacing[8] }} />
            <View style={styles.routingCard}>
              <RNText style={styles.routingEyebrow}>Urgent Help</RNText>
              <RNText style={styles.routingValue}>
                {[
                  settings.urgent_help_email && 'Email',
                  settings.urgent_help_text && 'Text',
                  settings.urgent_help_phone && 'Phone call',
                  settings.urgent_auto_call_senior && 'Auto-call senior',
                ].filter(Boolean).join(', ') || 'None configured'}
              </RNText>
            </View>

            <View style={{ height: spacing[20] }} />

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
            </View>

            {saving ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing[12] }}>
                <ActivityIndicator size="small" color={figmaColor.textMuted} />
                <RNText style={[styles.smallMuted, { marginLeft: 6 }]}>Saving…</RNText>
              </View>
            ) : isDirty ? (
              <View style={{ marginTop: spacing[12] }}>
                <RNText style={[styles.smallMuted, { marginBottom: 8 }]}>Unsaved changes</RNText>
                <TouchableOpacity onPress={handleSaveNow} style={styles.retryBtn}>
                  <RNText style={styles.retryBtnText}>Save now</RNText>
                </TouchableOpacity>
              </View>
            ) : lastConfirmed.current ? (
              <RNText style={[styles.smallMuted, { marginTop: spacing[12] }]}>All changes saved.</RNText>
            ) : null}
            <View style={{ height: spacing[24] }} />
            <TouchableOpacity onPress={() => navigation.navigate('Alerts')} style={styles.linkBtn}>
              <RNText style={styles.linkBtnText}>View alert history</RNText>
            </TouchableOpacity>
          </>
        ) : null}

        <View style={{ height: spacing[40] }} />
      </ScrollView>
    </Screen>
  );
};
