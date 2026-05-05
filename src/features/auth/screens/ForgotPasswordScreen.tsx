import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Text, Spacer, Input } from '../../../shared/components';
import { NeuButton, NeuCard, useColors, useTokens, spacing, borderRadius } from '../../../shared/design';
import { useForgotPassword } from '../../../hooks/useForgotPassword';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const tokens = useTokens();
  const { loading, error, success, message, forgotPassword } = useForgotPassword();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleRequestReset = async () => {
    if (!email.trim()) {
      return;
    }

    const result = await forgotPassword(email);
    if (result) {
      setStep('reset');
    }
  };

  return (
    <Screen style={styles.container}>
      {step === 'request' ? (
        <View style={styles.content}>
          <Text variant="h1" style={styles.title}>
            Reset Password
          </Text>

          <Spacer y="md" />

          <Text variant="body" color={colors.text.secondary} style={styles.description}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          <Spacer y="lg" />

          <Input
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {error && (
            <>
              <Spacer y="md" />
              <Card
                style={{
                  backgroundColor: theme.colors.error + '20',
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.error,
                }}
              >
                <Text color={theme.colors.error}>{error}</Text>
              </Card>
            </>
          )}

          {success && message && (
            <>
              <Spacer y="md" />
              <Card
                style={{
                  backgroundColor: theme.colors.success + '20',
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.success,
                }}
              >
                <Text color={theme.colors.success}>{message}</Text>
              </Card>
            </>
          )}

          <Spacer y="lg" />

          <Button
            onPress={handleRequestReset}
            disabled={!email.trim() || loading}
            loading={loading}
          >
            Send Reset Link
          </Button>

          <Spacer y="md" />

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text
              variant="caption"
              style={styles.backLink}
              color={theme.colors.primary}
            >
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <Text variant="h1" style={styles.title}>
            Reset Your Password
          </Text>

          <Spacer y="md" />

          <Text variant="body" color={colors.text.secondary} style={styles.description}>
            Check your email for the reset link. Enter the token and your new password below.
          </Text>

          <Spacer y="lg" />

          <Input
            placeholder="Reset token from email"
            value={resetToken}
            onChangeText={setResetToken}
            editable={!loading}
            autoCapitalize="none"
          />

          <Spacer y="md" />

          <Input
            placeholder="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <Spacer y="md" />

          <Input
            placeholder="Confirm password"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
            editable={!loading}
          />

          {error && (
            <>
              <Spacer y="md" />
              <Card
                style={{
                  backgroundColor: theme.colors.error + '20',
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.error,
                }}
              >
                <Text color={theme.colors.error}>{error}</Text>
              </Card>
            </>
          )}

          {success && message && (
            <>
              <Spacer y="md" />
              <Card
                style={{
                  backgroundColor: theme.colors.success + '20',
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.success,
                }}
              >
                <Text color={theme.colors.success}>{message}</Text>
                <Spacer y="sm" />
                <Button
                  size="sm"
                  onPress={() => {
                    setStep('request');
                    setEmail('');
                    setResetToken('');
                    setPassword('');
                    setPasswordConfirm('');
                  }}
                >
                  Back to Login
                </Button>
              </Card>
            </>
          )}

          {!success && (
            <>
              <Spacer y="lg" />

              <Button
                onPress={async () => {
                  await forgotPassword(email);
                }}
                disabled={!resetToken.trim() || !password.trim() || !passwordConfirm.trim() || loading}
                loading={loading}
              >
                Reset Password
              </Button>
            </>
          )}

          <Spacer y="md" />

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text
              variant="caption"
              style={styles.backLink}
              color={theme.colors.primary}
            >
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
  },
  backLink: {
    textAlign: 'center',
  },
});
