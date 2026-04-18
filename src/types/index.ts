// ─── Auth & Users ───────────────────────────────────────────────────────────

export type UserRole = 'elder' | 'family';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  expiresAt: number;
}

// ─── Check-in ────────────────────────────────────────────────────────────────

export type CheckInStatus = 'ok' | 'help' | 'urgent';
export type CheckInSlot = 'morning' | 'afternoon' | 'evening';

export interface CheckIn {
  id: string;
  elderId: string;
  status: CheckInStatus;
  slot: CheckInSlot;
  timestamp: string; // ISO 8601
  note?: string;
}

// ─── Elder Status ─────────────────────────────────────────────────────────────

export type ElderStatusType = 'ok' | 'help' | 'urgent' | 'late' | 'missed' | 'pending';

export interface ElderStatus {
  type: ElderStatusType;
  lastCheckIn?: CheckIn;
  nextSlot?: CheckInSlot;
  nextCheckInTime?: string;
}

// ─── Household & Members ─────────────────────────────────────────────────────

export interface Elder {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  status: ElderStatus;
}

export interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  notifyPush: boolean;
  notifySms: boolean;
}

export interface Household {
  id: string;
  elders: Elder[];
  familyMembers: FamilyMember[];
  schedule: ScheduleConfig;
  gracePeriod: GracePeriodConfig;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface SlotConfig {
  enabled: boolean;
  time: string; // "HH:MM" 24h
}

export interface ScheduleConfig {
  morning: SlotConfig;
  afternoon: SlotConfig;
  evening: SlotConfig;
}

export interface GracePeriodConfig {
  lateAfterMinutes: number;
  missedAfterMinutes: number;
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'urgent';

export interface Alert {
  id: string;
  elderId: string;
  elderName: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string; // ISO 8601
  read: boolean;
}

// ─── Navigation Param Lists ───────────────────────────────────────────────────

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  OTP: { phone: string };
  RoleSelect: undefined;
};

export type ElderTabParamList = {
  ElderHome: undefined;
  ElderProfile: undefined;
};

export type FamilyTabParamList = {
  FamilyDashboard: undefined;
  Alerts: undefined;
  FamilySettings: undefined;
};

export type FamilyStackParamList = {
  FamilyTabs: undefined;
  ElderDetail: { elderId: string };
};
