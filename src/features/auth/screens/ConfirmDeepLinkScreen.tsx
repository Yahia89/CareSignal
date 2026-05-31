import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { confirmDeepLinkStyles as styles } from './ConfirmDeepLinkScreen.styles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Screen, Text, Spacer } from '../../../shared/components';
import { NeuButton, NeuCard, useColors, spacing } from '../../../shared/design';
import { useAuth } from '../../../shared/contexts/AuthContext';
import type { AuthStackParamList } from '../../../navigation/types';

type ConfirmRoute = RouteProp<AuthStackParamList, 'Confirm'>;

/**
 * Interstitial that handles `caresignal://auth/confirm?token_hash=xxx&type=...`.
 *
 * - signup / email → `verifyEmail()` → user becomes authenticated and
 *   RootNavigator flips to Elder/Family stack.
 * - recovery → push the user to ResetPassword carrying the token_hash.
 */
export const ConfirmDeepLinkScreen = () => {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const route = useRoute<ConfirmRoute>();
  const { verifyEmail } = useAuth();

  const { token_hash, type } = route.params ?? ({} as Partial<ConfirmRoute['params']>);

  const [status, setStatus] = useState<'working' | 'error'>('working');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token_hash || !type) {
        if (!cancelled) {
          setError('Missing or invalid confirmation link.');
          setStatus('error');
        }
        return;
      }

      if (type === 'recovery') {
        // Hand off to the password-set screen with the token in tow.
        navigation.reset({
          index: 0,
          routes: [{ name: 'ResetPassword', params: { token_hash } }],
        });
        return;
      }

      const result = await verifyEmail(token_hash, type);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        setStatus('error');
      }
      // ok=true: AuthContext flips isAuthenticated, RootNavigator swaps stacks.
    })();
    return () => { cancelled = true; };
  }, [token_hash, type, verifyEmail, navigation]);

  const goToLogin = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <View style={styles.center}>
        {status === 'working' ? (
          <>
            <ActivityIndicator color={colors.accent.primary} />
            <Spacer y="md" />
            <Text variant="caption" color={colors.text.secondary}>
              Confirming…
            </Text>
          </>
        ) : (
          <NeuCard style={{
            backgroundColor: colors.semantic.error + '15',
            borderLeftWidth: 4,
            borderLeftColor: colors.semantic.error,
            width: '100%',
          }}>
            <Text variant="title" color={colors.semantic.error}>Confirmation failed</Text>
            <Spacer y="sm" />
            <Text variant="caption" color={colors.text.secondary}>
              {error ?? 'Something went wrong.'}
            </Text>
            <Spacer y="lg" />
            <NeuButton title="Back to login" onPress={goToLogin} variant="secondary" size="md" />
          </NeuCard>
        )}
      </View>
    </Screen>
  );
};

