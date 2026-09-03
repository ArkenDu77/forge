import type { Pose } from "@/lib/types";

/**
 * Repère : viewBox 0 0 200 150, sol à y = 132.
 * Angles en degrés — 0° vers la droite, 90° vers le bas, -90° vers le haut.
 * Longueurs de segments : torse 40 · bras 25 · avant-bras 24 · cuisse 30 · tibia 30 · pied 13
 */

type P = [number, number];
const DEG = 180 / Math.PI;

export const stand = (o: Partial<Pose> = {}): Pose => ({
  hip: [100, 72], torso: -90, upperArm: 90, foreArm: 90, thigh: 90, shin: 90, foot: 0, ...o,
});

/** Assis, buste droit, cuisses horizontales. */
export const seated = (o: Partial<Pose> = {}): Pose => ({
  hip: [96, 102], torso: -90, upperArm: 90, foreArm: 90, thigh: 0, shin: 90, foot: 0, ...o,
});

/** Allongé sur le dos, tête à gauche. */
export const lying = (o: Partial<Pose> = {}): Pose => ({
  hip: [116, 84], torso: 180, upperArm: -85, foreArm: -88, thigh: 32, shin: 80, foot: 0, ...o,
});

/** Buste incliné vers l'arrière (banc incliné). */
export const reclined = (o: Partial<Pose> = {}): Pose => ({
  hip: [104, 86], torso: -128, upperArm: 20, foreArm: -110, thigh: 26, shin: 82, foot: 0, ...o,
});

/** Buste penché en avant, jambes semi-fléchies (rowing, RDL). */
export const hinged = (o: Partial<Pose> = {}): Pose => ({
  hip: [110, 74], torso: -160, upperArm: 88, foreArm: 88, thigh: 82, shin: 92, foot: 0, ...o,
});

/* ------------------------------------------------------------------
   Cinématique inverse : on décrit où sont les appuis (pieds au sol,
   mains sur la barre) et les angles des segments sont déduits.
   ------------------------------------------------------------------ */
function ik(a: P, b: P, l1: number, l2: number, bend: 1 | -1) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const raw = Math.hypot(dx, dy);
  const d = Math.min(Math.max(raw, Math.abs(l1 - l2) + 0.001), l1 + l2 - 0.001);
  const base = Math.atan2(dy, dx);
  const cosA = (d * d + l1 * l1 - l2 * l2) / (2 * d * l1);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const a1 = base + bend * A;
  const jx = a[0] + l1 * Math.cos(a1);
  const jy = a[1] + l1 * Math.sin(a1);
  const a2 = Math.atan2(b[1] - jy, b[0] - jx);
  return [a1 * DEG, a2 * DEG] as [number, number];
}

const polar = (p: P, len: number, deg: number): P => [
  p[0] + len * Math.cos((deg * Math.PI) / 180),
  p[1] + len * Math.sin((deg * Math.PI) / 180),
];

/**
 * Construit une pose à partir des points de contact.
 * `ankle` : pied au sol/sur la machine · `wrist` : main sur la barre.
 * `kneeBend` / `elbowBend` : +1 = articulation vers l'avant (droite), -1 = vers l'arrière.
 */
export function ikPose(o: {
  hip: P;
  torso: number;
  ankle?: P;
  wrist?: P;
  farAnkle?: P;
  farWrist?: P;
  kneeBend?: 1 | -1;
  elbowBend?: 1 | -1;
  farKneeBend?: 1 | -1;
  farElbowBend?: 1 | -1;
  foot?: number;
  headTilt?: number;
  thigh?: number;
  shin?: number;
  upperArm?: number;
  foreArm?: number;
  farArm?: [number, number];
  farLeg?: [number, number];
  spread?: number;
  /** vue de face : les membres partent des épaules/hanches décalées */
  front?: boolean;
}): Pose {
  const dx = o.front ? 16 : 0;
  const dh = o.front ? 9.5 : 0;
  const shoulder = polar(o.hip, 40, o.torso);
  const armAnchor: P = [shoulder[0] + dx, shoulder[1]];
  const legAnchor: P = [o.hip[0] + dh, o.hip[1]];
  const leg = o.ankle ? ik(legAnchor, o.ankle, 30, 30, o.kneeBend ?? 1) : null;
  const arm = o.wrist ? ik(armAnchor, o.wrist, 25, 24, o.elbowBend ?? 1) : null;
  const farLeg = o.farAnkle
    ? ik([o.hip[0] - dh, o.hip[1]], o.farAnkle, 30, 30, o.farKneeBend ?? 1)
    : o.farLeg;
  const farArm = o.farWrist
    ? ik([shoulder[0] - dx, shoulder[1]], o.farWrist, 25, 24, o.farElbowBend ?? 1)
    : o.farArm;
  return {
    hip: o.hip,
    torso: o.torso,
    thigh: leg ? leg[0] : o.thigh ?? 90,
    shin: leg ? leg[1] : o.shin ?? 90,
    upperArm: arm ? arm[0] : o.upperArm ?? 90,
    foreArm: arm ? arm[1] : o.foreArm ?? 90,
    foot: o.foot ?? 0,
    headTilt: o.headTilt,
    farArm,
    farLeg,
    spread: o.spread,
  };
}
