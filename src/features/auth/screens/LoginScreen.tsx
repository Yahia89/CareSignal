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
import {
  validateForm,
  required,
  isEmail,
  oneOf,
  type FormErrors,
} from '../../../shared/utils/validators';
import { LogoCard, OutlinedField, OutlinedSelect } from '../components';

const FORM_MAX_WIDTH = 480;
const TABLET_BREAKPOINT = 768;

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Family Account', value: 'family' as const },
  { label: 'Senior Account', value: 'elder' as const },
];

type Role = (typeof ACCOUNT_TYPE_OPTIONS)[number]['value'];

interface LoginForm {
  email: string;
  password: string;
  role: Role;
}

const initialForm: LoginForm = { email: '', password: '', role: 'family' };

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
      // On login we only validate format/presence — no strength rules
      // (the user may have an old password from before any rule existed).
      email: [required('Email is required'), isEmail()],
      password: required('Password is required'),
      role: oneOf(ACCOUNT_TYPE_OPTIONS.map((o) => o.value), 'Choose an account type'),
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
    // On success: RootNavigator switches stacks automatically.
    if (!result.ok) setSubmitError(result.error);
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
            { paddingHorizontal: isTablet ? spacing[32] : spacing[24] },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.constrain, isTablet && styles.constrainTablet]}>
            <LogoCard />

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

            <OutlinedSelect
              options={ACCOUNT_TYPE_OPTIONS}
              value={form.role}
              onValueChange={(v) => setField('role', v as Role)}
              placeholder="Family Account"
              disabled={loading}
              error={errors.role}
            />

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
    paddingTop: spacing[24],
    paddingBottom: spacing[48],
  },
  constrain: { width: '100%', alignSelf: 'center' },
  constrainTablet: { maxWidth: FORM_MAX_WIDTH },

  // Title — exact Figma: 23/700/#36597D, lh 100%
  title: {
    fontSize: 23,
    lineHeight: 26,
    fontWeight: '700',
    color: staticColors.text.primary,
    letterSpacing: 0,
  },
  // Subtitle — exact Figma: 14/400/#333333, lh 16.6
  subtitle: { fontSize: 14, lineHeight: 16.6, fontWeight: '400', color: '#333333' },

  submitError: {
    fontSize: 13,
    color: staticColors.semantic.error,
    paddingHorizontal: spacing[4],
    textAlign: 'center',
  },

  // Pill button — bumped to lg shadow so the neumorphic lift is unmistakable
  // against the soft blue-gray background.
  submitBtn: {
    width: '100%',
    minHeight: 58,
    borderRadius: borderRadius.full,
    ...getShadowStyle('lg'),
  },

  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 15, color: staticColors.text.primary },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: staticColors.text.primary,
    textDecorationLine: 'underline',
  },
});
