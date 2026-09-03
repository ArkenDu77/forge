"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { Button, Card, cx, InfoNote, SectionTitle, Sheet } from "@/components/ui/primitives";
import { Counter, MacroBar, ProgressRing } from "@/components/ui/progress";
import { useApp, useTargets } from "@/lib/store";
import { addMacros, emptyMacros, weeklyWeightDelta } from "@/lib/nutrition";
import { getRecipe } from "@/lib/data/recipes";
import { SLOTS } from "@/lib/data/recipes";
import { SAFETY } from "@/lib/copy";
import { today } from "@/lib/format";

export default function NutritionPage() {
  const profile = useApp((s) => s.profile)!;
  const meals = useApp((s) => s.meals);
  const mealPlan = useApp((s) => s.mealPlan);
  const logMeal = useApp((s) => s.logMeal);
  const removeMeal = useApp((s) => s.removeMeal);
  const setTargets = useApp((s) => s.setTargets);
  const targets = useTargets()!;
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [draftKcal, setDraftKcal] = useState(targets.kcal);
  const [draftProt, setDraftProt] = useState(targets.prot);

  const dayMeals = meals.filter((m) => m.date === today());
  const eaten = dayMeals.reduce((a, m) => addMacros(a, m.macros), emptyMacros());
  const todayIndex = (new Date().getDay() + 6) % 7;
  const plannedToday = mealPlan.filter((m) => m.day === todayIndex);
  const kcalRatio = targets.kcal ? eaten.kcal / targets.kcal : 0;

  return (
    <Page>
      <TopBar
        title="Nutrition"
        subtitle={`Objectif ${targets.kcal} kcal · ${targets.prot} g de protéines`}
        action={
          <button onClick={() => setAdjustOpen(true)} className="tap grid h-10 w-10 place-items-center rounded-2xl border border-white/10 text-chalk-dim" aria-label="Ajuster">
            <Icon name="settings" size={18} />
          </button>
        }
      />

      <Card className="mb-4 p-5">
        <div className="flex items-center gap-5">
          <ProgressRing value={kcalRatio} size={104} stroke={10} tone={kcalRatio > 1.08 ? "violet" : "ember"}>
            <div className="text-center">
              <p className="num font-display text-xl font-extrabold leading-none">
                <Counter value={Math.round(eaten.kcal)} />
              </p>
              <p className="text-[10px] text-chalk-mute">/ {targets.kcal}</p>
            </div>
          </ProgressRing>
          <div className="flex-1 space-y-3">
            <MacroBar label="Protéines" value={eaten.prot} target={targets.prot} unit="g" tone="volt" />
            <MacroBar label="Glucides" value={eaten.carbs} target={targets.carbs} unit="g" tone="cyan" />
            <MacroBar label="Lipides" value={eaten.fat} target={targets.fat} unit="g" tone="violet" />
          </div>
        </div>
        <p className="mt-4 text-[12px] text-chalk-mute">
          Maintenance estimée {targets.maintenance} kcal · {targets.surplus >= 0 ? "surplus" : "déficit"} de{" "}
          {Math.abs(targets.surplus)} kcal ≈ {weeklyWeightDelta(targets.surplus) > 0 ? "+" : ""}
          {weeklyWeightDelta(targets.surplus).toFixed(2).replace(".", ",")} kg par semaine.
        </p>
      </Card>

      <div className="mb-5 grid grid-cols-3 gap-2">
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

      <SectionTitle>Prévu aujourd&apos;hui</SectionTitle>
      <div className="mb-5 space-y-2">
        {plannedToday.map((entry) => {
          const r = getRecipe(entry.recipeId);
          if (!r) return null;
          const already = dayMeals.some((m) => m.recipeId === r.id);
          return (
            <motion.div key={entry.slot} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={cx("flex items-center gap-3 p-3", already && "opacity-60")}>
                <Link href={`/nutrition/recettes/${r.slug}`} className="tap flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl"
                    style={{ background: `linear-gradient(135deg, ${r.gradient[0]}33, ${r.gradient[1]}22)` }}
                  >
                    {r.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10.5px] uppercase tracking-wider text-chalk-mute">
                      {SLOTS.find((s) => s.id === entry.slot)?.label}
                    </p>
                    <p className="truncate text-[14px] font-semibold">{r.name}</p>
                    <p className="num text-[11.5px] text-chalk-mute">
                      {r.macros.kcal} kcal · {r.macros.prot} g prot.
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() =>
                    already
                      ? removeMeal(dayMeals.find((m) => m.recipeId === r.id)!.id)
                      : logMeal({ date: today(), recipeId: r.id, label: r.name, macros: r.macros })
                  }
                  className={cx(
                    "tap grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition",
                    already ? "bg-volt-500/15 text-volt-400" : "bg-ember-500/15 text-ember-300"
                  )}
                  aria-label={already ? "Retirer du journal" : "Ajouter à ma journée"}
                >
                  <Icon name={already ? "check" : "plus"} size={18} />
                </button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {dayMeals.length > 0 && (
        <>
          <SectionTitle>Journal du jour</SectionTitle>
          <Card className="mb-5 divide-y divide-white/[.05] p-0">
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

      <InfoNote>{SAFETY.nutritionDisclaimer}</InfoNote>

      <Sheet open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Ajuster mes objectifs">
        <div className="space-y-4 pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px]">Calories</span>
              <span className="num font-display text-xl font-bold">{draftKcal} kcal</span>
            </div>
            <input
              type="range"
              min={Math.round(targets.maintenance * 0.7)}
              max={Math.round(targets.maintenance * 1.35)}
              step={10}
              value={draftKcal}
              onChange={(e) => setDraftKcal(Number(e.target.value))}
              className="mt-3 h-1.5 w-full appearance-none rounded-full bg-white/10 accent-[#ff6b2c]"
            />
            <p className="mt-2 text-[11.5px] text-chalk-mute">
              Maintenance estimée : {targets.maintenance} kcal ({draftKcal - targets.maintenance >= 0 ? "+" : ""}
              {draftKcal - targets.maintenance} kcal)
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px]">Protéines</span>
              <span className="num font-display text-xl font-bold">{draftProt} g</span>
            </div>
            <input
              type="range"
              min={Math.round(profile.weightKg * 1.2)}
              max={Math.round(profile.weightKg * 2.6)}
              step={5}
              value={draftProt}
              onChange={(e) => setDraftProt(Number(e.target.value))}
              className="mt-3 h-1.5 w-full appearance-none rounded-full bg-white/10 accent-[#ff6b2c]"
            />
            <p className="mt-2 text-[11.5px] text-chalk-mute">
              {(draftProt / profile.weightKg).toFixed(1).replace(".", ",")} g par kg de poids de corps
            </p>
          </div>
          <InfoNote tone="warn">{SAFETY.nutritionDisclaimer}</InfoNote>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setTargets(null);
                setAdjustOpen(false);
              }}
            >
              Réinitialiser
            </Button>
            <Button
              full
              size="lg"
              icon="check"
              onClick={() => {
                const carbs = Math.max(60, Math.round((draftKcal - draftProt * 4 - targets.fat * 9) / 4));
                setTargets({ kcal: draftKcal, prot: draftProt, carbs });
                setAdjustOpen(false);
              }}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </Sheet>
    </Page>
  );
}
