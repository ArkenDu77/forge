"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  BodyMeasurement,
  ExerciseSession,
  LoggedMeal,
  MealPlanEntry,
  NutritionTarget,
  PersonalRecord,
  Profile,
  RecoveryCheckin,
  SetLog,
  WeightEntry,
  WorkoutSession,
} from "@/lib/types";
import { DEFAULT_PROGRAM, getDay } from "@/lib/data/program";
import { ex } from "@/lib/data/exercises";
import { detectPRs, historyFor } from "@/lib/progression";
import { sessionXp } from "@/lib/gamification";
import { computeTargets } from "@/lib/nutrition";
import { DEFAULT_MEAL_PLAN } from "@/lib/data/mealplan";
import { today } from "@/lib/format";

export type ActiveWorkout = {
  dayId: string;
  startedAt: number;
  exIndex: number;
  setIndex: number;
  entries: ExerciseSession[];
  substitutions: Record<string, string>;
  restEndsAt: number | null;
  restTotal: number;
  xp: number;
  prs: PersonalRecord[];
};

type State = {
  hydrated: boolean;
  profile: Profile | null;
  programId: string;
  sessions: WorkoutSession[];
  weights: WeightEntry[];
  measurements: BodyMeasurement[];
  meals: LoggedMeal[];
  mealPlan: MealPlanEntry[];
  recovery: RecoveryCheckin[];
  targetsOverride: Partial<NutritionTarget> | null;
  pantry: string[];
  active: ActiveWorkout | null;
  lastFinished: WorkoutSession | null;
  seenExercises: string[];
};

type Actions = {
  setHydrated: () => void;
  setProfile: (p: Profile) => void;
  patchProfile: (p: Partial<Profile>) => void;
  startWorkout: (dayId: string) => void;
  abortWorkout: () => void;
  logSet: (payload: { reps: number; weight: number; rir: number; pain?: boolean }) => void;
  skipRest: () => void;
  addRest: (seconds: number) => void;
  goToExercise: (index: number) => void;
  skipExercise: () => void;
  substitute: (fromId: string, toId: string) => void;
  finishWorkout: () => WorkoutSession | null;
  addWeight: (kg: number, date?: string) => void;
  addMeasurement: (m: BodyMeasurement) => void;
  logMeal: (m: Omit<LoggedMeal, "id">) => void;
  removeMeal: (id: string) => void;
  replacePlanEntry: (day: number, slot: MealPlanEntry["slot"], recipeId: string) => void;
  setTargets: (t: Partial<NutritionTarget> | null) => void;
  togglePantry: (name: string) => void;
  addRecovery: (r: RecoveryCheckin) => void;
  markSeen: (exerciseId: string) => void;
  importDemo: (data: Partial<State>) => void;
  reset: () => void;
};

const initial: State = {
  hydrated: false,
  profile: null,
  programId: DEFAULT_PROGRAM.id,
  sessions: [],
  weights: [],
  measurements: [],
  meals: [],
  mealPlan: DEFAULT_MEAL_PLAN,
  recovery: [],
  targetsOverride: null,
  pantry: [],
  active: null,
  lastFinished: null,
  seenExercises: [],
};

export const useApp = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      setHydrated: () => set({ hydrated: true }),
      setProfile: (p) => set({ profile: p }),
      patchProfile: (p) => set((s) => (s.profile ? { profile: { ...s.profile, ...p } } : s)),

      startWorkout: (dayId) => {
        const day = getDay(dayId);
        if (!day) return;
        set({
          active: {
            dayId,
            startedAt: Date.now(),
            exIndex: 0,
            setIndex: 0,
            entries: day.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: [] })),
            substitutions: {},
            restEndsAt: null,
            restTotal: 0,
            xp: 0,
            prs: [],
          },
        });
      },

      abortWorkout: () => set({ active: null }),

      logSet: ({ reps, weight, rir, pain }) => {
        const s = get();
        const a = s.active;
        if (!a) return;
        const day = getDay(a.dayId);
        if (!day) return;
        const plan = day.exercises[a.exIndex];
        // Garde-fou : on n'enregistre jamais plus de séries que prévu pour cet exercice.
        if (a.entries[a.exIndex].sets.length >= plan.sets) return;
        const targetId = a.substitutions[plan.exerciseId] ?? plan.exerciseId;
        const entries = a.entries.map((e, i) =>
          i === a.exIndex
            ? {
                ...e,
                exerciseId: targetId,
                substitutedFor: targetId !== plan.exerciseId ? plan.exerciseId : undefined,
                sets: [
                  ...e.sets,
                  { setIndex: e.sets.length, reps, weight, rir, pain, ts: new Date().toISOString() } as SetLog,
                ],
              }
            : e
        );

        const isLastSet = entries[a.exIndex].sets.length >= plan.sets;
        // On avance vers le premier exercice encore incomplet, sinon on reste en place.
        const nextIndex = isLastSet
          ? day.exercises.findIndex((p, i) => i !== a.exIndex && entries[i].sets.length < p.sets && !entries[i].skipped)
          : -1;
        const restSec = plan.restSec;
        set({
          active: {
            ...a,
            entries,
            setIndex: isLastSet ? 0 : entries[a.exIndex].sets.length,
            exIndex: isLastSet && nextIndex >= 0 ? nextIndex : a.exIndex,
            restEndsAt: Date.now() + restSec * 1000,
            restTotal: restSec,
            xp: a.xp + 18 + (isLastSet ? 40 : 0),
          },
        });
      },

      skipRest: () => set((s) => (s.active ? { active: { ...s.active, restEndsAt: null } } : s)),
      addRest: (seconds) =>
        set((s) =>
          s.active && s.active.restEndsAt
            ? { active: { ...s.active, restEndsAt: s.active.restEndsAt + seconds * 1000, restTotal: s.active.restTotal + seconds } }
            : s
        ),

      goToExercise: (index) => set((s) => (s.active ? { active: { ...s.active, exIndex: index, restEndsAt: null } } : s)),

      skipExercise: () =>
        set((s) => {
          if (!s.active) return s;
          const day = getDay(s.active.dayId);
          if (!day) return s;
          const entries = s.active.entries.map((e, i) => (i === s.active!.exIndex ? { ...e, skipped: true } : e));
          return {
            active: {
              ...s.active,
              entries,
              exIndex: Math.min(day.exercises.length - 1, s.active.exIndex + 1),
              restEndsAt: null,
            },
          };
        }),

      substitute: (fromId, toId) =>
        set((s) =>
          s.active
            ? { active: { ...s.active, substitutions: { ...s.active.substitutions, [fromId]: toId } } }
            : s
        ),

      finishWorkout: () => {
        const s = get();
        const a = s.active;
        if (!a) return null;
        const entries = a.entries.filter((e) => e.sets.length > 0);
        if (!entries.length) {
          set({ active: null });
          return null;
        }
        const prs: PersonalRecord[] = [];
        for (const e of entries) {
          const hist = historyFor(s.sessions, e.exerciseId);
          for (const pr of detectPRs(e.exerciseId, e.sets, hist)) {
            prs.push({ exerciseId: e.exerciseId, kind: pr.kind, value: pr.value, reps: pr.reps, date: today() });
          }
        }
        const session: WorkoutSession = {
          id: `s-${Date.now()}`,
          dayId: a.dayId,
          date: new Date().toISOString(),
          durationSec: Math.round((Date.now() - a.startedAt) / 1000),
          entries,
          xp: 0,
          completed: true,
          prs,
        };
        session.xp = sessionXp(session);
        set({ sessions: [...s.sessions, session], active: null, lastFinished: session });
        return session;
      },

      addWeight: (kgValue, date) =>
        set((s) => {
          const d = date ?? today();
          const rest = s.weights.filter((w) => w.date !== d);
          return {
            weights: [...rest, { date: d, kg: kgValue }].sort((a, b) => (a.date < b.date ? -1 : 1)),
            profile: s.profile ? { ...s.profile, weightKg: kgValue } : s.profile,
          };
        }),

      addMeasurement: (m) =>
        set((s) => ({ measurements: [...s.measurements.filter((x) => x.date !== m.date), m].sort((a, b) => (a.date < b.date ? -1 : 1)) })),

      logMeal: (m) => set((s) => ({ meals: [...s.meals, { ...m, id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }] })),
      removeMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

      replacePlanEntry: (day, slot, recipeId) =>
        set((s) => ({
          mealPlan: s.mealPlan.map((e) => (e.day === day && e.slot === slot ? { ...e, recipeId } : e)),
        })),

      setTargets: (t) => set({ targetsOverride: t }),

      togglePantry: (name) =>
        set((s) => ({ pantry: s.pantry.includes(name) ? s.pantry.filter((x) => x !== name) : [...s.pantry, name] })),

      addRecovery: (r) => set((s) => ({ recovery: [...s.recovery.filter((x) => x.date !== r.date), r] })),

      markSeen: (id) => set((s) => (s.seenExercises.includes(id) ? s : { seenExercises: [...s.seenExercises, id] })),

      importDemo: (data) => set({ ...data } as Partial<State>),

      reset: () => set({ ...initial, hydrated: true }),
    }),
    {
      name: "forge-v1",
      storage: createJSONStorage(() => localStorage),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      partialize: ({ hydrated, ...rest }) => rest as unknown as State & Actions,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

/* ---------- Sélecteurs dérivés ---------- */

export function useTargets() {
  const profile = useApp((s) => s.profile);
  const override = useApp((s) => s.targetsOverride);
  if (!profile) return null;
  return { ...computeTargets(profile), ...(override ?? {}) };
}

export function useTotalXp() {
  return useApp((s) => s.sessions.reduce((a, x) => a + x.xp, 0));
}

export function currentPlanExercise(active: ActiveWorkout) {
  const day = getDay(active.dayId);
  if (!day) return null;
  const plan = day.exercises[active.exIndex];
  const id = active.substitutions[plan.exerciseId] ?? plan.exerciseId;
  return { day, plan, exercise: ex(id), original: ex(plan.exerciseId) };
}
