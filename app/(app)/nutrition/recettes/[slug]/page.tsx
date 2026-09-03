"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { Badge, Button, Card, SectionTitle } from "@/components/ui/primitives";
import { getRecipeBySlug } from "@/lib/data/recipes";
import { useApp } from "@/lib/store";
import { scaleMacros } from "@/lib/nutrition";
import { eur, today } from "@/lib/format";

export default function RecipePage({ params }: PageProps<"/nutrition/recettes/[slug]">) {
  const { slug } = use(params);
  const recipe = getRecipeBySlug(slug);
  const logMeal = useApp((s) => s.logMeal);
  const [portions, setPortions] = useState(1);
  const [added, setAdded] = useState(false);

  if (!recipe) notFound();
  const macros = scaleMacros(recipe.macros, portions);

  return (
    <Page>
      <TopBar title={recipe.name} subtitle={`${recipe.minutes} min · ${recipe.servings} portion(s)`} back="/nutrition/recettes" />

      <div
        className="mb-4 flex h-40 items-center justify-center rounded-3xl text-7xl"
        style={{ background: `linear-gradient(140deg, ${recipe.gradient[0]}44, ${recipe.gradient[1]}22)` }}
      >
        {recipe.emoji}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {recipe.tags.map((t) => (
          <Badge key={t}>{t.replace("-", " ")}</Badge>
        ))}
      </div>

      <Card className="mb-4 p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[12px] uppercase tracking-[0.14em] text-chalk-mute">Portions</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setPortions((p) => Math.max(0.5, p - 0.5))} className="tap grid h-9 w-9 place-items-center rounded-xl bg-white/[.06]" aria-label="Moins">
              <Icon name="minus" size={16} />
            </button>
            <span className="num w-8 text-center font-display text-lg font-bold">{portions}</span>
            <button onClick={() => setPortions((p) => Math.min(6, p + 0.5))} className="tap grid h-9 w-9 place-items-center rounded-xl bg-white/[.06]" aria-label="Plus">
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { l: "kcal", v: Math.round(macros.kcal) },
            { l: "Prot.", v: `${Math.round(macros.prot)} g` },
            { l: "Gluc.", v: `${Math.round(macros.carbs)} g` },
            { l: "Lip.", v: `${Math.round(macros.fat)} g` },
          ].map((m) => (
            <div key={m.l} className="rounded-2xl bg-white/[.04] py-3">
              <p className="num font-display text-[17px] font-bold">{m.v}</p>
              <p className="text-[10.5px] text-chalk-mute">{m.l}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[12px] text-chalk-mute">
          Coût estimé : {eur(recipe.costPerServing * portions)}
        </p>
      </Card>

      <Button
        full
        size="xl"
        icon={added ? "check" : "plus"}
        className="mb-5"
        onClick={() => {
          logMeal({ date: today(), recipeId: recipe.id, label: recipe.name, macros });
          setAdded(true);
        }}
      >
        {added ? "Ajouté à ta journée" : "Ajouter à ma journée"}
      </Button>

      <SectionTitle>Ingrédients</SectionTitle>
      <Card className="mb-5 divide-y divide-white/[.05] p-0">
        {recipe.ingredients.map((ing) => (
          <div key={ing.name} className="flex items-center justify-between px-4 py-3">
            <span className="text-[13.5px]">{ing.name}</span>
            <span className="num text-[13px] font-semibold text-chalk-dim">
              {Math.round(ing.qty * portions * 10) / 10} {ing.unit === "u" ? "" : ing.unit}
            </span>
          </div>
        ))}
      </Card>

      <SectionTitle>Préparation</SectionTitle>
      <Card className="mb-5 p-5">
        <ol className="space-y-3">
          {recipe.steps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-ember-500/15 text-[12px] font-bold text-ember-300">
                {i + 1}
              </span>
              <span className="text-[14px] leading-relaxed text-chalk-dim">{s}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="flex items-start gap-3 p-4">
        <Icon name="info" size={16} className="mt-0.5 shrink-0 text-ember-400" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-chalk-mute">Conservation</p>
          <p className="mt-0.5 text-[13px] text-chalk-dim">{recipe.storage}</p>
        </div>
      </Card>
    </Page>
  );
}
