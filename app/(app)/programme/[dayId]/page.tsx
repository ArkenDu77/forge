"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { ExerciseMedia } from "@/components/exercise/ExerciseMedia";
import { Icon } from "@/components/ui/Icon";
import { Badge, Button, Card, InfoNote } from "@/components/ui/primitives";
import { adaptForWeek, getDay } from "@/lib/data/program";
import { ex } from "@/lib/data/exercises";
import { coachingFor } from "@/lib/data/coaching";
import { muscleName } from "@/lib/data/muscles";
import { useApp } from "@/lib/store";
import { historyFor, recommendLoad } from "@/lib/progression";
import { lastSessionFor, weekdayLabel } from "@/lib/session";
import { weeksSince } from "@/lib/projection";
import { relativeDay } from "@/lib/format";
import { SAFETY } from "@/lib/copy";
import type { ProgramExercise } from "@/lib/types";

function goalWords(plan: ProgramExercise) {
  if (plan.metric === "distance") return `${plan.sets} passages de ${plan.distMin} à ${plan.distMax} m`;
  if (plan.metric === "duration") return `${plan.sets} fois ${plan.secMin} à ${plan.secMax} s`;
  return `${plan.sets} séries de ${plan.repMin} à ${plan.repMax} répétitions${plan.perSide ? " par côté" : ""}`;
}

function restWords(sec: number) {
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m} min ${s}`;
}

export default function DayPage({ params }: PageProps<"/programme/[dayId]">) {
  const { dayId } = use(params);
  const profile = useApp((s) => s.profile);
  const sessions = useApp((s) => s.sessions);
  const base = getDay(dayId);
  const week = profile ? weeksSince(profile.createdAt) + 1 : 99;
  const day = useMemo(() => (base ? adaptForWeek(base, week) : undefined), [base, week]);

  if (!day) notFound();
  const last = lastSessionFor(sessions, day.id);
  const muscles = [...new Set(day.exercises.flatMap((e) => ex(e.exerciseId).primary))];

  return (
    <Page>
      <TopBar title={`${day.name} — ${day.focus}`} subtitle={weekdayLabel(day.weekday)} back="/programme" />

      <Card className="mb-4 p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { l: "Exercices", v: day.exercises.length },
            { l: "Séries", v: day.exercises.reduce((a, e) => a + e.sets, 0) },
            { l: "Durée", v: `${day.estimatedMin} min` },
          ].map((s) => (
            <div key={s.l}>
              <p className="num font-display text-2xl font-extrabold">{s.v}</p>
              <p className="text-[11px] text-chalk-mute">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {muscles.map((m) => (
            <Badge key={m}>{muscleName(m)}</Badge>
          ))}
        </div>
        {last && (
          <p className="mt-3 text-[12.5px] text-chalk-mute">
            Dernière fois : {relativeDay(last.date.slice(0, 10)).toLowerCase()} · {Math.round(last.durationSec / 60)} min
          </p>
        )}
      </Card>

      <Button size="xl" full icon="play" href={`/seance/${day.id}`} className="mb-5">
        Commencer la séance
      </Button>

      {/* Échauffement */}
      <Card className="mb-4 flex items-start gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ember-500/12 text-ember-300">
          <Icon name="clock" size={18} />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-mute">On commence par</p>
          <p className="text-[15px] font-semibold">
            {day.warmup.minutes} minutes de {day.warmup.machine === "tapis" ? "tapis de course" : "vélo"}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-chalk-dim">{day.warmup.instruction}</p>
        </div>
      </Card>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-chalk-mute">Puis, dans l&apos;ordre</p>
      <div className="space-y-2.5">
        {day.exercises.map((p, i) => {
          const exercise = ex(p.exerciseId);
          const history = historyFor(sessions, p.exerciseId);
          const reco = profile ? recommendLoad(exercise, p, history, profile) : null;
          return (
            <motion.div key={p.exerciseId + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/exercice/${exercise.slug}`} className="tap block">
                <Card className="flex items-center gap-3 p-3">
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-white/[.03]">
                    <ExerciseMedia exercise={exercise} className="h-full w-full" frame={0.5} accent={day.accent} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="num text-[10.5px] font-bold text-chalk-mute">{String(i + 1).padStart(2, "0")}</span>
                      {p.warmup && <Badge tone="ember">Échauffement guidé</Badge>}
                    </div>
                    <p className="truncate text-[14.5px] font-semibold">{exercise.name}</p>
                    <p className="text-[12.5px] text-chalk-mute">{goalWords(p)}</p>
                    <p className="text-[12px] text-chalk-mute">
                      Repos {restWords(p.restSec)}
                      {reco && exercise.loadModel !== "bodyweight" ? ` · ${reco.display}` : ""}
                    </p>
                  </div>
                  <Icon name="right" size={16} className="shrink-0 text-chalk-mute" />
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        <InfoNote>
          Les poids affichés sont recalculés à chaque séance à partir de ce que tu as réussi la fois d&apos;avant. Tu
          n&apos;as rien à décider toi-même.
        </InfoNote>
        {day.exercises.some((p) => ex(p.exerciseId).needsSpotter) && <InfoNote tone="warn">{SAFETY.spotter}</InfoNote>}
      </div>
    </Page>
  );
}
