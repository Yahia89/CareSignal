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
        <View>
          <Text style={styles.appName}>CareSignal</Text>
          {firstName ? (
            <Text style={styles.welcomeText}>Hi, {firstName}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => {
            // Navigate to alerts tab — handled via tab navigation
          }}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          {unreadAlertCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  welcomeText: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bellBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
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
