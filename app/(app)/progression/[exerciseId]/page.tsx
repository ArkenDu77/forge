"use client";

import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { LineChart } from "@/components/charts/Charts";
import { ExerciseMedia } from "@/components/exercise/ExerciseMedia";
import { Button, Card, cx, EmptyState, Segmented } from "@/components/ui/primitives";
import { getExercise } from "@/lib/data/exercises";
import { ALL_DAYS } from "@/lib/data/program";
import { useApp } from "@/lib/store";
import { historyFor, totalVolume, workingWeight } from "@/lib/progression";
import { frDate, nf, relativeDay } from "@/lib/format";

type Metric = "poids" | "volume" | "resultat";

export default function ExerciseHistoryPage({ params }: PageProps<"/progression/[exerciseId]">) {
  const { exerciseId } = use(params);
  const exercise = getExercise(exerciseId);
  const sessions = useApp((s) => s.sessions);
  const [metric, setMetric] = useState<Metric>("poids");

  const history = useMemo(() => (exercise ? historyFor(sessions, exercise.id) : []), [sessions, exercise]);
  if (!exercise) notFound();

  const plan = ALL_DAYS.flatMap((d) => d.exercises).find((p) => p.exerciseId === exercise.id);
  const isCarry = plan?.metric === "distance";
  const isHold = plan?.metric === "duration";
  const unit = isCarry ? "m" : isHold ? "s" : "kg";

  const bestOf = (sets: (typeof history)[number]["sets"]) =>
    isCarry
      ? Math.max(...sets.map((s) => s.distanceM ?? 0))
      : isHold
        ? Math.max(...sets.map((s) => s.seconds ?? 0))
        : Math.max(...sets.map((s) => s.reps));

  const first = history[history.length - 1];
  const latest = history[0];
  const startValue = first ? (isCarry || isHold ? bestOf(first.sets) : workingWeight(first.sets)) : 0;
  const nowValue = latest ? (isCarry || isHold ? bestOf(latest.sets) : workingWeight(latest.sets)) : 0;
  const gain = nowValue - startValue;

  const points = history
    .slice()
    .reverse()
    .map((h) => ({
      label: frDate(h.date, { day: "numeric", month: "short" }),
      value:
        metric === "volume"
          ? Math.round(totalVolume(h.sets))
          : metric === "resultat"
            ? bestOf(h.sets)
            : isCarry || isHold
              ? bestOf(h.sets)
              : workingWeight(h.sets),
    }));

  return (
    <Page>
      <TopBar title={exercise.shortName ?? exercise.name} subtitle="Ce que tu as fait" back="/progression" />

      {history.length === 0 ? (
        <EmptyState
          icon="chart"
          title="Rien à montrer encore"
          body="Tu n'as pas encore fait cet exercice. Après ta première séance, tu verras ici l'évolution de tes poids."
          action={<Button href={`/exercice/${exercise.slug}`}>Voir la fiche</Button>}
        />
      ) : (
        <>
          <Card className="mb-4 overflow-hidden p-0">
            <div className="flex items-center gap-3 p-4">
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-white/[.03]">
                <ExerciseMedia exercise={exercise} className="h-full w-full" frame={0.5} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">Depuis ta première séance</p>
                <p className={cx("font-display text-2xl font-extrabold", gain > 0 && "text-gradient-ember")}>
                  {gain > 0 ? "+" : ""}
                  {nf(gain, gain % 1 === 0 ? 0 : 1)} {unit}
                </p>
                <p className="num text-[12px] text-chalk-mute">
                  {nf(startValue, 1)} {unit} → {nf(nowValue, 1)} {unit}
                </p>
              </div>
            </div>
          </Card>

          <Segmented
            className="mb-3"
            value={metric}
            onChange={setMetric}
            options={
              isCarry || isHold
                ? [
                    { value: "resultat", label: isCarry ? "Distance" : "Temps" },
                    { value: "poids", label: "Poids porté" },
                  ]
                : [
                    { value: "poids", label: "Poids" },
                    { value: "resultat", label: "Répétitions" },
                    { value: "volume", label: "Travail total" },
                  ]
            }
          />
          <Card className="mb-5 p-4">
            <LineChart
              points={points}
              tone={metric === "poids" ? "ember" : metric === "resultat" ? "cyan" : "violet"}
              format={(v) => `${nf(v, v % 1 === 0 ? 0 : 1)} ${metric === "volume" ? "kg au total" : unit}`}
            />
            <p className="mt-2 text-center text-[11.5px] text-chalk-mute">
              {metric === "volume"
                ? "Tout le poids déplacé pendant la séance : poids × répétitions, additionné."
                : metric === "poids"
                  ? "Le poids de tes séries de travail, séance après séance."
                  : isCarry
                    ? "La distance la plus longue de chaque séance."
                    : isHold
                      ? "Le temps le plus long de chaque séance."
                      : "Ton meilleur nombre de répétitions à chaque séance."}
            </p>
          </Card>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">Séance par séance</p>
          <div className="space-y-2">
            {history.map((h) => (
              <Card key={h.date} className="p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold">{relativeDay(h.date.slice(0, 10))}</span>
                  <span className="num text-[11.5px] text-chalk-mute">
                    {h.sets.length} série{h.sets.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {h.sets.map((s, i) => (
                    <span key={i} className="num rounded-lg bg-white/[.05] px-2.5 py-1 text-[12px]">
                      {isCarry
                        ? `${s.distanceM} m`
                        : isHold
                          ? `${s.seconds} s`
                          : `${nf(s.weight, s.weight % 1 === 0 ? 0 : 1)} kg × ${s.reps}`}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Page>
  );
}
