import { ALL_DAYS } from "@/lib/data/program";
import type { WorkoutDay, WorkoutSession } from "@/lib/types";

/** Prochaine séance = la suivante dans la rotation du programme. */
export function nextDay(sessions: WorkoutSession[]): WorkoutDay {
  const done = sessions.filter((s) => s.completed).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (!done.length) return ALL_DAYS[0];
  const lastIndex = ALL_DAYS.findIndex((d) => d.id === done[done.length - 1].dayId);
  return ALL_DAYS[(lastIndex + 1) % ALL_DAYS.length];
}

export function lastSessionFor(sessions: WorkoutSession[], dayId: string) {
  return sessions
    .filter((s) => s.completed && s.dayId === dayId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
}

export const ACCENT_CLASS: Record<WorkoutDay["accent"], { text: string; ring: string; from: string }> = {
  ember: { text: "text-ember-400", ring: "ring-ember-500/30", from: "from-ember-500/25" },
  violet: { text: "text-violet-glow", ring: "ring-violet-glow/30", from: "from-violet-glow/25" },
  cyan: { text: "text-cyan-glow", ring: "ring-cyan-glow/30", from: "from-cyan-glow/25" },
  volt: { text: "text-volt-400", ring: "ring-volt-500/30", from: "from-volt-500/25" },
};
