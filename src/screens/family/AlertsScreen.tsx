import React, { useCallback, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AlertItem } from '../../components/family/AlertItem';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useHousehold } from '../../hooks/useHousehold';

export function AlertsScreen(): React.JSX.Element {
  const { alerts, isLoading, isRefreshing, fetchHousehold, refreshHousehold, readAlert } =
    useHousehold();

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  const onRefresh = useCallback(() => {
    refreshHousehold();
  }, [refreshHousehold]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  if (isLoading && alerts.length === 0) {
    return <LoadingOverlay message="Loading alerts..." fullScreen={false} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount} new</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {alerts.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="All Clear!"
            subtitle="No alerts at this time. Your loved ones are doing great."
          />
        ) : (
          <>
            {unreadCount > 0 && (
              <View style={styles.groupHeader}>
                <Ionicons name="alert-circle" size={16} color={Colors.urgent} />
                <Text style={styles.groupTitle}>Recent Alerts</Text>
              </View>
            )}
            {alerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onPress={() => {
                  if (!alert.read) readAlert(alert.id);
                }}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  unreadBadge: {
    backgroundColor: Colors.urgent,
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  unreadText: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  groupTitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
