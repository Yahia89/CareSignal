import React, { ReactNode } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ThemeProvider } from '../shared/contexts/ThemeContext';
import { AuthProvider } from '../shared/contexts/AuthContext';
import { RevenueCatProvider } from '../shared/contexts/RevenueCatContext';
import { HouseholdProvider } from '../shared/contexts/HouseholdContext';
import { SettingsProvider } from '../shared/contexts/SettingsContext';
import { AppLifecycleProvider } from '../shared/contexts/AppLifecycleContext';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <KeyboardProvider>
      <AppLifecycleProvider>
        <ThemeProvider>
          <AuthProvider>
            <RevenueCatProvider>
              <HouseholdProvider>
                <SettingsProvider>
                  {children}
                </SettingsProvider>
              </HouseholdProvider>
            </RevenueCatProvider>
          </AuthProvider>
        </ThemeProvider>
      </AppLifecycleProvider>
    </KeyboardProvider>
  );
};
