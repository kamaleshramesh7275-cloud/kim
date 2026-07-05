export type UserRole = "coach" | "player" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type InjuryStatus = "Healthy" | "Caution" | "Injured";

export interface Biometrics {
  sleep: number; // 0-100
  hydration: number; // 0-100
  soreness: number; // 0-100 (100 is no soreness)
  fatigue: number; // 0-100 (100 is no fatigue)
  stress: number; // 0-100 (100 is no stress)
  trainingLoad: number; // 0-100
}

export interface PastInjury {
  id: string;
  type: string;
  date: string;
  resolvedDate?: string;
  status: "current" | "healing" | "resolved";
}

export interface CurrentInjury {
  type: string;
  severity: "low" | "medium" | "high";
  timeline: string;
  rehabPlan: string;
}

export interface Athlete {
  id: string;
  name: string;
  position: string;
  recoveryScore: number;
  injuryStatus: InjuryStatus;
  lastUpdated: string;
  biometrics: Biometrics;
  currentInjury?: CurrentInjury;
  pastInjuries: PastInjury[];
  streakDays: number;
  points: number;
}

export interface Alert {
  id: string;
  athleteId: string;
  athleteName: string;
  type: "injury" | "workload" | "recovery";
  severity: "high" | "medium" | "low";
  message: string;
  date: string;
  isResolved: boolean;
}

export interface TeamOverview {
  avgRecoveryScore: number;
  highRiskCount: number;
  totalAthletes: number;
  workloadAlertsCount: number;
  injuryRiskAlertsCount: number;
}
