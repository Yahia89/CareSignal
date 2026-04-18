import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CheckInStatus, CheckInSlot } from '../../types';
import { CheckInButton } from '../../components/elder/CheckInButton';
import { AppCard } from '../../components/common/AppCard';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useCheckIn } from '../../hooks/useCheckIn';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { SlotLabels } from '../../constants/config';

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

function formatDate(): string {
  return new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const STATUS_CHECK_IN_CONFIG: Record<CheckInStatus, {
  label: string;
  sublabel: string;
  icon: string;
  bg: string;
  confirmTitle: string;
  confirmMsg: string;
}> = {
  ok: {
    label: "I'm OK",
    sublabel: 'Everything is fine',
    icon: 'checkmark-circle',
    bg: Colors.success,
    confirmTitle: 'Thank you!',
    confirmMsg: 'Your family has been updated.',
  },
  help: {
    label: 'I Need Help',
    sublabel: 'I could use some assistance',
    icon: 'warning',
    bg: Colors.warning,
    confirmTitle: 'Help is on the way',
    confirmMsg: 'Your family has been notified.',
  },
  urgent: {
    label: 'Urgent Help',
    sublabel: 'I need immediate assistance',
    icon: 'alert-circle',
    bg: Colors.urgent,
    confirmTitle: 'Alerting your family!',
    confirmMsg: "We're alerting your family right away.",
  },
};

export function ElderHomeScreen(): React.JSX.Element {
  const { user } = useAuth();
  const { todayCheckIn, isLoading, isSubmitting, submitCheckIn } = useCheckIn();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedStatus, setConfirmedStatus] = useState<CheckInStatus>('ok');

  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const confirmFade = useRef(new Animated.Value(0)).current;

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const currentSlot = getCurrentSlot();

  const animateConfirmation = useCallback(() => {
    checkmarkScale.setValue(0);
    confirmFade.setValue(0);
    Animated.parallel([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 14,
        speed: 10,
      }),
      Animated.timing(confirmFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkmarkScale, confirmFade]);

  const handleCheckIn = useCallback(
    async (status: CheckInStatus) => {
      try {
        await submitCheckIn(status, currentSlot);
        setConfirmedStatus(status);
        setShowConfirmation(true);
        animateConfirmation();
      } catch (err) {
        Alert.alert('Error', (err as Error).message ?? 'Failed to submit check-in. Try again.');
      }
    },
    [submitCheckIn, currentSlot, animateConfirmation],
  );

  if (isLoading) {
    return <LoadingOverlay message="Loading..." fullScreen={false} />;
  }

  const cfg = STATUS_CHECK_IN_CONFIG[confirmedStatus];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {firstName}! 👋
          </Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>

        {todayCheckIn ? (
          /* Already checked in today */
          <AppCard style={styles.checkedInCard}>
            <View style={styles.checkedInInner}>
              <View style={[styles.bigCheckCircle, { backgroundColor: Colors.success }]}>
                <Ionicons name="checkmark" size={48} color={Colors.textInverse} />
              </View>
              <Text style={styles.checkedInTitle}>You've checked in today</Text>
              <Text style={styles.checkedInSlot}>
                {SlotLabels[todayCheckIn.slot]} · {formatTime(todayCheckIn.timestamp)}
              </Text>
              {todayCheckIn.status !== 'ok' && (
                <View style={styles.statusNote}>
                  <Ionicons
                    name={todayCheckIn.status === 'urgent' ? 'alert-circle' : 'warning'}
                    size={16}
                    color={todayCheckIn.status === 'urgent' ? Colors.urgent : Colors.warning}
                  />
                  <Text style={styles.statusNoteText}>
                    {todayCheckIn.status === 'urgent'
                      ? 'Family was alerted for urgent help'
                      : 'Family was notified you need help'}
                  </Text>
                </View>
              )}
            </View>
          </AppCard>
        ) : (
          /* Check-in prompt */
          <>
            <AppCard style={styles.promptCard}>
              <Text style={styles.promptTitle}>How are you today?</Text>
              <Text style={styles.promptSubtitle}>
                {SlotLabels[currentSlot]} check-in · Let your family know you're safe
              </Text>
            </AppCard>

            <View style={styles.buttons}>
              <CheckInButton
                label="I'm OK"
                sublabel="Everything is fine"
                icon="checkmark-circle"
                backgroundColor={Colors.success}
                onPress={() => handleCheckIn('ok')}
                disabled={isSubmitting}
              />
              <CheckInButton
                label="I Need Help"
                sublabel="I could use some assistance"
                icon="warning"
                backgroundColor={Colors.warning}
                onPress={() => handleCheckIn('help')}
                disabled={isSubmitting}
              />
              <CheckInButton
                label="Urgent Help"
                sublabel="I need immediate assistance"
                icon="alert-circle"
                backgroundColor={Colors.urgent}
                onPress={() => handleCheckIn('urgent')}
                disabled={isSubmitting}
              />
            </View>
          </>
        )}

        {isSubmitting && <LoadingOverlay message="Sending check-in..." fullScreen={false} />}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { opacity: confirmFade }]}>
            <Animated.View
              style={[
                styles.modalIcon,
                { backgroundColor: `${cfg.bg}20`, transform: [{ scale: checkmarkScale }] },
              ]}
            >
              <Ionicons name={cfg.icon as any} size={64} color={cfg.bg} />
            </Animated.View>
            <Text style={styles.modalTitle}>{cfg.confirmTitle}</Text>
            <Text style={styles.modalName}>Thank you, {firstName}!</Text>
            <Text style={styles.modalMsg}>{cfg.confirmMsg}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: cfg.bg }]}
              onPress={() => setShowConfirmation(false)}
            >
              <Text style={styles.modalBtnText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  header: { marginBottom: Spacing.xl },
  greeting: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  date: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  promptCard: { marginBottom: Spacing.xl },
  promptTitle: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  promptSubtitle: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSizeMd * 1.5,
  },
  buttons: { gap: 0 },
  checkedInCard: { marginBottom: Spacing.xl },
  checkedInInner: { alignItems: 'center', paddingVertical: Spacing.xl },
  bigCheckCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  checkedInTitle: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  checkedInSlot: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  statusNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    backgroundColor: '#FFF3CD',
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  statusNoteText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xxl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  modalName: {
    fontSize: Typography.fontSizeLg,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  modalMsg: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: Typography.fontSizeMd * 1.5,
    marginBottom: Spacing.xl,
  },
  modalBtn: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    minWidth: 140,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
  },
});
