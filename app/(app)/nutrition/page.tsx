"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { Button, Card, cx, InfoNote, Sheet } from "@/components/ui/primitives";
import { Counter, MacroBar, ProgressRing } from "@/components/ui/progress";
import { useApp, useTargets } from "@/lib/store";
import { FIXED_MEALS, SLOTS, getRecipe } from "@/lib/data/recipes";
import { addMacros, calorieAdjustment, emptyMacros, remainingToday, scaleMacros } from "@/lib/nutrition";
import { SAFETY } from "@/lib/copy";
import { nf, today } from "@/lib/format";

export default function NutritionPage() {
  const profile = useApp((s) => s.profile)!;
  const meals = useApp((s) => s.meals);
  const mealPlan = useApp((s) => s.mealPlan);
  const weights = useApp((s) => s.weights);
  const creatine = useApp((s) => s.creatine);
  const logMeal = useApp((s) => s.logMeal);
  const removeMeal = useApp((s) => s.removeMeal);
  const toggleCreatine = useApp((s) => s.toggleCreatine);
  const targets = useTargets()!;
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);

  const dayMeals = meals.filter((m) => m.date === today());
  const eaten = dayMeals.reduce((a, m) => addMacros(a, m.macros), emptyMacros());
  const todayIdx = (new Date().getDay() + 6) % 7;
  const planned = mealPlan.filter((m) => m.day === todayIdx);
  const left = remainingToday(targets, eaten);
  const adjustment = useMemo(() => calorieAdjustment(weights, profile), [weights, profile]);
  const creatineTaken = creatine.includes(today());

  const recipe = openRecipe ? getRecipe(openRecipe) : null;
  const catchUp = getRecipe("quick-smoothie")!;
  const catchUpServings = Math.min(2, Math.max(0.5, Math.round((left.kcal / catchUp.macros.kcal) * 2) / 2));

  return (
    <Page>
      <TopBar title="Ce que je mange" subtitle={`Objectif : ${targets.kcal} kcal et au moins ${targets.prot} g de protéines`} />

      {/* Compteur du jour */}
      <Card className="mb-4 p-5">
        <div className="flex items-center gap-5">
          <ProgressRing value={targets.kcal ? eaten.kcal / targets.kcal : 0} size={104} stroke={10}>
            <div className="text-center">
              <p className="num font-display text-xl font-extrabold leading-none">
                <Counter value={Math.round(eaten.kcal)} />
              </p>
              <p className="text-[10px] text-chalk-mute">sur {targets.kcal}</p>
            </div>
          </ProgressRing>
          <div className="flex-1 space-y-3">
            <MacroBar label="Calories" value={eaten.kcal} target={targets.kcal} unit="kcal" tone="ember" />
            <MacroBar label="Protéines" value={eaten.prot} target={targets.prot} unit="g" tone="volt" />
            <MacroBar label="Glucides" value={eaten.carbs} target={targets.carbs} unit="g" tone="cyan" />
          </div>
        </div>
        {left.kcal > 0 ? (
          <p className="mt-4 text-[13.5px] text-chalk-dim">
            Il te reste <span className="font-semibold text-chalk">{left.kcal} kcal</span>
            {left.prot > 0 && (
              <>
                {" "}
                et <span className="font-semibold text-chalk">{left.prot} g de protéines</span>
              </>
            )}{" "}
            à manger aujourd&apos;hui.
          </p>
        ) : (
          <p className="mt-4 text-[13.5px] text-volt-400">Objectif du jour atteint.</p>
        )}
      </Card>

      {/* Rattrapage de fin de journée */}
      {left.short && new Date().getHours() >= 17 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-4 border-ember-500/25 bg-ember-500/[.06] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember-300">Fin de journée</p>
            <p className="mt-1.5 text-[15px] font-semibold">Il te manque environ {left.kcal} kcal.</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-chalk-dim">
              Le plus simple : un {catchUp.name.toLowerCase()}, en {catchUpServings === 1 ? "une portion" : `${nf(catchUpServings, 1)} portions`}.
            </p>
            <div className="mt-3 space-y-1">
              {catchUp.ingredients.map((ing) => (
                <div key={ing.name} className="flex justify-between text-[13px]">
                  <span className="text-chalk-dim">{ing.name}</span>
                  <span className="num text-chalk-mute">
                    {Math.round(ing.qty * catchUpServings * 10) / 10} {ing.unit === "u" ? "" : ing.unit}
                  </span>
                </div>
              ))}
            </div>
            <Button
              full
              size="lg"
              icon="plus"
              className="mt-4"
              onClick={() =>
                logMeal({
                  date: today(),
                  recipeId: catchUp.id,
                  label: catchUp.name,
                  macros: scaleMacros(catchUp.macros, catchUpServings),
                })
              }
            >
              Je l&apos;ai bu
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Repas du jour */}
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">Les repas d&apos;aujourd&apos;hui</p>
      <div className="mb-4 space-y-2.5">
        {SLOTS.map((slot) => {
          const entry = planned.find((m) => m.slot === slot.id);
          const r = entry ? getRecipe(entry.recipeId) : null;
          if (!r) return null;
          const already = dayMeals.find((m) => m.recipeId === r.id);
          return (
            <Card key={slot.id} className={cx("overflow-hidden p-0", already && "opacity-60")}>
              <button onClick={() => setOpenRecipe(r.id)} className="tap flex w-full items-center gap-3 p-3 text-left">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
                  style={{ background: `linear-gradient(135deg, ${r.gradient[0]}44, ${r.gradient[1]}22)` }}
                >
                  {r.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] uppercase tracking-wider text-chalk-mute">
                    {slot.label} · {slot.when}
                  </p>
                  <p className="truncate text-[15px] font-semibold">{r.name}</p>
                  <p className="num text-[12px] text-chalk-mute">
                    {r.macros.kcal} kcal · {r.macros.prot} g de protéines · {r.minutes} min
                  </p>
                </div>
                <Icon name="right" size={16} className="shrink-0 text-chalk-mute" />
              </button>
              <button
                onClick={() =>
                  already
                    ? removeMeal(already.id)
                    : logMeal({ date: today(), recipeId: r.id, label: r.name, macros: r.macros })
                }
                className={cx(
                  "tap flex w-full items-center justify-center gap-2 border-t border-white/[.06] py-3 text-[13.5px] font-semibold transition",
                  already ? "text-volt-400" : "text-ember-300"
                )}
              >
                <Icon name={already ? "check" : "plus"} size={16} />
                {already ? "Mangé" : "J'ai mangé ce repas"}
              </button>
            </Card>
          );
        })}
      </div>

      {/* Créatine */}
      <button
        onClick={() => toggleCreatine()}
        className={cx(
          "tap mb-4 flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition",
          creatineTaken ? "border-volt-500/40 bg-volt-500/[.08]" : "border-white/10 bg-white/[.03]"
        )}
      >
        <span
          className={cx(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            creatineTaken ? "bg-volt-500 text-ink-950" : "bg-white/[.06] text-chalk-mute"
          )}
        >
          <Icon name={creatineTaken ? "check" : "plus"} size={17} strokeWidth={2.4} />
        </span>
        <div className="flex-1">
          <p className="text-[14px] font-semibold">5 g de créatine monohydrate</p>
          <p className="text-[12px] text-chalk-mute">
            Tu peux la prendre avec n&apos;importe quel repas. L&apos;important est d&apos;en prendre tous les jours.
          </p>
        </div>
      </button>

      {/* Journal */}
      {dayMeals.length > 0 && (
        <>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">Déjà mangé</p>
          <Card className="mb-4 divide-y divide-white/[.05] p-0">
            {dayMeals.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-1 truncate text-[13.5px]">{m.label}</span>
                <span className="num text-[12px] text-chalk-mute">{Math.round(m.macros.kcal)} kcal</span>
                <button onClick={() => removeMeal(m.id)} className="tap text-chalk-mute hover:text-danger" aria-label="Retirer">
                  <Icon name="x" size={15} />
                </button>
              </div>
            ))}
          </Card>
        </>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { href: "/nutrition/recettes", icon: "chef", label: "Recettes" },
          { href: "/nutrition/plan", icon: "calendar", label: "Semaine" },
          { href: "/nutrition/courses", icon: "cart", label: "Courses" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="tap">
            <Card className="flex flex-col items-center gap-2 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ember-500/12 text-ember-300">
                <Icon name={l.icon} size={19} />
              </span>
              <span className="text-[12px] font-semibold">{l.label}</span>
            </Card>
          </Link>
        ))}
      </div>

      {adjustment.reason && <InfoNote tone={adjustment.actionable ? "warn" : "neutral"}>{adjustment.reason}</InfoNote>}
      <div className="mt-3">
        <InfoNote>{SAFETY.nutritionDisclaimer}</InfoNote>
      </div>

      {/* Fiche recette */}
      <Sheet open={!!recipe} onClose={() => setOpenRecipe(null)} title={recipe?.name}>
        {recipe && (
          <div className="space-y-4 pb-4">
            <div
              className="flex h-28 items-center justify-center rounded-2xl text-5xl"
              style={{ background: `linear-gradient(140deg, ${recipe.gradient[0]}44, ${recipe.gradient[1]}22)` }}
            >
              {recipe.emoji}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { l: "kcal", v: recipe.macros.kcal },
                { l: "Protéines", v: `${recipe.macros.prot} g` },
                { l: "Préparation", v: `${recipe.minutes} min` },
              ].map((m) => (
                <div key={m.l} className="rounded-2xl bg-white/[.04] py-3">
                  <p className="num font-display text-[17px] font-bold">{m.v}</p>
                  <p className="text-[10.5px] text-chalk-mute">{m.l}</p>
                </div>
              ))}
            </div>

            {FIXED_MEALS[recipe.id] && (
              <p className="rounded-2xl border border-ember-500/25 bg-ember-500/[.07] px-4 py-3 text-[13.5px] font-semibold text-ember-300/90">
                {FIXED_MEALS[recipe.id]}
              </p>
            )}

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-chalk-mute">Ce qu&apos;il te faut</p>
              <div className="divide-y divide-white/[.05] rounded-2xl border border-white/8">
                {recipe.ingredients.map((ing) => (
                  <div key={ing.name} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[13.5px]">{ing.name}</span>
                    <span className="num text-[13px] font-semibold text-chalk-dim">
                      {ing.qty} {ing.unit === "u" ? "" : ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-chalk-mute">Préparation</p>
              <ol className="space-y-2.5">
                {recipe.steps.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-ember-500/15 text-[12px] font-bold text-ember-300">
                      {i + 1}
                    </span>
                    <span className="text-[14px] leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[12.5px] text-chalk-mute">{recipe.storage}</p>

            <Button
              full
              size="lg"
              icon="check"
              onClick={() => {
                logMeal({ date: today(), recipeId: recipe.id, label: recipe.name, macros: recipe.macros });
                setOpenRecipe(null);
              }}
            >
              J&apos;ai mangé ce repas
            </Button>
          </div>
        )}
      </Sheet>
    </Page>
  );
}
