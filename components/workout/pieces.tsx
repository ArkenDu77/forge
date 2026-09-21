"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Badge, Button, Card, cx, InfoNote, Sheet } from "@/components/ui/primitives";
import { ProgressRing } from "@/components/ui/progress";
import { ExerciseMedia } from "@/components/exercise/ExerciseMedia";
import type { Exercise, ProgramExercise } from "@/lib/types";
import type { LoadRecommendation } from "@/lib/progression";
import { coachingFor } from "@/lib/data/coaching";
import { mmss, nf } from "@/lib/format";
import { SAFETY } from "@/lib/copy";

/* ---------------- Sélecteur de charge ---------------- */

export function WeightStepper({
  value,
  onChange,
  increment,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  increment: number;
  suffix?: string;
}) {
  const step = increment || 2.5;
  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, Math.round((value - step) * 100) / 100))}
        className="tap grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.05] text-chalk-dim transition active:scale-95 disabled:opacity-30"
        aria-label={`Retirer ${step} kg`}
      >
        <span className="num text-[13px] font-bold">−{nf(step, step % 1 === 0 ? 0 : 1)}</span>
      </button>
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[.04]">
        <span className="num font-display text-[30px] font-extrabold leading-none">
          {nf(value, value % 1 === 0 ? 0 : 1)}
          <span className="ml-1 text-sm font-semibold text-chalk-dim">kg</span>
        </span>
        {suffix && <span className="mt-0.5 text-[11px] text-chalk-mute">{suffix}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.round((value + step) * 100) / 100)}
        className="tap grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.05] text-chalk-dim transition active:scale-95"
        aria-label={`Ajouter ${step} kg`}
      >
        <span className="num text-[13px] font-bold">+{nf(step, step % 1 === 0 ? 0 : 1)}</span>
      </button>
    </div>
  );
}

/* ---------------- Pourquoi ce poids ---------------- */

export function WhyThisLoad({ reco }: { reco: LoadRecommendation }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="tap flex w-full items-center gap-2 rounded-2xl border border-white/8 bg-white/[.03] px-3.5 py-2.5 text-left"
      >
        <Icon name="info" size={15} className="text-ember-400" />
        <span className="flex-1 text-[12.5px] text-chalk-dim">Pourquoi ce poids ?</span>
        <Icon name="right" size={14} className="text-chalk-mute" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={reco.headline}>
        <div className="space-y-2.5 pb-4 pt-1">
          {reco.previousWeight !== null && (
            <div className="flex items-center justify-center gap-4 rounded-2xl border border-white/8 bg-white/[.03] p-4">
              <div className="text-center">
                <p className="text-[11px] text-chalk-mute">La dernière fois</p>
                <p className="num font-display text-xl font-bold text-chalk-dim">{nf(reco.previousWeight, 1)} kg</p>
              </div>
              <Icon name="right" size={18} className="text-ember-400" />
              <div className="text-center">
                <p className="text-[11px] text-chalk-mute">Aujourd&apos;hui</p>
                <p className="num font-display text-xl font-extrabold text-ember-300">{nf(reco.weight, 1)} kg</p>
              </div>
            </div>
          )}
          {reco.reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-2.5 rounded-2xl bg-white/[.03] px-3.5 py-3"
            >
              <Icon
                name={r.ok ? "check" : "minus"}
                size={15}
                className={cx("mt-0.5 shrink-0", r.ok ? "text-volt-400" : "text-chalk-mute")}
              />
              <span className="text-[13px] leading-relaxed text-chalk-dim">{r.text}</span>
            </motion.div>
          ))}
          <InfoNote tone="warn">{SAFETY.loadNeverSafe}</InfoNote>
        </div>
      </Sheet>
    </>
  );
}

/* ---------------- Saisie de série ---------------- */

/** « Combien tu aurais pu en faire de plus ? » — la question posée à la place du jargon. */
const RESERVE_OPTIONS = [
  { v: 0, emoji: "💀", label: "Aucune", hint: "Tu ne pouvais vraiment plus en faire une seule." },
  { v: 1, emoji: "🥵", label: "1", hint: "Peut-être encore une, difficilement." },
  { v: 2, emoji: "👍", label: "2", hint: "Encore deux : c'est la zone idéale." },
  { v: 3, emoji: "🙂", label: "3", hint: "Encore trois. Un peu léger, mais correct." },
  { v: 4, emoji: "😌", label: "4 ou +", hint: "Beaucoup trop facile. On montera le poids." },
];

function optionsFor(plan: ProgramExercise): { values: number[]; unit: string } {
  if (plan.metric === "distance") {
    const lo = plan.distMin ?? 10;
    const hi = plan.distMax ?? 30;
    const step = 5;
    const values: number[] = [];
    for (let v = Math.max(step, lo - step); v <= hi; v += step) values.push(v);
    values.push(hi + step);
    return { values, unit: "mètres" };
  }
  if (plan.metric === "duration") {
    const lo = plan.secMin ?? 20;
    const hi = plan.secMax ?? 45;
    const values = [Math.max(5, lo - 10), lo, Math.round((lo + hi) / 2), hi, hi + 15];
    return { values: [...new Set(values)].sort((a, b) => a - b), unit: "secondes" };
  }
  const span = plan.repMax - plan.repMin;
  const step = span > 6 ? 2 : 1;
  const values: number[] = [];
  for (let n = plan.repMin - step; n <= plan.repMax; n += step) if (n > 0) values.push(n);
  values.push(plan.repMax + 1);
  return { values, unit: "répétitions" };
}

export function SetLogger({
  plan,
  isWarmup,
  onSubmit,
  onCancel,
}: {
  plan: ProgramExercise;
  isWarmup: boolean;
  onSubmit: (result: { reps?: number; distanceM?: number; seconds?: number; reserve: number; pain: boolean }) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState<number | null>(null);
  const [reserve, setReserve] = useState<number | null>(null);
  const [pain, setPain] = useState(false);
  const { values, unit } = optionsFor(plan);
  const cols = values.length <= 4 ? values.length : values.length <= 6 ? 3 : 4;
  const max = values[values.length - 1];

  const question =
    plan.metric === "distance"
      ? "Combien de mètres as-tu parcourus ?"
      : plan.metric === "duration"
        ? "Combien de temps as-tu tenu ?"
        : "Combien de répétitions as-tu faites ?";

  const submit = () => {
    if (amount === null) return;
    const reserveValue = isWarmup ? 4 : reserve;
    if (reserveValue === null) return;
    onSubmit({
      reps: plan.metric === "reps" ? amount : undefined,
      distanceM: plan.metric === "distance" ? amount : undefined,
      seconds: plan.metric === "duration" ? amount : undefined,
      reserve: reserveValue,
      pain,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className="space-y-4"
    >
      <div>
        <p className="mb-2.5 text-[15px] font-semibold">{question}</p>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {values.map((n) => (
            <button
              key={n}
              onClick={() => setAmount(n)}
              className={cx(
                "tap rounded-2xl border py-4 font-display text-xl font-bold transition-all active:scale-95",
                amount === n
                  ? "border-ember-500/70 bg-ember-500/15 text-ember-300"
                  : "border-white/12 bg-white/[.05] text-chalk"
              )}
            >
              {n === max ? `${n}+` : n}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {amount !== null && !isWarmup && (
          <motion.div
            className="overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
          >
            <p className="mb-1 text-[15px] font-semibold">
              À la fin, tu aurais pu en faire combien de plus ?
            </p>
            <p className="mb-2.5 text-[12.5px] text-chalk-mute">
              Des {unit} en plus, si tu avais continué sans t&apos;arrêter.
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {RESERVE_OPTIONS.map((o) => (
                <button
                  key={o.v}
                  onClick={() => setReserve(o.v)}
                  className={cx(
                    "tap flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 transition-all active:scale-95",
                    reserve === o.v ? "border-ember-500/70 bg-ember-500/15" : "border-white/10 bg-white/[.03]"
                  )}
                >
                  <span className="text-lg leading-none">{o.emoji}</span>
                  <span className={cx("text-[11px] font-bold", reserve === o.v ? "text-ember-300" : "text-chalk-dim")}>
                    {o.label}
                  </span>
                </button>
              ))}
            </div>
            {reserve !== null && (
              <p className="mt-2 text-center text-[12.5px] text-chalk-mute">
                {RESERVE_OPTIONS.find((o) => o.v === reserve)?.hint}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setPain((p) => !p)}
        className={cx(
          "tap flex w-full items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left text-[12.5px] transition",
          pain ? "border-danger/40 bg-danger/10 text-danger" : "border-white/8 bg-white/[.02] text-chalk-mute"
        )}
      >
        <Icon name="alert" size={15} />
        <span className="flex-1">J&apos;ai senti une douleur inhabituelle</span>
        {pain && <Icon name="check" size={15} />}
      </button>

      {pain && <InfoNote tone="warn">{SAFETY.sharpPain}</InfoNote>}

      <div className="flex gap-2">
        <Button variant="ghost" size="lg" onClick={onCancel}>
          Annuler
        </Button>
        <Button size="lg" full icon="check" disabled={amount === null || (!isWarmup && reserve === null)} onClick={submit}>
          Valider
        </Button>
      </div>
    </motion.div>
  );
}

/* ---------------- Chrono de repos ---------------- */

export function RestTimer({
  endsAt,
  total,
  message,
  onSkip,
  onAdd,
  nextLabel,
}: {
  endsAt: number;
  total: number;
  message?: string;
  onSkip: () => void;
  onAdd: (s: number) => void;
  nextLabel?: string;
}) {
  const [remaining, setRemaining] = useState(() => Math.max(0, (endsAt - Date.now()) / 1000));
  const done = useRef(false);

  useEffect(() => {
    done.current = false;
    const id = setInterval(() => {
      const r = Math.max(0, (endsAt - Date.now()) / 1000);
      setRemaining(r);
      if (r <= 0 && !done.current) {
        done.current = true;
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([90, 60, 90]);
      }
    }, 200);
    return () => clearInterval(id);
  }, [endsAt]);

  const progress = total > 0 ? 1 - remaining / total : 1;
  const over = remaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="flex flex-col items-center"
    >
      <ProgressRing value={progress} size={210} stroke={12} tone={over ? "volt" : "ember"}>
        <div className="text-center">
          <p className="num font-display text-[52px] font-extrabold leading-none tabular-nums">{mmss(remaining)}</p>
          <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-chalk-mute">
            {over ? "C'est reparti" : "Repos"}
          </p>
        </div>
      </ProgressRing>

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6 max-w-[32ch] text-center text-[14px] leading-relaxed text-chalk-dim"
        >
          {message}
        </motion.p>
      )}
      {nextLabel && <p className="mt-2 text-center text-[12.5px] text-chalk-mute">{nextLabel}</p>}

      <div className="mt-7 flex w-full max-w-sm gap-2">
        <Button variant="outline" size="lg" onClick={() => onAdd(30)} className="flex-1">
          +30 s
        </Button>
        <Button size="lg" onClick={onSkip} className="flex-[2]" iconRight="right">
          {over ? "Série suivante" : "Passer le repos"}
        </Button>
      </div>
    </motion.div>
  );
}

/* ---------------- Échauffement cardio ---------------- */

export function CardioWarmup({
  machine,
  minutes,
  instruction,
  onDone,
}: {
  machine: "tapis" | "velo";
  minutes: number;
  instruction: string;
  onDone: () => void;
}) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(minutes * 60);

  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => {
      const r = Math.max(0, (endsAt - Date.now()) / 1000);
      setRemaining(r);
      if (r <= 0 && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([90, 60, 90]);
    }, 250);
    return () => clearInterval(id);
  }, [endsAt]);

  const running = endsAt !== null;
  const over = running && remaining <= 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
      <Card className="p-6 text-center">
        <Badge tone="ember">Étape 1 — échauffement</Badge>
        <h2 className="mt-4 font-display text-[26px] font-extrabold leading-tight">
          {machine === "tapis" ? "Tapis de course" : "Vélo d'appartement"}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-chalk-dim">{instruction}</p>

        <div className="my-7 flex justify-center">
          <ProgressRing value={running ? 1 - remaining / (minutes * 60) : 0} size={190} stroke={11} tone={over ? "volt" : "ember"}>
            <div className="text-center">
              <p className="num font-display text-[46px] font-extrabold leading-none tabular-nums">
                {mmss(running ? remaining : minutes * 60)}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-chalk-mute">
                {over ? "Terminé" : running ? "En cours" : `${minutes} minutes`}
              </p>
            </div>
          </ProgressRing>
        </div>

        {!running ? (
          <Button size="xl" full icon="play" onClick={() => setEndsAt(Date.now() + minutes * 60 * 1000)}>
            Lancer le chrono
          </Button>
        ) : (
          <Button size="xl" full icon={over ? "check" : "right"} onClick={onDone}>
            {over ? "Échauffement terminé" : "Passer à la suite"}
          </Button>
        )}
        {!running && (
          <button onClick={onDone} className="tap mt-3 w-full text-[13px] text-chalk-mute underline underline-offset-4">
            J&apos;ai déjà fait mon échauffement
          </button>
        )}
      </Card>

      <InfoNote>
        L&apos;échauffement sert à monter la température du corps, pas à fatiguer. Tu dois finir en ayant juste un
        peu chaud, sans être essoufflé.
      </InfoNote>
    </motion.div>
  );
}

/* ---------------- Aides contextuelles ---------------- */

export function HelpButtons({
  exercise,
  substitutions,
  onSubstitute,
}: {
  exercise: Exercise;
  substitutions: Exercise[];
  onSubstitute: (id: string) => void;
}) {
  const [open, setOpen] = useState<"trouver" | "simple" | "checklist" | null>(null);
  const coaching = coachingFor(exercise.id);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {[
          { k: "trouver" as const, icon: "search", label: "Je ne la trouve pas" },
          { k: "simple" as const, icon: "info", label: "Explique plus simplement" },
          { k: "checklist" as const, icon: "check", label: "Checklist" },
        ].map((b) => (
          <button
            key={b.k}
            onClick={() => setOpen(b.k)}
            className="tap flex flex-col items-center gap-1.5 rounded-2xl border border-white/8 bg-white/[.03] px-2 py-3 text-center"
          >
            <Icon name={b.icon} size={16} className="text-ember-400" />
            <span className="text-[11px] leading-tight text-chalk-dim">{b.label}</span>
          </button>
        ))}
      </div>

      <Sheet open={open === "trouver"} onClose={() => setOpen(null)} title="Comment la reconnaître">
        <div className="space-y-4 pb-4">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[.03]">
            <ExerciseMedia exercise={exercise} className="aspect-[16/10] w-full" frame={0} priority />
          </div>
          <ul className="space-y-2.5">
            {coaching.findIt.map((f) => (
              <li key={f} className="flex gap-2.5 text-[14px] leading-relaxed text-chalk-dim">
                <Icon name="check" size={15} className="mt-1 shrink-0 text-volt-400" />
                {f}
              </li>
            ))}
          </ul>
          {substitutions.length > 0 && (
            <>
              <p className="pt-2 text-[15px] font-semibold">Pas grave. Voici les alternatives.</p>
              <div className="space-y-2">
                {substitutions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      onSubstitute(o.id);
                      setOpen(null);
                    }}
                    className="tap flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-3 text-left transition active:scale-[.98]"
                  >
                    <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-white/[.04]">
                      <ExerciseMedia exercise={o} className="h-full w-full" frame={0.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{o.name}</p>
                      <p className="truncate text-[12px] text-chalk-mute">{coachingFor(o.id).why}</p>
                    </div>
                    <Icon name="swap" size={17} className="text-ember-400" />
                  </button>
                ))}
              </div>
              <p className="text-center text-[12px] text-chalk-mute">
                L&apos;alternative remplace l&apos;exercice pour aujourd&apos;hui et reste dans ton historique.
              </p>
            </>
          )}
        </div>
      </Sheet>

      <Sheet open={open === "simple"} onClose={() => setOpen(null)} title="Le mouvement, simplement">
        <div className="space-y-4 pb-4">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[.03]">
            <ExerciseMedia exercise={exercise} className="aspect-[16/10] w-full" priority />
          </div>
          <ol className="space-y-3">
            {coaching.simple.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-ember-500/15 text-[13px] font-bold text-ember-300">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-[15px] leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl border border-white/8 bg-white/[.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-chalk-mute">Tu dois sentir</p>
            <p className="mt-1 text-[14px]">{exercise.feel}</p>
          </div>
          <Button full size="lg" onClick={() => setOpen(null)}>
            C&apos;est clair
          </Button>
        </div>
      </Sheet>

      <Sheet open={open === "checklist"} onClose={() => setOpen(null)} title="Avant de lancer la série">
        <div className="space-y-2.5 pb-4">
          {coaching.checklist.map((c) => (
            <div key={c} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.03] px-4 py-3.5">
              <Icon name="check" size={17} className="shrink-0 text-volt-400" />
              <span className="text-[14px]">{c}</span>
            </div>
          ))}
          <InfoNote tone="warn">{SAFETY.sharpPain}</InfoNote>
          <Button full size="lg" onClick={() => setOpen(null)}>
            Je suis prêt
          </Button>
        </div>
      </Sheet>
    </>
  );
}

/* ---------------- Fin d'exercice ---------------- */

export function ExerciseDone({ name, xp, pr }: { name: string; xp: number; pr?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="flex flex-col items-center gap-3 py-8 text-center"
    >
      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-volt-400 to-volt-500 text-ink-950"
      >
        <Icon name="check" size={38} strokeWidth={2.6} />
      </motion.span>
      <p className="font-display text-xl font-extrabold">{name} terminé</p>
      <Badge tone="ember" icon="spark">
        +{xp} XP
      </Badge>
      {pr && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mt-2 px-5 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ember-300">Ton meilleur résultat</p>
            <p className="mt-0.5 font-display text-lg font-bold">{pr}</p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ---------------- En-tête ---------------- */

export function WorkoutHeader({
  title,
  focus,
  progress,
  current,
  total,
  onExit,
}: {
  title: string;
  focus: string;
  progress: number;
  current: number;
  total: number;
  onExit: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-white/[.06] bg-ink-950/85 px-4 pb-3 pt-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <button
          onClick={onExit}
          className="tap grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-chalk-dim"
          aria-label="Quitter la séance"
        >
          <Icon name="x" size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold uppercase tracking-[0.12em]">
            {title} <span className="text-ember-400">— {focus}</span>
          </p>
        </div>
        <span className="num shrink-0 text-[12px] font-semibold text-chalk-mute">
          {current}/{total}
        </span>
      </div>
      <div className="mx-auto mt-2.5 flex max-w-lg items-center gap-2.5">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[.07]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-ember-400 to-ember-600"
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="num w-9 text-right text-[11px] font-semibold text-chalk-mute">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </header>
  );
}
