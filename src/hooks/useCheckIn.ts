import { useCallback, useEffect } from 'react';
import { useCheckInStore } from '../store/checkInStore';
import { checkInService } from '../services/checkInService';
import { useAuthStore } from '../store/authStore';
import { CheckInStatus, CheckInSlot } from '../types';

export function useCheckIn() {
  const { user } = useAuthStore();
  const {
    todayCheckIn,
    history,
    isLoading,
    isSubmitting,
    setTodayCheckIn,
    setHistory,
    setLoading,
    setSubmitting,
    addToHistory,
  } = useCheckInStore();

  const fetchTodayCheckIn = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const checkIn = await checkInService.getTodayCheckIn(user.id);
      setTodayCheckIn(checkIn);
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setTodayCheckIn]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await checkInService.getHistory(user.id, 7);
      setHistory(items);
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setHistory]);

  const submitCheckIn = useCallback(
    async (status: CheckInStatus, slot: CheckInSlot) => {
      if (!user) throw new Error('Not authenticated');
      setSubmitting(true);
      try {
        const checkIn = await checkInService.submitCheckIn(user.id, status, slot);
        addToHistory(checkIn);
        return checkIn;
      } finally {
        setSubmitting(false);
      }
    },
    [user, setSubmitting, addToHistory],
  );

  useEffect(() => {
    if (user?.role === 'elder') {
      fetchTodayCheckIn();
    }
  }, [user, fetchTodayCheckIn]);

  return {
    todayCheckIn,
    history,
    isLoading,
    isSubmitting,
    fetchTodayCheckIn,
    fetchHistory,
    submitCheckIn,
  };
}
