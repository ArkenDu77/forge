"use client";

import { ExerciseMedia } from "@/components/exercise/ExerciseMedia";
import { ALL_DAYS } from "@/lib/data/program";
import { ex } from "@/lib/data/exercises";

export default function Lab() {
  const ids = [...new Set(ALL_DAYS.flatMap((d) => d.exercises.map((e) => e.exerciseId)))];
  return (
    <div className="p-4">
      <h1 className="font-display mb-4 text-xl">Lab — {ids.length} exercices du programme</h1>
      <div className="grid grid-cols-4 gap-3">
        {ids.map((id) => {
          const e = ex(id);
          return (
            <div key={id} className="glass rounded-2xl p-2">
              <ExerciseMedia exercise={e} className="aspect-[4/3] w-full" priority />
              <p className="mt-1 text-center text-[11px] text-chalk-dim">{e.shortName ?? e.name}</p>
              <p className="text-center text-[9px] text-chalk-mute">{e.plates ? `planche ×${e.plates}` : "maison"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
