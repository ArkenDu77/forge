"use client";

import { useId } from "react";
import type { MuscleId } from "@/lib/types";
import { cx } from "@/components/ui/primitives";

type Shape =
  | { t: "r"; x: number; y: number; w: number; h: number; rx?: number; rot?: number }
  | { t: "e"; cx: number; cy: number; rx: number; ry: number; rot?: number };

type Region = { id: MuscleId | "base"; shapes: Shape[] };

const mirror = (s: Shape): Shape =>
  s.t === "r"
    ? { ...s, x: 120 - s.x - s.w, rot: s.rot ? -s.rot : undefined }
    : { ...s, cx: 120 - s.cx, rot: s.rot ? -s.rot : undefined };

const both = (s: Shape) => [s, mirror(s)];

/* Silhouette commune : tête, cou, bassin, mains, pieds */
const BASE: Shape[] = [
  { t: "e", cx: 60, cy: 20, rx: 12.5, ry: 14 },
  { t: "r", x: 54, y: 32, w: 12, h: 10, rx: 4 },
  { t: "r", x: 41, y: 116, w: 38, h: 26, rx: 10 },
  ...both({ t: "e", cx: 25, cy: 139, rx: 6, ry: 8 }),
  ...both({ t: "r", x: 44, y: 236, w: 15, h: 8, rx: 3.5 }),
];

const FRONT: Region[] = [
  { id: "deltoide-ant", shapes: both({ t: "e", cx: 33, cy: 52, rx: 11, ry: 12 }) },
  { id: "pectoraux", shapes: both({ t: "r", x: 42, y: 46, w: 17, h: 22, rx: 7 }) },
  { id: "biceps", shapes: both({ t: "r", x: 22, y: 62, w: 13, h: 34, rx: 6.5 }) },
  { id: "avant-bras", shapes: both({ t: "r", x: 20, y: 98, w: 12, h: 36, rx: 6 }) },
  { id: "abdominaux", shapes: [{ t: "r", x: 50, y: 70, w: 20, h: 44, rx: 7 }] },
  { id: "obliques", shapes: both({ t: "r", x: 40, y: 74, w: 9, h: 40, rx: 4.5 }) },
  { id: "quadriceps", shapes: both({ t: "r", x: 41, y: 144, w: 18, h: 52, rx: 9 }) },
  { id: "adducteurs", shapes: both({ t: "r", x: 52, y: 144, w: 7, h: 36, rx: 3.5 }) },
  { id: "mollets", shapes: both({ t: "r", x: 43, y: 198, w: 15, h: 38, rx: 7 }) },
];

const BACK: Region[] = [
  { id: "trapezes", shapes: [{ t: "r", x: 44, y: 42, w: 32, h: 26, rx: 9 }] },
  { id: "deltoide-post", shapes: both({ t: "e", cx: 33, cy: 52, rx: 11, ry: 12 }) },
  { id: "dorsaux", shapes: both({ t: "r", x: 41, y: 62, w: 18, h: 34, rx: 7 }) },
  { id: "triceps", shapes: both({ t: "r", x: 22, y: 62, w: 13, h: 34, rx: 6.5 }) },
  { id: "avant-bras", shapes: both({ t: "r", x: 20, y: 98, w: 12, h: 36, rx: 6 }) },
  { id: "lombaires", shapes: [{ t: "r", x: 48, y: 96, w: 24, h: 20, rx: 7 }] },
  { id: "fessiers", shapes: both({ t: "e", cx: 50, cy: 130, rx: 11, ry: 11 }) },
  { id: "ischios", shapes: both({ t: "r", x: 41, y: 144, w: 18, h: 52, rx: 9 }) },
  { id: "mollets", shapes: both({ t: "r", x: 43, y: 198, w: 15, h: 38, rx: 7 }) },
];

function Shapes({ shapes, fill, opacity }: { shapes: Shape[]; fill: string; opacity: number }) {
  return (
    <>
      {shapes.map((s, i) =>
        s.t === "r" ? (
          <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx ?? 6} fill={fill} opacity={opacity} />
        ) : (
          <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={fill} opacity={opacity} />
        )
      )}
    </>
  );
}

export function MuscleMap({
  primary,
  secondary = [],
  side = "front",
  className,
  accent = "#ff6b2c",
  accent2 = "#ffc48a",
}: {
  primary: MuscleId[];
  secondary?: MuscleId[];
  side?: "front" | "back";
  className?: string;
  accent?: string;
  accent2?: string;
}) {
  const uid = useId().replace(/[:_]/g, "");
  const regions = side === "front" ? FRONT : BACK;
  return (
    <svg viewBox="0 0 120 250" className={cx("h-full w-full", className)} role="img" aria-label="Muscles sollicités">
      <defs>
        <linearGradient id={`m-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={accent2} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>
      <Shapes shapes={BASE} fill="#ffffff" opacity={0.09} />
      {regions.map((r) => {
        const isPrimary = primary.includes(r.id as MuscleId);
        const isSecondary = secondary.includes(r.id as MuscleId);
        return (
          <Shapes
            key={r.id}
            shapes={r.shapes}
            fill={isPrimary || isSecondary ? `url(#m-${uid})` : "#ffffff"}
            opacity={isPrimary ? 1 : isSecondary ? 0.42 : 0.09}
          />
        );
      })}
    </svg>
  );
}

export function MuscleMapPair({
  primary,
  secondary,
  className,
}: {
  primary: MuscleId[];
  secondary?: MuscleId[];
  className?: string;
}) {
  return (
    <div className={cx("flex items-end justify-center gap-3", className)}>
      <div className="flex flex-col items-center gap-1">
        <MuscleMap primary={primary} secondary={secondary} side="front" className="h-full" />
        <span className="text-[10px] uppercase tracking-wider text-chalk-mute">Face</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <MuscleMap primary={primary} secondary={secondary} side="back" className="h-full" />
        <span className="text-[10px] uppercase tracking-wider text-chalk-mute">Dos</span>
      </div>
    </div>
  );
}
