import { create } from "zustand";
import { User, Athlete, Alert, TeamOverview, CurrentInjury } from "./types";
import { MOCK_ATHLETES, MOCK_ALERTS, MOCK_TEAM_OVERVIEW } from "./mock";

interface AppState {
  user: User | null;
  athletes: Athlete[];
  alerts: Alert[];
  teamOverview: TeamOverview;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateAthleteBiometrics: (id: string, biometrics: Partial<Athlete["biometrics"]>) => void;
  updateAthleteInjury: (id: string, injury: CurrentInjury | undefined) => void;
  resolveAlert: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  athletes: MOCK_ATHLETES,
  alerts: MOCK_ALERTS,
  teamOverview: MOCK_TEAM_OVERVIEW,

  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  
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
