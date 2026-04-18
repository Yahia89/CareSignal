import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { OTPInput } from '../../components/common/OTPInput';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { Config } from '../../constants/config';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export function OTPScreen({ navigation, route }: Props): React.JSX.Element {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState<number>(Config.otpResendSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { verifyOtp, sendOtp, isLoading } = useAuth();

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startTimer() {
    setResendTimer(Config.otpResendSeconds);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  async function handleVerify() {
    if (otp.length < Config.otpLength) return;
    try {
      const { isNewUser } = await verifyOtp(phone, otp);
      if (isNewUser) {
        navigation.replace('RoleSelect');
      }
      // If existing user: RootNavigator will auto-navigate based on role
    } catch (err) {
      Alert.alert('Invalid Code', (err as Error).message ?? 'Please check the code and try again.');
      setOtp('');
    }
  }

  async function handleResend() {
    try {
      await sendOtp(phone);
      startTimer();
    } catch {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  }

  const maskedPhone = phone.replace(/(\+\d{1,2})(\d+)(\d{2})/, '$1•••••$3');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.phone}>{maskedPhone}</Text>
            </Text>
          </View>

          <View style={styles.otpContainer}>
            <OTPInput
              length={Config.otpLength}
              value={otp}
              onChange={setOtp}
              onComplete={handleVerify}
            />
          </View>

          <AppButton
            label="Verify"
            variant="primary"
            fullWidth
            size="lg"
            loading={isLoading}
            disabled={otp.length < Config.otpLength}
            onPress={handleVerify}
          />

          <View style={styles.resendRow}>
            {resendTimer > 0 ? (
              <Text style={styles.resendHint}>
                Resend code in{' '}
                <Text style={styles.resendTimer}>{resendTimer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.demoHint}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textDisabled} />
            <Text style={styles.demoHintText}>Demo OTP: 123456</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  header: { marginBottom: Spacing.xxxl },
  title: {
    fontSize: Typography.fontSize3xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: Typography.fontSizeMd * 1.6,
  },
  phone: {
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  otpContainer: {
    marginBottom: Spacing.xxxl,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  resendHint: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
  },
  resendTimer: {
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  resendLink: {
    fontSize: Typography.fontSizeMd,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
    textDecorationLine: 'underline',
  },
  demoHint: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoHintText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textDisabled,
  },
});
