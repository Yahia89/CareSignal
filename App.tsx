import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Providers } from './src/app/Providers';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/shared/components/ErrorBoundary';

// Optional: Wrap with Sentry.wrap if configured
export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <RootNavigator />
        <StatusBar style="auto" />
      </Providers>
    </ErrorBoundary>
  );
}
