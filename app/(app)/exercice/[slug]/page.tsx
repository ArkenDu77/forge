"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { ExerciseMedia, PlateCredit } from "@/components/exercise/ExerciseMedia";
import { MuscleMap } from "@/components/exercise/MuscleMap";
import { Icon } from "@/components/ui/Icon";
import { Accordion, Badge, Button, Card, cx, InfoNote, Sheet } from "@/components/ui/primitives";
import { getExerciseBySlug, substitutionsFor } from "@/lib/data/exercises";
import { ALL_DAYS } from "@/lib/data/program";
import { coachingFor } from "@/lib/data/coaching";
import { muscleName } from "@/lib/data/muscles";
import { useApp } from "@/lib/store";
import { historyFor, recommendLoad, workingWeight } from "@/lib/progression";
import { SAFETY } from "@/lib/copy";
import { nf, relativeDay } from "@/lib/format";

export default function ExercisePage({ params }: PageProps<"/exercice/[slug]">) {
  const { slug } = use(params);
  const exercise = getExerciseBySlug(slug);
  const profile = useApp((s) => s.profile);
  const sessions = useApp((s) => s.sessions);
  const seen = useApp((s) => s.seenExercises);
  const markSeen = useApp((s) => s.markSeen);
  const [playing, setPlaying] = useState(true);
  const [firstTimeOpen, setFirstTimeOpen] = useState(false);

  if (!exercise) notFound();

  const plan = ALL_DAYS.flatMap((d) => d.exercises).find((p) => p.exerciseId === exercise.id);
  const coaching = coachingFor(exercise.id);
  const history = historyFor(sessions, exercise.id);
  const reco = profile && plan ? recommendLoad(exercise, plan, history, profile) : null;
  const isNew = !seen.includes(exercise.id) && history.length === 0;

  const goal = plan
    ? plan.metric === "distance"
      ? `${plan.sets} passages de ${plan.distMin} à ${plan.distMax} mètres`
      : plan.metric === "duration"
        ? `${plan.sets} fois ${plan.secMin} à ${plan.secMax} secondes`
        : `${plan.sets} séries de ${plan.repMin} à ${plan.repMax} répétitions`
    : null;

  const first = history[history.length - 1];
  const latest = history[0];
  const progressed = first && latest && workingWeight(latest.sets) > workingWeight(first.sets);

  return (
    <Page>
      <TopBar title={exercise.name} back="" />

      {/* 1 — le mouvement */}
      <Card className="mb-3 overflow-hidden p-0">
        <div className="relative">
          <ExerciseMedia exercise={exercise} playing={playing} className="aspect-[16/11] w-full" priority />
          <button
            onClick={() => setPlaying((p) => !p)}
            className="tap absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-ink-900/70 text-chalk-dim backdrop-blur"
            aria-label={playing ? "Mettre en pause" : "Relancer l'animation"}
          >
            <Icon name={playing ? "pause" : "play"} size={17} />
          </button>
          <PlateCredit exercise={exercise} className="absolute bottom-2 left-3" />
        </div>
        <div className="grid grid-cols-2 divide-x divide-white/[.06] border-t border-white/[.06]">
          {[
            { label: "Position de départ", frame: 0 },
            { label: "Position d'arrivée", frame: 1 },
          ].map((f) => (
            <div key={f.label} className="p-2">
              <ExerciseMedia exercise={exercise} frame={f.frame} className="aspect-[4/3] w-full" accent="cyan" />
              <p className="truncate text-center text-[10px] uppercase tracking-wider text-chalk-mute">{f.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 2 — à quoi ça sert */}
      <Card className="mb-3 flex items-start gap-3 p-4">
        <div className="h-24 w-14 shrink-0">
          <MuscleMap
            primary={exercise.primary}
            secondary={exercise.secondary}
            side={
              exercise.primary.some((m) => ["dorsaux", "trapezes", "ischios", "fessiers", "triceps", "deltoide-post", "lombaires"].includes(m))
                ? "back"
                : "front"
            }
          />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-mute">À quoi ça sert</p>
          <p className="mt-1 text-[14.5px] leading-relaxed">{coaching.why}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {exercise.primary.map((m) => (
              <Badge key={m} tone="ember">
                {muscleName(m)}
              </Badge>
            ))}
            {exercise.secondary.slice(0, 2).map((m) => (
              <Badge key={m}>{muscleName(m)}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Chiffres du jour */}
      {plan && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Card className="p-4">
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-chalk-mute">Ce que tu vises</p>
            <p className="mt-1 text-[14px] font-semibold leading-snug">{goal}</p>
          </Card>
          <Card className="p-4">
            <p className="text-[10.5px] uppercase tracking-[0.14em] text-chalk-mute">Poids du jour</p>
            <p className="num mt-1 font-display text-xl font-extrabold text-gradient-ember">
              {reco ? reco.display : "—"}
            </p>
          </Card>
        </div>
      )}

      {isNew && (
        <button
          onClick={() => {
            setFirstTimeOpen(true);
            markSeen(exercise.id);
          }}
          className="tap mb-3 flex w-full items-center gap-3 rounded-2xl border border-ember-500/30 bg-ember-500/[.08] px-4 py-3.5 text-left"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember-500/20 text-ember-300">
            <Icon name="spark" size={17} />
          </span>
          <span className="flex-1 text-[13.5px] font-semibold text-ember-300">
            C&apos;est la première fois que je fais cet exercice
          </span>
          <Icon name="right" size={16} className="text-ember-400" />
        </button>
      )}

      {/* 3 — où aller */}
      <section className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">Où aller dans la salle</p>
        <Card className="space-y-2.5 p-5">
          {coaching.findIt.map((f) => (
            <div key={f} className="flex gap-2.5">
              <Icon name="check" size={15} className="mt-1 shrink-0 text-volt-400" />
              <span className="text-[14px] leading-relaxed text-chalk-dim">{f}</span>
            </div>
          ))}
        </Card>
      </section>

      {/* 4 — comment se placer */}
      <section className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">Comment faire</p>
        <Card className="p-5">
          <ol className="space-y-3">
            {coaching.simple.map((s, i) => (
              <motion.li
                key={s}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3"
              >
                <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-ember-500/15 text-[13px] font-bold text-ember-300">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-[14.5px] leading-relaxed">{s}</span>
              </motion.li>
            ))}
          </ol>
        </Card>
      </section>

      {/* 5 — checklist */}
      <section className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">
          À vérifier avant chaque série
        </p>
        <Card className="space-y-2 p-5">
          {coaching.checklist.map((c) => (
            <div key={c} className="flex items-center gap-2.5">
              <Icon name="check" size={16} className="shrink-0 text-volt-400" />
              <span className="text-[13.5px] text-chalk-dim">{c}</span>
            </div>
          ))}
        </Card>
      </section>

      {/* 6 — à éviter */}
      <section className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">À éviter</p>
        <Card className="space-y-2 p-5">
          {exercise.mistakes.map((m) => (
            <div key={m} className="flex items-center gap-2.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-danger/15 text-danger">
                <Icon name="x" size={12} strokeWidth={2.6} />
              </span>
              <span className="text-[13.5px] text-chalk-dim">{m}</span>
            </div>
          ))}
        </Card>
      </section>

      {/* Sensation */}
      <Card className="mb-4 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-chalk-mute">Tu dois sentir</p>
        <p className="mt-1 font-display text-[17px] font-bold">{exercise.feel}</p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-chalk-mute">{SAFETY.sharpPain}</p>
      </Card>

      {/* Détails */}
      <section className="mb-4 space-y-2">
        <Accordion title="Réglages et détails" icon="settings">
          <dl className="space-y-2.5">
            {[
              ["Respiration", exercise.breathing],
              ["Rythme", exercise.tempo],
              ["Amplitude — la distance à parcourir", exercise.rom],
              ["Mains", exercise.handPlacement],
              ["Pieds", exercise.footPlacement],
              ["Dos", exercise.backPosition],
              ["Réglage de la machine", exercise.machineSetup],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-chalk-mute">{k}</dt>
                  <dd className="text-[13.5px] leading-relaxed text-chalk-dim">{v}</dd>
                </div>
              ))}
          </dl>
        </Accordion>
        {exercise.tips.length > 0 && (
          <Accordion title="Conseils" icon="spark">
            <ul className="space-y-2">
              {exercise.tips.map((t) => (
                <li key={t} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                  <Icon name="check" size={14} className="mt-1 shrink-0 text-volt-400" />
                  {t}
                </li>
              ))}
            </ul>
          </Accordion>
        )}
        {exercise.needsSpotter && (
          <Accordion title="Sécurité" icon="alert" tone="danger">
            <p className="text-[13.5px] leading-relaxed">{SAFETY.spotter}</p>
            <p className="mt-2 text-[13.5px] leading-relaxed">{SAFETY.learnWithSomeone}</p>
          </Accordion>
        )}
      </section>

      {/* Progression */}
      {history.length > 1 && (
        <section className="mb-4">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">Ta progression</p>
            <Link href={`/progression/${exercise.id}`} className="text-[12px] text-chalk-mute">
              Tout voir
            </Link>
          </div>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-[11px] text-chalk-mute">Première fois</p>
                <p className="num font-display text-lg font-bold text-chalk-dim">
                  {nf(workingWeight(first.sets), 1)} kg
                </p>
              </div>
              <Icon name="right" size={18} className={progressed ? "text-volt-400" : "text-chalk-mute"} />
              <div className="text-center">
                <p className="text-[11px] text-chalk-mute">Aujourd&apos;hui</p>
                <p className={cx("num font-display text-lg font-extrabold", progressed && "text-gradient-ember")}>
                  {nf(workingWeight(latest.sets), 1)} kg
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 border-t border-white/[.06] pt-3">
              {history.slice(0, 3).map((h) => (
                <div key={h.date} className="flex items-center justify-between">
                  <span className="text-[12.5px] text-chalk-mute">{relativeDay(h.date.slice(0, 10))}</span>
                  <span className="num text-[12.5px] font-semibold">
                    {nf(workingWeight(h.sets), 1)} kg × {h.sets.map((s) => s.reps || s.distanceM || s.seconds).join("/")}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Alternatives */}
      <section className="mb-2">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">
          Si la machine est prise
        </p>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {substitutionsFor(exercise.id).map((s) => (
            <Link key={s.id} href={`/exercice/${s.slug}`} className="tap w-[140px] shrink-0 rounded-2xl border border-white/8 bg-white/[.03] p-2.5">
              <div className="h-16 w-full overflow-hidden rounded-xl bg-white/[.03]">
                <ExerciseMedia exercise={s} className="h-full w-full" frame={0.5} accent="violet" />
              </div>
              <p className="mt-1.5 truncate text-[12px] font-medium">{s.shortName ?? s.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <Sheet open={firstTimeOpen} onClose={() => setFirstTimeOpen(false)} title="Première fois">
        <div className="space-y-3 pb-4">
          <InfoNote tone="warn">{SAFETY.loadNeverSafe}</InfoNote>
          <ol className="space-y-3">
            {(exercise.firstTime ?? [
              "Commence avec un poids très léger pour sentir le mouvement.",
              "Fais une série d'essai de 8 à 10 répétitions.",
              "Augmente petit à petit jusqu'à trouver un poids difficile mais propre.",
            ]).map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-ember-500/15 text-[13px] font-bold text-ember-300">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-[14.5px] leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl border border-white/8 bg-white/[.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-chalk-mute">Effort normal</p>
            <p className="mt-1 text-[13px] text-chalk-dim">{SAFETY.normalEffort}</p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-danger">Signal anormal</p>
            <p className="mt-1 text-[13px] text-chalk-dim">{SAFETY.abnormalPain}</p>
          </div>
          <p className="text-center text-[11.5px] text-chalk-mute">{SAFETY.noDiagnosis}</p>
          <Button full size="lg" onClick={() => setFirstTimeOpen(false)}>
            C&apos;est compris
          </Button>
        </div>
      </Sheet>

      <p className="mt-4 text-center text-[11px] text-chalk-mute">{SAFETY.notMedical}</p>
    </Page>
  );
}
