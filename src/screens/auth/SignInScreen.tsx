import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const COUNTRY_CODE = '+1';

export function SignInScreen({ navigation }: Props): React.JSX.Element {
  const [phone, setPhone] = useState('');
  const { sendOtp, isLoading } = useAuth();

  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = `${COUNTRY_CODE}${cleanPhone}`;
  const isValid = cleanPhone.length >= 10;

  async function handleSend() {
    if (!isValid) return;
    try {
      await sendOtp(fullPhone);
      navigation.navigate('OTP', { phone: fullPhone });
    } catch (err) {
      Alert.alert('Error', (err as Error).message ?? 'Failed to send code. Try again.');
    }
  }

  function formatPhoneDisplay(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

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
            <Text style={styles.title}>Enter your phone</Text>
            <Text style={styles.subtitle}>
              We'll send you a 6-digit code to verify your identity.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>{COUNTRY_CODE}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formatPhoneDisplay(phone)}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="(555) 000-0000"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleSend}
                autoFocus
              />
            </View>
          </View>

          <Text style={styles.hint}>
            Standard messaging rates may apply. By continuing you agree to our Terms of Service.
          </Text>

          <AppButton
            label="Send Code"
            variant="primary"
            fullWidth
            size="lg"
            loading={isLoading}
            disabled={!isValid}
            onPress={handleSend}
          />

          <View style={styles.demoHint}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textDisabled} />
            <Text style={styles.demoHintText}>
              Demo: use +1-555-0142 (Elder) or +1-555-0201 (Family). OTP is 123456.
            </Text>
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
    lineHeight: Typography.fontSizeMd * 1.5,
  },
  inputGroup: { marginBottom: Spacing.lg },
  label: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    backgroundColor: '#F9FAFB',
  },
  countryCodeText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizeLg,
    color: Colors.textPrimary,
  },
  hint: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textDisabled,
    marginBottom: Spacing.xl,
    lineHeight: Typography.fontSizeXs * 1.6,
  },
  demoHint: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    alignItems: 'flex-start',
  },
  demoHintText: {
    flex: 1,
    fontSize: Typography.fontSizeXs,
    color: Colors.textDisabled,
    lineHeight: Typography.fontSizeXs * 1.6,
  },
});
