"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { notFound } from "next/navigation";
import { use } from "react";
import { Page, TopBar } from "@/components/AppShell";
import { ExerciseFigure } from "@/components/exercise/Figure";
import { Icon } from "@/components/ui/Icon";
import { Badge, Button, Card, InfoNote, SectionTitle } from "@/components/ui/primitives";
import { getDay } from "@/lib/data/program";
import { ex } from "@/lib/data/exercises";
import { muscleName } from "@/lib/data/muscles";
import { useApp } from "@/lib/store";
import { historyFor, recommendLoad } from "@/lib/progression";
import { lastSessionFor } from "@/lib/session";
import { mmss, relativeDay } from "@/lib/format";
import { SAFETY } from "@/lib/copy";

export default function DayPage({ params }: PageProps<"/programme/[dayId]">) {
  const { dayId } = use(params);
  const day = getDay(dayId);
  const profile = useApp((s) => s.profile);
  const sessions = useApp((s) => s.sessions);

  if (!day) notFound();
  const last = lastSessionFor(sessions, day.id);
  const totalSets = day.exercises.reduce((a, e) => a + e.sets, 0);
  const muscles = [...new Set(day.exercises.flatMap((e) => ex(e.exerciseId).primary))];

  return (
    <Page>
      <TopBar title={day.name} subtitle={`Jour ${day.index} · ${day.focus}`} back="/programme" />

      <Card className="mb-4 p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { l: "Exercices", v: day.exercises.length },
            { l: "Séries", v: totalSets },
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
            Dernière fois : {relativeDay(last.date.slice(0, 10))} · {Math.round(last.durationSec / 60)} min
          </p>
        )}
      </Card>

      <Button size="xl" full icon="play" href={`/seance/${day.id}`} className="mb-5">
        Commencer la séance
      </Button>

      <SectionTitle>Déroulé</SectionTitle>
      <div className="space-y-2.5">
        {day.exercises.map((p, i) => {
          const exercise = ex(p.exerciseId);
          const history = historyFor(sessions, p.exerciseId);
          const reco = profile ? recommendLoad(exercise, p, history, profile) : null;
          return (
            <motion.div key={p.exerciseId + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/exercice/${exercise.slug}`} className="tap block">
                <Card className="flex items-center gap-3 p-3">
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-white/[.03]">
                    <ExerciseFigure media={exercise.media} className="h-full w-full" showTrail={false} frame={0.5} accent={day.accent} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="num text-[10.5px] font-bold text-chalk-mute">{String(i + 1).padStart(2, "0")}</span>
                      {p.kind === "force" && <Badge tone="ember">Force</Badge>}
                    </div>
                    <p className="truncate text-[14.5px] font-semibold">{exercise.name}</p>
                    <p className="num text-[12.5px] text-chalk-mute">
                      {p.sets} × {p.repMin}-{p.repMax} · repos {mmss(p.restSec)}
                      {reco && ` · ${reco.display}`}
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
          Les charges affichées sont recalculées à chaque séance à partir de ton historique, de tes répétitions et de la
          difficulté ressentie.
        </InfoNote>
        {day.exercises.some((p) => ex(p.exerciseId).needsSpotter) && <InfoNote tone="warn">{SAFETY.spotter}</InfoNote>}
      </div>
    </Page>
  );
}
