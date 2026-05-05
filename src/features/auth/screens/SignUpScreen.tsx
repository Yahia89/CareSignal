import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { HeartPulse } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Screen,
  Text,
  Button,
  Spacer,
  Input,
  Select,
} from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { authService } from '../services/authService';

export const SignUpScreen = () => {
  const navigation = useNavigation<any>();
  const { dispatch } = useAuth();
  const theme = useTheme();

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
              <HeartPulse size={20} color={theme.colors.secondary} strokeWidth={2.5} />
            </View>
            <Text
              variant="subheading"
              color={theme.colors.secondary}
              style={styles.logoText}
            >
              iMedTechCare
            </Text>
          </View>

          <Spacer y="xl" />

          {/* ── White Card ── */}
          <View style={styles.card}>
            {/* Heading block */}
            <Text variant="small" color={theme.colors.textSecondary} style={styles.eyebrow}>
              Create Account
            </Text>
            <Text style={styles.title}>
              Sign up for Care Signal
            </Text>
            <Text variant="caption" color={theme.colors.textSecondary} style={styles.subtitle}>
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
            <TouchableOpacity
              style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={styles.ctaText}>Creating…</Text>
              ) : (
                <Text style={styles.ctaText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <Spacer y="lg" />

            {/* Already have account link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
              style={styles.loginRow}
            >
              <Text variant="caption" color={theme.colors.textSecondary}>
                Already have an account?{' '}
              </Text>
              <Text variant="caption" color={theme.colors.secondary} style={styles.loginLink}>
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
    backgroundColor: '#E9EFFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 24 : 40,
    paddingBottom: 48,
  },

  // ── Logo ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D6EDE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
    color: '#008471',
  },

  // ── Card ──
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 28,
    // Subtle neumorphic shadow for the card lift
    shadowColor: '#B8C6D9',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A2138',
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },

  // ── Form ──
  nameRow: {
    flexDirection: 'row',
  },
  nameCol: {
    flex: 1,
  },

  // ── CTA Button ──
  ctaButton: {
    backgroundColor: '#0D1425',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    // Button shadow
    shadowColor: '#0D1425',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Login link ──
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    fontWeight: '700',
    color: '#008471',
    textDecorationLine: 'underline',
  },
});
