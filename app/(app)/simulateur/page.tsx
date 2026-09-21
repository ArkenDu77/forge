"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { ExerciseMedia } from "@/components/exercise/ExerciseMedia";
import { Icon } from "@/components/ui/Icon";
import { Card, Chip, cx, InfoNote, Sheet } from "@/components/ui/primitives";
import { EXERCISES, ex } from "@/lib/data/exercises";
import { coachingFor } from "@/lib/data/coaching";
import { useApp } from "@/lib/store";
import { adjustFromFeedback, estimateStartingLoad, loadForReps, estimate1RM, type Feedback } from "@/lib/estimator";
import { SAFETY } from "@/lib/copy";
import { nf } from "@/lib/format";

const SUGGESTED = ["bench-press", "hack-squat", "rdl", "lat-pulldown", "leg-press", "db-shoulder-press"];

export default function QuelPoidsPage() {
  const profile = useApp((s) => s.profile)!;
  const [exerciseId, setExerciseId] = useState("bench-press");
  const [known, setKnown] = useState(false);
  const [lastWeight, setLastWeight] = useState(30);
  const [lastReps, setLastReps] = useState(8);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const exercise = ex(exerciseId);
  const base = useMemo(() => estimateStartingLoad(exercise, profile), [exercise, profile]);

  // Si la personne connaît une performance récente, on s'en sert : c'est plus fiable
  // que n'importe quelle estimation à partir du poids de corps.
  const fromKnown = Math.round(loadForReps(estimate1RM(lastWeight, lastReps), 8) / exercise.increment) * exercise.increment;
  const suggested = known ? fromKnown : base.weight;
  const adjusted = feedback ? adjustFromFeedback(suggested, feedback, exercise.increment) : null;
  const finalWeight = adjusted ? adjusted.weight : suggested;

  return (
    <Page>
      <TopBar title="Quel poids mettre ?" subtitle="Une estimation prudente, à ajuster dès la première série" back="/programme" />

      <button
        onClick={() => setPickerOpen(true)}
        className="tap mb-4 flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/[.03] p-3 text-left"
      >
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/[.03]">
          <ExerciseMedia exercise={exercise} className="h-full w-full" frame={0.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-chalk-mute">Exercice</p>
          <p className="truncate font-display text-[17px] font-bold">{exercise.name}</p>
        </div>
        <Icon name="down" size={17} className="text-chalk-mute" />
      </button>

      <Card className="mb-4 p-5">
        <p className="text-[15px] font-semibold">Tu as déjà fait cet exercice ?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { v: false, label: "Jamais" },
            { v: true, label: "Oui, je me souviens" },
          ].map((o) => (
            <button
              key={String(o.v)}
              onClick={() => {
                setKnown(o.v);
                setFeedback(null);
              }}
              className={cx(
                "tap rounded-2xl border py-3.5 text-[13.5px] font-semibold transition active:scale-95",
                known === o.v ? "border-ember-500/60 bg-ember-500/[.10] text-ember-300" : "border-white/10 bg-white/[.03] text-chalk-dim"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        {known && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-4 overflow-hidden">
            <Slider label="Le poids que tu avais mis" value={lastWeight} onChange={setLastWeight} min={0} max={200} step={exercise.increment} unit="kg" />
            <Slider label="Le nombre de répétitions réussies" value={lastReps} onChange={setLastReps} min={1} max={20} step={1} unit="" />
          </motion.div>
        )}
      </Card>

      <Card className="mb-4 overflow-hidden p-0">
        <div className="bg-gradient-to-br from-ember-500/15 to-transparent p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember-300">{SAFETY.estimateLabel}</p>
          <p className="mt-2 font-display text-[42px] font-extrabold leading-none">
            {base.bodyweightOnly ? "—" : nf(finalWeight, finalWeight % 1 === 0 ? 0 : 1)}
            {!base.bodyweightOnly && <span className="ml-1.5 text-lg font-semibold text-chalk-dim">kg</span>}
          </p>
          <p className="mt-1.5 text-[13.5px] text-chalk-dim">
            {base.bodyweightOnly ? base.display : "Pour une série d'environ 8 répétitions confortables"}
          </p>
        </div>
        <div className="space-y-2 p-5">
          {base.notes.map((n) => (
            <p key={n} className="flex gap-2 text-[12.5px] text-chalk-mute">
              <Icon name="info" size={14} className="mt-0.5 shrink-0" />
              {n}
            </p>
          ))}
          {adjusted && (
            <p className="rounded-2xl border border-ember-500/25 bg-ember-500/[.07] px-3.5 py-3 text-[13px] text-ember-300/90">
              {adjusted.message}
            </p>
          )}
        </div>
      </Card>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">
        Fais une série d&apos;essai, puis dis-moi
      </p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {(
          [
            ["trop-facile", "C'était trop facile", "arrowUp"],
            ["correcte", "C'était bien", "check"],
            ["trop-lourde", "C'était trop lourd", "arrowDown"],
            ["douleur", "J'ai eu mal", "alert"],
          ] as [Feedback, string, string][]
        ).map(([v, l, i]) => (
          <button
            key={v}
            onClick={() => setFeedback(v)}
            className={cx(
              "tap flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 text-[13.5px] font-semibold transition active:scale-95",
              feedback === v
                ? v === "douleur"
                  ? "border-danger/50 bg-danger/10 text-danger"
                  : "border-ember-500/60 bg-ember-500/[.10] text-ember-300"
                : "border-white/10 bg-white/[.03] text-chalk-dim"
            )}
          >
            <Icon name={i} size={16} />
            {l}
          </button>
        ))}
      </div>

      <Card className="mb-4 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-mute">Comment reconnaître la machine</p>
        <ul className="mt-2 space-y-2">
          {coachingFor(exercise.id).findIt.map((f) => (
            <li key={f} className="flex gap-2.5 text-[13.5px] leading-relaxed text-chalk-dim">
              <Icon name="check" size={14} className="mt-1 shrink-0 text-volt-400" />
              {f}
            </li>
          ))}
        </ul>
      </Card>

      <InfoNote tone="warn">{SAFETY.estimateDisclaimer}</InfoNote>

      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Choisir un exercice">
        <div className="pb-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED.map((id) => (
              <Chip
                key={id}
                active={exerciseId === id}
                onClick={() => {
                  setExerciseId(id);
                  setFeedback(null);
                  setPickerOpen(false);
                }}
              >
                {ex(id).shortName ?? ex(id).name}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EXERCISES.filter((e) => e.loadModel !== "bodyweight").map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  setExerciseId(e.id);
                  setFeedback(null);
                  setPickerOpen(false);
                }}
                className={cx(
                  "tap rounded-2xl border p-2.5 text-left",
                  exerciseId === e.id ? "border-ember-500/50 bg-ember-500/[.08]" : "border-white/8 bg-white/[.02]"
                )}
              >
                <div className="h-14 w-full overflow-hidden rounded-xl">
                  <ExerciseMedia exercise={e} className="h-full w-full" frame={0.5} />
                </div>
                <p className="mt-1.5 truncate text-[12px] font-medium">{e.shortName ?? e.name}</p>
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </Page>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-chalk-dim">{label}</span>
        <span className="num font-display text-lg font-bold">
          {nf(value, value % 1 === 0 ? 0 : 1)}
          {unit && <span className="ml-1 text-[11px] font-medium text-chalk-mute">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full appearance-none rounded-full bg-white/10 accent-[#ff6b2c]"
        aria-label={label}
      />
    </div>
  );
}
