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
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation, route }: Props): React.JSX.Element {
  const { role } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginAsElder, loginAsFamily, isLoading } = useAuth();

  const isElder = role === 'elder';
  const accountLabel = isElder ? 'Senior account' : 'Family account';

  async function handleCreate() {
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    try {
      if (isElder) {
        await loginAsElder();
      } else {
        await loginAsFamily();
      }
    } catch (err) {
      Alert.alert('Error', (err as Error).message ?? 'Sign up failed. Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* Logo */}
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Ionicons name="fitness-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.logoName}>MEDTECH CARE</Text>
                <Text style={styles.logoSub}>CareSignal</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.label}>Create account</Text>
            <Text style={styles.title}>Sign up for CareSignal</Text>
            <Text style={styles.subtitle}>
              {isElder
                ? 'Senior-side access for daily check-ins and optional vitals.'
                : 'Family-side access for alert controls and senior monitoring.'}
            </Text>

            {/* Name row */}
            <View style={styles.nameRow}>
              <View style={[styles.inputWrap, styles.flex1]}>
                <TextInput
                  style={styles.input}
                  placeholder="First name"
                  placeholderTextColor={Colors.textDisabled}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputWrap, styles.flex1]}>
                <TextInput
                  style={styles.input}
                  placeholder="Last name"
                  placeholderTextColor={Colors.textDisabled}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textDisabled}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.inputPr]}
                placeholder="Password"
                placeholderTextColor={Colors.textDisabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textDisabled}
                />
              </TouchableOpacity>
            </View>

            {/* Account type (read-only) */}
            <View style={[styles.inputWrap, styles.dropdownWrap]}>
              <Text style={styles.dropdownText}>{accountLabel}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
            </View>

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, isLoading && styles.createBtnDisabled]}
                onPress={handleCreate}
                disabled={isLoading}
              >
                <Text style={styles.createBtnText}>
                  {isLoading ? 'Creating…' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login link */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate('SignIn', { role })}
            >
              <Text style={styles.linkText}>Already have an account? </Text>
              <Text style={styles.linkTextUnderline}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundMint },
  flex: { flex: 1 },
  flex1: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingVertical: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxxl,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoName: {
    fontSize: 10,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: 1.5,
    color: Colors.primary,
  },
  logoSub: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: 0,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizeMd,
    color: Colors.textPrimary,
  },
  inputPr: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  dropdownWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  dropdownText: {
    flex: 1,
    fontSize: Typography.fontSizeMd,
    color: Colors.textPrimary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  createBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
  },
  linkTextUnderline: {
    fontSize: Typography.fontSizeSm,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
    textDecorationLine: 'underline',
  },
});
