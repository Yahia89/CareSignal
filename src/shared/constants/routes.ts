export const routes = {
  auth: {
    login: 'Login',
    otp: 'OTP',
  },
  elder: {
    home: 'CheckInHome',
    success: 'CheckInSuccess',
  },
  family: {
    dashboard: 'FamilyDashboard',
    settings: 'FamilySettings',
  },
} as const;
