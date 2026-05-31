import React, { useState } from 'react';
import { extractApiError } from '../../../shared/utils';
import { View, StyleSheet } from 'react-native';
import { resetPasswordStyles as styles } from './ResetPasswordScreen.styles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Screen, Text, Spacer, Input } from '../../../shared/components';
import { NeuButton, NeuCard, useColors, spacing } from '../../../shared/design';
import { authService } from '../../../services/auth.service';
import type { AuthStackParamList } from '../../../navigation/types';

type ResetRoute = RouteProp<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen = () => {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const route = useRoute<ResetRoute>();
  const token_hash = route.params?.token_hash;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!token_hash) {
      setError('Reset link is missing the token. Open the email link again.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({ token_hash, type: 'recovery', password });
      setSuccess(true);
    } catch (err) {
      setError(extractApiError(err, 'Could not reset password. Try requesting a new link.'));
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <View style={styles.content}>
        <Text variant="title">Set a new password</Text>
        <Spacer y="sm" />
        <Text variant="caption" color={colors.text.secondary}>
          Enter the new password for your CareSignal account.
        </Text>

        <Spacer y="lg" />

        {success ? (
          <NeuCard style={{
            backgroundColor: colors.semantic.success + '12',
            borderWidth: 2,
            borderColor: colors.semantic.success,
          }}>
            <Text variant="title" color={colors.semantic.success}>Password updated</Text>
            <Spacer y="sm" />
            <Text variant="caption" color={colors.text.secondary}>
              You can now log in with your new password.
            </Text>
            <Spacer y="lg" />
            <NeuButton title="Back to login" onPress={goToLogin} size="md" />
          </NeuCard>
        ) : (
          <>
            <Input
              placeholder="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            <Spacer y="md" />
            <Input
              placeholder="Confirm new password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            {error && (
              <>
                <Spacer y="md" />
                <NeuCard style={{
                  backgroundColor: colors.semantic.error + '15',
                  borderLeftWidth: 4,
                  borderLeftColor: colors.semantic.error,
                }}>
                  <Text color={colors.semantic.error}>{error}</Text>
                </NeuCard>
              </>
            )}

            <Spacer y="lg" />
            <NeuButton
              title={loading ? 'Updating…' : 'Update password'}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !password || !confirm}
              size="md"
            />
            <Spacer y="md" />
            <NeuButton title="Back to login" onPress={goToLogin} variant="secondary" size="md" />
          </>
        )}
      </View>
    </Screen>
  );
};

