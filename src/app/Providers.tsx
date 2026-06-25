import React, { ReactNode } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ThemeProvider } from '../shared/contexts/ThemeContext';
import { AuthProvider } from '../shared/contexts/AuthContext';
import { HouseholdProvider } from '../shared/contexts/HouseholdContext';
import { SettingsProvider } from '../shared/contexts/SettingsContext';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <KeyboardProvider>
      <ThemeProvider>
        <AuthProvider>
          <HouseholdProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </HouseholdProvider>
        </AuthProvider>
      </ThemeProvider>
    </KeyboardProvider>
  );
};
