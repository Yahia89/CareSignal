import { Household, Elder, FamilyMember, ScheduleConfig, GracePeriodConfig } from '../types';

const MOCK_DELAY = 700;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_HOUSEHOLD: Household = {
  id: 'household-1',
  elders: [
    {
      id: 'elder-1',
      name: 'Margaret Chen',
      phone: '+15550142',
      status: {
        type: 'ok',
        lastCheckIn: {
          id: 'ci-1',
          elderId: 'elder-1',
          status: 'ok',
          slot: 'morning',
          timestamp: (() => {
            const d = new Date();
            d.setHours(9, 3, 0, 0);
            return d.toISOString();
          })(),
        },
        nextSlot: 'afternoon',
        nextCheckInTime: (() => {
          const d = new Date();
          d.setHours(14, 0, 0, 0);
          return d.toISOString();
        })(),
      },
    },
  ],
  familyMembers: [
    {
      id: 'family-1',
      name: 'David Chen',
      phone: '+15550201',
      notifyPush: true,
      notifySms: true,
    },
    {
      id: 'family-2',
      name: 'Lisa Chen',
      phone: '+15550300',
      notifyPush: true,
      notifySms: false,
    },
  ],
  schedule: {
    morning: { enabled: true, time: '09:00' },
    afternoon: { enabled: true, time: '14:00' },
    evening: { enabled: true, time: '19:00' },
  },
  gracePeriod: {
    lateAfterMinutes: 30,
    missedAfterMinutes: 120,
  },
};

let mockHousehold = { ...MOCK_HOUSEHOLD };

export const householdService = {
  async getHousehold(householdId: string): Promise<Household> {
    await delay(MOCK_DELAY);
    return { ...mockHousehold };
  },

  async getElderById(elderId: string): Promise<Elder | null> {
    await delay(400);
    return mockHousehold.elders.find((e) => e.id === elderId) ?? null;
  },

  async updateSchedule(householdId: string, schedule: ScheduleConfig): Promise<ScheduleConfig> {
    await delay(MOCK_DELAY);
    mockHousehold = { ...mockHousehold, schedule };
    return schedule;
  },

  async updateGracePeriod(
    householdId: string,
    gracePeriod: GracePeriodConfig,
  ): Promise<GracePeriodConfig> {
    await delay(MOCK_DELAY);
    mockHousehold = { ...mockHousehold, gracePeriod };
    return gracePeriod;
  },

  async addFamilyMember(
    householdId: string,
    member: Omit<FamilyMember, 'id'>,
  ): Promise<FamilyMember> {
    await delay(MOCK_DELAY);
    const newMember: FamilyMember = { ...member, id: `family-${Date.now()}` };
    mockHousehold = {
      ...mockHousehold,
      familyMembers: [...mockHousehold.familyMembers, newMember],
    };
    return newMember;
  },

  async removeFamilyMember(householdId: string, memberId: string): Promise<void> {
    await delay(MOCK_DELAY);
    mockHousehold = {
      ...mockHousehold,
      familyMembers: mockHousehold.familyMembers.filter((m) => m.id !== memberId),
    };
  },

  async updateFamilyMember(
    householdId: string,
    memberId: string,
    updates: Partial<FamilyMember>,
  ): Promise<FamilyMember> {
    await delay(MOCK_DELAY);
    const members = mockHousehold.familyMembers.map((m) =>
      m.id === memberId ? { ...m, ...updates } : m,
    );
    mockHousehold = { ...mockHousehold, familyMembers: members };
    return members.find((m) => m.id === memberId)!;
  },
};
