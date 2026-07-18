import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Screen, Spacer } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import {
  NeuButton,
  useColors,
  spacing,
  borderRadius,
  colors as staticColors,
} from '../../../shared/design';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';
import {
  validateForm,
  required,
  isEmail,
  oneOf,
  strongPassword,
  personName,
  type FormErrors,
} from '../../../shared/utils/validators';
import { LogoCard, OutlinedField, OutlinedSelect } from '../../../shared/components';
import { uiRoleToApi } from '../services/roleMapping';

const FORM_MAX_WIDTH = 480;
const TABLET_BREAKPOINT = 768;

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Family Account', value: 'family' as const },
  { label: 'Senior Account', value: 'elder' as const },
];

type Role = (typeof ACCOUNT_TYPE_OPTIONS)[number]['value'];

interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

const initialForm: SignUpForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'family',
};

export const SignUpScreen = () => {
  const navigation = useNavigation<any>();
  const { signup } = useAuth();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const insets = useSafeAreaInsets();
  const [focusedField, setFocusedField] = useState<'firstName' | 'lastName' | 'email' | 'password' | null>(null);

  const getBottomOffset = () => {
    if (focusedField === 'password') {
      // Dynamic offset: safe area bottom + space for the role select (58) + margins + spacer (16) + "Create Account" button (58) + extra gap (160px)
      return insets.bottom + 160;
    }
    return insets.bottom + 24; // Default offset
  };

  const [form, setForm] = useState<SignUpForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors<SignUpForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = <K extends keyof SignUpForm>(key: K, value: SignUpForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear the field-level error as the user edits — feels responsive
    // without revalidating on every keystroke.
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (submitError) setSubmitError(null);
  };

  const handleSignUp = async () => {
    const { valid, errors: validationErrors } = validateForm<SignUpForm>(form, {
      firstName: personName('First name'),
      lastName: personName('Last name'),
      email: [required('Email is required'), isEmail()],
      password: strongPassword,
      role: oneOf(ACCOUNT_TYPE_OPTIONS.map((o) => o.value), 'Choose an account type'),
    });

    if (!valid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setLoading(true);

    const result = await signup({
      email: form.email.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      role: uiRoleToApi(form.role),
    });

    setLoading(false);
    // On success: RootNavigator switches stacks automatically based on
    // isAuthenticated/role — no manual navigation needed.
    if (!result.ok) setSubmitError(result.error);
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isTablet ? spacing[32] : spacing[24] },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={getBottomOffset()}
      >
        <View style={[styles.constrain, isTablet && styles.constrainTablet]}>
          <LogoCard />

          <Spacer y="lg" />

          <Text style={styles.eyebrow}>Create Account</Text>
          <Spacer y="sm" />
          <Text style={styles.title}>Sign up for Care Signal</Text>
          <Spacer y="sm" />
          <Text style={styles.subtitle}>
            Family-Side access for alert controls and senior monitoring
          </Text>

          <Spacer y="lg" />

          <View style={styles.nameRow}>
            <OutlinedField
              placeholder="First Name"
              value={form.firstName}
              onChangeText={(v) => setField('firstName', v)}
              autoCapitalize="words"
              editable={!loading}
              error={errors.firstName}
              containerStyle={styles.nameCol}
              returnKeyType="next"
              onFocus={() => setFocusedField('firstName')}
              onBlur={() => setFocusedField(null)}
            />
            <View style={{ width: spacing[12] }} />
            <OutlinedField
              placeholder="Last Name"
              value={form.lastName}
              onChangeText={(v) => setField('lastName', v)}
              autoCapitalize="words"
              editable={!loading}
              error={errors.lastName}
              containerStyle={styles.nameCol}
              returnKeyType="next"
              onFocus={() => setFocusedField('lastName')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

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
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />

          <OutlinedField
            placeholder="Password"
            value={form.password}
            onChangeText={(v) => setField('password', v)}
            secureTextEntry
            editable={!loading}
            error={errors.password}
            textContentType="newPassword"
            autoComplete="password-new"
            returnKeyType="next"
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
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
            disabled={loading}
          >
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.footerLink}>Log in</Text>
          </TouchableOpacity>
        </View>

        <Spacer y="xxl" />
      </KeyboardAwareScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    // Visible gap between safe-area top and the LogoCard, matches the
    // Figma layout where there's background showing above the card.
    paddingTop: spacing[24],
    paddingBottom: spacing[48],
  },
  constrain: { width: '100%', alignSelf: 'center' },
  constrainTablet: { maxWidth: FORM_MAX_WIDTH },

  // Eyebrow + subtitle — exact Figma values: 14/400/#333333, lh 16.6
  eyebrow: { fontSize: 14, lineHeight: 16.6, fontFamily: interFamilyForWeight(400), color: '#333333' },
  // Title — exact Figma: 23/700/#36597D, lh 100%
  title: {
    fontSize: 23,
    lineHeight: 26,
    fontFamily: interFamilyForWeight(700),
    color: staticColors.text.primary,
    letterSpacing: 0,
  },
  subtitle: { fontSize: 14, lineHeight: 16.6, fontFamily: interFamilyForWeight(400), color: '#333333' },

  nameRow: { flexDirection: 'row', alignItems: 'flex-start' },
  nameCol: { flex: 1 },

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
    // Tier C — primary-CTA soft float (straight-down), matching the design system.
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },

  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: {
    fontSize: 15,
    fontFamily: interFamilyForWeight(400),
    color: staticColors.text.primary,
  },
  footerLink: {
    fontSize: 15,
    fontFamily: interFamilyForWeight(700),
    color: staticColors.text.primary,
    textDecorationLine: 'underline',
  },
});
