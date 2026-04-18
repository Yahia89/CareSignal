import { Alert } from '../types';

const MOCK_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 1000).toISOString();
}

function hoursAgo(n: number): string {
  return minutesAgo(n * 60);
}

let mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    elderId: 'elder-1',
    elderName: 'Margaret Chen',
    severity: 'urgent',
    message: 'Margaret pressed Urgent Help this evening.',
    timestamp: hoursAgo(3),
    read: false,
  },
  {
    id: 'alert-2',
    elderId: 'elder-1',
    elderName: 'Margaret Chen',
    severity: 'warning',
    message: 'Margaret requested help during her afternoon check-in.',
    timestamp: hoursAgo(28),
    read: true,
  },
  {
    id: 'alert-3',
    elderId: 'elder-1',
    elderName: 'Margaret Chen',
    severity: 'warning',
    message: 'Margaret missed her Evening check-in.',
    timestamp: hoursAgo(56),
    read: true,
  },
  {
    id: 'alert-4',
    elderId: 'elder-1',
    elderName: 'Margaret Chen',
    severity: 'info',
    message: 'Margaret\'s morning check-in was 45 minutes late.',
    timestamp: hoursAgo(70),
    read: true,
  },
];

export const alertService = {
  async getAlerts(householdId: string): Promise<Alert[]> {
    await delay(MOCK_DELAY);
    return [...mockAlerts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  },

  async markAlertRead(alertId: string): Promise<void> {
    await delay(300);
    mockAlerts = mockAlerts.map((a) => (a.id === alertId ? { ...a, read: true } : a));
  },

  async markAllRead(householdId: string): Promise<void> {
    await delay(300);
    mockAlerts = mockAlerts.map((a) => ({ ...a, read: true }));
  },

  getUnreadCount(): number {
    return mockAlerts.filter((a) => !a.read).length;
  },
};
