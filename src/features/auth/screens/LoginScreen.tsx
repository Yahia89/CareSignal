import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Spacer } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { NeuButton, useColors, spacing, borderRadius, colors as staticColors } from '../../../shared/design';
import { authService } from '../services/authService';
import { LogoCard, OutlinedField } from '../components';

const FORM_MAX_WIDTH = 480;
const TABLET_BREAKPOINT = 768;

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { dispatch } = useAuth();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', familyAccount: '' });
  const [error, setError] = useState<string | null>(null);

  const canSubmit = form.email.trim().length > 0 && form.password.length > 0 && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const trimmedFamily = form.familyAccount.trim();
      const response = await authService.login({
        email: form.email.trim(),
        password: form.password,
        ...(trimmedFamily ? { familyAccount: trimmedFamily } : {}),
      });
      dispatch({ type: 'LOGIN', payload: response });
    } catch (err: any) {
      setError(err?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: isTablet ? spacing[32] : spacing[20] },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.constrain, isTablet && styles.constrainTablet]}>
            <LogoCard />

            <Spacer y="xxl" />

            <Text style={styles.title}>Login for Care Signal</Text>
            <Spacer y="sm" />
            <Text style={styles.subtitle}>
              Family-Side access for alert controls and senior monitoring
            </Text>

            <Spacer y="xl" />

            <OutlinedField
              placeholder="Email Address"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              textContentType="emailAddress"
              autoComplete="email"
            />

            <OutlinedField
              placeholder="Password"
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
              secureTextEntry
              editable={!loading}
              textContentType="password"
              autoComplete="password"
            />

            <OutlinedField
              placeholder="Family Account"
              value={form.familyAccount}
              onChangeText={(v) => setForm({ ...form, familyAccount: v })}
              autoCapitalize="none"
              editable={!loading}
            />

            {error && (
              <>
                <Spacer y="xs" />
                <Text style={styles.error}>{error}</Text>
              </>
            )}

            <Spacer y="md" />

            <NeuButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              disabled={!canSubmit}
              size="lg"
              style={styles.submitBtn}
            />

            <Spacer y="lg" />

            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.7}
              style={styles.footerRow}
            >
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <Spacer y="xxl" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? spacing[16] : spacing[24],
    paddingBottom: spacing[48],
  },
  constrain: { width: '100%', alignSelf: 'center' },
  constrainTablet: { maxWidth: FORM_MAX_WIDTH },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: staticColors.text.primary,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: staticColors.text.primary,
    opacity: 0.85,
  },

  error: {
    fontSize: 13,
    color: staticColors.semantic.error,
    paddingHorizontal: spacing[4],
  },

  submitBtn: { width: '100%', minHeight: 56, borderRadius: borderRadius.full },

  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 15, color: staticColors.text.primary },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: staticColors.text.primary,
    textDecorationLine: 'underline',
  },
});
