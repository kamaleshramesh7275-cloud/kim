import type { Athlete, Alert, Biometrics, CurrentInjury, InjuryStatus, PastInjury, TeamOverview } from "./types";

interface TrainingRecord {
  athleteId: string;
  sportType: string;
  trainingHours: number;
  trainingIntensity: number;
  sleepHours: number;
  nutritionScore: number;
  fatigueLevel: number;
  recoveryIndex: number;
  performanceScore: number;
  injuryRisk: string;
  date: string;
}

interface DatasetSummary {
  recoveryRows: number;
  trainingRows: number;
  injuryRows: number;
}

interface DatasetState {
  athletes: Athlete[];
  alerts: Alert[];
  teamOverview: TeamOverview;
  datasetSummary: DatasetSummary;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      const nextChar = text[i + 1];
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      currentRow.push(currentValue);
      if (currentRow.some((cell) => cell.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    if (currentRow.some((cell) => cell.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeAthleteId(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits || "0";
}

function mapSeverity(value: string): CurrentInjury["severity"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("severe")) return "high";
  if (normalized.includes("moderate")) return "medium";
  return "low";
}

function mapInjuryStatus(recoveryScore: number, injurySeverity: string, recoverySuccess: boolean): InjuryStatus {
  if (!recoverySuccess || recoveryScore < 45 || injurySeverity.toLowerCase().includes("severe")) {
    return "Injured";
  }
  if (recoveryScore < 65) {
    return "Caution";
  }
  return "Healthy";
}

function toBiometrics(recoveryRow: string[], training: TrainingRecord | undefined): Biometrics {
  const sleepHours = Number(recoveryRow[10]) || 0;
  const dietaryIntake = Number(recoveryRow[11]) || 0;
  const recoverySeverity = recoveryRow[2]?.toLowerCase() || "";
  const muscleRecoveryStatus = recoveryRow[6]?.toLowerCase() || "";
  const pomsScore = Number(recoveryRow[7]) || 0;
  const recoveryTime = Number(recoveryRow[3]) || 0;
  const trainingHours = training?.trainingHours || 0;
  const trainingIntensity = training?.trainingIntensity || 0;
  const fatigueLevel = training?.fatigueLevel || 0;

  return {
    sleep: clamp(Math.round(sleepHours * 10), 0, 100),
    hydration: clamp(Math.round(dietaryIntake / 35), 0, 100),
    soreness: clamp(
      Math.round(
        (muscleRecoveryStatus.includes("mild") ? 78 : muscleRecoveryStatus.includes("moderate") ? 56 : 24) +
          (recoveryTime < 30 ? 5 : 0) -
          (recoverySeverity.includes("severe") ? 10 : 0)
      ),
      0,
      100
    ),
    fatigue: clamp(Math.round(100 - fatigueLevel * 10), 0, 100),
    stress: clamp(Math.round(100 - pomsScore * 3), 0, 100),
    trainingLoad: clamp(Math.round(trainingHours * 8 + trainingIntensity * 3), 0, 100),
  };
}

function buildPastInjury(recoveryRow: string[], athleteId: string): PastInjury[] {
  const injuryType = recoveryRow[1] || "Training Load";
  const recoverySuccess = Number(recoveryRow[15]) === 1;
  return [
    {
      id: `${athleteId}-injury`,
      type: injuryType,
      date: "2025-01-01",
      status: recoverySuccess ? "resolved" : "current",
    },
  ];
}

function buildInjuryAthletes(rows: string[][]): Athlete[] {
  return rows.slice(0, 12).map((row, index) => {
    const athleteId = row[0] || `injury-${index + 1}`;
    const injurySeverity = (row[18] || "Minor").toLowerCase();
    const recoveryDays = Number(row[25]) || 0;
    const hydration = Number(row[14]) || 0;
    const fatigue = Number(row[13]) || 0;
    const painScore = Number(row[20]) || 0;
    const previousInjuries = Number(row[11]) || 0;
    const trainingHours = Number(row[12]) || 0;
    const outcome = (row[29] || "Partial Recovery").toLowerCase();
    const recoveryScore = clamp(
      Math.round(
        70 +
          (100 - recoveryDays * 0.35) +
          hydration * 0.1 -
          fatigue * 3 -
          painScore * 2 -
          (injurySeverity.includes("critical") ? 20 : injurySeverity.includes("moderate") ? 8 : 0) +
          (outcome.includes("full") ? 8 : 0) -
          previousInjuries * 2
      ),
      0,
      100
    );
    const injuryStatus = injurySeverity.includes("critical") || outcome.includes("recurring")
      ? "Injured"
      : recoveryScore < 60
        ? "Caution"
        : "Healthy";

    return {
      id: athleteId,
      name: `Athlete ${athleteId.replace(/^ATH0*/i, "")}`,
      position: `${row[4] || "Multi-sport"} · ${row[5] || "Athlete"}`,
      recoveryScore,
      injuryStatus,
      lastUpdated: row[15] ? new Date(row[15]).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today",
      streakDays: Math.max(0, Math.round((recoveryDays > 0 ? 30 - recoveryDays / 10 : 8))),
      points: Math.round(recoveryScore * 9 + trainingHours * 10 + previousInjuries * 20),
      biometrics: {
        sleep: clamp(Math.round(100 - fatigue * 8 + hydration * 0.1), 0, 100),
        hydration: clamp(Math.round(hydration), 0, 100),
        soreness: clamp(Math.round(100 - painScore * 8 - (injurySeverity.includes("critical") ? 16 : 0)), 0, 100),
        fatigue: clamp(Math.round(fatigue * 10), 0, 100),
        stress: clamp(Math.round(40 + previousInjuries * 10 + painScore * 5), 0, 100),
        trainingLoad: clamp(Math.round(trainingHours * 3), 0, 100),
      },
      currentInjury: injuryStatus === "Healthy"
        ? undefined
        : {
            type: row[16] || "Injury",
            severity: injurySeverity.includes("critical") ? "high" : injurySeverity.includes("moderate") ? "medium" : "low",
            timeline: `${recoveryDays} days`,
            rehabPlan: `Recovery plan: ${row[23] || "guided therapy"}`,
          },
      pastInjuries: [
        {
          id: `${athleteId}-injury`,
          type: row[16] || "Injury",
          date: row[15] || "2024-01-01",
          status: outcome.includes("full") ? "resolved" : outcome.includes("partial") ? "healing" : "current",
        },
      ],
    } satisfies Athlete;
  });
}

export async function loadDatasetState(): Promise<DatasetState> {
  if (typeof window === "undefined") {
    return {
      athletes: [],
      alerts: [],
      teamOverview: {
        avgRecoveryScore: 0,
        highRiskCount: 0,
        totalAthletes: 0,
        workloadAlertsCount: 0,
        injuryRiskAlertsCount: 0,
      },
      datasetSummary: {
        recoveryRows: 0,
        trainingRows: 0,
        injuryRows: 0,
      },
    };
  }

  const recoveryResponse = await fetch("/data/Athlete_recovery_dataset.csv");
  const trainingResponse = await fetch("/data/Athlete_Training_Recovery_Tracker_Dataset.csv");
  const injuryResponse = await fetch("/data/athlete_injury_dataset.csv");

  const recoveryText = await recoveryResponse.text();
  const trainingText = await trainingResponse.text();
  const injuryText = await injuryResponse.text();

  const recoveryRows = parseCsv(recoveryText).slice(1);
  const trainingRows = parseCsv(trainingText).slice(1);
  const injuryRows = parseCsv(injuryText).slice(1);
  const trainingByAthlete = new Map<string, TrainingRecord>();

  trainingRows.forEach((row) => {
    const athleteId = normalizeAthleteId(row[0]);
    trainingByAthlete.set(athleteId, {
      athleteId,
      sportType: row[1] || "Unknown",
      trainingHours: Number(row[2]) || 0,
      trainingIntensity: Number(row[3]) || 0,
      sleepHours: Number(row[4]) || 0,
      nutritionScore: Number(row[5]) || 0,
      fatigueLevel: Number(row[6]) || 0,
      recoveryIndex: Number(row[7]) || 0,
      performanceScore: Number(row[8]) || 0,
      injuryRisk: row[9] || "Unknown",
      date: row[10] || "2025-01-01",
    });
  });

  const injuryAthletes = buildInjuryAthletes(injuryRows);

  const recoveryAthletes = recoveryRows.slice(0, 12).map((row) => {
    const athleteId = normalizeAthleteId(row[0]);
    const training = trainingByAthlete.get(athleteId);
    const recoverySuccess = Number(row[15]) === 1;
    const injuryType = row[1] || "Training Load";
    const injurySeverity = row[2] || "Moderate";
    const recoveryTime = Number(row[3]) || 0;
    const confidenceScore = Number(row[8]) || 0;
    const sleepHours = Number(row[10]) || 0;
    const pomsScore = Number(row[7]) || 0;
    const recoveryIndex = training?.recoveryIndex || 0;
    const recoveryScore = clamp(
      Math.round(
        45 +
          confidenceScore * 4 +
          sleepHours * 2 +
          recoveryIndex / 10 +
          (recoverySuccess ? 12 : -8) -
          recoveryTime * 0.25 -
          pomsScore * 0.35
      ),
      0,
      100
    );
    const injuryStatus = mapInjuryStatus(recoveryScore, injurySeverity, recoverySuccess);

    return {
      id: athleteId,
      name: `Athlete ${athleteId}`,
      position: training?.sportType || "Multi-sport",
      recoveryScore,
      injuryStatus,
      lastUpdated: training?.date ? new Date(training.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today",
      streakDays: Math.max(0, Math.round((training?.recoveryIndex || 0) / 12)),
      points: Math.round(recoveryScore * 12 + (training?.performanceScore || 0) * 0.4),
      biometrics: toBiometrics(row, training),
      currentInjury: recoverySuccess
        ? undefined
        : {
            type: injuryType,
            severity: mapSeverity(injurySeverity),
            timeline: `${recoveryTime} days`,
            rehabPlan: `Recovery with ${row[12] || "guided therapy"}`,
          },
      pastInjuries: buildPastInjury(row, athleteId),
    } satisfies Athlete;
  });

  const athletes = [...injuryAthletes, ...recoveryAthletes].slice(0, 20);

  const alerts: Alert[] = athletes
    .filter((athlete) => athlete.injuryStatus !== "Healthy")
    .slice(0, 6)
    .map((athlete, index) => ({
      id: `dataset-${athlete.id}-${index}`,
      athleteId: athlete.id,
      athleteName: athlete.name,
      type: athlete.injuryStatus === "Injured" ? "injury" : "workload",
      severity: athlete.injuryStatus === "Injured" ? "high" : "medium",
      message:
        athlete.injuryStatus === "Injured"
          ? `${athlete.name} is showing elevated recovery risk from the integrated datasets.`
          : `${athlete.name} needs a lighter load based on the latest training tracker metrics.`,
      date: new Date().toISOString(),
      isResolved: false,
    }));

  const teamOverview: TeamOverview = {
    avgRecoveryScore: Math.round(athletes.reduce((sum, athlete) => sum + athlete.recoveryScore, 0) / athletes.length),
    highRiskCount: athletes.filter((athlete) => athlete.injuryStatus === "Injured").length,
    totalAthletes: athletes.length,
    workloadAlertsCount: athletes.filter((athlete) => athlete.biometrics.trainingLoad > 70).length,
    injuryRiskAlertsCount: alerts.filter((alert) => alert.type === "injury").length,
  };

  return {
    athletes,
    alerts,
    teamOverview,
    datasetSummary: {
      recoveryRows: recoveryRows.length,
      trainingRows: trainingRows.length,
      injuryRows: injuryRows.length,
    },
  };
}
