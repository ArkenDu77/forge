import type {
  BodyMeasurement,
  Profile,
  RecoveryCheckin,
  SetLog,
  WeightEntry,
  WorkoutSession,
} from "@/lib/types";
import { ALL_DAYS } from "@/lib/data/program";
import { ex } from "@/lib/data/exercises";
import { detectPRs, historyFor, recommendLoad } from "./progression";
import { sessionXp } from "./gamification";

export const DEMO_PROFILE: Profile = {
  firstName: "Arken",
  age: 24,
  sex: "h",
  heightCm: 178,
  weightKg: 62,
  level: "debutant",
  currentFrequency: 1,
  daysAvailable: 4,
  goal: "muscle-force",
  priorityMuscles: ["pectoraux", "dorsaux", "deltoide-lat"],
  gymType: "salle",
  equipment: ["barre", "halteres", "machine", "poulie", "banc", "barre-traction", "poids-du-corps"],
  sessionMinutes: 75,
  diet: "omnivore",
  dislikedFoods: [],
  allergies: [],
  monthlyFoodBudget: 260,
  budgetTier: "standard",
  targetWeightKg: 68,
  sleepHours: 7.5,
  dailyActivity: "leger",
  createdAt: new Date(Date.now() - 42 * 86_400_000).toISOString(),
};

/** PRNG déterministe : la démo est identique à chaque chargement. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

export function buildDemoData(profile: Profile = DEMO_PROFILE) {
  const rand = rng(42);
  const sessions: WorkoutSession[] = [];

  // 6 semaines, 4 séances par semaine (une séance sautée en semaine 3)
  const plan: { dayIndex: number; daysAgo: number }[] = [];
  let counter = 0;
  for (let week = 5; week >= 0; week--) {
    const offsets = [0, 2, 4, 6];
    for (let d = 0; d < 4; d++) {
      if (week === 3 && d === 3) continue;
      if (week === 0 && d >= 2) continue; // semaine en cours partiellement faite
      const daysAgo = week === 0 ? [3, 1][d] : week * 7 + (6 - offsets[d]);
      plan.push({ dayIndex: counter % 4, daysAgo });
      counter++;
    }
  }
  plan.sort((a, b) => b.daysAgo - a.daysAgo);

  for (const { dayIndex, daysAgo } of plan) {
    const day = ALL_DAYS[dayIndex];
    const date = new Date(Date.now() - daysAgo * 86_400_000);
    date.setHours(18, 30, 0, 0);

    const entries = day.exercises.map((p) => {
      const exercise = ex(p.exerciseId);
      // On rejoue l'algorithme de progression de l'application : la démo est cohérente
      // avec ce que Forge aurait réellement recommandé séance après séance.
      const reco = recommendLoad(exercise, p, historyFor(sessions, p.exerciseId), profile);
      const weight = reco.weight;
      const sets: SetLog[] = [];
      const hitMax = rand() > (exercise.pattern === "isolation" ? 0.5 : 0.38);
      for (let s = 0; s < p.sets; s++) {
        const drop = s === p.sets - 1 && rand() > 0.6 ? 1 : 0;
        const reps = Math.max(
          p.repMin,
          (hitMax ? p.repMax : p.repMax - 1 - Math.floor(rand() * 2)) - drop
        );
        sets.push({
          setIndex: s,
          reps,
          weight,
          rir: hitMax ? (rand() > 0.5 ? 2 : 1) : 1,
          ts: date.toISOString(),
        });
      }
      return { exerciseId: p.exerciseId, sets };
    });

    const prs = entries.flatMap((e) =>
      detectPRs(e.exerciseId, e.sets, historyFor(sessions, e.exerciseId)).map((pr) => ({
        exerciseId: e.exerciseId,
        kind: pr.kind,
        value: pr.value,
        reps: pr.reps,
        date: date.toISOString().slice(0, 10),
      }))
    );

    const session: WorkoutSession = {
      id: `demo-${daysAgo}-${dayIndex}`,
      dayId: day.id,
      date: date.toISOString(),
      durationSec: 55 * 60 + Math.round(rand() * 900),
      entries,
      xp: 0,
      completed: true,
      prs: prs.slice(0, 2),
    };
    session.xp = sessionXp(session);
    sessions.push(session);
  }

  // Poids : progression douce de 60,4 kg à 62,0 kg sur 6 semaines
  const weights: WeightEntry[] = [];
  for (let i = 42; i >= 0; i -= 3) {
    const t = (42 - i) / 42;
    const noise = (rand() - 0.5) * 0.35;
    weights.push({
      date: new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10),
      kg: Math.round((60.4 + t * 1.6 + noise) * 10) / 10,
    });
  }
  weights[weights.length - 1].kg = 62;

  const measurements: BodyMeasurement[] = [
    { date: new Date(Date.now() - 42 * 86_400_000).toISOString().slice(0, 10), brasCm: 30.5, poitrineCm: 92, tailleCm: 74, cuisseCm: 51, epaulesCm: 108 },
    { date: new Date(Date.now() - 21 * 86_400_000).toISOString().slice(0, 10), brasCm: 31.2, poitrineCm: 93.5, tailleCm: 74.5, cuisseCm: 52, epaulesCm: 109.5 },
    { date: new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0, 10), brasCm: 31.8, poitrineCm: 94.5, tailleCm: 74.5, cuisseCm: 53, epaulesCm: 110.5 },
  ];

  const recovery: RecoveryCheckin[] = [
    {
      date: new Date().toISOString().slice(0, 10),
      sleepHours: 7.5,
      fatigue: "faible",
      soreness: ["quadriceps", "fessiers"],
      motivation: 4,
    },
  ];

  return { profile, sessions, weights, measurements, recovery };
}
