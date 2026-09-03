import type { MealPlanEntry } from "@/lib/types";

const d = (day: number, slot: MealPlanEntry["slot"], recipeId: string, servings = 1): MealPlanEntry => ({
  day,
  slot,
  recipeId,
  servings,
});

/** Semaine type — 0 = lundi. Chaque jour vise ~2 400-2 700 kcal et 140 g+ de protéines. */
export const DEFAULT_MEAL_PLAN: MealPlanEntry[] = [
  d(0, "petit-dejeuner", "overnight-oats"),
  d(0, "dejeuner", "chicken-curry-rice"),
  d(0, "snack", "skyr-bowl"),
  d(0, "diner", "pasta-bolognese"),

  d(1, "petit-dejeuner", "eggs-avocado-toast"),
  d(1, "dejeuner", "meal-prep-chicken-rice"),
  d(1, "snack", "mass-smoothie"),
  d(1, "diner", "tuna-pasta"),

  d(2, "petit-dejeuner", "overnight-oats"),
  d(2, "dejeuner", "chili"),
  d(2, "snack", "cottage-bowl"),
  d(2, "diner", "salmon-rice"),

  d(3, "petit-dejeuner", "skyr-bowl"),
  d(3, "dejeuner", "meal-prep-chicken-rice"),
  d(3, "snack", "mass-smoothie"),
  d(3, "diner", "beef-sweet-potato"),

  d(4, "petit-dejeuner", "eggs-avocado-toast"),
  d(4, "dejeuner", "protein-wraps"),
  d(4, "snack", "skyr-bowl"),
  d(4, "diner", "chicken-pesto-pasta"),

  d(5, "petit-dejeuner", "overnight-oats"),
  d(5, "dejeuner", "chili"),
  d(5, "snack", "cottage-bowl"),
  d(5, "diner", "lentil-chicken"),

  d(6, "petit-dejeuner", "omelette-cheese"),
  d(6, "dejeuner", "chicken-sandwich"),
  d(6, "snack", "mass-smoothie"),
  d(6, "diner", "veggie-chickpea-bowl"),
];
