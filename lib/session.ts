import { adaptForWeek, ALL_DAYS, WEEKDAY_LABELS } from "@/lib/data/program";
import type { WorkoutDay, WorkoutSession } from "@/lib/types";

/** 0 = lundi */
export function todayIndex(d = new Date()) {
  return (d.getDay() + 6) % 7;
}

/**
 * Les séances rendues à l'écran sont toujours allégées pour la semaine en cours :
 * afficher le jour brut ici et le jour allégé ailleurs donnait deux durées et
 * deux nombres de séries pour la même séance.
 */
const forWeek = (day: WorkoutDay, week: number) => adaptForWeek(day, week);

/** La séance prévue aujourd'hui, ou null si c'est un jour de repos. */
export function dayForToday(week = 99, d = new Date()): WorkoutDay | null {
  const wd = todayIndex(d);
  const day = ALL_DAYS.find((x) => x.weekday === wd);
  return day ? forWeek(day, week) : null;
}

/** La prochaine séance du calendrier, avec le nombre de jours qui la sépare d'aujourd'hui. */
export function upcomingDay(week = 99, d = new Date()): { day: WorkoutDay; inDays: number } {
  const wd = todayIndex(d);
  for (let offset = 0; offset < 8; offset++) {
    const target = (wd + offset) % 7;
    const day = ALL_DAYS.find((x) => x.weekday === target);
    if (day) return { day: forWeek(day, week), inDays: offset };
  }
  return { day: forWeek(ALL_DAYS[0], week), inDays: 0 };
}

export function weekdayLabel(weekday: number) {
  return WEEKDAY_LABELS[weekday];
}

/** Formule le moment d'une séance en langage courant. */
export function whenWords(inDays: number, weekday: number) {
  if (inDays === 0) return "Aujourd'hui";
  if (inDays === 1) return "Demain";
  return WEEKDAY_LABELS[weekday];
}

export function lastSessionFor(sessions: WorkoutSession[], dayId: string) {
  return sessions.filter((s) => s.completed && s.dayId === dayId).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
}

/** Séances de la semaine en cours, du lundi au dimanche. */
export function doneThisWeek(sessions: WorkoutSession[], now = new Date()) {
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayIndex(now));
  monday.setHours(0, 0, 0, 0);
  return sessions.filter((s) => s.completed && new Date(s.date) >= monday);
}

export const ACCENT_CLASS: Record<WorkoutDay["accent"], { text: string; ring: string; from: string }> = {
  ember: { text: "text-ember-400", ring: "ring-ember-500/30", from: "from-ember-500/25" },
  violet: { text: "text-violet-glow", ring: "ring-violet-glow/30", from: "from-violet-glow/25" },
  cyan: { text: "text-cyan-glow", ring: "ring-cyan-glow/30", from: "from-cyan-glow/25" },
  volt: { text: "text-volt-400", ring: "ring-volt-500/30", from: "from-volt-500/25" },
};
