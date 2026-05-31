export type Role = 'elder' | 'family';
export type Plan = 'free' | 'plus' | 'pro';

export interface User {
  id: string;
  role: Role;
  name: string;
  phoneNumber: string;
  plan?: Plan;
}

export interface Household {
  id: string;
  members: User[];
  elderId: string;
}

export type Slot = 'morning' | 'afternoon' | 'evening';

export interface Schedule {
  id: string;
  elderId: string;
  slots: Slot[]; // e.g. ['morning', 'evening']
  // Configuration options for time offsets could be added here
}

export type CheckInStatus = 'ok' | 'help' | 'urgent' | 'late' | 'missed';

export interface CheckIn {
  id: string;
  elderId: string;
  slot: Slot;
  status: CheckInStatus;
  timestamp: string; // ISO 8601
}

export interface Alert {
  id: string;
  elderId: string;
  type: 'missed_checkin' | 'help_requested' | 'urgent_help';
  status: 'active' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android';
}
