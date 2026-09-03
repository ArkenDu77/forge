import type { Profile, WorkoutSession } from "@/lib/types";
import { clamp } from "./format";
import { weeklySessions } from "./progression";

/** Gain de poids hebdomadaire plausible, en % du poids de corps. */
const WEEKLY_GAIN: Record<Profile["level"], [number, number]> = {
  jamais: [0.0025, 0.005],
  debutant: [0.002, 0.0045],
  intermediaire: [0.0012, 0.003],
  avance: [0.0006, 0.0018],
};

/** Progression de force plausible sur les mouvements principaux, en % par semaine. */
const WEEKLY_STRENGTH: Record<Profile["level"], [number, number]> = {
  jamais: [0.012, 0.028],
  debutant: [0.01, 0.024],
  intermediaire: [0.005, 0.013],
  avance: [0.002, 0.007],
};

export type Horizon = { weeks: number; label: string };

export const HORIZONS: Horizon[] = [
  { weeks: 4, label: "4 sem." },
  { weeks: 8, label: "8 sem." },
  { weeks: 12, label: "12 sem." },
  { weeks: 26, label: "6 mois" },
];

export type Projection = {
  weeks: number;
  label: string;
  weight: [number, number];
  strengthPct: [number, number];
  sessions: number;
  adherence: number;
};

/** Assiduité réelle observée sur les 4 dernières semaines (1 = programme suivi intégralement). */
export function adherence(sessions: WorkoutSession[], profile: Profile) {
  if (sessions.filter((s) => s.completed).length < 2) return 0.85;
  // On ne compte que les semaines complètes : la semaine en cours fausserait la moyenne.
  const weeks = [1, 2, 3, 4].map((w) => weeklySessions(sessions, w).length).filter((n, i, arr) => n > 0 || arr.slice(0, i).some((x) => x > 0));
  if (!weeks.length) return 0.85;
  const avg = weeks.reduce((a, b) => a + b, 0) / weeks.length;
  return clamp(avg / Math.max(1, profile.daysAvailable), 0.3, 1.1);
}

export function project(profile: Profile, sessions: WorkoutSession[]): Projection[] {
  const adh = adherence(sessions, profile);
  const gaining = profile.targetWeightKg >= profile.weightKg;
  const [gLo, gHi] = WEEKLY_GAIN[profile.level];
  const [sLo, sHi] = WEEKLY_STRENGTH[profile.level];
  const dir = gaining ? 1 : -1;

  return HORIZONS.map(({ weeks, label }) => {
    // Le rythme ralentit mécaniquement avec le temps
    const decay = 1 - Math.min(0.45, weeks / 90);
    const lo = profile.weightKg * (1 + dir * gLo * weeks * decay * adh);
    const hi = profile.weightKg * (1 + dir * gHi * weeks * decay * adh);
    const cap = (v: number) =>
      gaining ? Math.min(v, profile.targetWeightKg + 1.5) : Math.max(v, profile.targetWeightKg - 1.5);

    return {
      weeks,
      label,
      weight: [Math.round(cap(lo) * 10) / 10, Math.round(cap(hi) * 10) / 10],
      strengthPct: [
        Math.round(sLo * weeks * decay * adh * 100),
        Math.round(sHi * weeks * decay * adh * 100),
      ],
      sessions: Math.round(weeks * profile.daysAvailable * adh),
      adherence: adh,
    };
  });
}

export type Milestone = { weeks: string; title: string; body: string; done?: boolean };

/** Repères de progression personnalisés — formulés comme des tendances, jamais des promesses. */
export function timeline(profile: Profile, weeksElapsed: number): Milestone[] {
  const debutant = profile.level === "jamais" || profile.level === "debutant";
  return [
    {
      weeks: "Semaine 0",
      title: "Point de départ",
      body: `${profile.weightKg} kg · objectif ${profile.targetWeightKg} kg · ${profile.daysAvailable} séances par semaine.`,
      done: weeksElapsed >= 0,
    },
    {
      weeks: "Semaines 1-2",
      title: "Coordination",
      body: debutant
        ? "Les mouvements deviennent généralement plus naturels. Les charges montent surtout parce que la technique s'installe."
        : "Reprise des repères techniques et des charges de travail.",
      done: weeksElapsed >= 2,
    },
    {
      weeks: "Semaines 3-4",
      title: "Progression de force",
      body: "La progression de charge devient généralement régulière sur les exercices principaux.",
      done: weeksElapsed >= 4,
    },
    {
      weeks: "Semaines 6-8",
      title: "Premières différences visibles",
      body: "Des changements peuvent commencer à être perceptibles, surtout si l'apport calorique et le sommeil suivent. Cela dépend notamment de ton point de départ.",
      done: weeksElapsed >= 6,
    },
    {
      weeks: "Semaines 8-12+",
      title: "Changements plus nets",
      body: "Avec un entraînement régulier, une nutrition cohérente et une récupération suffisante, les changements deviennent généralement plus visibles.",
      done: weeksElapsed >= 8,
    },
    {
      weeks: "6 mois +",
      title: "Transformation installée",
      body: "Le rythme ralentit naturellement : la progression se joue alors surtout sur la régularité et la qualité des séances.",
      done: weeksElapsed >= 26,
    },
  ];
}

export function weeksSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / (7 * 86_400_000)));
}
