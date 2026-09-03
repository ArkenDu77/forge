import type { Exercise, Level, Profile } from "@/lib/types";
import { clamp, roundTo } from "./format";

export const BAR_WEIGHT = 20;

const LEVEL_FACTOR: Record<Level, number> = {
  jamais: 0.72,
  debutant: 1,
  intermediaire: 1.32,
  avance: 1.6,
};

/** Facteur appliqué aux estimations. Volontairement prudent : on ajuste ensuite en direct. */
function sexFactor(sex: Profile["sex"], upper: boolean) {
  if (sex === "f") return upper ? 0.72 : 0.82;
  if (sex === "na") return upper ? 0.86 : 0.91;
  return 1;
}

function ageFactor(age: number) {
  if (age < 18) return 0.85;
  if (age <= 35) return 1;
  if (age <= 50) return 0.93;
  if (age <= 65) return 0.85;
  return 0.76;
}

const UPPER_PATTERNS = new Set([
  "poussee-horizontale",
  "poussee-verticale",
  "tirage-horizontal",
  "tirage-vertical",
]);

export type StartEstimate = {
  weight: number;
  /** ce qui est réellement affiché : « barre à vide », « 2 × 6 kg »… */
  display: string;
  bodyweightOnly: boolean;
  notes: string[];
};

/**
 * Estimation de départ délibérément conservatrice.
 * Elle vise une série de 8 répétitions confortable, pas un maximum.
 */
export function estimateStartingLoad(exercise: Exercise, profile: Profile): StartEstimate {
  const notes: string[] = [];
  const upper = UPPER_PATTERNS.has(exercise.pattern) || exercise.primary.some((m) => m.includes("delto") || m === "biceps" || m === "triceps");

  if (exercise.loadModel === "bodyweight") {
    return { weight: 0, display: "Poids du corps", bodyweightOnly: true, notes: ["Progression par le temps de maintien ou la difficulté."] };
  }
  if (exercise.loadModel === "bodyweight-loaded") {
    return {
      weight: 0,
      display: "Poids du corps",
      bodyweightOnly: true,
      notes: [
        profile.level === "jamais" || profile.level === "debutant"
          ? "Commence avec une assistance (machine ou élastique) si nécessaire."
          : "Ajoute du lest quand tu dépasses le haut de la fourchette de répétitions.",
      ],
    };
  }

  const raw =
    profile.weightKg *
    exercise.startFactor *
    LEVEL_FACTOR[profile.level] *
    sexFactor(profile.sex, upper) *
    ageFactor(profile.age) *
    (exercise.technical >= 4 ? 0.92 : 1);

  if (exercise.loadModel === "barbell") {
    const target = roundTo(Math.max(BAR_WEIGHT, raw), exercise.increment);
    if (target <= BAR_WEIGHT + exercise.increment) {
      notes.push("La barre olympique pèse déjà 20 kg : commence à vide.");
      return { weight: BAR_WEIGHT, display: "Barre à vide (20 kg)", bodyweightOnly: false, notes };
    }
    notes.push(`Soit ${((target - BAR_WEIGHT) / 2).toFixed(1).replace(".0", "").replace(".", ",")} kg de chaque côté de la barre.`);
    return { weight: target, display: `${target} kg`, bodyweightOnly: false, notes };
  }

  if (exercise.loadModel === "dumbbell-pair") {
    const perDb = roundTo(Math.max(2, raw), exercise.increment);
    notes.push("Charge indiquée par haltère.");
    return { weight: perDb, display: `2 × ${perDb} kg`, bodyweightOnly: false, notes };
  }

  const target = roundTo(Math.max(exercise.increment, raw), exercise.increment);
  notes.push("Les plaques varient d'une machine à l'autre : fie-toi surtout à la sensation.");
  return { weight: target, display: `${target} kg`, bodyweightOnly: false, notes };
}

/** 1RM estimé (formule d'Epley). Fiable jusqu'à ~10-12 répétitions. */
export function estimate1RM(weight: number, reps: number, rir = 0) {
  const effective = reps + Math.max(0, rir);
  if (effective <= 1) return weight;
  if (effective > 15) return weight * (1 + 15 / 30);
  return weight * (1 + effective / 30);
}

/** Charge estimée pour un nombre de répétitions donné à partir d'un 1RM. */
export function loadForReps(oneRm: number, reps: number) {
  return oneRm / (1 + reps / 30);
}

export type StrengthLevel = {
  label: "Débutant" | "Novice" | "Intermédiaire" | "Confirmé" | "Avancé";
  index: number; // 0-4
  progress: number; // 0-1 dans le niveau courant
  ratio: number;
  nextLabel?: string;
  nextRatio?: number;
};

/** Seuils de force relative (1RM / poids de corps) pour les mouvements de référence. */
const RATIOS: Record<string, number[]> = {
  "bench-press": [0.5, 0.75, 1.0, 1.35, 1.75],
  squat: [0.75, 1.15, 1.5, 2.0, 2.5],
  rdl: [0.85, 1.25, 1.65, 2.1, 2.6],
  "overhead-press": [0.35, 0.55, 0.7, 0.95, 1.2],
  "incline-barbell-press": [0.4, 0.65, 0.9, 1.2, 1.5],
  "hip-thrust": [1.0, 1.5, 2.0, 2.6, 3.2],
  default: [0.35, 0.6, 0.85, 1.15, 1.5],
};

const LABELS: StrengthLevel["label"][] = ["Débutant", "Novice", "Intermédiaire", "Confirmé", "Avancé"];

export function strengthLevel(exerciseId: string, oneRm: number, bodyweight: number, sex: Profile["sex"]): StrengthLevel {
  const base = RATIOS[exerciseId] ?? RATIOS.default;
  const adj = sex === "f" ? 0.72 : sex === "na" ? 0.86 : 1;
  const thresholds = base.map((r) => r * adj);
  const ratio = bodyweight > 0 ? oneRm / bodyweight : 0;

  let index = 0;
  for (let i = 0; i < thresholds.length; i++) if (ratio >= thresholds[i]) index = i;
  const lower = ratio < thresholds[0] ? 0 : thresholds[index];
  const upper = thresholds[Math.min(thresholds.length - 1, index + 1)];
  const progress = clamp(upper > lower ? (ratio - lower) / (upper - lower) : 1, 0, 1);

  return {
    label: LABELS[ratio < thresholds[0] ? 0 : Math.min(4, index)],
    index: ratio < thresholds[0] ? 0 : Math.min(4, index),
    progress,
    ratio,
    nextLabel: LABELS[Math.min(4, index + 1)],
    nextRatio: upper,
  };
}

export type Feedback = "trop-facile" | "correcte" | "trop-lourde" | "douleur";

/** Ajustement immédiat après une série d'essai. */
export function adjustFromFeedback(weight: number, feedback: Feedback, increment: number) {
  switch (feedback) {
    case "trop-facile":
      return {
        weight: roundTo(weight * 1.08 + increment, increment),
        message: "On monte légèrement. Reste 2 répétitions loin de la limite sur cette première séance.",
      };
    case "correcte":
      return { weight, message: "Charge conservée. C'est la bonne zone pour apprendre le mouvement." };
    case "trop-lourde":
      return {
        weight: roundTo(Math.max(increment, weight * 0.88 - increment), increment),
        message: "On redescend. Une charge trop lourde abîme la technique avant de développer le muscle.",
      };
    case "douleur":
      return {
        weight: roundTo(Math.max(increment, weight * 0.75), increment),
        message:
          "Arrête la série. Si la douleur est vive ou articulaire, ne force pas : change d'exercice ou passe cet exercice aujourd'hui.",
      };
  }
}
