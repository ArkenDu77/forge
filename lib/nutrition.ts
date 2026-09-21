import type { Macros, NutritionTarget, Profile, Recipe, WeightEntry } from "@/lib/types";
import { clamp } from "./format";

const ACTIVITY: Record<Profile["dailyActivity"], number> = {
  sedentaire: 1.2,
  leger: 1.375,
  actif: 1.55,
  "tres-actif": 1.725,
};

export function bmr(profile: Profile) {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  if (profile.sex === "h") return base + 5;
  if (profile.sex === "f") return base - 161;
  return base - 78;
}

export function maintenance(profile: Profile) {
  const factor = ACTIVITY[profile.dailyActivity] + clamp(profile.daysAvailable - 2, 0, 4) * 0.022;
  return Math.round((bmr(profile) * factor) / 10) * 10;
}

/**
 * Cible du jour.
 *
 * Le surplus vise environ +250 g de poids de corps par semaine : assez pour
 * construire du muscle, assez peu pour ne pas prendre surtout du gras.
 * `extraKcal` vient de la régulation par le poids réel (voir calorieAdjustment).
 */
export function computeTargets(profile: Profile, extraKcal = 0): NutritionTarget {
  const maint = maintenance(profile);
  const gaining = profile.targetWeightKg >= profile.weightKg;

  // +250 g/semaine ≈ +275 kcal/jour. Borné pour rester raisonnable.
  const surplus = gaining ? clamp(Math.round(maint * 0.11), 200, 400) : -clamp(Math.round(maint * 0.15), 300, 600);

  const kcal = Math.round((maint + surplus + extraKcal) / 10) * 10;
  const proteinPerKg = gaining ? 2.05 : 2.3;
  const prot = Math.round((profile.weightKg * proteinPerKg) / 5) * 5;
  const fat = Math.round((profile.weightKg * 0.9) / 5) * 5;
  const carbs = Math.max(80, Math.round((kcal - prot * 4 - fat * 9) / 4 / 5) * 5);

  return {
    kcal,
    prot,
    carbs,
    fat,
    maintenance: maint,
    surplus: surplus + extraKcal,
    proteinPerKg,
    updatedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------
   Suivi du poids : on ne juge jamais sur une pesée isolée.
   ------------------------------------------------------------------ */

export type WeightTrend = {
  latest: number | null;
  /** moyenne des 7 derniers jours */
  avg7: number | null;
  /** moyenne des 7 jours précédents */
  avgPrev7: number | null;
  /** variation hebdomadaire réelle, en kg */
  weeklyDeltaKg: number | null;
  /** nombre de semaines consécutives sans progression réelle */
  stalledWeeks: number;
  entries7: number;
};

const AVG_WINDOW = 7;
const STALL_THRESHOLD_KG = 0.1;

function averageBetween(weights: WeightEntry[], fromDaysAgo: number, toDaysAgo: number) {
  const now = Date.now();
  const inRange = weights.filter((w) => {
    const days = (now - new Date(w.date).getTime()) / 86_400_000;
    return days >= toDaysAgo && days < fromDaysAgo;
  });
  if (!inRange.length) return null;
  return Math.round((inRange.reduce((a, w) => a + w.kg, 0) / inRange.length) * 100) / 100;
}

export function weightTrend(weights: WeightEntry[]): WeightTrend {
  const sorted = [...weights].sort((a, b) => (a.date < b.date ? -1 : 1));
  const avg7 = averageBetween(sorted, AVG_WINDOW, 0);
  const avgPrev7 = averageBetween(sorted, AVG_WINDOW * 2, AVG_WINDOW);
  const weeklyDeltaKg = avg7 !== null && avgPrev7 !== null ? Math.round((avg7 - avgPrev7) * 100) / 100 : null;

  // Combien de fenêtres de 7 jours consécutives sans gain réel ?
  let stalledWeeks = 0;
  for (let w = 0; w < 6; w++) {
    const a = averageBetween(sorted, AVG_WINDOW * (w + 1), AVG_WINDOW * w);
    const b = averageBetween(sorted, AVG_WINDOW * (w + 2), AVG_WINDOW * (w + 1));
    if (a === null || b === null) break;
    if (a - b < STALL_THRESHOLD_KG) stalledWeeks++;
    else break;
  }

  return {
    latest: sorted.length ? sorted[sorted.length - 1].kg : null,
    avg7,
    avgPrev7,
    weeklyDeltaKg,
    stalledWeeks,
    entries7: sorted.filter((w) => (Date.now() - new Date(w.date).getTime()) / 86_400_000 < AVG_WINDOW).length,
  };
}

export type CalorieAdjustment = { extraKcal: number; reason: string; actionable: boolean };

/**
 * Règle de régulation : si le poids moyen ne monte pas pendant deux semaines
 * alors que l'objectif est la prise de masse, on ajoute 150 kcal par jour.
 */
export function calorieAdjustment(weights: WeightEntry[], profile: Profile): CalorieAdjustment {
  const trend = weightTrend(weights);
  const gaining = profile.targetWeightKg >= profile.weightKg;

  if (!gaining) return { extraKcal: 0, reason: "", actionable: false };
  if (trend.avg7 === null || trend.avgPrev7 === null) {
    return {
      extraKcal: 0,
      reason: "Pèse-toi quelques jours de plus : il faut deux semaines de pesées pour juger.",
      actionable: false,
    };
  }
  if (trend.stalledWeeks >= 2) {
    const steps = Math.min(3, Math.floor(trend.stalledWeeks / 2));
    return {
      extraKcal: 150 * steps,
      reason: `Ton poids moyen n'a pas bougé depuis ${trend.stalledWeeks} semaines. On ajoute ${150 * steps} kcal par jour.`,
      actionable: true,
    };
  }
  if ((trend.weeklyDeltaKg ?? 0) > 0.6) {
    return {
      extraKcal: -150,
      reason: "Tu prends plus de 600 g par semaine : c'est rapide. On redescend de 150 kcal par jour.",
      actionable: true,
    };
  }
  return { extraKcal: 0, reason: "Ton poids monte au bon rythme. On ne change rien.", actionable: false };
}

/** Rythme de variation de poids attendu (kg/semaine) pour un écart calorique donné. */
export function weeklyWeightDelta(surplusKcal: number) {
  return Math.round(((surplusKcal * 7) / 7700) * 100) / 100;
}

export const emptyMacros = (): Macros => ({ kcal: 0, prot: 0, carbs: 0, fat: 0 });

export function addMacros(a: Macros, b: Macros, factor = 1): Macros {
  return {
    kcal: a.kcal + b.kcal * factor,
    prot: a.prot + b.prot * factor,
    carbs: a.carbs + b.carbs * factor,
    fat: a.fat + b.fat * factor,
  };
}

export function scaleMacros(m: Macros, f: number): Macros {
  return { kcal: m.kcal * f, prot: m.prot * f, carbs: m.carbs * f, fat: m.fat * f };
}

export function recipeCost(recipe: Recipe) {
  return recipe.ingredients.reduce((a, i) => a + i.qty * i.pricePerUnit, 0) / recipe.servings;
}

/** Filtre les recettes incompatibles avec le régime, les allergies et les aliments refusés. */
export function isRecipeAllowed(recipe: Recipe, profile: Profile) {
  const banned = [...profile.dislikedFoods, ...profile.allergies].map((s) => s.toLowerCase().trim()).filter(Boolean);
  const text = (recipe.name + " " + recipe.ingredients.map((i) => i.name).join(" ")).toLowerCase();
  if (banned.some((b) => b.length > 2 && text.includes(b))) return false;
  if (profile.diet === "vegetarien" && !recipe.tags.includes("vegetarien")) return false;
  if (profile.diet === "sans-lactose" && !recipe.tags.includes("sans-lactose")) return false;
  if (profile.diet === "pescetarien") {
    const meats = ["poulet", "boeuf", "bœuf", "dinde", "jambon", "porc", "steak", "viande"];
    if (meats.some((m) => text.includes(m))) return false;
  }
  if (profile.diet === "sans-porc" && ["jambon", "lardons", "porc", "bacon"].some((m) => text.includes(m))) return false;
  return true;
}

/** Ce qu'il reste à manger aujourd'hui, formulé simplement. */
export function remainingToday(target: NutritionTarget, eaten: Macros) {
  const kcal = Math.max(0, Math.round(target.kcal - eaten.kcal));
  const prot = Math.max(0, Math.round(target.prot - eaten.prot));
  return { kcal, prot, short: kcal > 250, proteinShort: prot > 25 };
}
