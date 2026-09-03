"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { Card, cx, InfoNote, SectionTitle, Segmented } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { project, timeline, weeksSince } from "@/lib/projection";
import { SAFETY } from "@/lib/copy";
import { kg } from "@/lib/format";

export default function ProjectionPage() {
  const profile = useApp((s) => s.profile)!;
  const sessions = useApp((s) => s.sessions);
  const weights = useApp((s) => s.weights);
  const projections = useMemo(() => project(profile, sessions), [profile, sessions]);
  const [horizon, setHorizon] = useState(12);
  const current = projections.find((p) => p.weeks === horizon) ?? projections[2];
  const currentWeight = weights[weights.length - 1]?.kg ?? profile.weightKg;
  const elapsed = weeksSince(profile.createdAt);

  return (
    <Page>
      <TopBar title="Où pourrais-je en être ?" subtitle="Projections conditionnelles, pas des promesses" back="/" />

      <Card className="mb-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ember-500/12 text-ember-300">
            <Icon name="target" size={19} />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">Assiduité observée</p>
            <p className="font-display text-xl font-bold">{Math.round(current.adherence * 100)} %</p>
          </div>
        </div>
        <ProgressBar value={current.adherence} className="mt-3" tone={current.adherence > 0.8 ? "volt" : "ember"} />
        <p className="mt-2 text-[12.5px] text-chalk-mute">
          Calculée sur tes 4 dernières semaines. Toutes les projections ci-dessous en dépendent directement.
        </p>
      </Card>

      <Segmented
        className="mb-4"
        value={String(horizon)}
        onChange={(v) => setHorizon(Number(v))}
        options={projections.map((p) => ({ value: String(p.weeks), label: p.label }))}
      />

      <motion.div key={horizon} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-ember-500/15 to-transparent p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember-300">
              À {current.label}, avec une assiduité comparable
            </p>
            <p className="mt-3 text-[13px] text-chalk-dim">Poids projeté</p>
            <p className="font-display text-[34px] font-extrabold leading-none">
              {current.weight[0].toFixed(1).replace(".", ",")}
              <span className="mx-1.5 text-lg text-chalk-mute">à</span>
              {current.weight[1].toFixed(1).replace(".", ",")}
              <span className="ml-1.5 text-lg font-semibold text-chalk-dim">kg</span>
            </p>
            <p className="mt-1 text-[12.5px] text-chalk-mute">
              Aujourd&apos;hui {kg(currentWeight)} · objectif {kg(profile.targetWeightKg)}
            </p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-white/[.06] border-t border-white/[.06]">
            <div className="p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">Force</p>
              <p className="num mt-1 font-display text-xl font-bold">
                +{current.strengthPct[0]} à {current.strengthPct[1]} %
              </p>
              <p className="text-[11.5px] text-chalk-mute">sur les mouvements principaux</p>
            </div>
            <div className="p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">Séances</p>
              <p className="num mt-1 font-display text-xl font-bold">≈ {current.sessions}</p>
              <p className="text-[11.5px] text-chalk-mute">d&apos;ici là</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          {projections.map((p) => (
            <Card key={p.weeks} className={cx("p-4", p.weeks === horizon && "ring-1 ring-ember-500/40")}>
              <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">{p.label}</p>
              <p className="num mt-1 font-display text-[17px] font-bold">
                {p.weight[0].toFixed(1).replace(".", ",")}–{p.weight[1].toFixed(1).replace(".", ",")} kg
              </p>
              <p className="num text-[11.5px] text-volt-400">
                force +{p.strengthPct[0]}–{p.strengthPct[1]} %
              </p>
            </Card>
          ))}
        </div>
      </motion.div>

      <div className="my-5">
        <InfoNote tone="warn">{SAFETY.projectionDisclaimer}</InfoNote>
      </div>

      <SectionTitle>Ce qui fait varier ces chiffres</SectionTitle>
      <Card className="mb-5 space-y-3 p-5">
        {[
          { i: "calendar", t: "Régularité", d: "Le facteur le plus déterminant. Manquer une séance sur deux divise mécaniquement la progression." },
          { i: "nutrition", t: "Alimentation", d: "Sans surplus calorique ni protéines suffisantes, la prise de masse ralentit fortement." },
          { i: "moon", t: "Sommeil", d: "La récupération conditionne la capacité à progresser d'une séance à l'autre." },
          { i: "chart", t: "Point de départ", d: "Un débutant progresse plus vite qu'un pratiquant avancé, à effort égal." },
        ].map((x) => (
          <div key={x.t} className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.05] text-chalk-dim">
              <Icon name={x.i} size={16} />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold">{x.t}</p>
              <p className="text-[12.5px] leading-relaxed text-chalk-mute">{x.d}</p>
            </div>
          </div>
        ))}
      </Card>

      <SectionTitle>Repères dans le temps</SectionTitle>
      <Card className="p-5">
        <div className="space-y-4">
          {timeline(profile, elapsed).map((m, i) => (
            <div key={m.weeks} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cx(
                    "grid h-6 w-6 place-items-center rounded-full border text-[10px]",
                    m.done ? "border-ember-500 bg-ember-500 text-ink-950" : "border-white/15 text-chalk-mute"
                  )}
                >
                  {m.done ? <Icon name="check" size={11} strokeWidth={3} /> : i + 1}
                </span>
                {i < 5 && <span className="my-1 w-px flex-1 bg-white/10" />}
              </div>
              <div className="pb-1">
                <p className="text-[11px] uppercase tracking-wider text-chalk-mute">{m.weeks}</p>
                <p className="text-[14px] font-semibold">{m.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-chalk-dim">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="mt-5 text-center text-[11px] text-chalk-mute">{SAFETY.notMedical}</p>
    </Page>
  );
}
