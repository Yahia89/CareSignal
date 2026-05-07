import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { HeartPulse, LogOut, Bell, Link as LinkIcon, ShieldAlert, Camera, Volume2 } from 'lucide-react-native';
import { Screen, Text, Spacer, StatusBadge } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useSettings } from '../../../shared/contexts/SettingsContext';
import { NeuButton, NeuCard, useColors, useTokens, spacing, borderRadius, getShadowStyle } from '../../../shared/design';

export const FamilyDashboardScreen = () => {
  const { width } = useWindowDimensions();
  const { state, dispatch } = useAuth();
  const colors = useColors();
  const tokens = useTokens();
  const { state: settingsState, updateSettings } = useSettings();
  
  const user = state.user;
  const { vitalCaptureEnabled, needHelpConfig, urgentHelpConfig } = settingsState;
  const [showAlertSettings, setShowAlertSettings] = useState(false);

  const isTablet = width > 768;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const ListItem = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <View style={styles.listItem}>
      <NeuCard style={[styles.listIconInner, { padding: 0 }]}>
        <Icon size={16} color={colors.text.secondary} />
      </NeuCard>
      <Text variant="caption" color={colors.neutral[300]} style={{ flex: 1, marginLeft: 12 }}>{text}</Text>
    </View>
  );

  const CheckboxItem = ({ label, checked, onPress, color }: { label: string, checked: boolean, onPress: () => void, color?: string }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress}>
      <Text variant="body" color={colors.text.primary} style={{ flex: 1 }}>{label}</Text>
      <View style={[
        styles.checkbox,
        { borderColor: checked ? (color || colors.accent.primary) : colors.neutral[300], backgroundColor: checked ? (color || colors.accent.primary) : 'transparent' }
      ]}>
        {checked && <View style={styles.checkInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { padding: width > 600 ? spacing[24] : spacing[16] }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoGroup}>
            <NeuCard style={[styles.logoInner, { padding: spacing[8] }]}>
              <HeartPulse size={24} color={colors.accent.primary} strokeWidth={2.5} />
            </NeuCard>
            <View>
              <Text variant="subheading" color={colors.accent.primary} style={styles.logoText}>MEDTECH CARE</Text>
              <Text variant="small" color={colors.text.secondary}>CareSignal</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <View style={[styles.roleBadge, { borderColor: colors.neutral[300] }]}>
              <Text variant="small" color={colors.text.secondary}>{user?.name || 'test'} · Family</Text>
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <NeuCard style={[styles.logoutBtnInner, { padding: spacing[8] }]}>
                <LogOut size={18} color={colors.text.primary} />
                <Spacer x="xs" />
                <Text variant="small" style={{ fontWeight: '700' }}>Log Out</Text>
              </NeuCard>
            </TouchableOpacity>
          </View>
        </View>

        <Spacer y="xl" />

        {/* Profile Header */}
        <View>
          <Text variant="caption" color={colors.text.secondary}>Linked Senior Profile</Text>
          <Text variant="display" style={styles.profileName}>Eleanor Smith</Text>
          <Text variant="caption" color={colors.text.secondary}>
            Family and senior apps are connected through a shared account link.
          </Text>
        </View>

        <Spacer y="lg" />

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <NeuButton
            title={showAlertSettings ? "Close Alert Settings" : "Alert Settings"}
            onPress={() => setShowAlertSettings(!showAlertSettings)}
            variant={showAlertSettings ? "primary" : "secondary"}
            size="md"
          />
        </View>

        <Spacer y="xl" />

        {showAlertSettings ? (
          <NeuCard style={styles.settingsPanel}>
            <View style={[styles.settingsContent, { padding: width > 600 ? spacing[24] : spacing[16] }]}>
              <View style={[
                styles.settingsHeader,
                {
                  flexDirection: width > 600 ? 'row' : 'column',
                  alignItems: width > 600 ? 'flex-start' : 'stretch',
                }
              ]}>
                <View style={{ flex: width > 600 ? 1 : undefined }}>
                  <Text variant="caption" color={colors.text.secondary}>Family Alert Settings</Text>
                  <Text variant="title">Configure how help alerts are delivered</Text>
                </View>
                <Text variant="small" color={colors.text.secondary} style={{ alignSelf: width > 600 ? 'auto' : 'flex-start' }}>Per response type</Text>
              </View>

              <Spacer y="lg" />

              {/* Senior App Setting */}
              <View style={[styles.settingBox, { borderColor: colors.neutral[300], backgroundColor: colors.surface }]}>
                <View style={{ flex: 1 }}>
                  <Text variant="small" color={colors.text.secondary} style={{ fontWeight: '700' }}>Senior App Setting</Text>
                  <Text variant="heading" style={{ fontSize: 18, marginTop: 4 }}>Optional Vital Capture</Text>
                  <Text variant="small" color={colors.text.secondary} style={{ marginTop: 4 }}>
                    Allow the senior to optionally enter blood sugar or blood pressure during daily check-in.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => updateSettings({ vitalCaptureEnabled: !vitalCaptureEnabled })}
                  style={[styles.switch, { backgroundColor: vitalCaptureEnabled ? colors.semantic.success : colors.neutral[300] }]}
                >
                  <View style={[styles.switchKnob, { alignSelf: vitalCaptureEnabled ? 'flex-end' : 'flex-start' }]} />
                </TouchableOpacity>
              </View>

              <Spacer y="lg" />

              {/* Alert Config Columns */}
              <View style={[styles.gridContainer, isTablet && styles.gridContainerHorizontal]}>
                <View style={[styles.routingCard, { backgroundColor: colors.semantic.warning + '20', borderColor: colors.semantic.warning + '40', flex: 1 }]}>
                  <Text variant="heading" color={colors.semantic.warning} style={{ marginBottom: spacing[16] }}>I Need Help</Text>
                  <CheckboxItem 
                    label="Email Alert" 
                    checked={needHelpConfig.email} 
                    onPress={() => updateSettings({ needHelpConfig: { ...needHelpConfig, email: !needHelpConfig.email }})}
                  />
                  <CheckboxItem 
                    label="Text Alert" 
                    checked={needHelpConfig.text} 
                    onPress={() => updateSettings({ needHelpConfig: { ...needHelpConfig, text: !needHelpConfig.text }})}
                  />
                  <CheckboxItem 
                    label="Phone Call Alert" 
                    checked={needHelpConfig.phone} 
                    onPress={() => updateSettings({ needHelpConfig: { ...needHelpConfig, phone: !needHelpConfig.phone }})}
                  />
                </View>

                {isTablet ? <Spacer x="md" /> : <Spacer y="md" />}

                <View style={[styles.routingCard, { backgroundColor: colors.semantic.error + '20', borderColor: colors.semantic.error + '40', flex: 1 }]}>
                  <Text variant="heading" color={colors.semantic.error} style={{ marginBottom: spacing[16] }}>Urgent Help</Text>
                  <CheckboxItem 
                    label="Email Alert" 
                    checked={urgentHelpConfig.email} 
                    onPress={() => updateSettings({ urgentHelpConfig: { ...urgentHelpConfig, email: !urgentHelpConfig.email }})}
                    color={colors.semantic.error}
                  />
                  <CheckboxItem 
                    label="Text Alert" 
                    checked={urgentHelpConfig.text} 
                    onPress={() => updateSettings({ urgentHelpConfig: { ...urgentHelpConfig, text: !urgentHelpConfig.text }})}
                    color={colors.semantic.error}
                  />
                  <CheckboxItem 
                    label="Phone Call Alert" 
                    checked={urgentHelpConfig.phone} 
                    onPress={() => updateSettings({ urgentHelpConfig: { ...urgentHelpConfig, phone: !urgentHelpConfig.phone }})}
                    color={colors.semantic.error}
                  />
                  <CheckboxItem 
                    label="Auto Call Senior Phone" 
                    checked={urgentHelpConfig.autoCall} 
                    onPress={() => updateSettings({ urgentHelpConfig: { ...urgentHelpConfig, autoCall: !urgentHelpConfig.autoCall }})}
                    color={colors.semantic.error}
                  />
                </View>
              </View>
            </View>
          </NeuCard>
        ) : (
          <>
            {/* Status Section */}
            <View style={[styles.statusSection, isTablet && styles.statusSectionHorizontal]}>
              {/* Main Status Card */}
              <NeuCard style={[styles.mainStatusCard, isTablet && { flex: 1.5 }]}>
                <Text variant="caption" color={colors.text.secondary}>Today's Status</Text>
                <Text variant="title" style={styles.statusTitle}>Eleanor Smith</Text>

                <View style={styles.statusBadgeRow}>
                  <StatusBadge status="ok" />
                  <Spacer x="sm" />
                  <View style={[styles.lastCheckIn, { backgroundColor: colors.neutral[200] }]}>
                    <Text variant="small" color={colors.text.secondary}>Last check-in: 15:57</Text>
                  </View>
                </View>

                <Spacer y="md" />
                <Text variant="caption" color={colors.text.secondary} style={styles.desc}>
                  CareSignal gives family members a simple daily pulse between visits, so they can quickly understand whether things are steady, need support, or require immediate escalation.
                </Text>
              </NeuCard>

              {isTablet ? <Spacer x="lg" /> : <Spacer y="md" />}

              {/* Response Routing Card */}
              <View style={[styles.darkCard, { backgroundColor: colors.neutral[800] }, isTablet && { flex: 1 }]}>
                <Text variant="small" color={colors.neutral[400]} style={{ fontWeight: '700', marginBottom: spacing[16] }}>Response Routing</Text>

                <ListItem icon={Bell} text="Family Alert Status: Standing by" />
                <ListItem icon={ShieldAlert} text="Emergency Contact: Not engaged" />
                <ListItem icon={LinkIcon} text="Linked account: Connected to Eleanor" />
              </View>
            </View>

            <Spacer y="lg" />

            {/* Grid Stats */}
            <View style={[styles.gridContainer, isTablet && styles.gridContainerHorizontal]}>
              <NeuCard style={styles.gridCard}>
                <Text variant="small" color={colors.text.secondary}>Morning Check-In</Text>
                <Text variant="heading" style={styles.gridValue}>15:57</Text>
                <Text variant="small" color={colors.text.secondary}>Primary daily touchpoint.</Text>
              </NeuCard>
              {!isTablet && <Spacer y="md" />}
              {isTablet && <Spacer x="md" />}
              <NeuCard style={styles.gridCard}>
                <Text variant="small" color={colors.text.secondary}>Care Status</Text>
                <Text variant="heading" style={styles.gridValue}>Doing well</Text>
                <Text variant="small" color={colors.text.secondary}>Signal captured from experience.</Text>
              </NeuCard>
              {!isTablet && <Spacer y="md" />}
              {isTablet && <Spacer x="md" />}
              <NeuCard style={styles.gridCard}>
                <Text variant="small" color={colors.text.secondary}>Next Step</Text>
                <Text variant="heading" style={styles.gridValue}>No action</Text>
                <Text variant="small" color={colors.text.secondary}>Status is currently stable.</Text>
              </NeuCard>
            </View>

            <Spacer y="lg" />

            {/* Alert Routing Section */}
            <View>
              <Text variant="small" color={colors.text.secondary} style={{ fontWeight: '700', marginBottom: spacing[12] }}>Current Alert Routing</Text>
              <View style={[styles.inlineCards, isTablet && styles.gridContainerHorizontal]}>
                <View style={[styles.routingCard, { backgroundColor: colors.semantic.warning + '20', borderColor: colors.semantic.warning + '40' }]}>
                  <Text variant="small" color={colors.semantic.warning} style={{ fontWeight: '700' }}>I Need Help</Text>
                  <Text variant="small" color={colors.semantic.warning}>Email, Text</Text>
                </View>
                {!isTablet && <Spacer y="md" />}
                {isTablet && <Spacer x="md" />}
                <View style={[styles.routingCard, { backgroundColor: colors.semantic.error + '20', borderColor: colors.semantic.error + '40' }]}>
                  <Text variant="small" color={colors.semantic.error} style={{ fontWeight: '700' }}>Urgent Help</Text>
                  <Text variant="small" color={colors.semantic.error}>Email, Text, Phone Call...</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <Spacer y="xxxl" />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? spacing[20] : spacing[40],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -spacing[2],
  },
  logoInner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    marginRight: spacing[8],
  },
  logoText: {
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  logoutBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[14],
    paddingVertical: spacing[8],
  },
  profileName: {
    fontSize: 28,
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
  statusSection: {
    flexDirection: 'column',
  },
  statusSectionHorizontal: {
    flexDirection: 'row',
  },
  mainStatusCard: {
    padding: spacing[24],
  },
  statusTitle: {
    fontSize: 24,
    marginTop: spacing[8],
    marginBottom: spacing[12],
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastCheckIn: {
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[6],
    borderRadius: borderRadius.md,
  },
  desc: {
    lineHeight: 20,
  },
  darkCard: {
    padding: spacing[24],
    borderRadius: borderRadius['2xl'],
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[16],
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing[12],
    borderRadius: borderRadius.lg,
  },
  listIconInner: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  gridContainer: {
    flexDirection: 'column',
  },
  gridContainerHorizontal: {
    flexDirection: 'row',
  },
  gridCard: {
    flex: 1,
    padding: spacing[20],
  },
  gridValue: {
    fontSize: 20,
    marginVertical: spacing[8],
    fontWeight: '700',
  },
  inlineCards: {
    flexDirection: 'column',
  },
  routingCard: {
    flex: 1,
    padding: spacing[20],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  settingsPanel: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsContent: {
  },
  settingsHeader: {
    justifyContent: 'space-between',
    gap: spacing[8],
  },
  settingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[16],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: spacing[2],
    justifyContent: 'center',
  },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[12],
    borderRadius: borderRadius.md,
    marginBottom: spacing[8],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInner: {
    width: 8,
    height: 8,
    borderRadius: 1,
    backgroundColor: 'white',
  }
});
