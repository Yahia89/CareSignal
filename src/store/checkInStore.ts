import { create } from 'zustand';
import { CheckIn } from '../types';

interface CheckInState {
  todayCheckIn: CheckIn | null;
  history: CheckIn[];
  isLoading: boolean;
  isSubmitting: boolean;

  setTodayCheckIn: (checkIn: CheckIn | null) => void;
  setHistory: (history: CheckIn[]) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  addToHistory: (checkIn: CheckIn) => void;
}

export const useCheckInStore = create<CheckInState>((set) => ({
  todayCheckIn: null,
  history: [],
  isLoading: false,
  isSubmitting: false,

  setTodayCheckIn: (todayCheckIn) => set({ todayCheckIn }),

  setHistory: (history) => set({ history }),

  setLoading: (isLoading) => set({ isLoading }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  addToHistory: (checkIn) =>
    set((state) => ({
      history: [checkIn, ...state.history],
      todayCheckIn: checkIn,
    })),
}));
