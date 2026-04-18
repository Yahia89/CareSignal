import { CheckIn, CheckInStatus, CheckInSlot } from '../types';

const MOCK_DELAY = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function daysAgo(n: number, hour: number, min = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

const MOCK_HISTORY: CheckIn[] = [
  { id: 'ci-1', elderId: 'elder-1', status: 'ok', slot: 'morning', timestamp: daysAgo(0, 9) },
  { id: 'ci-2', elderId: 'elder-1', status: 'ok', slot: 'afternoon', timestamp: daysAgo(1, 14) },
  { id: 'ci-3', elderId: 'elder-1', status: 'ok', slot: 'morning', timestamp: daysAgo(1, 9) },
  { id: 'ci-4', elderId: 'elder-1', status: 'help', slot: 'evening', timestamp: daysAgo(2, 19) },
  { id: 'ci-5', elderId: 'elder-1', status: 'ok', slot: 'afternoon', timestamp: daysAgo(2, 14) },
  { id: 'ci-6', elderId: 'elder-1', status: 'ok', slot: 'morning', timestamp: daysAgo(2, 9) },
  { id: 'ci-7', elderId: 'elder-1', status: 'ok', slot: 'morning', timestamp: daysAgo(3, 9) },
  { id: 'ci-8', elderId: 'elder-1', status: 'ok', slot: 'evening', timestamp: daysAgo(3, 19) },
  { id: 'ci-9', elderId: 'elder-1', status: 'ok', slot: 'morning', timestamp: daysAgo(4, 9) },
  { id: 'ci-10', elderId: 'elder-1', status: 'ok', slot: 'afternoon', timestamp: daysAgo(4, 14) },
  { id: 'ci-11', elderId: 'elder-1', status: 'urgent', slot: 'evening', timestamp: daysAgo(5, 20) },
  { id: 'ci-12', elderId: 'elder-1', status: 'ok', slot: 'morning', timestamp: daysAgo(5, 9) },
  { id: 'ci-13', elderId: 'elder-1', status: 'ok', slot: 'morning', timestamp: daysAgo(6, 9) },
  { id: 'ci-14', elderId: 'elder-1', status: 'ok', slot: 'afternoon', timestamp: daysAgo(6, 14) },
];

let mockHistory = [...MOCK_HISTORY];

export const checkInService = {
  async getTodayCheckIn(elderId: string): Promise<CheckIn | null> {
    await delay(MOCK_DELAY);
    const today = new Date().toDateString();
    return (
      mockHistory.find(
        (c) => c.elderId === elderId && new Date(c.timestamp).toDateString() === today,
      ) ?? null
    );
  },

  async getHistory(elderId: string, days = 7): Promise<CheckIn[]> {
    await delay(MOCK_DELAY);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return mockHistory
      .filter((c) => c.elderId === elderId && new Date(c.timestamp) >= cutoff)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async submitCheckIn(
    elderId: string,
    status: CheckInStatus,
    slot: CheckInSlot,
  ): Promise<CheckIn> {
    await delay(MOCK_DELAY);

    const newCheckIn: CheckIn = {
      id: `ci-${Date.now()}`,
      elderId,
      status,
      slot,
      timestamp: new Date().toISOString(),
    };

    mockHistory = [newCheckIn, ...mockHistory];
    return newCheckIn;
  },
};
