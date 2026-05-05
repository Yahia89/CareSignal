import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Household } from '../types/domain';

interface HouseholdState {
  currentHousehold: Household | null;
}

const HouseholdContext = createContext<{
  state: HouseholdState;
  setHousehold: (h: Household | null) => void;
} | undefined>(undefined);

export const HouseholdProvider = ({ children }: { children: ReactNode }) => {
  const [currentHousehold, setHousehold] = useState<Household | null>(null);

  const value = useMemo(() => ({
    state: { currentHousehold },
    setHousehold,
  }), [currentHousehold]);

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
};

export const useHousehold = () => {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error('useHousehold must be used within HouseholdProvider');
  return ctx;
};

export const useHouseholdId = () => {
  return useHousehold().state.currentHousehold?.id;
};
