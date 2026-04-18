import React, { useCallback, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FamilyStackParamList } from '../../types';
import { ElderCard } from '../../components/family/ElderCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useHousehold } from '../../hooks/useHousehold';
import { useAuth } from '../../hooks/useAuth';

type Nav = NativeStackNavigationProp<FamilyStackParamList, 'FamilyTabs'>;

export function FamilyDashboardScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { elders, isLoading, isRefreshing, unreadAlertCount, fetchHousehold, refreshHousehold } =
    useHousehold();

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  const onRefresh = useCallback(() => {
    refreshHousehold();
  }, [refreshHousehold]);

  const firstName = user?.name.split(' ')[0] ?? '';

  if (isLoading && elders.length === 0) {
    return <LoadingOverlay message="Loading dashboard..." fullScreen={false} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="fitness-outline" size={16} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.logoName}>MEDTECH CARE</Text>
            <Text style={styles.logoSub}>CareSignal</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>
              {firstName.toLowerCase()} - Family App
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
            {unreadAlertCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
        <Text style={styles.sectionTitle}>Your Loved Ones</Text>

        {elders.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No Elders Linked"
            subtitle="Link an elder's account to start monitoring their daily check-ins."
          />
        ) : (
          elders.map((elder) => (
            <ElderCard
              key={elder.id}
              elder={elder}
              onPress={() => navigation.navigate('ElderDetail', { elderId: elder.id })}
            />
          ))
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoName: {
    fontSize: 9,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: 1.2,
    color: Colors.primary,
  },
  logoSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userBadge: {
    backgroundColor: Colors.background,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userBadgeText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
  },
  bellBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.urgent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: Typography.fontWeightBold,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
});
