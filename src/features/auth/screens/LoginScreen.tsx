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
import {
  NeuButton,
  useColors,
  spacing,
  borderRadius,
  getShadowStyle,
  colors as staticColors,
} from '../../../shared/design';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';
import {
  validateForm,
  required,
  isEmail,
  type FormErrors,
} from '../../../shared/utils/validators';
import { LogoCard, OutlinedField } from '../../../shared/components';

const FORM_MAX_WIDTH = 480;
const TABLET_BREAKPOINT = 768;

interface LoginForm {
  email: string;
  password: string;
}

const initialForm: LoginForm = { email: '', password: '' };

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const [form, setForm] = useState<LoginForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors<LoginForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = <K extends keyof LoginForm>(key: K, value: LoginForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (submitError) setSubmitError(null);
  };

  const handleLogin = async () => {
    const { valid, errors: validationErrors } = validateForm<LoginForm>(form, {
      email: [required('Email is required'), isEmail()],
      password: required('Password is required'),
    });

    if (!valid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setLoading(true);

    const result = await login(form.email.trim(), form.password);

    setLoading(false);
    if (!result.ok) setSubmitError(result.error);
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LogoCard />

          <View
            style={[
              styles.formPad,
              { paddingHorizontal: isTablet ? spacing[32] : spacing[24] },
            ]}
          >
          <View style={[styles.constrain, isTablet && styles.constrainTablet]}>
            <Spacer y="lg" />

            <Text style={styles.title}>Login for Care Signal</Text>
            <Spacer y="sm" />
            <Text style={styles.subtitle}>
              Family-Side access for alert controls and senior monitoring
            </Text>

            <Spacer y="xl" />

            <OutlinedField
              placeholder="Email Address"
              value={form.email}
              onChangeText={(v) => setField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              error={errors.email}
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
            />

            <OutlinedField
              placeholder="Password"
              value={form.password}
              onChangeText={(v) => setField('password', v)}
              secureTextEntry
              editable={!loading}
              error={errors.password}
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
              style={styles.forgotRow}
              disabled={loading}
              hitSlop={8}
            >
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>

            {submitError ? (
              <>
                <Spacer y="xs" />
                <Text style={styles.submitError}>{submitError}</Text>
              </>
            ) : null}

            <Spacer y="md" />

            <NeuButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              size="lg"
              style={styles.submitBtn}
            />

            <Spacer y="lg" />

            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.7}
              style={styles.footerRow}
              disabled={loading}
            >
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
          </View>

          <Spacer y="xxl" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing[48],
  },
  formPad: {
    paddingTop: spacing[0],
  },
  constrain: { width: '100%', alignSelf: 'center' },
  constrainTablet: { maxWidth: FORM_MAX_WIDTH },

  title: {
    fontSize: 23,
    lineHeight: 26,
    fontFamily: interFamilyForWeight(700),
    color: staticColors.text.primary,
    letterSpacing: 0,
  },
  subtitle: { fontSize: 14, lineHeight: 16.6, fontFamily: interFamilyForWeight(400), color: '#333333' },

  submitError: {
    fontSize: 13,
    color: staticColors.semantic.error,
    paddingHorizontal: spacing[4],
    textAlign: 'center',
  },

  submitBtn: {
    width: '100%',
    minHeight: 58,
    borderRadius: borderRadius.full,
    ...getShadowStyle('lg'),
  },

  forgotRow: {
    alignSelf: 'flex-end',
    paddingVertical: spacing[4],
    marginTop: spacing[2],
  },
  forgotLink: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(600),
    color: staticColors.text.primary,
    textDecorationLine: 'underline',
  },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: {
    fontSize: 16,
    fontFamily: interFamilyForWeight(400),
    color: staticColors.text.primary,
  },
  footerLink: {
    fontSize: 16,
    fontFamily: interFamilyForWeight(700),
    color: staticColors.text.primary,
    textDecorationLine: 'underline',
  },
});
