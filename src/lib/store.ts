import { create } from "zustand";
import { User, Athlete, Alert, TeamOverview, CurrentInjury } from "./types";
import { loadDatasetState } from "./data";

interface AppState {
  user: User | null;
  athletes: Athlete[];
  alerts: Alert[];
  teamOverview: TeamOverview;
  datasetSummary?: { recoveryRows: number; trainingRows: number };
  coachPermanentCode?: string;
  codeGeneratedAt?: string;

  // Actions
  login: (user: User) => void;
  hydrateFromDatasets: () => Promise<void>;
  logout: () => void;
  setCoachPermanentCode: (code: string) => void;
  updateAthleteBiometrics: (id: string, biometrics: Partial<Athlete["biometrics"]>) => void;
  updateAthleteInjury: (id: string, injury: CurrentInjury | undefined) => void;
  resolveAlert: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  athletes: [],
  alerts: [],
  teamOverview: {
    avgRecoveryScore: 0,
    highRiskCount: 0,
    totalAthletes: 0,
    workloadAlertsCount: 0,
    injuryRiskAlertsCount: 0,
  },
  datasetSummary: undefined,
  coachPermanentCode: undefined,
  codeGeneratedAt: undefined,

  login: (user) => set({ user }),

  hydrateFromDatasets: async () => {
    const state = await loadDatasetState();
    set({
      athletes: state.athletes,
      alerts: state.alerts,
      teamOverview: state.teamOverview,
      datasetSummary: state.datasetSummary,
    });
  },
  logout: () => set({ user: null }),
  setCoachPermanentCode: (code) => set({ coachPermanentCode: code, codeGeneratedAt: new Date().toISOString() }),
  
  updateAthleteBiometrics: (id, newBiometrics) =>
    set((state) => ({
      athletes: state.athletes.map((athlete) =>
        athlete.id === id
          ? {
              ...athlete,
              biometrics: { ...athlete.biometrics, ...newBiometrics },
            }
          : athlete
      ),
    })),

  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, isResolved: true } : alert
      ),
    })),

  updateAthleteInjury: (id, injury) =>
    set((state) => ({
      athletes: state.athletes.map((athlete) =>
        athlete.id === id
          ? {
              ...athlete,
              currentInjury: injury,
              injuryStatus: injury ? (injury.severity === "high" ? "Injured" : "Caution") : "Healthy"
            }
          : athlete
      ),
    })),
}));
