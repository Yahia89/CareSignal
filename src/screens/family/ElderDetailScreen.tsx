import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FamilyStackParamList, CheckIn, Elder } from '../../types';
import { Avatar } from '../../components/common/Avatar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AppCard } from '../../components/common/AppCard';
import { CheckInHistoryItem } from '../../components/family/CheckInHistoryItem';
import { EmptyState } from '../../components/common/EmptyState';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { householdService } from '../../services/householdService';
import { checkInService } from '../../services/checkInService';

type Props = NativeStackScreenProps<FamilyStackParamList, 'ElderDetail'>;

export function ElderDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { elderId } = route.params;
  const [elder, setElder] = useState<Elder | null>(null);
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [e, h] = await Promise.all([
          householdService.getElderById(elderId),
          checkInService.getHistory(elderId, 7),
        ]);
        setElder(e);
        setHistory(h);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [elderId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!elder) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState icon="person-outline" title="Elder not found" />
      </SafeAreaView>
    );
  }

  const statusColor: Record<string, string> = {
    ok: Colors.success,
    help: Colors.warning,
    urgent: Colors.urgent,
    late: Colors.late,
    missed: Colors.missed,
    pending: Colors.border,
  };

  const borderColor = statusColor[elder.status.type] ?? Colors.border;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{elder.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <AppCard leftBorderColor={borderColor} style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Avatar name={elder.name} size={64} />
            <View style={styles.statusInfo}>
              <Text style={styles.elderName}>{elder.name}</Text>
              <StatusBadge status={elder.status.type} size="md" />
            </View>
          </View>

          {elder.status.lastCheckIn && (
            <View style={styles.lastCheckIn}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.lastCheckInText}>
                Last check-in:{' '}
                {new Date(elder.status.lastCheckIn.timestamp).toLocaleString([], {
                  weekday: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </AppCard>

        {/* History */}
        <AppCard style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Check-in History (Last 7 Days)</Text>
          {history.length === 0 ? (
            <Text style={styles.noHistory}>No check-ins recorded yet.</Text>
          ) : (
            history.map((item, index) => (
              <CheckInHistoryItem
                key={item.id}
                checkIn={item}
                isLast={index === history.length - 1}
              />
            ))
          )}
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  statusCard: { marginBottom: Spacing.lg },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statusInfo: { flex: 1, gap: Spacing.sm },
  elderName: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  lastCheckIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lastCheckInText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
  },
  historyCard: {},
  sectionTitle: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  noHistory: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});
