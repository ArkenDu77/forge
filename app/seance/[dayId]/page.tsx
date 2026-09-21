"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { ExerciseMedia, PlateCredit } from "@/components/exercise/ExerciseMedia";
import { Icon } from "@/components/ui/Icon";
import { Badge, Button, Card, cx, Sheet, Skeleton } from "@/components/ui/primitives";
import {
  CardioWarmup,
  ExerciseDone,
  HelpButtons,
  RestTimer,
  SetLogger,
  WeightStepper,
  WhyThisLoad,
  WorkoutHeader,
} from "@/components/workout/pieces";
import { adaptForWeek, getDay } from "@/lib/data/program";
import { ex, substitutionsFor } from "@/lib/data/exercises";
import { coachingFor } from "@/lib/data/coaching";
import { useApp } from "@/lib/store";
import { detectPRs, historyFor, recommendLoad, workingWeight } from "@/lib/progression";
import { BAR_WEIGHT } from "@/lib/estimator";
import { sessionSummaryLine, volume } from "@/lib/coach";
import { kg, mmss, nf, tons } from "@/lib/format";
import { weeksSince } from "@/lib/projection";
import type { ProgramExercise, SetLog, WorkoutSession } from "@/lib/types";

/** « 3 × 8-12 » ne veut rien dire pour un débutant. On écrit la phrase en entier. */
function planSentence(plan: ProgramExercise) {
  const side = plan.perSide ? " de chaque côté" : "";
  const target =
    plan.metric === "distance"
      ? `parcourir entre ${plan.distMin} et ${plan.distMax} mètres`
      : plan.metric === "duration"
        ? `tenir entre ${plan.secMin} et ${plan.secMax} secondes`
        : `faire entre ${plan.repMin} et ${plan.repMax} répétitions${side}`;
  const label = plan.metric === "distance" ? "passages" : plan.sets > 1 ? "séries" : "série";
  return {
    line1: `Tu vas faire ${plan.sets} ${label}.`,
    line2: `Pour chaque ${label.replace(/s$/, "")}, essaie de ${target}.`,
    line3: `Après chaque ${label.replace(/s$/, "")}, repose-toi ${restWords(plan.restSec)}.`,
  };
}

function restWords(sec: number) {
  if (sec < 60) return `${sec} secondes`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (s === 0) return m === 1 ? "1 minute" : `${m} minutes`;
  return `${m} minute${m > 1 ? "s" : ""} et ${s} secondes`;
}

function setResultWords(s: SetLog) {
  if (s.distanceM) return `${s.distanceM} m · ${nf(s.weight, 1)} kg`;
  if (s.seconds) return `${s.seconds} s`;
  return `${s.reps} × ${nf(s.weight, s.weight % 1 === 0 ? 0 : 1)}`;
}

export default function WorkoutPage({ params }: PageProps<"/seance/[dayId]">) {
  const { dayId } = use(params);
  const router = useRouter();
  const profile = useApp((s) => s.profile);
  const sessions = useApp((s) => s.sessions);
  const active = useApp((s) => s.active);
  const startWorkout = useApp((s) => s.startWorkout);
  const finishCardio = useApp((s) => s.finishCardio);
  const logSet = useApp((s) => s.logSet);
  const skipRest = useApp((s) => s.skipRest);
  const addRest = useApp((s) => s.addRest);
  const finishWorkout = useApp((s) => s.finishWorkout);
  const abortWorkout = useApp((s) => s.abortWorkout);
  const substitute = useApp((s) => s.substitute);
  const skipExercise = useApp((s) => s.skipExercise);
  const goToExercise = useApp((s) => s.goToExercise);

  const [logging, setLogging] = useState(false);
  const [override, setOverride] = useState<{ key: string; value: number } | null>(null);
  const [celebrating, setCelebrating] = useState<{ name: string; xp: number; pr?: string } | null>(null);
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [lastLine, setLastLine] = useState<string | undefined>();

  const baseDay = getDay(dayId);
  const week = profile ? weeksSince(profile.createdAt) + 1 : 99;
  const day = useMemo(() => (baseDay ? adaptForWeek(baseDay, week) : undefined), [baseDay, week]);

  const plan = day && active ? day.exercises[active.exIndex] : null;
  const exercise = plan && active ? ex(active.substitutions[plan.exerciseId] ?? plan.exerciseId) : null;
  const history = useMemo(() => (exercise ? historyFor(sessions, exercise.id) : []), [sessions, exercise]);
  const reco = useMemo(
    () => (exercise && plan && profile ? recommendLoad(exercise, plan, history, profile) : null),
    [exercise, plan, history, profile]
  );

  if (!profile) return <Skeleton className="m-4 h-64" />;
  if (!day) return <div className="p-8 text-center text-chalk-dim">Séance introuvable.</div>;

  if (!active || active.dayId !== dayId) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-10 pt-10">
        <h1 className="font-display text-[30px] font-extrabold leading-tight">
          {day.name} <span className="block text-ember-400">{day.focus}</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-chalk-dim">
          {day.exercises.length} exercices, environ {day.estimatedMin} minutes. On commence par{" "}
          {day.warmup.minutes} minutes de {day.warmup.machine === "tapis" ? "tapis" : "vélo"}.
        </p>
        <Button size="xl" full icon="play" className="mt-7" onClick={() => startWorkout(dayId)}>
          Commencer la séance
        </Button>
        <Button variant="ghost" full className="mt-2" onClick={() => router.push("/")}>
          Retour
        </Button>
      </main>
    );
  }

  if (!plan || !exercise || !reco) return <Skeleton className="m-4 h-64" />;

  const entry = active.entries[active.exIndex];
  const warmupPlan = plan.warmup ?? [];
  const warmupDone = entry.sets.filter((s) => s.warmup).length;
  const workingDone = entry.sets.filter((s) => !s.warmup).length;
  const inWarmup = warmupDone < warmupPlan.length && workingDone === 0;
  const currentWarmup = warmupPlan[warmupDone];

  const totalSets = day.exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = active.entries.reduce((a, e) => a + e.sets.filter((s) => !s.warmup).length, 0);
  const progress = totalSets ? Math.min(1, doneSets / totalSets) : 0;
  const allDone = day.exercises.every(
    (p, i) => active.entries[i].sets.filter((s) => !s.warmup).length >= p.sets || active.entries[i].skipped
  );
  const resting = active.restEndsAt !== null && !celebrating;

  const weightKey = `${active.exIndex}-${exercise.id}-${entry.sets.length}`;
  const workingWeightValue = override && override.key === weightKey ? override.value : reco.weight;
  // Une barre olympique pèse déjà 20 kg : impossible de s'échauffer en dessous.
  const floor = exercise.loadModel === "barbell" ? BAR_WEIGHT : 0;
  const weight =
    inWarmup && currentWarmup
      ? Math.max(floor, Math.round((workingWeightValue * currentWarmup.loadPct) / 2.5) * 2.5)
      : workingWeightValue;

  const words = planSentence(plan);
  const coaching = coachingFor(exercise.id);
  const lastPerf = history[0];

  const handleSubmit = (r: { reps?: number; distanceM?: number; seconds?: number; reserve: number; pain: boolean }) => {
    const isLastWorking = !inWarmup && workingDone + 1 >= plan.sets;
    logSet({ ...r, weight, rir: r.reserve, warmup: inWarmup });
    setLogging(false);

    if (inWarmup) {
      setLastLine("Échauffement fait. On continue à monter tranquillement.");
      return;
    }
    const amount = r.reps ?? r.distanceM ?? r.seconds ?? 0;
    const top = plan.metric === "distance" ? plan.distMax ?? 0 : plan.metric === "duration" ? plan.secMax ?? 0 : plan.repMax;
    const left = plan.sets - workingDone - 1;
    setLastLine(
      r.reserve === 0
        ? "Tu es allé au bout. C'est bien, mais ce n'est pas nécessaire à chaque série."
        : amount >= top
          ? `${amount} : tu as atteint le haut de l'objectif.`
          : left > 0
            ? `Très bien. Il te reste ${left} série${left > 1 ? "s" : ""}.`
            : "Très bien. Dernier effort terminé."
    );

    if (isLastWorking) {
      const allSets: SetLog[] = [
        ...entry.sets.filter((s) => !s.warmup),
        {
          setIndex: workingDone,
          reps: r.reps ?? 0,
          distanceM: r.distanceM,
          seconds: r.seconds,
          weight,
          rir: r.reserve,
          ts: new Date().toISOString(),
        },
      ];
      const [pr] = detectPRs(exercise.id, allSets, history);
      setCelebrating({
        name: exercise.shortName ?? exercise.name,
        xp: plan.sets * 18 + 40,
        pr: pr
          ? plan.metric === "distance"
            ? `${pr.value} mètres — jamais fait aussi loin`
            : plan.metric === "duration"
              ? `${pr.value} secondes — jamais tenu aussi longtemps`
              : pr.kind === "charge"
                ? `${kg(pr.value)} — jamais soulevé aussi lourd`
                : `${kg(pr.value)} estimés au maximum`
          : undefined,
      });
      setTimeout(() => setCelebrating(null), pr ? 2800 : 2000);
    }
  };

  const finish = () => {
    const s = finishWorkout();
    if (s) setSummary(s);
    else router.push("/");
  };

  /* ---------------- Fin de séance ---------------- */
  if (summary) {
    const line = sessionSummaryLine(summary, sessions.filter((x) => x.id !== summary.id));
    const nextDayLabel = day.index < 4 ? "Prochaine séance dans deux jours." : "Prochaine séance : lundi.";
    return (
      <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-10 pt-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.span
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
            className="mx-auto grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-br from-ember-400 to-ember-600 text-ink-950"
          >
            <Icon name="check" size={46} strokeWidth={2.6} />
          </motion.span>
          <h1 className="mt-5 font-display text-3xl font-extrabold">Séance terminée</h1>
          <p className="mt-2 text-[14px] text-chalk-dim">{line.text}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-7 grid grid-cols-3 gap-2"
        >
          {[
            { l: "Durée", v: `${Math.max(1, Math.round(summary.durationSec / 60))} min` },
            { l: "Exercices", v: summary.entries.length },
            { l: "Séries", v: summary.entries.reduce((a, e) => a + e.sets.length, 0) },
          ].map((s) => (
            <Card key={s.l} className="p-4 text-center">
              <p className="num font-display text-xl font-extrabold text-gradient-ember">{s.v}</p>
              <p className="mt-0.5 text-[11px] text-chalk-mute">{s.l}</p>
            </Card>
          ))}
        </motion.div>

        {summary.prs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 space-y-2">
            {summary.prs.slice(0, 3).map((pr, i) => (
              <Card key={i} className="flex items-center gap-3 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ember-500/15 text-ember-300">
                  <Icon name="trophy" size={19} />
                </span>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-ember-300">Meilleur résultat</p>
                  <p className="text-sm font-semibold">{ex(pr.exerciseId).shortName ?? ex(pr.exerciseId).name}</p>
                </div>
                <span className="num font-display text-lg font-bold">{kg(pr.value)}</span>
              </Card>
            ))}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-4 space-y-2">
          {summary.entries.map((e) => (
            <div key={e.exerciseId} className="flex items-center gap-3 rounded-2xl border border-white/[.06] bg-white/[.02] px-4 py-3">
              <Icon name="check" size={15} className="shrink-0 text-volt-400" />
              <span className="flex-1 truncate text-[13.5px]">{ex(e.exerciseId).shortName ?? ex(e.exerciseId).name}</span>
              <span className="num text-[12px] text-chalk-mute">{e.sets.map(setResultWords).join(" · ")}</span>
            </div>
          ))}
        </motion.div>

        <p className="mt-5 text-center text-[13px] text-chalk-mute">
          Volume soulevé : {tons(volume(summary))}. {nextDayLabel}
        </p>

        <div className="mt-6 space-y-2">
          <Button size="xl" full href="/" icon="home">
            Retour à l&apos;accueil
          </Button>
          <Button variant="ghost" full href="/progression">
            Voir ma progression
          </Button>
        </div>
      </main>
    );
  }

  /* ---------------- Échauffement cardio ---------------- */
  if (active.phase === "cardio") {
    return (
      <main className="mx-auto min-h-dvh w-full px-4 pb-8">
        <WorkoutHeader
          title={day.name}
          focus={day.focus}
          progress={0}
          current={0}
          total={day.exercises.length}
          onExit={() => setExitOpen(true)}
        />
        <div className="mx-auto max-w-lg">
          <CardioWarmup
            machine={day.warmup.machine}
            minutes={day.warmup.minutes}
            instruction={day.warmup.instruction}
            onDone={finishCardio}
          />
        </div>
        <ExitSheet
          open={exitOpen}
          onClose={() => setExitOpen(false)}
          doneSets={0}
          onFinish={finish}
          onLater={() => router.push("/")}
          onAbort={() => {
            abortWorkout();
            router.push("/");
          }}
        />
      </main>
    );
  }

  /* ---------------- Exercices ---------------- */
  return (
    <main className="mx-auto min-h-dvh w-full px-4 pb-8">
      <WorkoutHeader
        title={day.name}
        focus={day.focus}
        progress={progress}
        current={active.exIndex + 1}
        total={day.exercises.length}
        onExit={() => setExitOpen(true)}
      />

      <div className="mx-auto max-w-lg">
        {celebrating ? (
          <ExerciseDone {...celebrating} />
        ) : resting ? (
          <motion.div
            className="pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <RestTimer
              endsAt={active.restEndsAt!}
              total={active.restTotal}
              message={lastLine}
              nextLabel={
                allDone
                  ? "Dernier effort de la séance : il ne reste qu'à valider."
                  : inWarmup
                    ? "Encore un échauffement, puis on passe aux vraies séries."
                    : workingDone >= plan.sets
                      ? `Ensuite : ${ex(day.exercises[active.exIndex].exerciseId).name}`
                      : `Série ${workingDone + 1} sur ${plan.sets} · ${exercise.shortName ?? exercise.name}`
              }
              onSkip={skipRest}
              onAdd={addRest}
            />
            {lastPerf && plan.metric === "reps" && (
              <p className="mt-8 text-center text-[12.5px] text-chalk-mute">
                La dernière fois : {kg(workingWeight(lastPerf.sets))} ×{" "}
                {lastPerf.sets
                  .filter((s) => s.weight === workingWeight(lastPerf.sets))
                  .map((s) => s.reps)
                  .join("/")}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`ex-${active.exIndex}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pt-4"
          >
            {/* Illustration */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[.07] bg-gradient-to-b from-white/[.05] to-transparent">
              <ExerciseMedia exercise={exercise} accent={day.accent} className="aspect-[16/10] w-full" priority />
              {entry.substitutedFor && (
                <span className="absolute left-3 top-3">
                  <Badge tone="violet" icon="swap">
                    Remplacé
                  </Badge>
                </span>
              )}
              <Link
                href={`/exercice/${exercise.slug}`}
                className="tap absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-ink-900/70 text-chalk-dim backdrop-blur"
                aria-label="Fiche complète"
              >
                <Icon name="book" size={16} />
              </Link>
              <PlateCredit exercise={exercise} className="absolute bottom-2 right-3" />
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">
                Exercice {active.exIndex + 1} sur {day.exercises.length}
              </p>
              <h2 className="mt-1 font-display text-[26px] font-extrabold leading-tight">{exercise.name}</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-chalk-dim">{coaching.why}</p>
            </div>

            {/* Ce qu'on va faire, écrit en toutes lettres */}
            <Card className="mt-4 space-y-1.5 p-5">
              <p className="text-[15px] font-semibold">{words.line1}</p>
              <p className="text-[14px] leading-relaxed text-chalk-dim">{words.line2}</p>
              <p className="text-[14px] leading-relaxed text-chalk-dim">{words.line3}</p>
              {plan.note && <p className="pt-1 text-[13px] text-ember-300/90">{plan.note}</p>}
            </Card>

            {/* Où on en est */}
            <div className="mt-4 flex items-center gap-2">
              {warmupPlan.map((_, i) => (
                <div
                  key={`w${i}`}
                  className={cx(
                    "flex h-11 flex-1 items-center justify-center rounded-xl border text-[11.5px] font-semibold",
                    i < warmupDone
                      ? "border-volt-500/40 bg-volt-500/12 text-volt-400"
                      : inWarmup && i === warmupDone
                        ? "border-ember-500/60 bg-ember-500/12 text-ember-300"
                        : "border-white/8 bg-white/[.02] text-chalk-mute"
                  )}
                >
                  {i < warmupDone ? setResultWords(entry.sets.filter((s) => s.warmup)[i]) : "Échauff."}
                </div>
              ))}
              {Array.from({ length: plan.sets }).map((_, i) => (
                <div
                  key={i}
                  className={cx(
                    "flex h-11 flex-1 items-center justify-center rounded-xl border text-[12px] font-semibold transition-all",
                    i < workingDone
                      ? "border-volt-500/40 bg-volt-500/12 text-volt-400"
                      : !inWarmup && i === workingDone
                        ? "border-ember-500/60 bg-ember-500/12 text-ember-300"
                        : "border-white/8 bg-white/[.02] text-chalk-mute"
                  )}
                >
                  {i < workingDone ? (
                    <span className="num">{setResultWords(entry.sets.filter((s) => !s.warmup)[i])}</span>
                  ) : (
                    i + 1
                  )}
                </div>
              ))}
            </div>

            {logging ? (
              <motion.div className="mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SetLogger plan={plan} isWarmup={inWarmup} onSubmit={handleSubmit} onCancel={() => setLogging(false)} />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-3">
                <Card className={cx("p-5", inWarmup && "border-ember-500/25 bg-ember-500/[.05]")}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">
                    {inWarmup
                      ? `Échauffement ${warmupDone + 1} sur ${warmupPlan.length}`
                      : `${plan.metric === "distance" ? "Passage" : "Série"} ${workingDone + 1} sur ${plan.sets}`}
                  </p>
                  <p className="mt-2 font-display text-[22px] font-extrabold leading-tight">
                    {inWarmup && currentWarmup
                      ? `${currentWarmup.reps} répétitions`
                      : plan.metric === "distance"
                        ? `${plan.distMin} à ${plan.distMax} mètres`
                        : plan.metric === "duration"
                          ? `${plan.secMin} à ${plan.secMax} secondes`
                          : `${plan.repMin} à ${plan.repMax} répétitions`}
                  </p>
                  {inWarmup && currentWarmup && (
                    <p className="mt-1.5 text-[13.5px] text-chalk-dim">{currentWarmup.note}</p>
                  )}
                </Card>

                {exercise.loadModel !== "bodyweight" && (
                  <>
                    <WeightStepper
                      value={weight}
                      onChange={(v) =>
                        setOverride({ key: weightKey, value: inWarmup && currentWarmup ? v / currentWarmup.loadPct : v })
                      }
                      increment={exercise.increment}
                      suffix={
                        exercise.loadModel === "dumbbell-pair"
                          ? "dans chaque main"
                          : exercise.loadModel === "bodyweight-loaded"
                            ? "de lest en plus de ton poids"
                            : undefined
                      }
                    />
                    {!inWarmup && <WhyThisLoad reco={reco} />}
                  </>
                )}

                <Button size="xl" full icon="check" onClick={() => setLogging(true)}>
                  {inWarmup ? "Échauffement fait" : "J'ai fini ma série"}
                </Button>

                <HelpButtons
                  exercise={exercise}
                  substitutions={substitutionsFor(plan.exerciseId)}
                  onSubstitute={(id) => substitute(plan.exerciseId, id)}
                />

                <button
                  onClick={skipExercise}
                  className="tap w-full py-2 text-center text-[12.5px] text-chalk-mute underline underline-offset-4"
                >
                  Passer cet exercice
                </button>
              </motion.div>
            )}

            {/* Le reste de la séance */}
            <div className="mt-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-chalk-mute">
                Le reste de la séance
              </p>
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
                {day.exercises.map((p, i) => {
                  const e = ex(active.substitutions[p.exerciseId] ?? p.exerciseId);
                  const done = active.entries[i].sets.filter((s) => !s.warmup).length >= p.sets;
                  return (
                    <button
                      key={p.exerciseId + i}
                      onClick={() => goToExercise(i)}
                      className={cx(
                        "tap w-[124px] shrink-0 rounded-2xl border p-2.5 text-left transition",
                        i === active.exIndex
                          ? "border-ember-500/50 bg-ember-500/[.08]"
                          : done
                            ? "border-volt-500/25 bg-volt-500/[.05]"
                            : "border-white/8 bg-white/[.02]"
                      )}
                    >
                      <div className="h-12 w-full overflow-hidden rounded-lg">
                        <ExerciseMedia exercise={e} className="h-full w-full" frame={0.5} accent={done ? "volt" : "ember"} />
                      </div>
                      <p className="mt-1.5 truncate text-[11.5px] font-medium">{e.shortName ?? e.name}</p>
                      <p className="num text-[10.5px] text-chalk-mute">
                        {active.entries[i].sets.filter((s) => !s.warmup).length}/{p.sets}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {allDone && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <Button size="xl" full icon="trophy" onClick={finish}>
                  Terminer la séance
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <ExitSheet
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        doneSets={doneSets}
        onFinish={() => {
          setExitOpen(false);
          finish();
        }}
        onLater={() => router.push("/")}
        onAbort={() => {
          abortWorkout();
          router.push("/");
        }}
      />
    </main>
  );
}

function ExitSheet({
  open,
  onClose,
  doneSets,
  onFinish,
  onLater,
  onAbort,
}: {
  open: boolean;
  onClose: () => void;
  doneSets: number;
  onFinish: () => void;
  onLater: () => void;
  onAbort: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Quitter la séance ?">
      <div className="space-y-2 pb-4">
        <p className="text-[13px] text-chalk-dim">
          {doneSets > 0
            ? `Tu as déjà fait ${doneSets} série${doneSets > 1 ? "s" : ""}. Tu peux enregistrer la séance telle quelle.`
            : "Aucune série enregistrée pour le moment."}
        </p>
        {doneSets > 0 && (
          <Button size="lg" full icon="check" onClick={onFinish}>
            Enregistrer et terminer
          </Button>
        )}
        <Button size="lg" full variant="outline" onClick={onLater}>
          Reprendre plus tard
        </Button>
        <Button size="lg" full variant="danger" onClick={onAbort}>
          Abandonner la séance
        </Button>
      </div>
    </Sheet>
  );
}
