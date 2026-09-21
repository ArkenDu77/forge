import { describe, expect, it } from "vitest";
import { detectPRs, recommendLoad, type PerfEntry } from "./progression";
import { calorieAdjustment, computeTargets, weightTrend } from "./nutrition";
import { ex } from "./data/exercises";
import { getDay } from "./data/program";
import type { Profile, SetLog, WeightEntry } from "./types";

const PROFILE: Profile = {
  firstName: "Test",
  age: 24,
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
  sleepHours: 7.5,
  dailyActivity: "leger",
  startPullUps: 1,
  startPushUps: 8,
  createdAt: new Date().toISOString(),
};

const set = (reps: number, weight: number, rir = 2, extra: Partial<SetLog> = {}): SetLog => ({
  setIndex: 0,
  reps,
  weight,
  rir,
  ts: new Date().toISOString(),
  ...extra,
});

const entry = (sets: SetLog[], daysAgo = 2): PerfEntry => ({
  date: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
  sets,
  sessionId: `s-${daysAgo}`,
});

const BENCH = ex("bench-press");
/** 4 séries de 4 à 6 répétitions */
const BENCH_PLAN = getDay("lundi")!.exercises[0];

describe("double progression", () => {
  it("part d'une estimation prudente quand il n'y a aucun historique", () => {
    const r = recommendLoad(BENCH, BENCH_PLAN, [], PROFILE);
    expect(r.source).toBe("estimation");
    expect(r.previousWeight).toBeNull();
    // jamais en dessous de la barre à vide
    expect(r.weight).toBeGreaterThanOrEqual(20);
  });

  it("monte la charge quand le haut de la fourchette est atteint partout avec de la réserve", () => {
    const history = [entry([set(6, 40), set(6, 40), set(6, 40), set(6, 40)])];
    const r = recommendLoad(BENCH, BENCH_PLAN, history, PROFILE);
    expect(r.weight).toBeGreaterThan(40);
    expect(r.delta).toBeGreaterThan(0);
  });

  it("garde la charge quand la fourchette est tenue sans être au sommet", () => {
    const history = [entry([set(6, 40), set(5, 40), set(5, 40), set(4, 40)])];
    const r = recommendLoad(BENCH, BENCH_PLAN, history, PROFILE);
    expect(r.weight).toBe(40);
    expect(r.delta).toBe(0);
  });

  it("ne monte pas la charge si la dernière série est allée jusqu'à l'échec", () => {
    const history = [entry([set(6, 40, 0), set(6, 40, 0), set(6, 40, 0), set(6, 40, 0)])];
    const r = recommendLoad(BENCH, BENCH_PLAN, history, PROFILE);
    expect(r.weight).toBe(40);
  });

  it("allège après deux séances consécutives sous la fourchette", () => {
    const low = [set(3, 50), set(3, 50), set(2, 50), set(2, 50)];
    const history = [entry(low, 2), entry(low, 5), entry(low, 8)];
    const r = recommendLoad(BENCH, BENCH_PLAN, history, PROFILE);
    expect(r.weight).toBeLessThan(50);
    expect(r.deload).toBe(true);
  });

  it("allège immédiatement si une douleur a été signalée", () => {
    const history = [entry([set(6, 50), set(6, 50, 2, { pain: true })])];
    const r = recommendLoad(BENCH, BENCH_PLAN, history, PROFILE);
    expect(r.weight).toBeLessThan(50);
    expect(r.deload).toBe(true);
    expect(r.reasons.some((x) => x.text.toLowerCase().includes("douleur"))).toBe(true);
  });

  it("explique toujours sa décision", () => {
    const history = [entry([set(6, 40), set(6, 40), set(6, 40), set(6, 40)])];
    const r = recommendLoad(BENCH, BENCH_PLAN, history, PROFILE);
    expect(r.reasons.length).toBeGreaterThan(1);
    expect(r.headline.length).toBeGreaterThan(0);
  });

  it("ne fait pas progresser le poids sur un porté : c'est la distance qui augmente", () => {
    const carry = ex("farmer-carry");
    const plan = getDay("mardi")!.exercises.find((p) => p.exerciseId === "farmer-carry")!;
    const history = [entry([set(0, 16, 2, { distanceM: 30 })])];
    const r = recommendLoad(carry, plan, history, PROFILE);
    expect(r.weight).toBe(16);
    expect(r.delta).toBe(0);
  });
});

describe("records", () => {
  it("retient un seul record par exercice et par séance", () => {
    const history = [entry([set(6, 40)])];
    const prs = detectPRs("bench-press", [set(6, 45), set(6, 45)], history);
    expect(prs.length).toBeLessThanOrEqual(1);
  });

  it("ne déclare pas de record à la toute première séance", () => {
    expect(detectPRs("bench-press", [set(6, 40)], [])).toHaveLength(0);
  });

  it("retient la meilleure distance sur un porté", () => {
    const history = [entry([set(0, 16, 2, { distanceM: 20 })])];
    const prs = detectPRs("farmer-carry", [set(0, 16, 2, { distanceM: 30 })], history);
    expect(prs[0]?.value).toBe(30);
  });
});

/* ---------------- Nutrition ---------------- */

const weightsFrom = (values: number[]): WeightEntry[] =>
  values.map((kg, i) => ({
    date: new Date(Date.now() - (values.length - 1 - i) * 86_400_000).toISOString().slice(0, 10),
    kg,
  }));

describe("suivi du poids", () => {
  it("calcule la moyenne des sept derniers jours plutôt que la dernière pesée", () => {
    const t = weightTrend(weightsFrom([62, 62.4, 61.8, 62.2, 62.6, 62.1, 63.4]));
    expect(t.latest).toBe(63.4);
    expect(t.avg7).not.toBeNull();
    expect(t.avg7!).toBeLessThan(63.4);
  });

  it("ajoute des calories après deux semaines de stagnation", () => {
    const flat = weightsFrom(Array.from({ length: 21 }, () => 62.5));
    const a = calorieAdjustment(flat, PROFILE);
    expect(a.extraKcal).toBeGreaterThanOrEqual(150);
    expect(a.actionable).toBe(true);
  });

  it("ne change rien quand le poids monte au bon rythme", () => {
    const rising = weightsFrom(Array.from({ length: 21 }, (_, i) => 62 + i * 0.04));
    const a = calorieAdjustment(rising, PROFILE);
    expect(a.extraKcal).toBe(0);
  });

  it("redescend si la prise dépasse 600 g par semaine", () => {
    const fast = weightsFrom(Array.from({ length: 21 }, (_, i) => 62 + i * 0.12));
    const a = calorieAdjustment(fast, PROFILE);
    expect(a.extraKcal).toBeLessThan(0);
  });

  it("reste dans la fourchette visée par le programme", () => {
    const t = computeTargets(PROFILE);
    expect(t.kcal).toBeGreaterThanOrEqual(2450);
    expect(t.kcal).toBeLessThanOrEqual(2850);
    expect(t.prot).toBeGreaterThanOrEqual(120);
    expect(t.prot).toBeLessThanOrEqual(145);
  });
});

/* ---------------- Cohérence du programme ---------------- */

describe("programme", () => {
  it("ne référence que des exercices qui existent", () => {
    for (const dayId of ["lundi", "mardi", "jeudi", "samedi"]) {
      const day = getDay(dayId)!;
      expect(day).toBeDefined();
      for (const p of day.exercises) expect(() => ex(p.exerciseId)).not.toThrow();
    }
  });

  it("donne une fourchette cohérente à chaque exercice", () => {
    for (const dayId of ["lundi", "mardi", "jeudi", "samedi"]) {
      for (const p of getDay(dayId)!.exercises) {
        if (p.metric === "reps") expect(p.repMax).toBeGreaterThanOrEqual(p.repMin);
        if (p.metric === "distance") expect(p.distMax!).toBeGreaterThan(p.distMin!);
        if (p.metric === "duration") expect(p.secMax!).toBeGreaterThan(p.secMin!);
        expect(p.sets).toBeGreaterThan(0);
        expect(p.restSec).toBeGreaterThan(0);
      }
    }
  });

  it("tient dans la durée annoncée", () => {
    for (const dayId of ["lundi", "mardi", "jeudi", "samedi"]) {
      const day = getDay(dayId)!;
      expect(day.estimatedMin).toBeGreaterThan(60);
      expect(day.estimatedMin).toBeLessThanOrEqual(100);
    }
  });
});
