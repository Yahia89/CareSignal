import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Text as RNText, ActivityIndicator } from 'react-native';
import { forgotPasswordStyles as styles } from './ForgotPasswordScreen.styles';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MailCheck } from 'lucide-react-native';
import { Screen, Input, LogoCard } from '../../../shared/components';
import { spacing, figmaColor, figmaFont, figmaRadius } from '../../../shared/design';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';
import { useForgotPassword } from '../../../hooks/useForgotPassword';
import { isEmail } from '../../../shared/utils/validators';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const { loading, error, success, message, forgotPassword } = useForgotPassword();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const emailError = touched && !isEmail(email) ? 'Enter a valid email address.' : null;

  const submit = async () => {
    setTouched(true);
    if (!isEmail(email)) return;
    await forgotPassword(email.trim());
  };

  return (
    <Screen style={{ backgroundColor: figmaColor.pageBg, padding: 0 }}>
      <View style={styles.header}>
        <View style={styles.logoSlot}>
          <LogoCard showSeparator={false} />
        </View>
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={22} color={figmaColor.titleNavy} strokeWidth={2.5} />
          <RNText style={styles.headerTitle}>Reset Password</RNText>
        </TouchableOpacity>
        <View style={styles.shadowFade1} />
        <View style={styles.shadowFade2} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {success ? (
          <View style={[styles.card, styles.successCard]}>
            <MailCheck size={28} color={figmaColor.green} strokeWidth={2} />
            <View style={{ height: spacing[12] }} />
            <RNText style={styles.h1}>Check your email</RNText>
            <View style={{ height: spacing[8] }} />
            <RNText style={styles.bodyMuted}>
              {message ?? "We sent a password reset link to your inbox. Tap it to set a new password."}
            </RNText>
            <View style={{ height: spacing[20] }} />
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.primaryBtn}>
              <RNText style={styles.primaryBtnText}>Back to Login</RNText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <RNText style={styles.eyebrow}>Forgot your password?</RNText>
            <RNText style={styles.heading}>Enter your email and we'll send a reset link</RNText>

            <View style={{ height: spacing[20] }} />

            <Input
              placeholder="Email address"
              value={email}
              onChangeText={(t) => { setEmail(t); if (touched) setTouched(false); }}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              {...(emailError ? { error: emailError } : {})}
            />

            {error && (
              <>
                <View style={{ height: spacing[12] }} />
                <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: figmaColor.red }]}>
                  <RNText style={[styles.bodyMuted, { color: figmaColor.red }]}>{error}</RNText>
                </View>
              </>
            )}

            <View style={{ height: spacing[24] }} />

            <TouchableOpacity
              onPress={submit}
              disabled={loading || !email.trim()}
              style={[styles.primaryBtn, (loading || !email.trim()) && { opacity: 0.6 }]}
            >
              {loading ? <ActivityIndicator color={figmaColor.textInverse} /> : <RNText style={styles.primaryBtnText}>Send reset link</RNText>}
            </TouchableOpacity>

            <View style={{ height: spacing[16] }} />

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkBtn}>
              <RNText style={styles.linkBtnText}>Back to Login</RNText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

