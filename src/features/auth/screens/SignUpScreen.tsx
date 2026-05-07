import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { HeartPulse } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Screen,
  Text,
  Spacer,
  Input,
  Select,
} from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { NeuButton, NeuCard, useColors, useTokens, spacing, borderRadius, getShadowStyle } from '../../../shared/design';
import { authService } from '../services/authService';

export const SignUpScreen = () => {
  const navigation = useNavigation<any>();
  const { dispatch } = useAuth();
  const colors = useColors();
  const tokens = useTokens();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'family',
  });

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const response = await authService.signUp(formData);
      dispatch({ type: 'LOGIN', payload: response });
    } catch (error) {
      console.error('Sign up failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const accountTypeOptions = [
    { label: 'Family Account', value: 'family' },
    { label: 'Senior Account', value: 'elder' },
  ];

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Logo Header ── */}
          <View style={styles.header}>
            <View style={styles.logoIconWrap}>
              <HeartPulse size={20} color={colors.accent.primary} strokeWidth={2.5} />
            </View>
            <Text
              variant="subheading"
              color={colors.accent.primary}
              style={styles.logoText}
            >
              iMedTechCare
            </Text>
          </View>

          <Spacer y="xl" />

          {/* ── White Card ── */}
          <View style={styles.card}>
            {/* Heading block */}
            <Text variant="small" color={colors.text.secondary} style={styles.eyebrow}>
              Create Account
            </Text>
            <Text style={styles.title}>
              Sign up for Care Signal
            </Text>
            <Text variant="caption" color={colors.text.secondary} style={styles.subtitle}>
              Family-Side access for alert controls and senior monitoring
            </Text>

            <Spacer y="lg" />

            {/* Name row */}
            <View style={styles.nameRow}>
              <View style={styles.nameCol}>
                <Input
                  variant="flat"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChangeText={(v) => setFormData({ ...formData, firstName: v })}
                  autoCapitalize="words"
                />
              </View>
              <Spacer x="sm" />
              <View style={styles.nameCol}>
                <Input
                  variant="flat"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChangeText={(v) => setFormData({ ...formData, lastName: v })}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <Input
              variant="flat"
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={formData.email}
              onChangeText={(v) => setFormData({ ...formData, email: v })}
            />

            <Input
              variant="flat"
              placeholder="Password"
              secureTextEntry
              value={formData.password}
              onChangeText={(v) => setFormData({ ...formData, password: v })}
            />

            <Select
              variant="flat"
              options={accountTypeOptions}
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v })}
              placeholder="Family Account"
            />

            <Spacer y="lg" />

            {/* Create Account button */}
            <NeuButton
              title={loading ? "Creating…" : "Create Account"}
              onPress={handleSignUp}
              loading={loading}
              size="md"
            />

            <Spacer y="lg" />

            {/* Already have account link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
              style={styles.loginRow}
            >
              <Text variant="caption" color={colors.text.secondary}>
                Already have an account?{' '}
              </Text>
              <Text variant="caption" color={colors.accent.primary} style={styles.loginLink}>
                Log in
              </Text>
            </TouchableOpacity>
          </View>

          <Spacer y="xxl" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing[20],
    paddingTop: Platform.OS === 'ios' ? 24 : 40,
    paddingBottom: spacing[48],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
  },
  logoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[22],
    paddingTop: spacing[28],
    paddingBottom: spacing[28],
    ...getShadowStyle('md'),
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 34,
    marginBottom: spacing[8],
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  nameRow: {
    flexDirection: 'row',
  },
  nameCol: {
    flex: 1,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    fontWeight: '700',
    color: colors.accent.primary,
    textDecorationLine: 'underline',
  },
});
