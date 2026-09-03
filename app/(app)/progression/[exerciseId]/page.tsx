"use client";

import { notFound } from "next/navigation";
import { use, useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { LineChart } from "@/components/charts/Charts";
import { ExerciseFigure } from "@/components/exercise/Figure";
import { Button, Card, cx, EmptyState, Segmented, SectionTitle } from "@/components/ui/primitives";
import { ProgressBar } from "@/components/ui/progress";
import { getExercise } from "@/lib/data/exercises";
import { useApp } from "@/lib/store";
import { historyFor, totalVolume, workingWeight } from "@/lib/progression";
import { progressSinceStart } from "@/lib/coach";
import { estimate1RM, strengthLevel } from "@/lib/estimator";
import { frDate, kg, relativeDay } from "@/lib/format";

type Metric = "1rm" | "charge" | "volume";

export default function ExerciseHistoryPage({ params }: PageProps<"/progression/[exerciseId]"> ) {
  const { exerciseId } = use(params);
  const exercise = getExercise(exerciseId);
  const sessions = useApp((s) => s.sessions);
  const profile = useApp((s) => s.profile)!;
  const [metric, setMetric] = useState<Metric>("1rm");

  const history = useMemo(() => (exercise ? historyFor(sessions, exercise.id) : []), [sessions, exercise]);
  if (!exercise) notFound();

  const prog = progressSinceStart(sessions, exercise.id);
  const best = history.flatMap((h) => h.sets).reduce((b, s) => Math.max(b, estimate1RM(s.weight, s.reps)), 0);
  const level = best > 0 ? strengthLevel(exercise.id, best, profile.weightKg, profile.sex) : null;

  const points = history
    .slice()
    .reverse()
    .map((h) => ({
      label: frDate(h.date, { day: "numeric", month: "short" }),
      value:
        metric === "1rm"
          ? Math.round(Math.max(...h.sets.map((s) => estimate1RM(s.weight, s.reps))) * 10) / 10
          : metric === "charge"
            ? workingWeight(h.sets)
            : Math.round(totalVolume(h.sets)),
    }));

  return (
    <Page>
      <TopBar title={exercise.shortName ?? exercise.name} subtitle="Historique" back="/progression" />

      {history.length === 0 ? (
        <EmptyState
          icon="chart"
          title="Aucune donnée"
          body="Tu n'as pas encore enregistré de série sur cet exercice."
          action={<Button href={`/exercice/${exercise.slug}`}>Voir la fiche</Button>}
        />
      ) : (
        <>
          <Card className="mb-4 overflow-hidden p-0">
            <div className="flex items-center gap-3 p-4">
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-white/[.03]">
                <ExerciseFigure media={exercise.media} className="h-full w-full" showTrail={false} frame={0.5} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">Depuis le début</p>
                <p className={cx("font-display text-2xl font-extrabold", (prog?.pct ?? 0) > 0 ? "text-gradient-ember" : "")}>
                  {prog ? `${prog.pct > 0 ? "+" : ""}${prog.pct.toFixed(1).replace(".", ",")} %` : "—"}
                </p>
                <p className="num text-[12px] text-chalk-mute">
                  {prog ? `${Math.round(prog.from)} → ${Math.round(prog.to)} kg de 1RM estimé` : ""}
                </p>
              </div>
            </div>
            {level && (
              <div className="border-t border-white/[.06] p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">Niveau de force</span>
                  <span className="text-[13px] font-bold text-ember-300">{level.label}</span>
                </div>
                <ProgressBar value={(level.index + level.progress) / 5} className="mt-2" />
                <p className="mt-2 text-[11.5px] text-chalk-mute">
                  {level.ratio.toFixed(2).replace(".", ",")} × ton poids de corps · prochain palier {level.nextLabel}
                </p>
              </div>
            )}
          </Card>

          <Segmented
            className="mb-3"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "1rm", label: "1RM estimé" },
              { value: "charge", label: "Charge" },
              { value: "volume", label: "Volume" },
            ]}
          />
          <Card className="mb-5 p-4">
            <LineChart
              points={points}
              tone={metric === "1rm" ? "ember" : metric === "charge" ? "cyan" : "violet"}
              format={(v) => (metric === "volume" ? `${Math.round(v)} kg` : kg(v))}
            />
          </Card>

          <SectionTitle>Séances</SectionTitle>
          <div className="space-y-2">
            {history.map((h) => (
              <Card key={h.date} className="p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold">{relativeDay(h.date.slice(0, 10))}</span>
                  <span className="num text-[11.5px] text-chalk-mute">
                    1RM estimé {Math.round(Math.max(...h.sets.map((s) => estimate1RM(s.weight, s.reps))))} kg
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {h.sets.map((s, i) => (
                    <span key={i} className="num rounded-lg bg-white/[.05] px-2.5 py-1 text-[12px]">
                      {s.weight} × {s.reps}
                      <span className="ml-1 text-[10px] text-chalk-mute">RIR {s.rir}</span>
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
