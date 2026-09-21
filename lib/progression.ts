import type { Exercise, ProgramExercise, Profile, SetLog, WorkoutSession } from "@/lib/types";
import { estimate1RM, estimateStartingLoad } from "./estimator";
import { roundTo } from "./format";

export type PerfEntry = { date: string; sets: SetLog[]; sessionId: string };

/** Historique d'un exercice, de la séance la plus récente à la plus ancienne. */
export function historyFor(sessions: WorkoutSession[], exerciseId: string): PerfEntry[] {
  return sessions
    .filter((s) => s.completed)
    .flatMap((s) => {
      const entry = s.entries.find((e) => e.exerciseId === exerciseId && e.sets.length > 0);
      return entry ? [{ date: s.date, sets: entry.sets, sessionId: s.id }] : [];
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const workingWeight = (sets: SetLog[]) =>
  sets.length ? Math.max(...sets.map((s) => s.weight)) : 0;

export const bestSet = (sets: SetLog[]) =>
  sets.reduce((best, s) => (estimate1RM(s.weight, s.reps) > estimate1RM(best.weight, best.reps) ? s : best), sets[0]);

export const totalVolume = (sets: SetLog[]) => sets.reduce((a, s) => a + s.weight * s.reps, 0);

export type Reason = { ok: boolean; text: string };

export type LoadRecommendation = {
  weight: number;
  previousWeight: number | null;
  delta: number;
  headline: string;
  reasons: Reason[];
  source: "estimation" | "historique";
  /** true quand on propose volontairement un allègement */
  deload: boolean;
  display: string;
};

function displayWeight(exercise: Exercise, weight: number) {
  if (exercise.assistance) return `${weight} kg d'aide`;
  if (exercise.loadModel === "bodyweight") return "Poids du corps";
  if (exercise.loadModel === "bodyweight-loaded") return weight > 0 ? `Poids du corps + ${weight} kg` : "Poids du corps";
  if (exercise.loadModel === "dumbbell-pair") return `2 × ${weight} kg`;
  return `${weight} kg`;
}

/**
 * Double progression.
 * On monte la charge seulement quand le haut de la fourchette de répétitions
 * est atteint sur toutes les séries avec une réserve suffisante.
 */
export function recommendLoad(
  exercise: Exercise,
  target: Pick<ProgramExercise, "sets" | "repMin" | "repMax" | "targetRir"> & Partial<Pick<ProgramExercise, "metric">>,
  history: PerfEntry[],
  profile: Profile
): LoadRecommendation {
  const est = estimateStartingLoad(exercise, profile);

  // Portés et suspensions : on ne progresse pas en répétitions mais en distance
  // ou en durée. Le poids reste celui de la dernière fois.
  if (target.metric && target.metric !== "reps") {
    const previous = history.length ? workingWeight(history[0].sets) : null;
    const weight = previous ?? est.weight;
    const unit = target.metric === "distance" ? "la distance" : "le temps";
    return {
      weight,
      previousWeight: previous,
      delta: 0,
      headline: previous === null ? "Premier essai" : "Même charge que la dernière fois",
      source: previous === null ? "estimation" : "historique",
      deload: false,
      display: displayWeight(exercise, weight),
      reasons: [
        previous === null
          ? { ok: true, text: "Choisis une charge que tu es sûr de pouvoir tenir jusqu'au bout." }
          : { ok: true, text: `La dernière fois : ${displayWeight(exercise, previous)}` },
        { ok: true, text: `Ici, tu progresses en augmentant ${unit}, pas le poids.` },
        { ok: true, text: "Quand tu tiens le haut de la fourchette facilement, ajoute du poids." },
      ],
    };
  }

  if (history.length === 0) {
    return {
      weight: est.weight,
      previousWeight: null,
      delta: 0,
      headline: "Première séance sur cet exercice",
      source: "estimation",
      deload: false,
      display: est.display,
      reasons: [
        { ok: true, text: `Estimation à partir de ton profil (${profile.weightKg} kg, niveau ${levelLabel(profile.level)})` },
        { ok: true, text: "Volontairement prudent : tu ajusteras dès la première série" },
        ...est.notes.map((n) => ({ ok: true, text: n })),
      ],
    };
  }

  const last = history[0];
  const prev = workingWeight(last.sets);
  const topSets = last.sets.filter((s) => s.weight === prev);
  const reps = topSets.map((s) => s.reps);
  const minReps = Math.min(...reps);
  const meanRir = topSets.reduce((a, s) => a + s.rir, 0) / topSets.length;
  const hadPain = last.sets.some((s) => s.pain);
  const inc = exercise.increment || 2.5;
  // Sens de la progression : sur une machine assistée, on avance en retirant
  // de l'aide, et on recule en en remettant.
  const harder = exercise.assistance ? -1 : 1;
  const easier = -harder;
  const reasons: Reason[] = [];

  const repsSummary = reps.join(" / ");
  reasons.push({ ok: true, text: `Dernière séance : ${displayWeight(exercise, prev)} — ${repsSummary} reps` });

  if (hadPain) {
    const weight = roundTo(Math.max(0, prev + easier * Math.max(inc, prev * 0.15)), inc);
    return {
      weight,
      previousWeight: prev,
      delta: weight - prev,
      headline: "Charge allégée après une gêne signalée",
      source: "historique",
      deload: true,
      display: displayWeight(exercise, weight),
      reasons: [
        ...reasons,
        { ok: false, text: "Tu as signalé une douleur sur cet exercice" },
        { ok: true, text: "On repart plus léger, en priorité sur la technique et l'amplitude" },
      ],
    };
  }

  // Toutes les séries au sommet de la fourchette, avec de la réserve
  if (minReps >= target.repMax && meanRir >= 1) {
    const stalledLong = history.length >= 2 && workingWeight(history[1].sets) === prev;
    const bigJump = meanRir >= 3 && exercise.loadModel !== "dumbbell-pair" && exercise.pattern !== "isolation";
    const step = bigJump ? inc * 2 : inc;
    const weight = Math.max(0, roundTo(prev + harder * step, inc));
    reasons.push({ ok: true, text: `Haut de la fourchette atteint sur toutes les séries (${target.repMax} reps)` });
    reasons.push({
      ok: true,
      text: meanRir >= 2 ? "Difficulté maîtrisée : il te restait de la réserve" : "Réserve suffisante en fin de série",
    });
    if (stalledLong) reasons.push({ ok: true, text: "Deuxième séance consécutive réussie à cette charge" });
    reasons.push({
      ok: true,
      text: exercise.assistance
        ? `Progression : ${step} kg d'aide en moins, donc un peu plus de toi`
        : `Progression : +${step} kg${exercise.loadModel === "dumbbell-pair" ? " par haltère" : ""}`,
    });
    return {
      weight,
      previousWeight: prev,
      delta: weight - prev,
      headline: exercise.assistance
        ? `On descend à ${displayWeight(exercise, weight)} : tu en fais plus toi-même`
        : `On monte à ${displayWeight(exercise, weight)}`,
      source: "historique",
      deload: false,
      display: displayWeight(exercise, weight),
      reasons,
    };
  }

  // Fourchette tenue mais pas au sommet → on répète pour gagner des répétitions
  if (minReps >= target.repMin) {
    reasons.push({ ok: true, text: `Fourchette tenue (${target.repMin}-${target.repMax} reps)` });
    reasons.push({ ok: false, text: `Il manque ${target.repMax - minReps} rep(s) sur ta série la plus faible` });
    reasons.push({ ok: true, text: "Même charge : l'objectif est d'ajouter des répétitions" });
    return {
      weight: prev,
      previousWeight: prev,
      delta: 0,
      headline: "On garde la même charge",
      source: "historique",
      deload: false,
      display: displayWeight(exercise, prev),
      reasons,
    };
  }

  // Sous la fourchette
  const stalls = history.slice(0, 3).filter((h) => {
    const w = workingWeight(h.sets);
    const r = h.sets.filter((s) => s.weight === w).map((s) => s.reps);
    return w === prev && Math.min(...r) < target.repMin;
  }).length;

  if (stalls >= 2) {
    const weight = roundTo(Math.max(0, prev + easier * Math.max(inc, prev * 0.1)), inc);
    reasons.push({ ok: false, text: `Sous la fourchette sur ${stalls} séances à cette charge` });
    reasons.push({ ok: true, text: "Léger recul de charge pour repartir sur des séries propres" });
    return {
      weight,
      previousWeight: prev,
      delta: weight - prev,
      headline: "On allège pour relancer la progression",
      source: "historique",
      deload: true,
      display: displayWeight(exercise, weight),
      reasons,
    };
  }

  reasons.push({ ok: false, text: `En dessous de ${target.repMin} reps sur au moins une série` });
  reasons.push({ ok: true, text: "Même charge : une séance faible n'est pas une régression" });
  return {
    weight: prev,
    previousWeight: prev,
    delta: 0,
    headline: "On garde la même charge",
    source: "historique",
    deload: false,
    display: displayWeight(exercise, prev),
    reasons,
  };
}

export function levelLabel(level: Profile["level"]) {
  return { jamais: "grand débutant", debutant: "débutant", intermediaire: "intermédiaire", avance: "avancé" }[level];
}

/* ---------------- Records ---------------- */

export type PrCandidate = { kind: "charge" | "reps" | "1rm"; value: number; reps?: number };

export function detectPRs(exerciseId: string, sets: SetLog[], history: PerfEntry[]): PrCandidate[] {
  if (!sets.length) return [];
  const past = history.flatMap((h) => h.sets);
  const out: PrCandidate[] = [];

  // Portés et suspensions : le record est la meilleure distance ou la meilleure durée.
  const bestDistance = Math.max(0, ...sets.map((s) => s.distanceM ?? 0));
  const bestSeconds = Math.max(0, ...sets.map((s) => s.seconds ?? 0));
  if (bestDistance > 0) {
    const pastBest = Math.max(0, ...past.map((s) => s.distanceM ?? 0));
    return bestDistance > pastBest && past.length > 0 ? [{ kind: "reps", value: bestDistance }] : [];
  }
  if (bestSeconds > 0) {
    const pastBest = Math.max(0, ...past.map((s) => s.seconds ?? 0));
    return bestSeconds > pastBest && past.length > 0 ? [{ kind: "reps", value: bestSeconds }] : [];
  }

  const w = workingWeight(sets);
  const pastBestWeight = past.length ? Math.max(...past.map((s) => s.weight)) : 0;
  if (w > pastBestWeight && past.length > 0) out.push({ kind: "charge", value: w });

  const best = bestSet(sets);
  const e = estimate1RM(best.weight, best.reps);
  const pastBestE = past.length ? Math.max(...past.map((s) => estimate1RM(s.weight, s.reps))) : 0;
  if (e > pastBestE * 1.005 && past.length > 0) out.push({ kind: "1rm", value: Math.round(e * 10) / 10, reps: best.reps });

  const repsAtWeight = Math.max(...sets.filter((s) => s.weight === w).map((s) => s.reps));
  const pastRepsAtWeight = past.filter((s) => s.weight === w).map((s) => s.reps);
  if (pastRepsAtWeight.length && repsAtWeight > Math.max(...pastRepsAtWeight))
    out.push({ kind: "reps", value: repsAtWeight, reps: repsAtWeight });

  // Un seul record par exercice et par séance : charge > 1RM estimé > répétitions.
  const priority = { charge: 0, "1rm": 1, reps: 2, volume: 3 } as Record<string, number>;
  return out.sort((a, b) => priority[a.kind] - priority[b.kind]).slice(0, 1);
}

/* ---------------- Volume & régularité ---------------- */

export function weeklySessions(sessions: WorkoutSession[], weeksBack = 0) {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day - weeksBack * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  return sessions.filter((s) => s.completed && new Date(s.date) >= monday && new Date(s.date) < sunday);
}

export function currentStreak(sessions: WorkoutSession[]) {
  const done = sessions.filter((s) => s.completed).sort((a, b) => (a.date < b.date ? 1 : -1));
  if (!done.length) return 0;
  let streak = 1;
  for (let i = 1; i < done.length; i++) {
    const gap = Math.round((new Date(done[i - 1].date).getTime() - new Date(done[i].date).getTime()) / 86_400_000);
    if (gap <= 4) streak++;
    else break;
  }
  return streak;
}
