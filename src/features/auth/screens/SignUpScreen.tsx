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

export const SignUpScreen = () => {
  const navigation = useNavigation<any>();
  const { dispatch } = useAuth();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    familyAccount: '',
    role: 'family',
  });

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const response = await authService.signUp(formData);
      dispatch({ type: 'LOGIN', payload: response });
    } catch (err) {
      console.error('Sign up failed:', err);
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

            <Spacer y="xl" />

            <Text style={styles.eyebrow}>Create Account</Text>
            <Spacer y="xs" />
            <Text style={styles.title}>Sign up for Care Signal</Text>
            <Spacer y="sm" />
            <Text style={styles.subtitle}>
              Family-Side access for alert controls and senior monitoring
            </Text>

            <Spacer y="lg" />

            <View style={styles.nameRow}>
              <OutlinedField
                placeholder="First Name"
                value={formData.firstName}
                onChangeText={(v) => setFormData({ ...formData, firstName: v })}
                autoCapitalize="words"
                editable={!loading}
                containerStyle={styles.nameCol}
              />
              <View style={{ width: spacing[12] }} />
              <OutlinedField
                placeholder="Last Name"
                value={formData.lastName}
                onChangeText={(v) => setFormData({ ...formData, lastName: v })}
                autoCapitalize="words"
                editable={!loading}
                containerStyle={styles.nameCol}
              />
            </View>

            <OutlinedField
              placeholder="Email Address"
              value={formData.email}
              onChangeText={(v) => setFormData({ ...formData, email: v })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <OutlinedField
              placeholder="Password"
              value={formData.password}
              onChangeText={(v) => setFormData({ ...formData, password: v })}
              secureTextEntry
              editable={!loading}
            />

            <OutlinedField
              placeholder="Family Account"
              value={formData.familyAccount}
              onChangeText={(v) => setFormData({ ...formData, familyAccount: v })}
              autoCapitalize="none"
              editable={!loading}
            />

            <Spacer y="md" />

            <NeuButton
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              size="lg"
              style={styles.submitBtn}
            />

            <Spacer y="lg" />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
              style={styles.footerRow}
            >
              <Text style={styles.footerText}>Already have an account? </Text>
              <Text style={styles.footerLink}>Log in</Text>
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

  eyebrow: { fontSize: 14, fontWeight: '500', color: staticColors.text.primary },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: staticColors.text.primary },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: staticColors.text.primary,
    opacity: 0.85,
  },

  nameRow: { flexDirection: 'row', alignItems: 'stretch' },
  nameCol: { flex: 1 },

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
