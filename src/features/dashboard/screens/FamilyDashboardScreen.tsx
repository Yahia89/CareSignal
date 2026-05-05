import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { HeartPulse, LogOut, Bell, Link as LinkIcon, ShieldAlert, Camera, Volume2 } from 'lucide-react-native';
import { Screen, Text, Button, Spacer, Card, NeumorphicView, StatusBadge } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useSettings } from '../../../shared/contexts/SettingsContext';

export const FamilyDashboardScreen = () => {
  const { width } = useWindowDimensions();
  const { state, dispatch } = useAuth();
  const theme = useTheme();
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
      <NeumorphicView 
        borderRadius={10} 
        containerStyle={styles.listIconContainer} 
        style={styles.listIconInner}
        inset
      >
        <Icon size={16} color={theme.colors.textSecondary} />
      </NeumorphicView>
      <Text variant="caption" color="#CBD5E1" style={{ flex: 1, marginLeft: 12 }}>{text}</Text>
    </View>
  );

  const CheckboxItem = ({ label, checked, onPress, color }: { label: string, checked: boolean, onPress: () => void, color?: string }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={onPress}>
      <Text variant="body" color="#1E293B" style={{ flex: 1 }}>{label}</Text>
      <View style={[
        styles.checkbox, 
        { borderColor: checked ? (color || theme.colors.primary) : '#CBD5E1', backgroundColor: checked ? (color || theme.colors.primary) : 'transparent' }
      ]}>
        {checked && <View style={styles.checkInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen style={{ backgroundColor: theme.colors.background }}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { padding: width > 600 ? 24 : 16 }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoGroup}>
            <NeumorphicView 
              borderRadius={12} 
              containerStyle={styles.logoNeumorphic}
              style={styles.logoInner}
            >
              <HeartPulse size={24} color={theme.colors.secondary} strokeWidth={2.5} />
            </NeumorphicView>
            <View>
              <Text variant="subheading" color={theme.colors.secondary} style={styles.logoText}>MEDTECH CARE</Text>
              <Text variant="small" color={theme.colors.textSecondary}>CareSignal</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <View style={styles.roleBadge}>
              <Text variant="small" color={theme.colors.textSecondary}>{user?.name || 'test'} · Family</Text>
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <NeumorphicView borderRadius={20} style={styles.logoutBtnInner}>
                <LogOut size={18} color={theme.colors.text} />
                <Spacer x="xs" />
                <Text variant="small" style={{ fontWeight: '700' }}>Log Out</Text>
              </NeumorphicView>
            </TouchableOpacity>
          </View>
        </View>

        <Spacer y="xl" />

        {/* Profile Header */}
        <View>
          <Text variant="caption" color={theme.colors.textSecondary}>Linked Senior Profile</Text>
          <Text variant="display" style={styles.profileName}>Eleanor Smith</Text>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Family and senior apps are connected through a shared account link.
          </Text>
        </View>

        <Spacer y="lg" />

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button 
            title={showAlertSettings ? "Close Alert Settings" : "Alert Settings"} 
            onPress={() => setShowAlertSettings(!showAlertSettings)} 
            variant={showAlertSettings ? "primary" : "secondary"}
            backgroundColor={showAlertSettings ? "#0F172A" : undefined}
            style={styles.actionBtn}
          />
        </View>

        <Spacer y="xl" />

        {showAlertSettings ? (
          <Card style={styles.settingsPanel}>
            <View style={[styles.settingsContent, { padding: width > 600 ? 24 : 16 }]}>
              <View style={[
                styles.settingsHeader,
                { 
                  flexDirection: width > 600 ? 'row' : 'column',
                  alignItems: width > 600 ? 'flex-start' : 'stretch',
                }
              ]}>
                <View style={{ flex: width > 600 ? 1 : undefined }}>
                  <Text variant="caption" color={theme.colors.textSecondary}>Family Alert Settings</Text>
                  <Text variant="title">Configure how help alerts are delivered</Text>
                </View>
                <Text variant="small" color={theme.colors.textSecondary} style={{ alignSelf: width > 600 ? 'auto' : 'flex-start' }}>Per response type</Text>
              </View>

              <Spacer y="lg" />

              {/* Senior App Setting */}
              <View style={styles.settingBox}>
                <View style={{ flex: 1 }}>
                  <Text variant="small" color={theme.colors.textSecondary} style={{ fontWeight: '700' }}>Senior App Setting</Text>
                  <Text variant="heading" style={{ fontSize: 18, marginTop: 4 }}>Optional Vital Capture</Text>
                  <Text variant="small" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
                    Allow the senior to optionally enter blood sugar or blood pressure during daily check-in.
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => updateSettings({ vitalCaptureEnabled: !vitalCaptureEnabled })}
                  style={[styles.switch, { backgroundColor: vitalCaptureEnabled ? '#0D9488' : '#E2E8F0' }]}
                >
                  <View style={[styles.switchKnob, { alignSelf: vitalCaptureEnabled ? 'flex-end' : 'flex-start' }]} />
                </TouchableOpacity>
              </View>

              <Spacer y="lg" />

              {/* Alert Config Columns */}
              <View style={[styles.gridContainer, isTablet && styles.gridContainerHorizontal]}>
                <View style={[styles.routingCard, { backgroundColor: '#FFFBED', borderColor: '#FEF3C7', flex: 1 }]}>
                  <Text variant="heading" color="#92400E" style={{ marginBottom: 16 }}>I Need Help</Text>
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

                <View style={[styles.routingCard, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2', flex: 1 }]}>
                  <Text variant="heading" color="#991B1B" style={{ marginBottom: 16 }}>Urgent Help</Text>
                  <CheckboxItem 
                    label="Email Alert" 
                    checked={urgentHelpConfig.email} 
                    onPress={() => updateSettings({ urgentHelpConfig: { ...urgentHelpConfig, email: !urgentHelpConfig.email }})}
                    color="#DC2626"
                  />
                  <CheckboxItem 
                    label="Text Alert" 
                    checked={urgentHelpConfig.text} 
                    onPress={() => updateSettings({ urgentHelpConfig: { ...urgentHelpConfig, text: !urgentHelpConfig.text }})}
                    color="#DC2626"
                  />
                  <CheckboxItem 
                    label="Phone Call Alert" 
                    checked={urgentHelpConfig.phone} 
                    onPress={() => updateSettings({ urgentHelpConfig: { ...urgentHelpConfig, phone: !urgentHelpConfig.phone }})}
                    color="#DC2626"
                  />
                  <CheckboxItem 
                    label="Auto Call Senior Phone" 
                    checked={urgentHelpConfig.autoCall} 
                    onPress={() => updateSettings({ urgentHelpConfig: { ...urgentHelpConfig, autoCall: !urgentHelpConfig.autoCall }})}
                    color="#DC2626"
                  />
                </View>
              </View>
            </View>
          </Card>
        ) : (
          <>
            {/* Status Section */}
            <View style={[styles.statusSection, isTablet && styles.statusSectionHorizontal]}>
              {/* Main Status Card */}
              <Card style={[styles.mainStatusCard, isTablet && { flex: 1.5 }]}>
                <Text variant="caption" color={theme.colors.textSecondary}>Today's Status</Text>
                <Text variant="title" style={styles.statusTitle}>Eleanor Smith</Text>
                
                <View style={styles.statusBadgeRow}>
                  <StatusBadge status="ok" />
                  <Spacer x="sm" />
                  <View style={styles.lastCheckIn}>
                    <Text variant="small" color={theme.colors.textSecondary}>Last check-in: 15:57</Text>
                  </View>
                </View>

                <Spacer y="md" />
                <Text variant="caption" color={theme.colors.textSecondary} style={styles.desc}>
                  CareSignal gives family members a simple daily pulse between visits, so they can quickly understand whether things are steady, need support, or require immediate escalation.
                </Text>
              </Card>

              {isTablet ? <Spacer x="lg" /> : <Spacer y="md" />}

              {/* Response Routing Card */}
              <View style={[styles.darkCard, { backgroundColor: '#0A1121' }, isTablet && { flex: 1 }]}>
                <Text variant="small" color="#94A3B8" style={{ fontWeight: '700', marginBottom: 16 }}>Response Routing</Text>
                
                <ListItem icon={Bell} text="Family Alert Status: Standing by" />
                <ListItem icon={ShieldAlert} text="Emergency Contact: Not engaged" />
                <ListItem icon={LinkIcon} text="Linked account: Connected to Eleanor" />
              </View>
            </View>

            <Spacer y="lg" />

            {/* Grid Stats */}
            <View style={[styles.gridContainer, isTablet && styles.gridContainerHorizontal]}>
              <Card style={styles.gridCard}>
                <Text variant="small" color={theme.colors.textSecondary}>Morning Check-In</Text>
                <Text variant="heading" style={styles.gridValue}>15:57</Text>
                <Text variant="small" color={theme.colors.textSecondary}>Primary daily touchpoint.</Text>
              </Card>
              {!isTablet && <Spacer y="md" />}
              {isTablet && <Spacer x="md" />}
              <Card style={styles.gridCard}>
                <Text variant="small" color={theme.colors.textSecondary}>Care Status</Text>
                <Text variant="heading" style={styles.gridValue}>Doing well</Text>
                <Text variant="small" color={theme.colors.textSecondary}>Signal captured from experience.</Text>
              </Card>
              {!isTablet && <Spacer y="md" />}
              {isTablet && <Spacer x="md" />}
              <Card style={styles.gridCard}>
                <Text variant="small" color={theme.colors.textSecondary}>Next Step</Text>
                <Text variant="heading" style={styles.gridValue}>No action</Text>
                <Text variant="small" color={theme.colors.textSecondary}>Status is currently stable.</Text>
              </Card>
            </View>

            <Spacer y="lg" />

            {/* Alert Routing Section */}
            <View>
              <Text variant="small" color={theme.colors.textSecondary} style={{ fontWeight: '700', marginBottom: 12 }}>Current Alert Routing</Text>
              <View style={[styles.inlineCards, isTablet && styles.gridContainerHorizontal]}>
                <View style={[styles.routingCard, { backgroundColor: '#FEFCE8' }]}>
                  <Text variant="small" color="#854D0E" style={{ fontWeight: '700' }}>I Need Help</Text>
                  <Text variant="small" color="#A16207">Email, Text</Text>
                </View>
                {!isTablet && <Spacer y="md" />}
                {isTablet && <Spacer x="md" />}
                <View style={[styles.routingCard, { backgroundColor: '#FEF2F2' }]}>
                  <Text variant="small" color="#991B1B" style={{ fontWeight: '700' }}>Urgent Help</Text>
                  <Text variant="small" color="#B91C1C">Email, Text, Phone Call...</Text>
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
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
  },
  logoNeumorphic: {
    marginRight: 10,
  },
  logoInner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  profileName: {
    fontSize: 28,
    marginTop: 4,
    marginBottom: 4,
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
    padding: 24,
  },
  statusTitle: {
    fontSize: 24,
    marginTop: 8,
    marginBottom: 12,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastCheckIn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  desc: {
    lineHeight: 20,
  },
  darkCard: {
    padding: 24,
    borderRadius: 24,
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 16,
  },
  listIconContainer: {},
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
    padding: 20,
  },
  gridValue: {
    fontSize: 20,
    marginVertical: 8,
    fontWeight: '700',
  },
  inlineCards: {
    flexDirection: 'column',
  },
  routingCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  settingsPanel: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsContent: {
  },
  settingsHeader: {
    justifyContent: 'space-between',
    gap: 8,
  },
  settingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
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
    paddingVertical: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
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
