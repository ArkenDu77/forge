import { describe, expect, it } from "vitest";
import { detectPRs, recommendLoad, type PerfEntry } from "./progression";
import { ex } from "./data/exercises";
import { getDay } from "./data/program";
import type { Profile, SetLog } from "./types";

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
const ASSISTED = ex("assisted-pull-up");
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

/* ---------------- Machines assistées ---------------- */

describe("charge d'aide", () => {
  /** 4 séries de 5 à 8 répétitions à la traction assistée. */
  const PLAN = getDay("lundi")!.exercises[1];

  it("l'exercice déclare que sa charge est une aide", () => {
    expect(ASSISTED.assistance).toBe(true);
    expect(PLAN.exerciseId).toBe("assisted-pull-up");
  });

  it("réussir la fourchette retire de l'aide au lieu d'en ajouter", () => {
    const h = [entry([set(8, 40, 2), set(8, 40, 2), set(8, 40, 2), set(8, 40, 2)])];
    const r = recommendLoad(ASSISTED, PLAN, h, PROFILE);
    // Moins d'aide = plus dur : c'est ça, progresser sur cette machine.
    expect(r.weight).toBeLessThan(40);
    expect(r.delta).toBeLessThan(0);
    expect(r.deload).toBe(false);
    expect(r.display).toMatch(/aide/);
  });

  it("une douleur remet de l'aide", () => {
    const h = [entry([set(6, 40, 1, { pain: true }), set(5, 40, 0)])];
    const r = recommendLoad(ASSISTED, PLAN, h, PROFILE);
    expect(r.weight).toBeGreaterThan(40);
    expect(r.deload).toBe(true);
  });

  it("deux séances sous la fourchette remettent de l'aide", () => {
    const faible = [set(3, 40, 0), set(3, 40, 0)];
    const r = recommendLoad(ASSISTED, PLAN, [entry(faible, 2), entry(faible, 5), entry(faible, 9)], PROFILE);
    expect(r.weight).toBeGreaterThan(40);
    expect(r.deload).toBe(true);
  });

  it("l'aide ne descend jamais sous zéro", () => {
    const h = [entry([set(8, 0, 3), set(8, 0, 3), set(8, 0, 3), set(8, 0, 3)])];
    expect(recommendLoad(ASSISTED, PLAN, h, PROFILE).weight).toBeGreaterThanOrEqual(0);
  });
});
