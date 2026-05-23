// Configuration based on app.config.ts or env
export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  version: '1.0.0', // In real app, import from app.json
};
