"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { Card, Chip, cx, InfoNote, SectionTitle } from "@/components/ui/primitives";
import { Counter, ProgressBar } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { AISLES, BUDGET_TIERS, buildShoppingList, formatQty } from "@/lib/shopping";
import { eur } from "@/lib/format";

export default function CoursesPage() {
  const profile = useApp((s) => s.profile)!;
  const mealPlan = useApp((s) => s.mealPlan);
  const pantry = useApp((s) => s.pantry);
  const togglePantry = useApp((s) => s.togglePantry);
  const patchProfile = useApp((s) => s.patchProfile);

  const lines = useMemo(() => buildShoppingList(mealPlan), [mealPlan]);
  const weekTotal = lines.reduce((a, l) => a + l.cost, 0);
  const remaining = lines.filter((l) => !pantry.includes(l.name)).reduce((a, l) => a + l.cost, 0);
  const monthly = weekTotal * 4.33;
  const budgetRatio = profile.monthlyFoodBudget ? monthly / profile.monthlyFoodBudget : 0;

  return (
    <Page>
      <TopBar title="Courses & budget" subtitle="Généré à partir de ta semaine type" back="/nutrition" />

      <Card className="mb-4 p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">Cette semaine</p>
            <p className="font-display text-[34px] font-extrabold leading-none">
              <Counter value={Math.round(weekTotal)} from={Math.round(weekTotal * 0.55)} />
              <span className="ml-1 text-lg text-chalk-dim">€</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-chalk-mute">Estimation mensuelle</p>
            <p className="num font-display text-xl font-bold">{eur(monthly)}</p>
          </div>
        </div>
        <ProgressBar value={budgetRatio} className="mt-4" tone={budgetRatio > 1 ? "violet" : "volt"} />
        <p className="mt-2 text-[12px] text-chalk-mute">
          {budgetRatio > 1
            ? `Environ ${Math.round((budgetRatio - 1) * 100)} % au-dessus de ton budget de ${profile.monthlyFoodBudget} €.`
            : `Dans ton budget de ${profile.monthlyFoodBudget} € par mois.`}
        </p>
      </Card>

      <SectionTitle>Niveau de budget</SectionTitle>
      <div className="mb-5 flex gap-2">
        {BUDGET_TIERS.map((t) => (
          <Chip
            key={t.id}
            active={profile.budgetTier === t.id}
            onClick={() => patchProfile({ budgetTier: t.id, monthlyFoodBudget: t.id === "economique" ? 200 : t.id === "standard" ? 260 : 340 })}
          >
            {t.label}
          </Chip>
        ))}
      </div>

      <SectionTitle
        action={
          <span className="num text-[12px] text-chalk-mute">
            {lines.filter((l) => pantry.includes(l.name)).length}/{lines.length} coché(s)
          </span>
        }
      >
        Liste de courses
      </SectionTitle>

      <div className="space-y-4">
        {AISLES.map((aisle) => {
          const items = lines.filter((l) => l.aisle === aisle.id);
          if (!items.length) return null;
          return (
            <div key={aisle.id}>
              <p className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-chalk-dim">
                <span>{aisle.emoji}</span>
                {aisle.label}
                <span className="num ml-auto text-[11.5px] text-chalk-mute">
                  {eur(items.reduce((a, i) => a + i.cost, 0))}
                </span>
              </p>
              <Card className="divide-y divide-white/[.05] p-0">
                {items.map((l, i) => {
                  const checked = pantry.includes(l.name);
                  return (
                    <motion.button
                      key={l.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(0.25, i * 0.02) }}
                      onClick={() => togglePantry(l.name)}
                      className="tap flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className={cx(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
                          checked ? "border-volt-500 bg-volt-500 text-ink-950" : "border-white/20"
                        )}
                      >
                        {checked && <Icon name="check" size={12} strokeWidth={3} />}
                      </span>
                      <span className={cx("flex-1 text-[13.5px]", checked && "text-chalk-mute line-through")}>{l.name}</span>
                      <span className="num text-[12.5px] font-semibold text-chalk-dim">{formatQty(l)}</span>
                      <span className="num w-14 text-right text-[12px] text-chalk-mute">{eur(l.cost)}</span>
                    </motion.button>
                  );
                })}
              </Card>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        <Card className="flex items-center justify-between p-4">
          <span className="text-[13px] text-chalk-dim">Reste à acheter</span>
          <span className="num font-display text-xl font-bold text-gradient-ember">{eur(remaining)}</span>
        </Card>
        <InfoNote>
          Les prix sont des estimations moyennes, hors promotions et sans distinction d&apos;enseigne. Ils servent à
          comparer des repas entre eux, pas à prédire ton ticket de caisse.
        </InfoNote>
      </div>
    </Page>
  );
}
