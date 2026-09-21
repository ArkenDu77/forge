import type { MealPlanEntry } from "@/lib/types";

const d = (day: number, slot: MealPlanEntry["slot"], recipeId: string, servings = 1): MealPlanEntry => ({
  day,
  slot,
  recipeId,
  servings,
});

/**
 * Semaine type — 0 = lundi.
 * Petit déjeuner et collation sont identiques tous les jours : c'est ce qui rend
 * la nutrition tenable. Seul le dîner change, pour ne pas se lasser.
 */
const DINNERS = [
  "chicken-pasta",
  "beef-rice",
  "tuna-pasta",
  "salmon-potatoes",
  "chicken-pasta",
  "eggs-bread",
  "beef-rice",
];

export const DEFAULT_MEAL_PLAN: MealPlanEntry[] = Array.from({ length: 7 }).flatMap((_, day) => [
  d(day, "petit-dejeuner", "mass-smoothie"),
  d(day, "dejeuner", "chicken-rice"),
  d(day, "snack", "skyr-bowl"),
  d(day, "diner", DINNERS[day]),
]);
