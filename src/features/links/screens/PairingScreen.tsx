import React, { useCallback, useEffect, useState } from 'react';
import { extractApiError } from '../../../shared/utils';
import { View, TouchableOpacity, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { pairingStyles as styles } from './PairingScreen.styles';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Copy, Check } from 'lucide-react-native';
import { Screen, Text, Spacer, Input, SkeletonBlock, SkeletonGroup } from '../../../shared/components';
import {
  NeuButton,
  NeuCard,
  useColors,
  spacing,
  borderRadius,
} from '../../../shared/design';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { linksService } from '../../../services/links.service';
import type { Link } from '../../../types';

export const PairingScreen = () => {
  const colors = useColors();
  const navigation = useNavigation();
  const { state } = useAuth();
  const role = state.user?.role; // 'elder' | 'family'

  const [link, setLink] = useState<Link | null>(null);
  const [hasNoLink, setHasNoLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Senior side
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Family side
  const [inviteInput, setInviteInput] = useState('');
  const [accepting, setAccepting] = useState(false);

  const fetchLink = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const result = await linksService.getMyLink();
      setLink(result);
      setHasNoLink(result == null);
    } catch (err) {
      setError(extractApiError(err, 'Could not load link'));
    } finally {
      if (mode === 'initial') setLoading(false); else setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLink('initial'); }, [fetchLink]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const code = await linksService.generateInvite();
      // Optimistically render a pending Link so the senior sees the code
      // immediately, even if GET /links hasn't propagated yet.
      const optimistic: Link = {
        id: `pending-${Date.now()}`,
        senior_user_id: state.user?.id ?? '',
        family_user_id: null,
        invite_code: code,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setLink(optimistic);
      setHasNoLink(false);
      // Background-refresh to pick up the real id from the server. Only
      // override our optimistic Link if the server actually returns one —
      // a transient null/404 here shouldn't blow the code off the screen.
      linksService.getMyLink()
        .then((real) => { if (real) setLink(real); })
        .catch(() => {});
    } catch (err) {
      setError(extractApiError(err, 'Failed to generate invite code'));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!link?.invite_code) return;
    await Clipboard.setStringAsync(link.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmRevoke = () => {
    if (!link) return;
    Alert.alert(
      'Revoke link?',
      'This will disconnect your family member. They will no longer see your check-ins.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Revoke', style: 'destructive', onPress: handleRevoke },
      ]
    );
  };

  const handleRevoke = async () => {
    if (!link) return;
    setRevoking(true);
    setError(null);
    try {
      await linksService.revokeLink(link.id);
      setLink(null);
      setHasNoLink(true);
    } catch (err) {
      setError(extractApiError(err, 'Failed to revoke link'));
    } finally {
      setRevoking(false);
    }
  };

  const handleAccept = async () => {
    const code = inviteInput.trim().toUpperCase();
    if (code.length < 4) {
      setError('Enter the invite code your senior shared.');
      return;
    }
    setAccepting(true);
    setError(null);
    try {
      const accepted = await linksService.acceptInvite({ invite_code: code });
      setLink(accepted);
      setHasNoLink(false);
      setInviteInput('');
      // Bounce back to dashboard on family side
      // @ts-expect-error — navigator type union allows both Elder and Family
      navigation.navigate('FamilyDashboard');
    } catch (err) {
      setError(extractApiError(err, 'Could not accept invite. Check the code and try again.'));
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchLink('refresh')} />}
      >
        <Text variant="title" style={{ textAlign: 'center' }}>Pairing</Text>
        <Spacer y="sm" />
        <Text variant="caption" color={colors.text.secondary} style={{ textAlign: 'center' }}>
          {role === 'elder'
            ? 'Connect a family member so they can see your daily check-ins.'
            : 'Enter the 5-character invite code your senior shared with you.'}
        </Text>

        <Spacer y="xl" />

        {loading ? (
          <SkeletonGroup gap={16}>
            <SkeletonBlock height={120} radius="card" />
            <SkeletonBlock height={48} radius="card" />
            <SkeletonBlock height={48} width="60%" radius="card" />
          </SkeletonGroup>
        ) : (
          <>
            {error && (
              <>
                <NeuCard style={{
                  backgroundColor: colors.semantic.error + '15',
                  borderLeftWidth: 4,
                  borderLeftColor: colors.semantic.error,
                }}>
                  <Text color={colors.semantic.error}>{error}</Text>
                </NeuCard>
                <Spacer y="md" />
              </>
            )}

            {role === 'elder' ? (
              <ElderView
                link={link}
                hasNoLink={hasNoLink}
                generating={generating}
                revoking={revoking}
                copied={copied}
                onGenerate={handleGenerate}
                onCopy={handleCopy}
                onRevoke={confirmRevoke}
              />
            ) : (
              <FamilyView
                link={link}
                hasNoLink={hasNoLink}
                inviteInput={inviteInput}
                setInviteInput={setInviteInput}
                accepting={accepting}
                revoking={revoking}
                onAccept={handleAccept}
                onRevoke={confirmRevoke}
              />
            )}
          </>
        )}

        <Spacer y="xl" />
        <NeuButton
          title="Back"
          onPress={() => navigation.goBack()}
          variant="secondary"
          size="md"
        />
      </ScrollView>
    </Screen>
  );
};

interface ElderViewProps {
  link: Link | null;
  hasNoLink: boolean;
  generating: boolean;
  revoking: boolean;
  copied: boolean;
  onGenerate: () => void;
  onCopy: () => void;
  onRevoke: () => void;
}

const ElderView = ({ link, hasNoLink, generating, revoking, copied, onGenerate, onCopy, onRevoke }: ElderViewProps) => {
  const colors = useColors();

  if (!link || hasNoLink) {
    return (
      <NeuButton
        title={generating ? 'Generating…' : 'Generate invite code'}
        onPress={onGenerate}
        loading={generating}
        disabled={generating}
        size="md"
      />
    );
  }

  return (
    <>
      <NeuCard style={{
        backgroundColor: link.status === 'active' ? colors.semantic.success + '12' : colors.semantic.info + '12',
        borderWidth: 2,
        borderColor: link.status === 'active' ? colors.semantic.success : colors.semantic.info,
        paddingVertical: spacing[24],
        alignItems: 'center',
      }}>
        {link.status === 'active' ? (
          <>
            <Text variant="title" color={colors.semantic.success}>
              You're already linked
            </Text>
            <Spacer y="xs" />
            <Text variant="caption" color={colors.text.secondary} style={{ textAlign: 'center' }}>
              Your family is set up to receive your check-ins. You don't need a new code unless you want to add another member.
            </Text>
            <Spacer y="md" />
          </>
        ) : (
          <Text variant="caption" color={colors.text.secondary}>
            Your invite code
          </Text>
        )}
        <Spacer y="sm" />
        <Text
          style={styles.inviteCode}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {link.invite_code}
        </Text>
        <Spacer y="md" />
        <TouchableOpacity onPress={onCopy} style={[styles.copyChip, { backgroundColor: colors.neutral[200] }]}>
          {copied ? (
            <>
              <Check size={16} color={colors.semantic.success} />
              <Text variant="caption" color={colors.semantic.success} style={{ marginLeft: 6 }}>Copied!</Text>
            </>
          ) : (
            <>
              <Copy size={16} color={colors.text.primary} />
              <Text variant="caption" style={{ marginLeft: 6 }}>Copy code</Text>
            </>
          )}
        </TouchableOpacity>
        <Spacer y="sm" />
        <Text variant="small" color={colors.text.secondary} style={{ textAlign: 'center' }}>
          Status: {link.status === 'active' ? 'Active' : 'Waiting for family to accept'}
        </Text>
      </NeuCard>

      <Spacer y="lg" />

      <NeuButton
        title={revoking ? 'Revoking…' : 'Revoke link'}
        onPress={onRevoke}
        loading={revoking}
        disabled={revoking}
        variant="secondary"
        size="md"
      />
    </>
  );
};

interface FamilyViewProps {
  link: Link | null;
  hasNoLink: boolean;
  inviteInput: string;
  setInviteInput: (s: string) => void;
  accepting: boolean;
  revoking: boolean;
  onAccept: () => void;
  onRevoke: () => void;
}

const FamilyView = ({ link, hasNoLink, inviteInput, setInviteInput, accepting, revoking, onAccept, onRevoke }: FamilyViewProps) => {
  const colors = useColors();

  if (link && !hasNoLink && link.status === 'active') {
    return (
      <>
        <NeuCard style={{
          backgroundColor: colors.semantic.success + '12',
          borderWidth: 2,
          borderColor: colors.semantic.success,
          paddingVertical: spacing[24],
          alignItems: 'center',
        }}>
          <Text variant="title" color={colors.semantic.success}>Linked</Text>
          <Spacer y="sm" />
          <Text variant="caption" color={colors.text.secondary} style={{ textAlign: 'center' }}>
            You're connected to a senior. Their daily status appears on your dashboard.
          </Text>
        </NeuCard>
        <Spacer y="lg" />
        <NeuButton
          title={revoking ? 'Revoking…' : 'Disconnect'}
          onPress={onRevoke}
          loading={revoking}
          disabled={revoking}
          variant="secondary"
          size="md"
        />
      </>
    );
  }

  return (
    <>
      <Input
        value={inviteInput}
        onChangeText={(t) => setInviteInput(t.toUpperCase())}
        placeholder="Enter invite code"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={32}
        style={styles.codeInput}
      />
      <Spacer y="lg" />
      <NeuButton
        title={accepting ? 'Connecting…' : 'Accept invite'}
        onPress={onAccept}
        loading={accepting}
        disabled={accepting || inviteInput.trim().length < 4}
        size="md"
      />
    </>
  );
};

