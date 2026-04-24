import { useCallback, useEffect } from 'react';
import { useHouseholdStore } from '../store/householdStore';
import { householdService } from '../services/householdService';
import { alertService } from '../services/alertService';
import { ScheduleConfig, GracePeriodConfig } from '../types';

const HOUSEHOLD_ID = 'household-1';

export function useHousehold() {
  const {
    household,
    alerts,
    isLoading,
    isRefreshing,
    setHousehold,
    setAlerts,
    setLoading,
    setRefreshing,
    markAlertRead,
    getUnreadAlertCount,
  } = useHouseholdStore();

  useEffect(() => {
    const unsubscribe = alertService.listenToAlerts(HOUSEHOLD_ID, setAlerts);
    return unsubscribe;
  }, [setAlerts]);

  const fetchHousehold = useCallback(async () => {
    setLoading(true);
    try {
      const hh = await householdService.getHousehold(HOUSEHOLD_ID);
      setHousehold(hh);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setHousehold]);

  const refreshHousehold = useCallback(async () => {
    setRefreshing(true);
    try {
      const hh = await householdService.getHousehold(HOUSEHOLD_ID);
      setHousehold(hh);
    } finally {
      setRefreshing(false);
    }
  }, [setRefreshing, setHousehold]);

  const updateSchedule = useCallback(
    async (schedule: ScheduleConfig) => {
      const updated = await householdService.updateSchedule(HOUSEHOLD_ID, schedule);
      if (household) {
        setHousehold({ ...household, schedule: updated });
      }
    },
    [household, setHousehold],
  );

  const updateGracePeriod = useCallback(
    async (gracePeriod: GracePeriodConfig) => {
      const updated = await householdService.updateGracePeriod(HOUSEHOLD_ID, gracePeriod);
      if (household) {
        setHousehold({ ...household, gracePeriod: updated });
      }
    },
    [household, setHousehold],
  );

  const readAlert = useCallback(
    async (alertId: string) => {
      await alertService.markAlertRead(alertId);
      markAlertRead(alertId);
    },
    [markAlertRead],
  );

  return {
    household,
    alerts,
    isLoading,
    isRefreshing,
    elders: household?.elders ?? [],
    familyMembers: household?.familyMembers ?? [],
    schedule: household?.schedule,
    gracePeriod: household?.gracePeriod,
    unreadAlertCount: getUnreadAlertCount(),
    fetchHousehold,
    refreshHousehold,
    updateSchedule,
    updateGracePeriod,
    readAlert,
  };
}
