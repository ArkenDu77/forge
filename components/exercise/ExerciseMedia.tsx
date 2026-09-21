"use client";

import { useEffect, useRef, useState } from "react";
import type { Exercise } from "@/lib/types";
import { ExerciseFigure, type Accent } from "./Figure";
import { cx } from "@/components/ui/primitives";

/**
 * Point d'entrée unique pour l'illustration d'un exercice.
 *
 * Deux sources possibles, transparentes pour l'appelant :
 *  - une planche illustrée (Everkinetic, CC BY-SA 3.0) quand elle existe : deux
 *    positions réelles dont on enchaîne le fondu pour montrer le mouvement ;
 *  - sinon la silhouette dessinée par le moteur maison.
 */

const TINT: Record<Accent, string> = {
  ember: "invert(86%) sepia(22%) saturate(680%) hue-rotate(332deg) brightness(104%)",
  violet: "invert(80%) sepia(30%) saturate(900%) hue-rotate(215deg) brightness(108%)",
  cyan: "invert(84%) sepia(28%) saturate(560%) hue-rotate(165deg) brightness(107%)",
  volt: "invert(86%) sepia(30%) saturate(480%) hue-rotate(105deg) brightness(105%)",
};

export function ExerciseMedia({
  exercise,
  accent = "ember",
  playing = true,
  frame,
  className,
  showTrail = true,
  priority = false,
}: {
  exercise: Exercise;
  accent?: Accent;
  playing?: boolean;
  /** fige sur une position : 0 = départ, 1 = arrivée */
  frame?: number;
  className?: string;
  showTrail?: boolean;
  priority?: boolean;
}) {
  if (!exercise.plates) {
    return (
      <ExerciseFigure
        media={exercise.media}
        accent={accent}
        playing={playing}
        frame={frame}
        className={className}
        showTrail={showTrail}
      />
    );
  }
  return (
    <ExercisePlate
      id={exercise.id}
      frames={exercise.plates}
      accent={accent}
      playing={playing}
      frame={frame}
      className={className}
      priority={priority}
      label={exercise.name}
    />
  );
}

function ExercisePlate({
  id,
  frames,
  accent,
  playing,
  frame,
  className,
  priority,
  label,
}: {
  id: string;
  frames: 1 | 2;
  accent: Accent;
  playing: boolean;
  frame?: number;
  className?: string;
  priority: boolean;
  label: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(priority);

  // On ne charge la planche que lorsqu'elle approche de l'écran.
  useEffect(() => {
    if (priority || visible) return;
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { rootMargin: "220px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [priority, visible]);

  const single = frames === 1;
  // Position figée demandée : on affiche la planche correspondante, sans animation.
  const frozen = frame !== undefined ? (frame >= 0.5 && !single ? 2 : 1) : null;
  const animate = playing && !single && frozen === null;

  return (
    <div ref={wrap} className={cx("relative", className)}>
      {visible && (
        /* Deux SVG locaux superposés et recolorés au filtre CSS, qu'on fait
           se relayer en fondu : next/image ne sait ni optimiser un SVG ni
           produire ce fondu, il n'apporterait rien ici. */
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/exercises/${id}-1.svg`}
            alt={`${label} — position de départ`}
            className="absolute inset-0 h-full w-full object-contain p-3"
            style={{ filter: TINT[accent], opacity: frozen === 2 ? 0 : 1 }}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
          />
          {!single && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/exercises/${id}-2.svg`}
              alt={`${label} — position d'arrivée`}
              className={cx("absolute inset-0 h-full w-full object-contain p-3", animate && "plate-flip")}
              style={{ filter: TINT[accent], opacity: animate ? undefined : frozen === 2 ? 1 : 0 }}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Mention de licence, obligatoire partout où une planche est affichée. */
export function PlateCredit({ exercise, className }: { exercise: Exercise; className?: string }) {
  if (!exercise.plates) return null;
  return (
    <span className={cx("text-[9.5px] leading-none text-chalk-mute/70", className)}>
      Illustration Everkinetic · CC BY-SA 3.0
    </span>
  );
}
