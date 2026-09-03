import type { Macros, NutritionTarget, Profile, Recipe } from "@/lib/types";
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

/** Surplus modéré : on privilégie une prise de masse propre à une prise rapide. */
export function computeTargets(profile: Profile): NutritionTarget {
  const maint = maintenance(profile);
  const gaining = profile.targetWeightKg >= profile.weightKg;
  const pct = !gaining ? -0.15 : profile.goal === "muscle" ? 0.12 : profile.goal === "muscle-force" ? 0.1 : 0.07;
  const rawSurplus = maint * pct;
  const surplus = Math.round(clamp(rawSurplus, -700, 450) / 10) * 10;
  const kcal = Math.round((maint + surplus) / 10) * 10;

  const proteinPerKg = profile.level === "jamais" ? 1.7 : 1.9;
  const prot = Math.round((profile.weightKg * proteinPerKg) / 5) * 5;
  const fat = Math.round((profile.weightKg * 0.9) / 5) * 5;
  const carbs = Math.max(80, Math.round((kcal - prot * 4 - fat * 9) / 4 / 5) * 5);

  return {
    kcal,
    prot,
    carbs,
    fat,
    maintenance: maint,
    surplus,
    proteinPerKg,
    updatedAt: new Date().toISOString(),
  };
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
