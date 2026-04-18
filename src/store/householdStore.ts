import { create } from 'zustand';
import { Household, Elder, Alert } from '../types';

interface HouseholdState {
  household: Household | null;
  alerts: Alert[];
  isLoading: boolean;
  isRefreshing: boolean;

  setHousehold: (household: Household) => void;
  setAlerts: (alerts: Alert[]) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  updateElder: (elder: Elder) => void;
  markAlertRead: (alertId: string) => void;
  getUnreadAlertCount: () => number;
}

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  household: null,
  alerts: [],
  isLoading: false,
  isRefreshing: false,

  setHousehold: (household) => set({ household }),

  setAlerts: (alerts) => set({ alerts }),

  setLoading: (isLoading) => set({ isLoading }),

  setRefreshing: (isRefreshing) => set({ isRefreshing }),

  updateElder: (elder) =>
    set((state) => {
      if (!state.household) return state;
      return {
        household: {
          ...state.household,
          elders: state.household.elders.map((e) => (e.id === elder.id ? elder : e)),
        },
      };
    }),

  markAlertRead: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a)),
    })),

  getUnreadAlertCount: () => get().alerts.filter((a) => !a.read).length,
}));
