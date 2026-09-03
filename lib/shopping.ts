import type { Ingredient, MealPlanEntry } from "@/lib/types";
import { getRecipe } from "./data/recipes";

export type ShoppingLine = {
  name: string;
  qty: number;
  unit: Ingredient["unit"];
  aisle: Ingredient["aisle"];
  cost: number;
};

export const AISLES: { id: Ingredient["aisle"]; label: string; emoji: string }[] = [
  { id: "viande", label: "Viande", emoji: "🥩" },
  { id: "poisson", label: "Poisson", emoji: "🐟" },
  { id: "cremerie", label: "Crèmerie", emoji: "🥛" },
  { id: "fruits-legumes", label: "Fruits & légumes", emoji: "🥦" },
  { id: "epicerie", label: "Épicerie", emoji: "🫙" },
  { id: "surgele", label: "Surgelés", emoji: "🧊" },
  { id: "boulangerie", label: "Boulangerie", emoji: "🥖" },
];

/** Agrège les ingrédients de la semaine en une liste de courses par rayon. */
export function buildShoppingList(plan: MealPlanEntry[]): ShoppingLine[] {
  const map = new Map<string, ShoppingLine>();
  for (const entry of plan) {
    const r = getRecipe(entry.recipeId);
    if (!r) continue;
    const factor = entry.servings / r.servings;
    for (const ing of r.ingredients) {
      const key = `${ing.name}|${ing.unit}`;
      const qty = ing.qty * factor;
      const existing = map.get(key);
      if (existing) {
        existing.qty += qty;
        existing.cost += qty * ing.pricePerUnit;
      } else {
        map.set(key, { name: ing.name, qty, unit: ing.unit, aisle: ing.aisle, cost: qty * ing.pricePerUnit });
      }
    }
  }
  return [...map.values()]
    .map((l) => ({ ...l, qty: roundQty(l.qty, l.unit), cost: Math.round(l.cost * 100) / 100 }))
    .sort((a, b) => a.aisle.localeCompare(b.aisle) || b.cost - a.cost);
}

function roundQty(qty: number, unit: Ingredient["unit"]) {
  if (unit === "u") return Math.ceil(qty * 2) / 2;
  if (unit === "g" || unit === "ml") return Math.round(qty / 10) * 10;
  return Math.round(qty * 10) / 10;
}

export function formatQty(line: ShoppingLine) {
  if (line.unit === "u") return `× ${line.qty % 1 === 0 ? line.qty : line.qty.toFixed(1).replace(".", ",")}`;
  if (line.unit === "g" && line.qty >= 1000) return `${(line.qty / 1000).toFixed(1).replace(".", ",")} kg`;
  if (line.unit === "ml" && line.qty >= 1000) return `${(line.qty / 1000).toFixed(1).replace(".", ",")} L`;
  return `${line.qty} ${line.unit}`;
}

export function weeklyCost(plan: MealPlanEntry[]) {
  return buildShoppingList(plan).reduce((a, l) => a + l.cost, 0);
}

/** Ajuste le plan au niveau de budget choisi en remplaçant les repas les plus chers. */
export const BUDGET_TIERS = [
  { id: "economique" as const, label: "Économique", hint: "≈ 45-55 € / semaine", maxPerServing: 2.2 },
  { id: "standard" as const, label: "Standard", hint: "≈ 60-70 € / semaine", maxPerServing: 3.2 },
  { id: "flexible" as const, label: "Flexible", hint: "≈ 75-90 € / semaine", maxPerServing: 99 },
];
