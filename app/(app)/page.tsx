"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Page } from "@/components/AppShell";
import { Badge, Button, Card, cx } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { Counter, Dots, MacroBar } from "@/components/ui/progress";
import { Sparkline } from "@/components/charts/Charts";
import { ExerciseMedia } from "@/components/exercise/ExerciseMedia";
import { useApp, useTargets } from "@/lib/store";
import { dayForToday, doneThisWeek, upcomingDay, whenWords } from "@/lib/session";
import { adaptationLabel } from "@/lib/data/program";
import { ex } from "@/lib/data/exercises";
import { SLOTS, getRecipe } from "@/lib/data/recipes";
import { addMacros, calorieAdjustment, emptyMacros, weightTrend } from "@/lib/nutrition";
import { historyFor, workingWeight } from "@/lib/progression";
import { weeksSince } from "@/lib/projection";
import { greeting, kg, nf, today } from "@/lib/format";

export default function Dashboard() {
  const profile = useApp((s) => s.profile)!;
  const sessions = useApp((s) => s.sessions);
  const weights = useApp((s) => s.weights);
  const meals = useApp((s) => s.meals);
  const mealPlan = useApp((s) => s.mealPlan);
  const creatine = useApp((s) => s.creatine);
  const toggleCreatine = useApp((s) => s.toggleCreatine);
  const active = useApp((s) => s.active);
  const targets = useTargets()!;

  const todayDay = dayForToday();
  const upcoming = upcomingDay();
  const week = weeksSince(profile.createdAt) + 1;
  const adaptation = adaptationLabel(week);
  const doneWeek = doneThisWeek(sessions).length;

  const trend = useMemo(() => weightTrend(weights), [weights]);
  const adjustment = useMemo(() => calorieAdjustment(weights, profile), [weights, profile]);

  const dayMeals = meals.filter((m) => m.date === today());
  const eaten = dayMeals.reduce((a, m) => addMacros(a, m.macros), emptyMacros());
  const todayIdx = (new Date().getDay() + 6) % 7;
  const plannedToday = mealPlan.filter((m) => m.day === todayIdx);
  const creatineTaken = creatine.includes(today());

  const startWeight = weights[0]?.kg ?? profile.weightKg;
  const currentWeight = trend.latest ?? profile.weightKg;

  const pullUpHistory = historyFor(sessions, "assisted-pull-up");
  const benchHistory = historyFor(sessions, "bench-press");

  const sessionInProgress = active && active.dayId === upcoming.day.id;

  return (
    <Page>
      <header className="mb-5">
        <p className="text-[13px] text-chalk-mute">{greeting()}</p>
        <h1 className="font-display text-[26px] font-extrabold leading-tight">{profile.firstName}</h1>
        {adaptation && (
          <span className="mt-2 inline-block">
            <Badge tone="ember">{adaptation}</Badge>
          </span>
        )}
      </header>

      {/* ---- Aujourd'hui ---- */}
      <Card className="relative mb-4 overflow-hidden p-0">
        {todayDay ? (
          <>
            <div className="pointer-events-none absolute -right-3 -top-3 h-40 w-40 opacity-40">
              <ExerciseMedia exercise={ex(todayDay.exercises[0].exerciseId)} accent={todayDay.accent} className="h-full w-full" frame={0.5} />
            </div>
            <div className="relative p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">Aujourd&apos;hui</p>
              <h2 className="mt-1.5 font-display text-[26px] font-extrabold leading-none">{todayDay.name}</h2>
              <p className="mt-1.5 text-[15px] font-semibold text-ember-300">{todayDay.focus}</p>
              <p className="mt-2 flex items-center gap-3 text-[13px] text-chalk-mute">
                <span className="flex items-center gap-1.5">
                  <Icon name="clock" size={14} /> {todayDay.estimatedMin} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="dumbbell" size={14} /> {todayDay.exercises.length} exercices
                </span>
              </p>
              <Button size="xl" full icon="play" href={`/seance/${todayDay.id}`} className="mt-5">
                {sessionInProgress ? "Reprendre ma séance" : "Commencer ma séance"}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">Aujourd&apos;hui</p>
            <h2 className="mt-1.5 font-display text-[26px] font-extrabold leading-none">Repos</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-chalk-dim">
              Rien à faire à la salle. Le muscle se construit pendant les jours de repos, pas pendant la séance.
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3">
              <Icon name="calendar" size={17} className="text-ember-400" />
              <div className="flex-1">
                <p className="text-[12px] text-chalk-mute">Prochaine séance</p>
                <p className="text-[14px] font-semibold">
                  {whenWords(upcoming.inDays, upcoming.day.weekday)} — {upcoming.day.name} {upcoming.day.focus}
                </p>
              </div>
            </div>
            <Button variant="outline" full className="mt-3" href={`/seance/${upcoming.day.id}`}>
              Voir la séance en avance
            </Button>
          </div>
        )}
      </Card>

      {/* ---- Semaine ---- */}
      <Card className="mb-4 flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Cette semaine</p>
          <p className="mt-1.5 font-display text-2xl font-extrabold">
            <Counter value={doneWeek} /> <span className="text-chalk-mute">/ 4</span>
            <span className="ml-1.5 text-sm font-semibold text-chalk-dim">séances</span>
          </p>
        </div>
        <Dots total={4} done={doneWeek} />
      </Card>

      {/* ---- Poids ---- */}
      <Card className="mb-4 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Poids</p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="font-display text-[34px] font-extrabold leading-none">
              <Counter value={currentWeight} decimals={1} from={Math.max(0, currentWeight - 4)} />
              <span className="ml-1 text-base font-semibold text-chalk-dim">kg</span>
            </p>
            <p className="mt-1 text-[12.5px] text-chalk-mute">aujourd&apos;hui</p>
          </div>
          {weights.length > 2 && <Sparkline values={weights.slice(-14).map((w) => w.kg)} />}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[.06] pt-4 text-center">
          {[
            { l: "Moyenne 7 jours", v: trend.avg7 !== null ? `${nf(trend.avg7, 1)} kg` : "—", strong: true },
            { l: "Au départ", v: `${nf(startWeight, 1)} kg` },
            { l: "Objectif", v: `${nf(profile.targetWeightKg, 0)} kg` },
          ].map((s) => (
            <div key={s.l}>
              <p className={cx("num font-display font-bold", s.strong ? "text-[19px] text-gradient-ember" : "text-[17px]")}>
                {s.v}
              </p>
              <p className="mt-0.5 text-[10.5px] leading-tight text-chalk-mute">{s.l}</p>
            </div>
          ))}
        </div>

        {trend.weeklyDeltaKg !== null && (
          <p className="mt-3 text-[12.5px] text-chalk-mute">
            {trend.weeklyDeltaKg > 0 ? "+" : ""}
            {nf(trend.weeklyDeltaKg, 2)} kg sur la dernière semaine. C&apos;est la moyenne qui compte, pas la pesée du
            jour.
          </p>
        )}
        {adjustment.reason && (
          <p
            className={cx(
              "mt-3 rounded-2xl border px-3.5 py-3 text-[13px] leading-relaxed",
              adjustment.actionable
                ? "border-ember-500/25 bg-ember-500/[.07] text-ember-300/90"
                : "border-white/8 bg-white/[.03] text-chalk-dim"
            )}
          >
            {adjustment.reason}
          </p>
        )}
        <Link
          href="/progression"
          className="tap mt-3 flex items-center gap-2 text-[12.5px] text-chalk-mute hover:text-chalk-dim"
        >
          <Icon name="chart" size={14} /> Voir toutes mes courbes
          <Icon name="right" size={13} className="ml-auto" />
        </Link>
      </Card>

      {/* ---- Nutrition du jour ---- */}
      <Card className="mb-4 p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Aujourd&apos;hui</p>
          <Link href="/nutrition" className="text-[12px] text-chalk-mute">
            Détail
          </Link>
        </div>
        <div className="space-y-3">
          <MacroBar label="Calories" value={eaten.kcal} target={targets.kcal} unit="kcal" tone="ember" />
          <MacroBar label="Protéines" value={eaten.prot} target={targets.prot} unit="g" tone="volt" />
        </div>

        <div className="mt-4 space-y-1.5">
          {SLOTS.map((slot) => {
            const entry = plannedToday.find((m) => m.slot === slot.id);
            const r = entry ? getRecipe(entry.recipeId) : null;
            const eatenIt = r ? dayMeals.some((m) => m.recipeId === r.id) : false;
            return (
              <Link
                key={slot.id}
                href="/nutrition"
                className="tap flex items-center gap-2.5 rounded-xl px-1 py-1.5"
              >
                <span
                  className={cx(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                    eatenIt ? "border-volt-500 bg-volt-500 text-ink-950" : "border-white/20"
                  )}
                >
                  {eatenIt && <Icon name="check" size={12} strokeWidth={3} />}
                </span>
                <span className={cx("text-[13px]", eatenIt ? "text-chalk-mute line-through" : "text-chalk-dim")}>
                  {slot.label}
                </span>
                <span className="ml-auto truncate text-[12px] text-chalk-mute">{r?.name}</span>
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => toggleCreatine()}
          className={cx(
            "tap mt-4 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
            creatineTaken ? "border-volt-500/40 bg-volt-500/[.08]" : "border-white/10 bg-white/[.03]"
          )}
        >
          <span
            className={cx(
              "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
              creatineTaken ? "bg-volt-500 text-ink-950" : "bg-white/[.06] text-chalk-mute"
            )}
          >
            <Icon name={creatineTaken ? "check" : "plus"} size={16} strokeWidth={2.4} />
          </span>
          <div className="flex-1">
            <p className="text-[13.5px] font-semibold">5 g de créatine</p>
            <p className="text-[11.5px] text-chalk-mute">
              {creatineTaken ? "Prise aujourd'hui" : "N'importe quand dans la journée, avec un repas"}
            </p>
          </div>
        </button>
      </Card>

      {/* ---- Progression ---- */}
      {(pullUpHistory.length > 0 || benchHistory.length > 0) && (
        <Card className="p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Où tu en es</p>
          <div className="space-y-3">
            {benchHistory.length > 0 && (
              <Row
                label="Développé couché"
                value={`${nf(workingWeight(benchHistory[0].sets), 1)} kg`}
                start={`${nf(workingWeight(benchHistory[benchHistory.length - 1].sets), 1)} kg au départ`}
                href="/progression/bench-press"
              />
            )}
            {pullUpHistory.length > 0 && (
              <Row
                label="Tractions assistées"
                value={`${Math.max(...pullUpHistory[0].sets.map((s) => s.reps))} reps`}
                start={`${Math.max(...pullUpHistory[pullUpHistory.length - 1].sets.map((s) => s.reps))} au départ`}
                href="/progression/assisted-pull-up"
              />
            )}
          </div>
        </Card>
      )}
    </Page>
  );
}

function Row({ label, value, start, href }: { label: string; value: string; start: string; href: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
      <Link href={href} className="tap flex items-center gap-3 rounded-2xl border border-white/[.06] bg-white/[.02] px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold">{label}</p>
          <p className="text-[11.5px] text-chalk-mute">{start}</p>
        </div>
        <span className="num text-[15px] font-bold text-ember-300">{value}</span>
        <Icon name="right" size={15} className="text-chalk-mute" />
      </Link>
    </motion.div>
  );
}
