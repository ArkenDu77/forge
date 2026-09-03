import type { Exercise, ProgramExercise, Profile, WeightEntry, WorkoutSession } from "@/lib/types";
import { estimate1RM } from "./estimator";
import { historyFor, workingWeight, currentStreak, weeklySessions, type LoadRecommendation, type PerfEntry } from "./progression";
import { kg } from "./format";
import { EXERCISES } from "./data/exercises";

const exerciseNames: Record<string, string> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e.shortName ?? e.name])
);

/**
 * Tous les messages sont calculés à partir des données réelles.
 * Aucune phrase ne prétend un fait qui n'existe pas dans l'historique.
 */

export type CoachLine = { tone: "neutre" | "positif" | "attention"; text: string };

export function preExerciseLine(
  exercise: Exercise,
  target: Pick<ProgramExercise, "repMin" | "repMax">,
  history: PerfEntry[],
  reco: LoadRecommendation
): CoachLine | null {
  if (!history.length) {
    return {
      tone: "neutre",
      text: `Première fois sur cet exercice : on part léger pour caler la technique, puis on ajuste.`,
    };
  }
  const last = history[0];
  const w = workingWeight(last.sets);
  const reps = last.sets.filter((s) => s.weight === w).map((s) => s.reps);
  const summary = `${reps.join("/")} à ${kg(w)}`;
  if (reco.delta > 0) {
    return { tone: "positif", text: `La dernière fois : ${summary}. Aujourd'hui on tente ${reco.display}.` };
  }
  if (reco.deload) {
    return { tone: "attention", text: `La dernière fois : ${summary}. On allège volontairement pour repartir propre.` };
  }
  return { tone: "neutre", text: `La dernière fois : ${summary}. Objectif du jour : ajouter des répétitions.` };
}

export function postSetLine(reps: number, target: { repMin: number; repMax: number }, rir: number, setsLeft: number): CoachLine {
  if (rir === 0) {
    return {
      tone: "attention",
      text:
        setsLeft > 0
          ? "Série menée jusqu'à la limite. Garde une répétition en réserve sur les suivantes."
          : "Série menée jusqu'à la limite. Bien joué, mais ce n'est pas nécessaire à chaque fois.",
    };
  }
  if (reps >= target.repMax) {
    return { tone: "positif", text: `${reps} répétitions : haut de la fourchette atteint.` };
  }
  if (reps < target.repMin) {
    return { tone: "neutre", text: "Série en dessous de la fourchette. Ça arrive : reste concentré sur la technique." };
  }
  return { tone: "positif", text: setsLeft > 0 ? `Bien. Il te reste ${setsLeft} série${setsLeft > 1 ? "s" : ""}.` : "Bien. Dernier effort terminé." };
}

export function sessionSummaryLine(session: WorkoutSession, previous: WorkoutSession[]): CoachLine {
  if (session.prs.length) {
    return { tone: "positif", text: `${session.prs.length} record${session.prs.length > 1 ? "s" : ""} sur cette séance. C'est une progression mesurée, pas une impression.` };
  }
  const sameDay = previous.filter((s) => s.dayId === session.dayId);
  if (sameDay.length) {
    const before = sameDay[sameDay.length - 1];
    const vNow = volume(session);
    const vBefore = volume(before);
    if (vNow > vBefore * 1.02) {
      return { tone: "positif", text: `Volume en hausse de ${Math.round(((vNow - vBefore) / vBefore) * 100)} % par rapport à la même séance précédente.` };
    }
    if (vNow < vBefore * 0.94) {
      return {
        tone: "neutre",
        text: "Volume un peu inférieur à la dernière fois. Ce n'est pas nécessairement une régression : sommeil, fatigue et alimentation influencent une séance.",
      };
    }
  }
  return { tone: "positif", text: "Séance terminée et enregistrée. La régularité fait le reste." };
}

export const volume = (s: WorkoutSession) =>
  s.entries.reduce((a, e) => a + e.sets.reduce((b, x) => b + x.weight * x.reps, 0), 0);

/** Phrase d'accueil du tableau de bord — uniquement des faits tirés des données. */
export function dashboardHeadline(
  sessions: WorkoutSession[],
  weights: WeightEntry[],
  profile: Profile
): CoachLine {
  const done = sessions.filter((s) => s.completed);
  if (!done.length) {
    return { tone: "neutre", text: "Ta première séance est prête. C'est la seule qui compte aujourd'hui." };
  }

  const thisWeek = weeklySessions(sessions).length;
  const remaining = profile.daysAvailable - thisWeek;

  // Progression de force sur 30 jours, sur l'exercice le plus travaillé
  const gains = strengthGains(sessions, 30, exerciseNames);
  if (gains.length) {
    const best = gains[0];
    return {
      tone: "positif",
      text: `${best.name} : +${best.delta.toFixed(1).replace(".0", "").replace(".", ",")} kg en 30 jours.`,
    };
  }

  if (remaining === 1) return { tone: "neutre", text: "Encore une séance cette semaine pour atteindre ton objectif." };
  if (remaining > 1) return { tone: "neutre", text: `${remaining} séances cette semaine pour atteindre ton objectif.` };
  if (remaining <= 0) return { tone: "positif", text: "Objectif de la semaine atteint. Tout ce que tu ajoutes est du bonus." };

  const streak = currentStreak(sessions);
  if (streak >= 3) return { tone: "positif", text: `${streak} séances enchaînées sans trou.` };
  void weights;
  return { tone: "neutre", text: "Le programme t'attend." };
}

export type StrengthGain = { exerciseId: string; name: string; delta: number; pct: number };

/** Écart de charge de travail entre la première et la dernière séance sur la période. */
export function strengthGains(sessions: WorkoutSession[], days: number, names?: Record<string, string>): StrengthGain[] {
  const cutoff = Date.now() - days * 86_400_000;
  const ids = new Set(sessions.flatMap((s) => s.entries.map((e) => e.exerciseId)));
  const out: StrengthGain[] = [];
  for (const id of ids) {
    const hist = historyFor(sessions, id).filter((h) => new Date(h.date).getTime() >= cutoff);
    if (hist.length < 2) continue;
    const newest = workingWeight(hist[0].sets);
    const oldest = workingWeight(hist[hist.length - 1].sets);
    if (newest > oldest && oldest > 0) {
      out.push({
        exerciseId: id,
        name: names?.[id] ?? id,
        delta: newest - oldest,
        pct: ((newest - oldest) / oldest) * 100,
      });
    }
  }
  return out.sort((a, b) => b.delta - a.delta);
}

/** Progression totale sur un exercice depuis le début, en 1RM estimé. */
export function progressSinceStart(sessions: WorkoutSession[], exerciseId: string) {
  const hist = historyFor(sessions, exerciseId);
  if (hist.length < 2) return null;
  const first = hist[hist.length - 1];
  const last = hist[0];
  const e0 = Math.max(...first.sets.map((s) => estimate1RM(s.weight, s.reps)));
  const e1 = Math.max(...last.sets.map((s) => estimate1RM(s.weight, s.reps)));
  if (e0 <= 0) return null;
  return { from: e0, to: e1, pct: ((e1 - e0) / e0) * 100 };
}

/** Conseil du jour, choisi selon l'état réel : récupération, régularité, nutrition. */
export function tipOfTheDay(sessions: WorkoutSession[], profile: Profile, sleepHours: number): CoachLine {
  const week = weeklySessions(sessions).length;
  if (sleepHours && sleepHours < 6.5) {
    return {
      tone: "attention",
      text: "Nuit courte enregistrée : garde une répétition de réserve supplémentaire aujourd'hui, la fatigue nerveuse se paie sur les gros exercices.",
    };
  }
  if (week === 0) {
    return { tone: "neutre", text: "Une séance imparfaite bat toujours une séance annulée." };
  }
  if (week >= profile.daysAvailable) {
    return { tone: "positif", text: "Semaine complète. La récupération fait maintenant autant que l'entraînement." };
  }
  const rotation = [
    "Sur les exercices principaux, la technique passe avant la charge. Toujours.",
    "Une amplitude complète sur une charge modérée vaut mieux qu'une demi-répétition lourde.",
    "Note ta charge dès la fin de la série : la mémoire est un mauvais carnet.",
    "Le repos entre séries n'est pas du temps perdu : c'est ce qui rend la série suivante utile.",
    "Les protéines sont la seule variable nutritionnelle qu'il ne faut pas rater.",
  ];
  return { tone: "neutre", text: rotation[new Date().getDate() % rotation.length] };
}
