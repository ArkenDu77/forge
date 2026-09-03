"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { Button, Card, cx, InfoNote, Sheet } from "@/components/ui/primitives";
import { useApp, useTargets } from "@/lib/store";
import { RECIPES, SLOTS, getRecipe } from "@/lib/data/recipes";
import { addMacros, emptyMacros, isRecipeAllowed } from "@/lib/nutrition";
import { eur, WEEKDAYS } from "@/lib/format";
import type { MealPlanEntry } from "@/lib/types";

export default function PlanPage() {
  const profile = useApp((s) => s.profile)!;
  const mealPlan = useApp((s) => s.mealPlan);
  const replacePlanEntry = useApp((s) => s.replacePlanEntry);
  const targets = useTargets()!;
  const todayIndex = (new Date().getDay() + 6) % 7;
  const [day, setDay] = useState(todayIndex);
  const [swap, setSwap] = useState<{ day: number; slot: MealPlanEntry["slot"]; current: string } | null>(null);

  const entries = mealPlan.filter((m) => m.day === day);
  const totals = entries.reduce((a, e) => {
    const r = getRecipe(e.recipeId);
    return r ? addMacros(a, r.macros, e.servings) : a;
  }, emptyMacros());
  const cost = entries.reduce((a, e) => a + (getRecipe(e.recipeId)?.costPerServing ?? 0) * e.servings, 0);

  const alternatives = swap
    ? RECIPES.filter(
        (r) => r.slot.includes(swap.slot) && r.id !== swap.current && isRecipeAllowed(r, profile)
      )
    : [];

  return (
    <Page>
      <TopBar title="Semaine type" subtitle="Un menu par jour, ajustable en un geste" back="/nutrition" />

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {WEEKDAYS.map((d, i) => (
          <button
            key={d}
            onClick={() => setDay(i)}
            className={cx(
              "tap flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border transition-all",
              day === i ? "border-ember-500/60 bg-ember-500/[.10]" : "border-white/10 bg-white/[.03]"
            )}
          >
            <span className={cx("text-[11px] font-semibold", day === i ? "text-ember-300" : "text-chalk-mute")}>
              {d.slice(0, 3)}
            </span>
            {i === todayIndex && <span className="mt-1 h-1 w-1 rounded-full bg-ember-400" />}
          </button>
        ))}
      </div>

      <div className="mb-4 space-y-2.5">
        {SLOTS.map((slot) => {
          const entry = entries.find((e) => e.slot === slot.id);
          const r = entry ? getRecipe(entry.recipeId) : null;
          if (!r || !entry) return null;
          return (
            <motion.div key={slot.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="flex items-center gap-3 p-3">
                <Link href={`/nutrition/recettes/${r.slug}`} className="tap flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
                    style={{ background: `linear-gradient(135deg, ${r.gradient[0]}44, ${r.gradient[1]}22)` }}
                  >
                    {r.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10.5px] uppercase tracking-wider text-chalk-mute">{slot.label}</p>
                    <p className="truncate text-[14px] font-semibold">{r.name}</p>
                    <p className="num text-[11.5px] text-chalk-mute">
                      {Math.round(r.macros.kcal * entry.servings)} kcal · {Math.round(r.macros.prot * entry.servings)} g prot. ·{" "}
                      {eur(r.costPerServing * entry.servings)}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => setSwap({ day, slot: slot.id, current: r.id })}
                  className="tap grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[.06] text-chalk-dim"
                  aria-label="Remplacer ce repas"
                >
                  <Icon name="swap" size={17} />
                </button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="mb-4 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Total du jour</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { l: "kcal", v: Math.round(totals.kcal), target: targets.kcal },
            { l: "Prot.", v: `${Math.round(totals.prot)} g`, target: `${targets.prot} g` },
            { l: "Gluc.", v: `${Math.round(totals.carbs)} g`, target: `${targets.carbs} g` },
            { l: "Coût", v: eur(cost) },
          ].map((m) => (
            <div key={m.l} className="rounded-2xl bg-white/[.04] py-3">
              <p className="num font-display text-[16px] font-bold">{m.v}</p>
              <p className="text-[10.5px] text-chalk-mute">{m.l}</p>
              {m.target && <p className="num text-[9.5px] text-chalk-mute/70">cible {m.target}</p>}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-chalk-mute">
          {totals.kcal < targets.kcal - 200
            ? `Il manque environ ${Math.round(targets.kcal - totals.kcal)} kcal : ajoute un snack calorique.`
            : totals.kcal > targets.kcal + 250
              ? "Journée un peu au-dessus de la cible : réduis une portion si tu ne t'entraînes pas."
              : "Journée cohérente avec ta cible."}
        </p>
      </Card>

      <InfoNote>
        Tu n&apos;aimes pas un repas ? Remplace-le : Forge propose uniquement des alternatives du même créneau,
        compatibles avec ton régime et tes allergies.
      </InfoNote>

      <Button href="/nutrition/courses" full size="lg" icon="cart" className="mt-4">
        Générer la liste de courses
      </Button>

      <Sheet open={!!swap} onClose={() => setSwap(null)} title="Remplacer ce repas">
        <div className="space-y-2 pb-4">
          {alternatives.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                if (swap) replacePlanEntry(swap.day, swap.slot, r.id);
                setSwap(null);
              }}
              className="tap flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-3 text-left"
            >
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl"
                style={{ background: `linear-gradient(135deg, ${r.gradient[0]}44, ${r.gradient[1]}22)` }}
              >
                {r.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">{r.name}</p>
                <p className="num text-[11.5px] text-chalk-mute">
                  {r.macros.kcal} kcal · {r.macros.prot} g · {eur(r.costPerServing)}
                </p>
              </div>
              <Icon name="right" size={16} className="text-chalk-mute" />
            </button>
          ))}
          {alternatives.length === 0 && (
            <p className="py-6 text-center text-sm text-chalk-mute">Aucune alternative disponible pour ce créneau.</p>
          )}
        </div>
      </Sheet>
    </Page>
  );
}
