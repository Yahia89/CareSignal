import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { confirmDeepLinkStyles as styles } from './ConfirmDeepLinkScreen.styles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Screen, Text, Spacer } from '../../../shared/components';
import { NeuButton, NeuCard, useColors, spacing } from '../../../shared/design';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { decodeToken } from '../../../utils/tokenManager';
import type { AuthStackParamList } from '../../../navigation/types';
import type { Session, ApiUser } from '../../../types';

type ConfirmRoute = RouteProp<AuthStackParamList, 'Confirm'>;

/**
 * Interstitial that handles deep links from the backend's email-verify page.
 *
 * The backend now supports two shapes:
 *
 *  1) Pre-issued Supabase session (signup / email-change):
 *       caresignal://auth?access_token=...&refresh_token=...&expires_in=3600
 *     → decode JWT for user id/email, build a Session, call `loginWithSession`.
 *
 *  2) Legacy / recovery (`token_hash` flow):
 *       caresignal://auth?token_hash=xxx&type=signup|email|recovery
 *     → `recovery` hops to ResetPassword; `signup`/`email` call `verifyEmail`.
 *
 * On any success the AuthContext flips `isAuthenticated` and RootNavigator
 * swaps to the Elder/Family stack automatically.
 */
export const ConfirmDeepLinkScreen = () => {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const route = useRoute<ConfirmRoute>();
  const { state, verifyEmail, loginWithSession } = useAuth();

  const {
    access_token,
    refresh_token,
    expires_in,
    token_hash,
    type,
  } = route.params ?? ({} as Partial<ConfirmRoute['params']>);

  const [status, setStatus] = useState<'working' | 'error'>('working');
  const [error, setError] = useState<string | null>(null);
  // Categorize the failure so we can offer the right CTA + copy. "expired"
  // covers expired/invalid tokens; "generic" everything else.
  const [errorKind, setErrorKind] = useState<'expired' | 'generic'>('generic');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // ─── Sensible fallback: user is already authenticated ──────────────
      // RootNavigator should have already routed us out of the Auth stack
      // in this case, but a deep link can still arrive in transit. Don't
      // try to "re-login" — just present a clear message and let the
      // navigator do its thing on the next render cycle.
      if (state.isAuthenticated) {
        if (!cancelled) {
          setError("You're already signed in. Continue using the app.");
          setErrorKind('generic');
          setStatus('error');
        }
        return;
      }

      // ─── Path 1: backend handed us a fully-issued session ──────────────
      if (access_token && refresh_token) {
        // Decode the JWT to recover the user id + email so we can build a
        // Session shaped like the rest of the auth code expects. The backend
        // doesn't include `user` in the deep link — only the tokens — but
        // Supabase JWTs always carry `sub` (user id) and `email` in the body.
        const decoded = decodeToken(access_token);
        const apiUser: ApiUser = {
          id: (decoded?.sub as string) ?? '',
          email: (decoded?.email as string) ?? '',
        };
        const session: Session = {
          access_token,
          refresh_token,
          expires_in: Number(expires_in) || 3600,
          user: apiUser,
        };
        const result = await loginWithSession(session);
        if (cancelled) return;
        if (!result.ok) {
          setError(result.error);
          setErrorKind(classifyError(result.error));
          setStatus('error');
        }
        return;
      }

      // ─── Path 2: legacy token_hash flow ────────────────────────────────
      if (!token_hash || !type) {
        if (!cancelled) {
          setError(
            'This confirmation link is missing required information. Open the most recent email or request a new link.'
          );
          setErrorKind('expired');
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
        setErrorKind(classifyError(result.error));
        setStatus('error');
      }
      // ok=true: AuthContext flips isAuthenticated, RootNavigator swaps stacks.
    })();
    return () => { cancelled = true; };
  }, [
    state.isAuthenticated,
    access_token,
    refresh_token,
    expires_in,
    token_hash,
    type,
    verifyEmail,
    loginWithSession,
    navigation,
  ]);

  const goToLogin = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const goToForgotPassword = () => {
    navigation.reset({ index: 0, routes: [{ name: 'ForgotPassword' }] });
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
            <Text variant="title" color={colors.semantic.error}>
              {errorKind === 'expired' ? 'Link expired or invalid' : 'Confirmation failed'}
            </Text>
            <Spacer y="sm" />
            <Text variant="caption" color={colors.text.secondary}>
              {error ?? 'Something went wrong.'}
            </Text>
            <Spacer y="lg" />
            {errorKind === 'expired' ? (
              <>
                <NeuButton title="Request a new link" onPress={goToForgotPassword} size="md" />
                <Spacer y="sm" />
                <NeuButton title="Back to login" onPress={goToLogin} variant="secondary" size="md" />
              </>
            ) : (
              <NeuButton title="Back to login" onPress={goToLogin} variant="secondary" size="md" />
            )}
          </NeuCard>
        )}
      </View>
    </Screen>
  );
};

/** Heuristic to map a raw error message to one of our user-facing buckets. */
function classifyError(msg: string | null | undefined): 'expired' | 'generic' {
  if (!msg) return 'generic';
  const m = msg.toLowerCase();
  if (
    m.includes('expired') ||
    m.includes('invalid') ||
    m.includes('not found') ||
    m.includes('token') ||
    m.includes('otp')
  ) {
    return 'expired';
  }
  return 'generic';
}

