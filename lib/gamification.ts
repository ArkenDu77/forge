import type { Achievement, WorkoutSession } from "@/lib/types";
import { currentStreak } from "./progression";

export const XP_PER_SET = 18;
export const XP_PER_EXERCISE = 40;
export const XP_SESSION = 180;
export const XP_PR = 120;

export function sessionXp(session: Pick<WorkoutSession, "entries" | "prs">) {
  const sets = session.entries.reduce((a, e) => a + e.sets.length, 0);
  const exercises = session.entries.filter((e) => e.sets.length > 0).length;
  return XP_SESSION + sets * XP_PER_SET + exercises * XP_PER_EXERCISE + session.prs.length * XP_PR;
}

export const LEVELS = [
  { level: 1, name: "Rookie", xp: 0 },
  { level: 2, name: "Débutant appliqué", xp: 1200 },
  { level: 3, name: "Régulier", xp: 3200 },
  { level: 4, name: "Constructeur", xp: 6400 },
  { level: 5, name: "Builder", xp: 11000 },
  { level: 6, name: "Machiniste", xp: 17000 },
  { level: 7, name: "Forgeron", xp: 25000 },
  { level: 8, name: "Vétéran", xp: 36000 },
  { level: 9, name: "Colosse", xp: 50000 },
  { level: 10, name: "Titan", xp: 70000 },
];

export function levelFor(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) current = l;
  const next = LEVELS.find((l) => l.xp > xp);
  const span = next ? next.xp - current.xp : 1;
  return {
    ...current,
    next,
    progress: next ? (xp - current.xp) / span : 1,
    toNext: next ? next.xp - xp : 0,
  };
}

export const ACHIEVEMENTS: (Achievement & { test: (s: WorkoutSession[]) => boolean })[] = [
  {
    id: "first-session",
    name: "Première séance",
    desc: "Tu as franchi la porte.",
    icon: "spark",
    tier: "bronze",
    test: (s) => s.filter((x) => x.completed).length >= 1,
  },
  {
    id: "five-sessions",
    name: "5 séances",
    desc: "L'habitude commence à se créer.",
    icon: "flame",
    tier: "bronze",
    test: (s) => s.filter((x) => x.completed).length >= 5,
  },
  {
    id: "ten-sessions",
    name: "10 séances",
    desc: "Le programme est lancé.",
    icon: "flame",
    tier: "argent",
    test: (s) => s.filter((x) => x.completed).length >= 10,
  },
  {
    id: "first-pr",
    name: "Premier record",
    desc: "Une charge que tu n'avais jamais soulevée.",
    icon: "trophy",
    tier: "bronze",
    test: (s) => s.some((x) => x.prs.length > 0),
  },
  {
    id: "five-prs",
    name: "5 records",
    desc: "La progression est réelle, chiffres à l'appui.",
    icon: "trophy",
    tier: "argent",
    test: (s) => s.reduce((a, x) => a + x.prs.length, 0) >= 5,
  },
  {
    id: "streak-4",
    name: "Série de 4",
    desc: "4 séances enchaînées sans trou.",
    icon: "bolt",
    tier: "argent",
    test: (s) => currentStreak(s) >= 4,
  },
  {
    id: "month",
    name: "Un mois régulier",
    desc: "12 séances ou plus sur 30 jours.",
    icon: "calendar",
    tier: "or",
    test: (s) =>
      s.filter((x) => x.completed && Date.now() - new Date(x.date).getTime() < 30 * 86_400_000).length >= 12,
  },
  {
    id: "volume-20t",
    name: "20 tonnes",
    desc: "Volume cumulé soulevé depuis le début.",
    icon: "weight",
    tier: "or",
    test: (s) =>
      s.reduce((a, x) => a + x.entries.reduce((b, e) => b + e.sets.reduce((c, st) => c + st.weight * st.reps, 0), 0), 0) >=
      20000,
  },
];

export function unlockedAchievements(sessions: WorkoutSession[]) {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.test(sessions) }));
}
