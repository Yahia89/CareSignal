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

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export function SignInScreen({ navigation, route }: Props): React.JSX.Element {
  const { role } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithEmail, isLoading } = useAuth();

  const isElder = role === 'elder';

  async function handleLogin() {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }
    if (!password) {
      Alert.alert('Missing Password', 'Please enter your password.');
      return;
    }
    try {
      await loginWithEmail(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', (err as Error).message ?? 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Card */}
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
            <Text style={styles.label}>Welcome back</Text>
            <Text style={styles.title}>Login to CareSignal</Text>
            <Text style={styles.subtitle}>
              {isElder
                ? 'Senior-side access for daily check-ins and optional vitals.'
                : 'Family-side access for alert controls and senior monitoring.'}
            </Text>

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

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginBtnText}>{isLoading ? 'Logging in…' : 'Log In'}</Text>
              </TouchableOpacity>
            </View>

            {/* Sign up link */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate('SignUp', { role })}
            >
              <Text style={styles.linkText}>Need an account? </Text>
              <Text style={styles.linkTextUnderline}>Sign up</Text>
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
  loginBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
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
