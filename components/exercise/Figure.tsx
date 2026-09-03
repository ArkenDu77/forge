"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import type { ExerciseMedia, LoadSpec, PropSpec } from "@/lib/types";
import { buildSkeleton, lerpPose, pingPong, type P, type Skeleton } from "./figure-math";

export type Accent = "ember" | "violet" | "cyan" | "volt";

export const ACCENTS: Record<Accent, [string, string]> = {
  ember: ["#ffc48a", "#ff6b2c"],
  violet: ["#c4b1ff", "#8b5cf6"],
  cyan: ["#a5e8ff", "#38bdf8"],
  volt: ["#a8f5d5", "#34d399"],
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Silhouette animée pilotée par les données (aucun média sous copyright).
 * Les positions sont écrites directement dans le DOM à chaque frame :
 * pas de re-render React, donc une animation stable à 60 fps.
 */
export function ExerciseFigure({
  media,
  accent = "ember",
  playing = true,
  className,
  showTrail = true,
  speed = 1,
  frame,
}: {
  media: ExerciseMedia;
  accent?: Accent;
  playing?: boolean;
  className?: string;
  showTrail?: boolean;
  speed?: number;
  /** Fige l'animation sur une position clé (0 = départ, 1 = arrivée). */
  frame?: number;
}) {
  const uid = useId().replace(/[:_]/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const bones = useRef<Record<string, SVGElement | null>>({});
  const visible = useRef(true);
  const [c1, c2] = ACCENTS[accent];
  const cycle = (media.tempoMs ?? 1500) * 2;

  const poseAt = useMemo(
    () => (u: number) => {
      const poses = media.poses;
      if (poses.length === 1) return poses[0];
      const scaled = u * (poses.length - 1);
      const i = Math.min(poses.length - 2, Math.floor(scaled));
      return lerpPose(poses[i], poses[i + 1], scaled - i);
    },
    [media]
  );

  const initial = useMemo(
    () => buildSkeleton(poseAt(frame ?? 0), media.view),
    [poseAt, media.view, frame]
  );

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const set = (key: string, attrs: Record<string, string | number>) => {
      const el = bones.current[key];
      if (!el) return;
      for (const k in attrs) el.setAttribute(k, String(attrs[k]));
    };
    const seg = (key: string, a: P, b: P) =>
      set(key, { x1: r2(a[0]), y1: r2(a[1]), x2: r2(b[0]), y2: r2(b[1]) });

    const apply = (sk: Skeleton) => {
      seg("far-upper", sk.shoulderL, sk.far.elbow);
      seg("far-fore", sk.far.elbow, sk.far.wrist);
      seg("far-thigh", sk.hipL, sk.far.knee);
      seg("far-shin", sk.far.knee, sk.far.ankle);
      seg("far-foot", sk.far.ankle, sk.far.toe);
      seg("neck", sk.shoulder, sk.neck);
      seg("thigh", sk.hipR, sk.near.knee);
      seg("shin", sk.near.knee, sk.near.ankle);
      seg("foot", sk.near.ankle, sk.near.toe);
      seg("upper", sk.shoulderR, sk.near.elbow);
      seg("fore", sk.near.elbow, sk.near.wrist);
      set("head", { cx: r2(sk.head[0]), cy: r2(sk.head[1]) });
      set("glow", { cx: r2(sk.hip[0]) });
      if (sk.view === "front") {
        set("torso", {
          d: `M${r2(sk.shoulderL[0])},${r2(sk.shoulderL[1])} L${r2(sk.shoulderR[0])},${r2(sk.shoulderR[1])} L${r2(
            sk.hipR[0]
          )},${r2(sk.hipR[1])} L${r2(sk.hipL[0])},${r2(sk.hipL[1])} Z`,
        });
      } else {
        seg("torso", sk.hip, sk.shoulder);
      }
      const w = sk.near.wrist;
      const wl = sk.far.wrist;
      set("load-near", { transform: `translate(${r2(w[0])} ${r2(w[1])})` });
      set("load-far", { transform: `translate(${r2(wl[0])} ${r2(wl[1])})` });
      if (media.load.kind === "barbell" || media.load.kind === "ez") {
        if (sk.view === "front") seg("rod", [wl[0] - 30, wl[1]], [w[0] + 30, w[1]]);
      }
      if (media.load.kind === "cable") {
        const a = media.load.anchor;
        seg("cable-near", a, w);
        seg("cable-far", a, wl);
      }
    };

    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (frame !== undefined || !playing || reduce) {
      apply(buildSkeleton(poseAt(frame ?? (playing ? 0.5 : 0)), media.view));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      if (visible.current) {
        const u = pingPong(((now - start) / (cycle / speed)) % 1);
        apply(buildSkeleton(poseAt(u), media.view));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, cycle, speed, poseAt, media, frame]);

  const trail = useMemo(() => {
    if (!showTrail || media.poses.length < 2) return null;
    const pts = media.poses.map((p) => buildSkeleton(p, media.view).near.wrist);
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${r2(p[0])},${r2(p[1])}`).join(" ");
  }, [media, showTrail]);

  // Refs de rappel : React les appelle après le commit, jamais pendant le rendu.
  // C'est ce qui permet d'animer le SVG sans re-render (voir l'effet ci-dessus).
  /* eslint-disable react-hooks/refs */
  const reg = (k: string) => (el: SVGElement | null) => {
    bones.current[k] = el;
  };
  /* eslint-enable react-hooks/refs */
  const g = `url(#bd-${uid})`;

  const bone = ({ k, a, b, w, opacity = 1, stroke = g }: { k: string; a: P; b: P; w: number; opacity?: number; stroke?: string }) => (
    <line
      key={k}
      ref={reg(k)}
      x1={r2(a[0])}
      y1={r2(a[1])}
      x2={r2(b[0])}
      y2={r2(b[1])}
      stroke={stroke}
      strokeWidth={w}
      strokeLinecap="round"
      opacity={opacity}
    />
  );

  return (
    <div ref={wrap} className={className}>
      <svg viewBox={media.viewBox ?? "0 0 200 150"} className="h-full w-full" role="img" aria-label="Démonstration animée du mouvement">
        <defs>
          <linearGradient id={`bd-${uid}`} x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <radialGradient id={`gl-${uid}`}>
            <stop offset="0%" stopColor={c2} stopOpacity="0.3" />
            <stop offset="100%" stopColor={c2} stopOpacity="0" />
          </radialGradient>
          <filter id={`sh-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse ref={reg("glow")} cx={r2(initial.hip[0])} cy="128" rx="54" ry="14" fill={`url(#gl-${uid})`} />

        <g opacity="0.9">
          {media.props.map((p, i) => (
            <PropShape key={i} spec={p} />
          ))}
        </g>

        {trail && (
          <path d={trail} fill="none" stroke={c2} strokeWidth="1.4" strokeDasharray="3 4.5" strokeLinecap="round" opacity="0.4" />
        )}

        <g filter={`url(#sh-${uid})`}>
          <g opacity="0.28">
            {bone({ k: "far-upper", a: initial.shoulderL, b: initial.far.elbow, w: 8.5, stroke: c2 })}
            {bone({ k: "far-fore", a: initial.far.elbow, b: initial.far.wrist, w: 7.5, stroke: c2 })}
            {bone({ k: "far-thigh", a: initial.hipL, b: initial.far.knee, w: 9.5, stroke: c2 })}
            {bone({ k: "far-shin", a: initial.far.knee, b: initial.far.ankle, w: 8.5, stroke: c2 })}
            {bone({ k: "far-foot", a: initial.far.ankle, b: initial.far.toe, w: 6.5, stroke: c2 })}
          </g>

          {media.view === "front" ? (
            <path
              ref={reg("torso")}
              d={`M${r2(initial.shoulderL[0])},${r2(initial.shoulderL[1])} L${r2(initial.shoulderR[0])},${r2(
                initial.shoulderR[1]
              )} L${r2(initial.hipR[0])},${r2(initial.hipR[1])} L${r2(initial.hipL[0])},${r2(initial.hipL[1])} Z`}
              fill={g}
              stroke={g}
              strokeWidth="9"
              strokeLinejoin="round"
            />
          ) : (
            bone({ k: "torso", a: initial.hip, b: initial.shoulder, w: 19 })
          )}

          {bone({ k: "neck", a: initial.shoulder, b: initial.neck, w: 9 })}
          <circle ref={reg("head")} cx={r2(initial.head[0])} cy={r2(initial.head[1])} r="9.5" fill={g} />

          {bone({ k: "thigh", a: initial.hipR, b: initial.near.knee, w: 11 })}
          {bone({ k: "shin", a: initial.near.knee, b: initial.near.ankle, w: 9.5 })}
          {bone({ k: "foot", a: initial.near.ankle, b: initial.near.toe, w: 7 })}
          {bone({ k: "upper", a: initial.shoulderR, b: initial.near.elbow, w: 9.5 })}
          {bone({ k: "fore", a: initial.near.elbow, b: initial.near.wrist, w: 8.5 })}
        </g>

        <LoadShape load={media.load} sk={initial} c1={c1} uid={uid} reg={reg} front={media.view === "front"} />
      </svg>
    </div>
  );
}

function PropShape({ spec }: { spec: PropSpec }) {
  const steel = "#4a5468";
  const steelSoft = "#2f3846";
  switch (spec.kind) {
    case "floor":
      return <line x1="8" y1="132" x2="192" y2="132" stroke={steel} strokeWidth="2" strokeLinecap="round" opacity="0.6" />;
    case "bench": {
      const w = spec.w ?? 80;
      const inc = spec.incline ?? 0;
      return (
        <g>
          <g transform={`rotate(${-inc} ${spec.x} ${spec.y})`}>
            <rect x={spec.x - w / 2} y={spec.y} width={w} height="8" rx="4" fill={steelSoft} />
          </g>
          <line x1={spec.x - w / 5} y1={spec.y + 4} x2={spec.x - w / 5} y2="132" stroke={steel} strokeWidth="4" strokeLinecap="round" />
          <line x1={spec.x + w / 3} y1={spec.y + 4} x2={spec.x + w / 3} y2="132" stroke={steel} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    }
    case "rack": {
      const h = spec.h ?? 50;
      return (
        <g opacity="0.75">
          <rect x={spec.x - 3} y={spec.y - h} width="6" height={h} rx="3" fill={steelSoft} />
          <rect x={spec.x - 3} y={spec.y - h} width="17" height="5" rx="2.5" fill={steel} />
        </g>
      );
    }
    case "pullup-bar": {
      const w = spec.w ?? 60;
      return (
        <g>
          <rect x={spec.x - w / 2} y={spec.y} width={w} height="5" rx="2.5" fill={steel} />
          <rect x={spec.x - w / 2 - 5} y={spec.y - 16} width="6" height="20" rx="3" fill={steelSoft} />
          <rect x={spec.x + w / 2 - 1} y={spec.y - 16} width="6" height="20" rx="3" fill={steelSoft} />
        </g>
      );
    }
    case "seat":
      return (
        <g>
          <rect x={spec.x - 20} y={spec.y} width="44" height="8" rx="4" fill={steelSoft} />
          {spec.back ? <rect x={spec.x - 25} y={spec.y - 44} width="8" height="48" rx="4" fill={steelSoft} /> : null}
          <line x1={spec.x + 2} y1={spec.y + 6} x2={spec.x + 2} y2="132" stroke={steel} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "machine":
      return (
        <g opacity="0.8">
          <rect x={spec.x - (spec.w ?? 20) / 2} y={spec.y} width={spec.w ?? 20} height={spec.h ?? 60} rx="6" fill={steelSoft} />
          {Array.from({ length: Math.max(2, Math.floor((spec.h ?? 60) / 12)) }).map((_, i) => (
            <rect
              key={i}
              x={spec.x - (spec.w ?? 20) / 2 + 3.5}
              y={spec.y + 6 + i * 11}
              width={(spec.w ?? 20) - 7}
              height="7"
              rx="2.5"
              fill={steel}
            />
          ))}
        </g>
      );
    case "pulley":
      return (
        <g>
          <circle cx={spec.x} cy={spec.y} r="6" fill="none" stroke={steel} strokeWidth="3" />
          <circle cx={spec.x} cy={spec.y} r="1.8" fill={steel} />
        </g>
      );
    case "platform":
      return <rect x={spec.x - (spec.w ?? 40) / 2} y={spec.y} width={spec.w ?? 40} height={spec.h ?? 8} rx="4" fill={steelSoft} />;
    case "step":
      return (
        <g>
          <rect x={spec.x - 24} y={spec.y} width="48" height="7" rx="3.5" fill={steelSoft} />
          <line x1={spec.x - 20} y1={spec.y + 7} x2={spec.x - 20} y2="132" stroke={steel} strokeWidth="3" />
        </g>
      );
    default:
      return null;
  }
}

function LoadShape({
  load,
  sk,
  c1,
  uid,
  reg,
  front,
}: {
  load: LoadSpec;
  sk: Skeleton;
  c1: string;
  uid: string;
  reg: (k: string) => (el: SVGElement | null) => void;
  front: boolean;
}) {
  const steel = "#5b6679";
  const g = `url(#bd-${uid})`;
  const w = sk.near.wrist;
  const wl = sk.far.wrist;
  const near = `translate(${r2(w[0])} ${r2(w[1])})`;
  const far = `translate(${r2(wl[0])} ${r2(wl[1])})`;

  switch (load.kind) {
    case "barbell":
    case "ez":
      if (front)
        return (
          <g>
            <line
              ref={reg("rod")}
              x1={r2(wl[0] - 30)}
              y1={r2(wl[1])}
              x2={r2(w[0] + 30)}
              y2={r2(w[1])}
              stroke={steel}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <g ref={reg("load-far")} transform={far}>
              <rect x="-27" y="-11" width="5.4" height="22" rx="2.4" fill={g} />
              <rect x="-20" y="-8" width="4.6" height="16" rx="2" fill={g} />
            </g>
            <g ref={reg("load-near")} transform={near}>
              <rect x="21.6" y="-11" width="5.4" height="22" rx="2.4" fill={g} />
              <rect x="15.4" y="-8" width="4.6" height="16" rx="2" fill={g} />
            </g>
          </g>
        );
      return (
        <g ref={reg("load-near")} transform={near}>
          <circle cx="0" cy="0" r="10.5" fill="none" stroke={c1} strokeWidth="4.5" />
          <circle cx="0" cy="0" r="3.4" fill={steel} />
        </g>
      );
    case "dumbbell":
      if (front)
        return (
          <g>
            {(["load-near", "load-far"] as const).map((k) => (
              <g key={k} ref={reg(k)} transform={k === "load-near" ? near : far}>
                <rect x="-11" y="-2.4" width="22" height="4.8" rx="2.4" fill={steel} />
                <rect x="-13.5" y="-6.5" width="5" height="13" rx="2.2" fill={g} />
                <rect x="8.5" y="-6.5" width="5" height="13" rx="2.2" fill={g} />
              </g>
            ))}
          </g>
        );
      return (
        <g ref={reg("load-near")} transform={near}>
          <rect x="-6" y="-7.5" width="12" height="15" rx="4" fill={g} />
          <rect x="-9" y="-3" width="18" height="6" rx="3" fill={steel} />
        </g>
      );
    case "cable": {
      const a = load.anchor;
      return (
        <g>
          <line ref={reg("cable-near")} x1={a[0]} y1={a[1]} x2={r2(w[0])} y2={r2(w[1])} stroke={c1} strokeWidth="1.8" opacity="0.85" />
          {front && (
            <line ref={reg("cable-far")} x1={a[0]} y1={a[1]} x2={r2(wl[0])} y2={r2(wl[1])} stroke={c1} strokeWidth="1.8" opacity="0.45" />
          )}
          <g ref={reg("load-near")} transform={near}>
            <circle cx="0" cy="0" r="4.4" fill={g} />
          </g>
        </g>
      );
    }
    case "machine-handle":
      return (
        <g>
          <g ref={reg("load-near")} transform={near}>
            <rect x="-5" y="-5" width="10" height="10" rx="4" fill={g} />
          </g>
          {front && (
            <g ref={reg("load-far")} transform={far} opacity="0.45">
              <rect x="-5" y="-5" width="10" height="10" rx="4" fill={g} />
            </g>
          )}
        </g>
      );
    case "handle":
      return (
        <g ref={reg("load-near")} transform={near}>
          <circle cx="0" cy="0" r="5" fill={g} />
        </g>
      );
    default:
      return null;
  }
}
