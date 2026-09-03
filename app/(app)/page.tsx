"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Page } from "@/components/AppShell";
import { Badge, Button, Card, cx, SectionTitle } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { Counter, Dots, MacroBar, ProgressRing } from "@/components/ui/progress";
import { Sparkline } from "@/components/charts/Charts";
import { ExerciseFigure } from "@/components/exercise/Figure";
import { useApp, useTargets, useTotalXp } from "@/lib/store";
import { nextDay } from "@/lib/session";
import { ex } from "@/lib/data/exercises";
import { dashboardHeadline, tipOfTheDay } from "@/lib/coach";
import { currentStreak, weeklySessions } from "@/lib/progression";
import { levelFor } from "@/lib/gamification";
import { addMacros, emptyMacros } from "@/lib/nutrition";
import { getRecipe } from "@/lib/data/recipes";
import { greeting, kg, today } from "@/lib/format";

export default function Dashboard() {
  const profile = useApp((s) => s.profile)!;
  const sessions = useApp((s) => s.sessions);
  const weights = useApp((s) => s.weights);
  const meals = useApp((s) => s.meals);
  const mealPlan = useApp((s) => s.mealPlan);
  const active = useApp((s) => s.active);
  const targets = useTargets()!;
  const xp = useTotalXp();

  const day = useMemo(() => nextDay(sessions), [sessions]);
  const week = weeklySessions(sessions).length;
  const streak = currentStreak(sessions);
  const level = levelFor(xp);
  const headline = dashboardHeadline(sessions, weights, profile);
  const tip = tipOfTheDay(sessions, profile, profile.sleepHours);

  const eaten = meals.filter((m) => m.date === today()).reduce((a, m) => addMacros(a, m.macros), emptyMacros());

  const recentPrs = sessions
    .flatMap((s) => s.prs.map((p) => ({ ...p, date: s.date })))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  const weightSeries = weights.slice(-12).map((w) => w.kg);
  const startWeight = weights[0]?.kg ?? profile.weightKg;
  const currentWeight = weights[weights.length - 1]?.kg ?? profile.weightKg;
  const goalProgress =
    profile.targetWeightKg !== startWeight
      ? Math.min(1, Math.max(0, (currentWeight - startWeight) / (profile.targetWeightKg - startWeight)))
      : 1;

  const todayIndex = (new Date().getDay() + 6) % 7;
  const nextMeal = mealPlan.find((m) => m.day === todayIndex && m.slot === "diner");
  const nextRecipe = nextMeal ? getRecipe(nextMeal.recipeId) : undefined;

  return (
    <Page>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-chalk-mute">{greeting()}</p>
          <h1 className="font-display text-[26px] font-extrabold leading-tight">{profile.firstName}</h1>
        </div>
        <Link href="/profil" className="tap flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] px-3 py-2">
          <ProgressRing value={level.progress} size={34} stroke={3.5}>
            <span className="num text-[11px] font-bold">{level.level}</span>
          </ProgressRing>
          <div className="text-left">
            <p className="text-[12px] font-semibold leading-none">{level.name}</p>
            <p className="num mt-0.5 text-[10px] text-chalk-mute">{xp.toLocaleString("fr-FR")} XP</p>
          </div>
        </Link>
      </header>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cx(
          "mb-5 font-display text-[19px] font-bold leading-snug",
          headline.tone === "positif" ? "text-gradient-ember" : "text-chalk"
        )}
      >
        {headline.text}
      </motion.p>

      {/* ---- Prochaine séance ---- */}
      <Card className="relative mb-4 overflow-hidden p-0">
        <div className="pointer-events-none absolute -right-3 -top-3 h-44 w-44 opacity-45">
          <ExerciseFigure media={ex(day.exercises[0].exerciseId).media} accent={day.accent} className="h-full w-full" showTrail={false} />
        </div>
        <div className="relative p-5">
          <div className="flex items-center gap-2">
            <Badge tone={day.accent === "ember" ? "ember" : day.accent === "volt" ? "volt" : "violet"}>
              {active ? "Séance en cours" : "Prochaine séance"}
            </Badge>
            {streak >= 2 && (
              <Badge tone="ember" icon="flame">
                {streak}
              </Badge>
            )}
          </div>
          <h2 className="mt-3 font-display text-[27px] font-extrabold leading-none">{day.name}</h2>
          <p className="mt-1.5 text-[15px] font-semibold text-ember-300">{day.focus}</p>
          <p className="mt-2 flex items-center gap-3 text-[13px] text-chalk-mute">
            <span className="flex items-center gap-1.5">
              <Icon name="clock" size={14} /> {day.estimatedMin} min
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="dumbbell" size={14} /> {day.exercises.length} exercices
            </span>
          </p>

          <div className="mt-5 flex gap-2">
            <Button size="lg" icon="play" href={`/seance/${day.id}`} className="flex-1">
              {active ? "Reprendre" : "Commencer"}
            </Button>
            <Button size="lg" variant="outline" href={`/programme/${day.id}`} aria-label="Voir le détail">
              <Icon name="eye" size={19} />
            </Button>
          </div>
        </div>
      </Card>

      {/* ---- Semaine ---- */}
      <Card className="mb-4 flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Cette semaine</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold">
            <Counter value={week} /> <span className="text-chalk-mute">/ {profile.daysAvailable}</span>
            <span className="ml-1.5 text-sm font-semibold text-chalk-dim">séances</span>
          </p>
        </div>
        <Dots total={profile.daysAvailable} done={week} />
      </Card>

      {/* ---- Poids & objectif ---- */}
      <Card className="mb-4 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Poids actuel</p>
            <p className="mt-1 font-display text-[32px] font-extrabold leading-none">
              <Counter value={currentWeight} decimals={1} from={Math.max(0, currentWeight - 6)} />
              <span className="ml-1 text-base font-semibold text-chalk-dim">kg</span>
            </p>
            <p className="mt-1.5 text-[13px] text-chalk-mute">
              Objectif {kg(profile.targetWeightKg)}
              {currentWeight !== startWeight && (
                <span className={cx("ml-2 font-semibold", currentWeight > startWeight ? "text-volt-400" : "text-chalk-dim")}>
                  {currentWeight > startWeight ? "+" : ""}
                  {(currentWeight - startWeight).toFixed(1).replace(".", ",")} kg
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ProgressRing value={goalProgress} size={68} stroke={7} tone="volt">
              <span className="num text-[13px] font-bold">{Math.round(goalProgress * 100)}%</span>
            </ProgressRing>
            {weightSeries.length > 2 && <Sparkline values={weightSeries} />}
          </div>
        </div>
        <Link href="/projection" className="tap mt-4 flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[.03] px-3.5 py-3 text-[13px] text-chalk-dim">
          <Icon name="target" size={16} className="text-ember-400" />
          <span className="flex-1">Où pourrais-je en être dans 12 semaines ?</span>
          <Icon name="right" size={15} className="text-chalk-mute" />
        </Link>
      </Card>

      {/* ---- Records ---- */}
      {recentPrs.length > 0 && (
        <section className="mb-4">
          <SectionTitle action={<Link href="/progression" className="text-[12px] text-chalk-mute">Tout voir</Link>}>
            Records récents
          </SectionTitle>
          <div className="space-y-2">
            {recentPrs.map((pr, i) => (
              <motion.div
                key={`${pr.exerciseId}-${pr.date}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/progression/${pr.exerciseId}`}
                  className="tap flex items-center gap-3 rounded-2xl border border-white/[.07] bg-white/[.03] px-4 py-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember-500/12 text-ember-300">
                    <Icon name="trophy" size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{ex(pr.exerciseId).shortName ?? ex(pr.exerciseId).name}</p>
                    <p className="text-[12px] text-chalk-mute">
                      {pr.kind === "charge" ? "Nouvelle charge max" : pr.kind === "1rm" ? "Meilleur 1RM estimé" : "Plus de répétitions"}
                    </p>
                  </div>
                  <span className="num text-sm font-bold text-ember-300">
                    {pr.kind === "reps" ? `${pr.value} reps` : kg(pr.value)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Nutrition ---- */}
      <section className="mb-4">
        <SectionTitle action={<Link href="/nutrition" className="text-[12px] text-chalk-mute">Détail</Link>}>
          Nutrition aujourd&apos;hui
        </SectionTitle>
        <Card className="space-y-3.5 p-5">
          <MacroBar label="Calories" value={eaten.kcal} target={targets.kcal} unit="kcal" tone="ember" />
          <MacroBar label="Protéines" value={eaten.prot} target={targets.prot} unit="g" tone="volt" />
          {nextRecipe && (
            <Link
              href={`/nutrition/recettes/${nextRecipe.slug}`}
              className="tap mt-1 flex items-center gap-3 rounded-2xl border border-white/[.07] bg-white/[.03] px-3.5 py-3"
            >
              <span className="text-xl">{nextRecipe.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-chalk-mute">Dîner prévu</p>
                <p className="truncate text-[13.5px] font-semibold">{nextRecipe.name}</p>
              </div>
              <span className="num text-[12px] text-chalk-mute">{nextRecipe.macros.kcal} kcal</span>
            </Link>
          )}
        </Card>
      </section>

      {/* ---- Conseil ---- */}
      <Card className="flex gap-3 p-4">
        <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tip.tone === "attention" ? "bg-ember-500/12 text-ember-300" : "bg-white/[.05] text-chalk-dim")}>
          <Icon name={tip.tone === "attention" ? "alert" : "spark"} size={17} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Conseil du jour</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-chalk-dim">{tip.text}</p>
        </div>
      </Card>
    </Page>
  );
}
