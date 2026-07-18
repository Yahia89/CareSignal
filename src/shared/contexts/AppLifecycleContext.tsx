import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAppLifecycle } from '../../hooks/useAppLifecycle';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface AppLifecycleContextValue {
  /**
   * `true` when 24+ hours of inactivity have been detected.
   * Navigation should reset to the role's first screen and then
   * call `acknowledgeReset`.
   */
  shouldReset: boolean;

  /** `true` once the persisted timestamp has been loaded from storage. */
  hydrated: boolean;

  /** Call after performing the navigation reset to start a new 24hr window. */
  acknowledgeReset: () => Promise<void>;

  /** Call on logout so the next user starts with a clean slate. */
  clearLifecycleData: () => Promise<void>;
}

const AppLifecycleContext = createContext<AppLifecycleContextValue | undefined>(
  undefined,
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const AppLifecycleProvider = ({ children }: { children: ReactNode }) => {
  const lifecycle = useAppLifecycle();

  const value = useMemo<AppLifecycleContextValue>(
    () => ({
      shouldReset: lifecycle.shouldReset,
      hydrated: lifecycle.hydrated,
      acknowledgeReset: lifecycle.acknowledgeReset,
      clearLifecycleData: lifecycle.clearLifecycleData,
    }),
    [
      lifecycle.shouldReset,
      lifecycle.hydrated,
      lifecycle.acknowledgeReset,
      lifecycle.clearLifecycleData,
    ],
  );

  return (
    <AppLifecycleContext.Provider value={value}>
      {children}
    </AppLifecycleContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useAppLifecycleContext = () => {
  const ctx = useContext(AppLifecycleContext);
  if (!ctx) {
    throw new Error(
      'useAppLifecycleContext must be used within AppLifecycleProvider',
    );
  }
  return ctx;
};
