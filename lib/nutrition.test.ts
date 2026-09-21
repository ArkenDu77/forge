import { describe, expect, it } from "vitest";
import { calorieAdjustment, computeTargets, weightTrend } from "@/lib/nutrition";
import type { Profile, WeightEntry } from "@/lib/types";

/**
 * La régulation calorique est le mécanisme dont dépend tout le plan 62 → 69 kg :
 * si la moyenne glissante ou la détection de stagnation se trompent, l'app
 * conseille de manger plus alors que la prise de poids est déjà trop rapide,
 * ou l'inverse.
 */

const DAY = 86_400_000;

/**
 * Une pesée il y a `daysAgo` jours, au format que l'application enregistre
 * réellement (`YYYY-MM-DD`, donc minuit UTC) : une date à l'heure courante
 * tomberait dans le futur pour la pesée du jour et serait écartée du calcul.
 */
const at = (daysAgo: number, kg: number): WeightEntry => ({
  date: new Date(Date.now() - daysAgo * DAY).toISOString().slice(0, 10),
  kg,
});

/** Une pesée par jour sur `days` jours, du plus ancien au plus récent. */
const series = (days: number, kgAt: (dayIndex: number) => number): WeightEntry[] =>
  Array.from({ length: days }, (_, i) => at(days - 1 - i, kgAt(days - 1 - i)));

/** Deux semaines pleines : jours 13 à 7 au poids `avant`, jours 6 à 0 au poids `maintenant`. */
const series14 = (avant: number, maintenant: number): WeightEntry[] =>
  series(14, (d) => (d >= 7 ? avant : maintenant));

const ARKEN: Profile = {
  firstName: "Arken",
  age: 27,
  sex: "h",
  heightCm: 178,
  weightKg: 62.5,
  level: "debutant",
  currentFrequency: 0,
  daysAvailable: 4,
  goal: "muscle-force",
  priorityMuscles: [],
  gymType: "salle",
  equipment: [],
  sessionMinutes: 90,
  diet: "omnivore",
  dislikedFoods: [],
  allergies: [],
  monthlyFoodBudget: 280,
  budgetTier: "standard",
  targetWeightKg: 69,
  sleepHours: 8,
  dailyActivity: "leger",
  startPullUps: 1,
  startPushUps: 8,
  createdAt: new Date(Date.now() - 30 * DAY).toISOString(),
};

describe("moyenne glissante du poids", () => {
  it("ne calcule aucune moyenne sans pesée", () => {
    const t = weightTrend([]);
    expect(t.latest).toBeNull();
    expect(t.avg7).toBeNull();
    expect(t.weeklyDeltaKg).toBeNull();
  });

  it("moyenne les pesées présentes même s'il y en a moins de sept", () => {
    const t = weightTrend([at(2, 62.4), at(1, 62.6), at(0, 62.8)]);
    expect(t.avg7).toBe(62.6);
    expect(t.latest).toBe(62.8);
    // Pas de semaine précédente : aucune variation hebdomadaire à annoncer.
    expect(t.avgPrev7).toBeNull();
    expect(t.weeklyDeltaKg).toBeNull();
  });

  it("compare les deux dernières semaines quand elles existent", () => {
    const t = weightTrend(series14(62.0, 62.5));
    expect(t.avg7).toBe(62.5);
    expect(t.avgPrev7).toBe(62.0);
    expect(t.weeklyDeltaKg).toBe(0.5);
    expect(t.stalledWeeks).toBe(0);
  });

  it("compte les semaines consécutives sans progression réelle", () => {
    const t = weightTrend(series(21, () => 62.5));
    expect(t.weeklyDeltaKg).toBe(0);
    expect(t.stalledWeeks).toBeGreaterThanOrEqual(2);
  });
});

describe("régulation calorique", () => {
  it("demande d'attendre tant qu'il n'y a pas deux semaines de pesées", () => {
    const a = calorieAdjustment([at(1, 62.5), at(0, 62.6)], ARKEN);
    expect(a.extraKcal).toBe(0);
    expect(a.actionable).toBe(false);
    expect(a.reason).toMatch(/deux semaines/i);
  });

  it("ajoute 150 kcal par jour après deux semaines sans gain", () => {
    const a = calorieAdjustment(series(21, () => 62.5), ARKEN);
    expect(a.extraKcal).toBe(150);
    expect(a.actionable).toBe(true);
  });

  it("retire 150 kcal quand la prise dépasse 600 g par semaine", () => {
    // +1 kg d'une semaine sur l'autre : trop rapide pour une prise de masse propre.
    const a = calorieAdjustment(series14(62.0, 63.0), ARKEN);
    expect(a.extraKcal).toBe(-150);
    expect(a.actionable).toBe(true);
  });

  it("ne touche à rien si l'objectif n'est pas de prendre du poids", () => {
    const perte: Profile = { ...ARKEN, weightKg: 80, targetWeightKg: 72 };
    expect(calorieAdjustment(series(21, () => 80), perte).extraKcal).toBe(0);
  });

  it("le surplus s'ajoute à la cible du jour", () => {
    const base = computeTargets(ARKEN);
    const plus = computeTargets(ARKEN, 150);
    expect(plus.kcal).toBe(base.kcal + 150);
    expect(plus.prot).toBe(base.prot);
  });
});

describe("cible calorique", () => {
  it("reste dans la fourchette annoncée pour Arken", () => {
    const t = computeTargets(ARKEN);
    expect(t.kcal).toBeGreaterThanOrEqual(2500);
    expect(t.kcal).toBeLessThanOrEqual(2700);
    expect(t.prot).toBeGreaterThanOrEqual(125);
  });
});
