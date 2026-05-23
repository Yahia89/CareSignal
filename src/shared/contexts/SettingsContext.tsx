import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Schedule } from '../types/domain';

interface SettingsState {
  schedule: Schedule | null;
  notificationsEnabled: boolean;
  vitalCaptureEnabled: boolean;
  needHelpConfig: {
    email: boolean;
    text: boolean;
    phone: boolean;
  };
  urgentHelpConfig: {
    email: boolean;
    text: boolean;
    phone: boolean;
    autoCall: boolean;
  };
}

const SettingsContext = createContext<{
  state: SettingsState;
  updateSettings: (s: Partial<SettingsState>) => void;
} | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SettingsState>({
    schedule: null,
    notificationsEnabled: true,
    vitalCaptureEnabled: true,
    needHelpConfig: {
      email: true,
      text: true,
      phone: false,
    },
    urgentHelpConfig: {
      email: true,
      text: true,
      phone: true,
      autoCall: true,
    },
  });

  const updateSettings = (s: Partial<SettingsState>) => {
    setState(prev => ({ ...prev, ...s }));
  };

  const value = useMemo(() => ({ state, updateSettings }), [state]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
