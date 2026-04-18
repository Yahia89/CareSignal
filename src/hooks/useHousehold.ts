import { useCallback } from 'react';
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

  const fetchHousehold = useCallback(async () => {
    setLoading(true);
    try {
      const [hh, al] = await Promise.all([
        householdService.getHousehold(HOUSEHOLD_ID),
        alertService.getAlerts(HOUSEHOLD_ID),
      ]);
      setHousehold(hh);
      setAlerts(al);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setHousehold, setAlerts]);

  const refreshHousehold = useCallback(async () => {
    setRefreshing(true);
    try {
      const [hh, al] = await Promise.all([
        householdService.getHousehold(HOUSEHOLD_ID),
        alertService.getAlerts(HOUSEHOLD_ID),
      ]);
      setHousehold(hh);
      setAlerts(al);
    } finally {
      setRefreshing(false);
    }
  }, [setRefreshing, setHousehold, setAlerts]);

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
