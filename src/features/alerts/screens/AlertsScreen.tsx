import React, { useCallback, useEffect, useState } from 'react';
import { extractApiError } from '../../../shared/utils';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { alertsStyles as styles } from './AlertsScreen.styles';
import { useNavigation } from '@react-navigation/native';
import { Bell, Check, AlertTriangle } from 'lucide-react-native';
import { Screen, Text, Spacer, SkeletonBlock, SkeletonGroup } from '../../../shared/components';
import { NeuButton, NeuCard, useColors, spacing, borderRadius } from '../../../shared/design';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { alertsService } from '../../../services/alerts.service';
import type { ApiAlert, AlertTriggerType } from '../../../types';

const PAGE_SIZE = 20;

const triggerLabel = (t: AlertTriggerType): string => {
  switch (t) {
    case 'ok': return 'Checked in';
    case 'needs_help': return 'Needs help';
    case 'urgent': return 'Urgent';
  }
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

interface AlertRowProps {
  alert: ApiAlert;
  busy: boolean;
  onDismiss: (id: string) => void;
}

const AlertRow = ({ alert, busy, onDismiss }: AlertRowProps) => {
  const colors = useColors();
  const dismissed = !!alert.dismissed_at;

  const accent =
    alert.trigger_type === 'urgent'
      ? colors.semantic.error
      : alert.trigger_type === 'needs_help'
      ? colors.semantic.warning
      : colors.semantic.success;

  return (
    <NeuCard style={[styles.row, { borderLeftColor: accent }]}>
      <View style={styles.rowIconWrap}>
        {alert.trigger_type === 'urgent' ? (
          <AlertTriangle size={20} color={accent} />
        ) : alert.trigger_type === 'needs_help' ? (
          <Bell size={20} color={accent} />
        ) : (
          <Check size={20} color={accent} />
        )}
      </View>
      <View style={{ flex: 1, paddingHorizontal: spacing[12] }}>
        <Text variant="body" style={{ fontWeight: '700' }} color={accent}>
          {triggerLabel(alert.trigger_type)}
        </Text>
        <Text variant="small" color={colors.text.secondary} style={{ marginTop: 2 }}>
          {formatDateTime(alert.created_at)}
        </Text>
        {dismissed && (
          <Text variant="small" color={colors.text.secondary} style={{ marginTop: 2 }}>
            Dismissed {formatDateTime(alert.dismissed_at!)}
          </Text>
        )}
      </View>
      {!dismissed && (
        <NeuButton
          title={busy ? '…' : 'Dismiss'}
          onPress={() => onDismiss(alert.id)}
          disabled={busy}
          variant="secondary"
          size="sm"
        />
      )}
    </NeuCard>
  );
};

export const AlertsScreen = () => {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { state } = useAuth();
  const plan = state.user?.plan ?? 'free';
  const isPlusOrPro = plan === 'plus' || plan === 'pro';

  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const fetchPage = useCallback(async (targetPage: number, mode: 'initial' | 'append' | 'refresh') => {
    if (mode === 'append') setLoading(true);
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    setError(null);
    try {
      const { items, meta } = await alertsService.listAlerts({ page: targetPage, limit: PAGE_SIZE });
      setAlerts((prev) => (mode === 'append' ? [...prev, ...items] : items));
      setPage(targetPage);
      if (meta) {
        setHasMore(targetPage < meta.totalPages);
      } else {
        setHasMore(items.length === PAGE_SIZE);
      }
    } catch (err) {
      setError(extractApiError(err, 'Could not load alerts'));
      if (mode !== 'append') setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isPlusOrPro) fetchPage(1, 'initial');
  }, [isPlusOrPro, fetchPage]);

  const handleDismiss = async (id: string) => {
    setDismissingId(id);
    try {
      const updated = await alertsService.dismiss(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      setError(extractApiError(err, 'Could not dismiss alert'));
    } finally {
      setDismissingId(null);
    }
  };

  const handleEndReached = () => {
    if (loading || refreshing || !hasMore) return;
    fetchPage(page + 1, 'append');
  };

  if (!isPlusOrPro) {
    return (
      <Screen style={{ backgroundColor: colors.background }}>
        <View style={styles.upgradeWrap}>
          <NeuCard
            style={{
              padding: spacing[24],
              alignItems: 'flex-start',
              // Tier A — straight-down soft float, consistent with the app.
              shadowColor: '#3A5575',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.17,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text variant="title">Alert history</Text>
            <Spacer y="sm" />
            <Text variant="caption" color={colors.text.secondary}>
              Alert history is available on the Plus plan. Upgrade to keep a record of every "I need help" and "Urgent" alert your senior has sent.
            </Text>
            <Spacer y="lg" />
            <NeuButton
              title="Back"
              onPress={() => navigation.goBack()}
              variant="secondary"
              size="md"
            />
          </NeuCard>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <FlatList
        data={alerts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchPage(1, 'refresh')} />
        }
        ListHeaderComponent={
          <View>
            <Text variant="title">Alert history</Text>
            <Spacer y="sm" />
            <Text variant="caption" color={colors.text.secondary}>
              Every "I need help" and "Urgent" your senior has sent.
            </Text>
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
            <Spacer y="md" />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <SkeletonGroup gap={12}>
              <SkeletonBlock height={84} radius="card" />
              <SkeletonBlock height={84} radius="card" />
              <SkeletonBlock height={84} radius="card" />
              <SkeletonBlock height={84} radius="card" />
            </SkeletonGroup>
          ) : (
            <NeuCard style={{ padding: spacing[24], alignItems: 'center' }}>
              <Text variant="body" color={colors.text.secondary}>No alerts yet.</Text>
            </NeuCard>
          )
        }
        ListFooterComponent={
          loading ? (
            <View style={{ padding: spacing[16], alignItems: 'center' }}>
              <ActivityIndicator color={colors.accent.primary} />
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <Spacer y="sm" />}
        renderItem={({ item }) => (
          <AlertRow alert={item} busy={dismissingId === item.id} onDismiss={handleDismiss} />
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
      />
    </Screen>
  );
};

