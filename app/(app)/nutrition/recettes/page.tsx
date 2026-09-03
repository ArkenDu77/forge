"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { Card, Chip, EmptyState } from "@/components/ui/primitives";
import { RECIPES, RECIPE_TAGS } from "@/lib/data/recipes";
import { isRecipeAllowed } from "@/lib/nutrition";
import { useApp } from "@/lib/store";
import { eur } from "@/lib/format";

export default function RecipesPage() {
  const profile = useApp((s) => s.profile)!;
  const [tag, setTag] = useState<string>("tous");
  const [onlyMine, setOnlyMine] = useState(true);

  const list = useMemo(
    () =>
      RECIPES.filter((r) => (tag === "tous" ? true : r.tags.includes(tag as never))).filter((r) =>
        onlyMine ? isRecipeAllowed(r, profile) : true
      ),
    [tag, onlyMine, profile]
  );

  return (
    <Page>
      <TopBar title="Recettes" subtitle={`${list.length} recettes adaptées à la prise de masse`} back="/nutrition" />

      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        {RECIPE_TAGS.map((t) => (
          <Chip key={t.id} active={tag === t.id} onClick={() => setTag(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>
      <div className="mb-4">
        <Chip active={onlyMine} onClick={() => setOnlyMine((v) => !v)} icon="filter">
          Compatible avec mon régime
        </Chip>
      </div>

      {list.length === 0 ? (
        <EmptyState icon="chef" title="Aucune recette" body="Aucune recette ne correspond à ces filtres." />
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {list.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(0.3, i * 0.03) }}>
              <Link href={`/nutrition/recettes/${r.slug}`} className="tap block h-full">
                <Card className="h-full overflow-hidden p-0">
                  <div
                    className="relative flex aspect-[4/3] items-center justify-center text-5xl"
                    style={{ background: `linear-gradient(140deg, ${r.gradient[0]}44, ${r.gradient[1]}22)` }}
                  >
                    <span>{r.emoji}</span>
                    <span className="num absolute bottom-2 left-2 rounded-lg bg-ink-950/60 px-2 py-0.5 text-[11px] font-semibold backdrop-blur">
                      {r.macros.kcal} kcal
                    </span>
                    <span className="num absolute bottom-2 right-2 rounded-lg bg-ink-950/60 px-2 py-0.5 text-[11px] font-semibold text-volt-400 backdrop-blur">
                      {r.macros.prot} g
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug">{r.name}</p>
                    <p className="num mt-1 flex items-center gap-2 text-[11.5px] text-chalk-mute">
                      <span className="flex items-center gap-1">
                        <Icon name="clock" size={11} />
                        {r.minutes} min
                      </span>
                      <span>{eur(r.costPerServing)}</span>
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Page>
  );
}
