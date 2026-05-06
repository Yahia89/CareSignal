import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, useWindowDimensions, Modal } from 'react-native';
import { HeartPulse, LogOut, Volume2, Activity, ChevronDown, Camera, Phone, X } from 'lucide-react-native';
import { Screen, Text, Spacer, Input, Select } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useSettings } from '../../../shared/contexts/SettingsContext';
import { useVoiceAssistant } from '../../../shared/hooks';
import { NeuButton, NeuCard, useColors, useTokens, spacing, borderRadius, getShadowStyle } from '../../../shared/design';

export const CheckInHome = () => {
  const { width } = useWindowDimensions();
  const { state: settingsState } = useSettings();
  const { state, dispatch } = useAuth();
  const colors = useColors();
  const tokens = useTokens();
  const user = state.user;

  const [voiceOn, setVoiceOn] = useState(true);
  const [voiceType, setVoiceType] = useState('warm');
  const [vitalType, setVitalType] = useState('blood_sugar');
  const [inputMethod, setInputMethod] = useState('camera');
  const [vitalValue, setVitalValue] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const { speak } = useVoiceAssistant(voiceOn);

  // Greet user on load
  useEffect(() => {
    const name = user?.name || 'Eleanor';
    speak(`Good morning, ${name}. How are you today?`);
  }, []);

  const handleLogout = () => {
    speak('Logging out');
    dispatch({ type: 'LOGOUT' });
  };

  const handleStatusReport = (status: 'ok' | 'help' | 'urgent') => {
    const messages = {
      ok: "I'm glad to hear you are doing well. Your status has been reported as OK.",
      help: "I've notified your support circle that you need help. Stay calm, assistance is on the way.",
      urgent: settingsState.urgentHelpConfig.autoCall 
        ? "Alerting urgent help and initiating emergency call now." 
        : "Alerting urgent help immediately. Help is coming now.",
    };
    
    speak(messages[status]);
    
    if (status === 'urgent' && settingsState.urgentHelpConfig.autoCall) {
      setTimeout(() => setIsCalling(true), 1500);
    }
    
    console.log(`Reported status: ${status}`);
  };

  return (
    <Screen style={{ backgroundColor: colors.background.light }}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { padding: width > 600 ? 16 : 12 }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[
          styles.header,
          { flexDirection: width > 600 ? 'row' : 'column', alignItems: width > 600 ? 'flex-start' : 'center' }
        ]}>
          <View style={styles.logoGroup}>
            <NeuCard style={[styles.logoInner, { padding: spacing[8] }]}>
              <HeartPulse size={24} color={colors.accent.primary} strokeWidth={2.5} />
            </NeuCard>
            <View>
              <Text variant="subheading" color={colors.accent.primary} style={styles.logoText}>MEDTECH CARE</Text>
              <Text variant="small" color={colors.text.secondary}>CareSignal</Text>
            </View>
          </View>
          
          <View style={[
            styles.headerActions,
            { marginTop: width > 600 ? 6 : 16 }
          ]}>
            <View style={styles.roleBadge}>
              <Text variant="small" color={colors.text.secondary}>test · Family App</Text>
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

        <Spacer y="lg" />

        {/* Daily Check-In Welcome Card */}
        <NeuCard style={styles.welcomeCard}>
          <Text variant="body" color={colors.text.secondary}>Daily Check-In</Text>
          <Text variant="display" style={styles.welcomeTitle}>Good Morning, {user?.name || 'Eleanor'}</Text>
          <Text variant="heading" color={colors.text.secondary}>How are you today?</Text>
          
          <Spacer y="md" />
          
          <View style={styles.voiceStatus}>
            <View style={[styles.statusDot, { backgroundColor: '#CBD5E1' }]} />
            <Spacer x="xs" />
            <Text variant="caption" color={colors.text.secondary}>Voice assistant ready</Text>
          </View>

          <Spacer y="lg" />

          <View style={styles.voiceControls}>
            <TouchableOpacity 
              style={[
                styles.voiceToggle, 
                { backgroundColor: voiceOn ? '#0F172A' : '#F1F5F9' }
              ]}
              onPress={() => {
                const newState = !voiceOn;
                setVoiceOn(newState);
                if (newState) {
                  speak("Voice assistance enabled", { force: true });
                }
              }}
            >
              <Volume2 size={18} color={voiceOn ? '#FFFFFF' : '#64748B'} />
              <Spacer x="xs" />
              <Text variant="small" color={voiceOn ? '#FFFFFF' : '#64748B'} style={{ fontWeight: '700' }}>
                Voice {voiceOn ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>

            <Spacer x="sm" />

            <TouchableOpacity 
              style={[styles.voiceToggle, { backgroundColor: '#E2E8F0', width: 80 }]}
              onPress={() => speak("Testing 1 2 3", { force: true })}
            >
              <Text variant="small" color="#1A2138" style={{ fontWeight: '700' }}>Test Voice</Text>
            </TouchableOpacity>

            <Spacer x="md" />

            <View style={styles.voiceSelectWrapper}>
              <Select
                options={[
                  { label: 'Warm Voice', value: 'warm' },
                  { label: 'Clarity Voice', value: 'clarity' }
                ]}
                value={voiceType}
                onValueChange={setVoiceType}
                placeholder="Voice type"
              />
            </View>
          </View>
        </NeuCard>

        <Spacer y="md" />

        {/* Status Actions */}
        <View style={styles.statusButtons}>
          <NeuButton
            variant="primary"
            onPress={() => handleStatusReport(‘ok’)}
            title="I’m OK"
            size="md"
            style={styles.statusBtn}
          />
          <NeuButton
            variant="primary"
            onPress={() => handleStatusReport(‘help’)}
            title="I Need Help"
            size="md"
            style={styles.statusBtn}
          />
          <NeuButton
            variant="primary"
            onPress={() => handleStatusReport('urgent')}
            title="Urgent Help"
            size="md"
            style={styles.statusBtn}
          />
        </View>

        <Spacer y="md" />

        {/* Vital Capture Card */}
        <NeuCard style={styles.vitalsCard}>
          <View style={styles.vitalsHeader}>
            <View>
              <Text variant="body" color={colors.text.secondary}>Optional Vital Capture</Text>
              <Text variant="title" style={styles.vitalsTitle}>Capture blood sugar or blood pressure</Text>
            </View>
            <View style={styles.optionalBadge}>
              <Text variant="small" color={colors.accent.primary} style={{ fontWeight: '700' }}>Optional</Text>
            </View>
          </View>

          <Spacer y="md" />

          <View style={styles.vitalParams}>
            <View style={{ flex: 1 }}>
              <Select
                label="Vital Type"
                options={[
                  { label: 'Blood Sugar', value: 'blood_sugar' },
                  { label: 'Blood Pressure', value: 'blood_pressure' }
                ]}
                value={vitalType}
                onValueChange={setVitalType}
              />
            </View>
            <Spacer x="md" />
            <View style={{ flex: 1 }}>
              <Select
                label="Input Method"
                options={[
                  { label: 'Camera Capture', value: 'camera' },
                  { label: 'Manual Entry', value: 'manual' }
                ]}
                value={inputMethod}
                onValueChange={setInputMethod}
              />
            </View>
          </View>

          <Spacer y="md" />

          <View style={styles.vitalInputContainer}>
            <View style={styles.inputArea}>
              <View style={styles.inputRow}>
                <View style={styles.cameraGuide}>
                  <Camera size={20} color={colors.accent.primary} />
                  <Text variant="small" color={colors.text.secondary} style={styles.cameraText}>Scan</Text>
                </View>
                <Spacer x="sm" />
                <View style={{ flex: 1 }}>
                  <Input 
                    placeholder="e.g. 108"
                    value={vitalValue}
                    onChangeText={setVitalValue}
                    style={styles.vitalInput}
                  />
                </View>
              </View>
              
              <Spacer y="md" />
              
              <Button 
                title="Save Reading" 
                backgroundColor="#006B5E"
                onPress={() => {
                  const type = vitalType.replace('_', ' ');
                  speak(`Saving your ${type} reading of ${vitalValue || 'zero'}`);
                  console.log('Saving vitals...');
                }}
                style={styles.saveBtnFull}
              />
            </View>
          </View>
        </NeuCard>

        <Spacer y="md" />

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => speak("Replaying instructions. How are you today?")}>
            <NeumorphicView borderRadius={24} style={styles.replayBtnInner}>
              <Volume2 size={18} color={theme.colors.text} />
              <Spacer x="xs" />
              <Text variant="body">Replay Voice</Text>
            </NeumorphicView>
          </TouchableOpacity>
        </View>
        <Spacer y="xxl" />
      </ScrollView>

      {/* Emergency Call Modal */}
      <Modal visible={isCalling} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.callCard, { backgroundColor: '#DC2626' }]}>
            <View style={styles.callHeader}>
              <Phone size={48} color="white" />
              <Spacer y="lg" />
              <Text variant="display" color="white">Emergency Call</Text>
              <Text variant="heading" color="rgba(255,255,255,0.8)">Initiated via Auto-Call</Text>
            </View>
            
            <View style={styles.callStatus}>
              <View style={styles.pulseContainer}>
                <View style={styles.pulseCircle} />
              </View>
              <Spacer y="md" />
              <Text variant="title" color="white">Calling Dispatch...</Text>
            </View>

            <TouchableOpacity 
              style={styles.hangUpBtn} 
              onPress={() => {
                speak("Emergency call cancelled.");
                setIsCalling(false);
              }}
            >
              <X size={32} color="white" />
              <Spacer y="xs" />
              <Text variant="small" color="white" style={{ fontWeight: '700' }}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop: spacing[6],
  },
  roleBadge: {
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[10],
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.xl,
    marginRight: spacing[8],
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  logoutBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[14],
    paddingVertical: spacing[8],
  },
  welcomeCard: {
    padding: spacing[24],
  },
  welcomeTitle: {
    fontSize: 32,
    marginTop: spacing[8],
    marginBottom: spacing[4],
  },
  voiceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  voiceControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[16],
    height: 48,
    borderRadius: borderRadius.md,
  },
  voiceSelectWrapper: {
    flex: 1,
  },
  statusButtons: {
    gap: spacing[16],
  },
  statusBtn: {
    height: 80,
    borderRadius: 24,
  },
  vitalsCard: {
    padding: 24,
  },
  vitalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vitalsTitle: {
    fontSize: 20,
    marginTop: 4,
    maxWidth: '85%', // Prevent overlap with badge
  },
  optionalBadge: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  vitalParams: {
    flexDirection: 'row',
  },
  vitalInputContainer: {
    width: '100%',
  },
  inputArea: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraGuide: {
    width: 60,
    height: 90,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#008471',
    borderRadius: 12,
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
  },
  vitalInput: {
    height: 90,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 0,
  },
  saveBtnFull: {
    height: 56,
    borderRadius: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  replayBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  callCard: {
    width: '100%',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '70%',
  },
  callHeader: {
    alignItems: 'center',
  },
  callStatus: {
    alignItems: 'center',
  },
  pulseContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  hangUpBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  }
});
