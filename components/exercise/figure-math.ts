import type { Pose } from "@/lib/types";

export const SEG = {
  torso: 40,
  neck: 11,
  headR: 9.5,
  upper: 25,
  fore: 24,
  thigh: 30,
  shin: 30,
  foot: 13,
  shoulderHalf: 16,
  hipHalf: 9.5,
  /** Vue de face : les membres partent de l'extérieur du tronc, sinon ils se superposent. */
  shoulderHalfFront: 21,
  hipHalfFront: 12,
};

export type P = [number, number];

export function polar(from: P, len: number, deg: number): P {
  const r = (deg * Math.PI) / 180;
  return [from[0] + len * Math.cos(r), from[1] + len * Math.sin(r)];
}

export type Skeleton = {
  hip: P;
  shoulder: P;
  neck: P;
  head: P;
  near: { elbow: P; wrist: P; knee: P; ankle: P; toe: P };
  far: { elbow: P; wrist: P; knee: P; ankle: P; toe: P };
  shoulderL: P;
  shoulderR: P;
  hipL: P;
  hipR: P;
  view: "side" | "front";
};

function mirror(a: number) {
  return 180 - a;
}

export function buildSkeleton(pose: Pose, view: "side" | "front"): Skeleton {
  const hip: P = pose.hip;
  const tilt = pose.torso + (pose.headTilt ?? 0);
  const shoulder = polar(hip, SEG.torso, pose.torso);
  const neck = polar(shoulder, SEG.neck, tilt);
  const head = polar(neck, SEG.headR, tilt);

  if (view === "front") {
    const shoulderL: P = [shoulder[0] - SEG.shoulderHalfFront, shoulder[1] + 2];
    const shoulderR: P = [shoulder[0] + SEG.shoulderHalfFront, shoulder[1] + 2];
    const hipL: P = [hip[0] - SEG.hipHalfFront, hip[1]];
    const hipR: P = [hip[0] + SEG.hipHalfFront, hip[1]];

    const elbowR = polar(shoulderR, SEG.upper, pose.upperArm);
    const wristR = polar(elbowR, SEG.fore, pose.foreArm);
    const elbowL = polar(shoulderL, SEG.upper, mirror(pose.upperArm));
    const wristL = polar(elbowL, SEG.fore, mirror(pose.foreArm));

    const kneeR = polar(hipR, SEG.thigh, pose.thigh);
    const ankleR = polar(kneeR, SEG.shin, pose.shin);
    const toeR = polar(ankleR, SEG.foot, pose.foot);
    const kneeL = polar(hipL, SEG.thigh, mirror(pose.thigh));
    const ankleL = polar(kneeL, SEG.shin, mirror(pose.shin));
    const toeL = polar(ankleL, SEG.foot, mirror(pose.foot));

    return {
      hip, shoulder, neck, head, shoulderL, shoulderR, hipL, hipR, view,
      near: { elbow: elbowR, wrist: wristR, knee: kneeR, ankle: ankleR, toe: toeR },
      far: { elbow: elbowL, wrist: wristL, knee: kneeL, ankle: ankleL, toe: toeL },
    };
  }

  const [fa1, fa2] = pose.farArm ?? [pose.upperArm + 9, pose.foreArm + 7];
  const [fl1, fl2] = pose.farLeg ?? [pose.thigh + 8, pose.shin - 5];

  const elbow = polar(shoulder, SEG.upper, pose.upperArm);
  const wrist = polar(elbow, SEG.fore, pose.foreArm);
  const knee = polar(hip, SEG.thigh, pose.thigh);
  const ankle = polar(knee, SEG.shin, pose.shin);
  const toe = polar(ankle, SEG.foot, pose.foot);

  const fElbow = polar(shoulder, SEG.upper, fa1);
  const fWrist = polar(fElbow, SEG.fore, fa2);
  const fKnee = polar(hip, SEG.thigh, fl1);
  const fAnkle = polar(fKnee, SEG.shin, fl2);
  const fToe = polar(fAnkle, SEG.foot, pose.foot);

  return {
    hip, shoulder, neck, head, view,
    shoulderL: shoulder, shoulderR: shoulder, hipL: hip, hipR: hip,
    near: { elbow, wrist, knee, ankle, toe },
    far: { elbow: fElbow, wrist: fWrist, knee: fKnee, ankle: fAnkle, toe: fToe },
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const pair = (x?: [number, number], y?: [number, number]) =>
    x && y ? ([lerp(x[0], y[0], t), lerp(x[1], y[1], t)] as [number, number]) : undefined;
  return {
    hip: [lerp(a.hip[0], b.hip[0], t), lerp(a.hip[1], b.hip[1], t)],
    torso: lerp(a.torso, b.torso, t),
    upperArm: lerp(a.upperArm, b.upperArm, t),
    foreArm: lerp(a.foreArm, b.foreArm, t),
    thigh: lerp(a.thigh, b.thigh, t),
    shin: lerp(a.shin, b.shin, t),
    foot: lerp(a.foot, b.foot, t),
    headTilt: lerp(a.headTilt ?? 0, b.headTilt ?? 0, t),
    farArm: pair(a.farArm, b.farArm),
    farLeg: pair(a.farLeg, b.farLeg),
    spread: lerp(a.spread ?? 0.5, b.spread ?? 0.5, t),
  };
}

/** Aller-retour avec temps de pause aux extrémités. */
export function pingPong(progress: number) {
  const p = progress % 1;
  const hold = 0.11;
  const half = 0.5;
  let raw: number;
  if (p < half) {
    raw = (p - hold / 2) / (half - hold);
  } else {
    raw = 1 - (p - half - hold / 2) / (half - hold);
  }
  const c = Math.min(1, Math.max(0, raw));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * Membre fuselé : capsule dont l'épaisseur va de `w1` (côté `a`) à `w2` (côté `b`),
 * terminée par deux demi-disques bombés vers l'extérieur (sweep 0 : avec sweep 1
 * les arcs mordaient dans le segment et creusaient une encoche à chaque articulation).
 * Beaucoup plus proche d'un corps qu'un trait d'épaisseur
 * constante, qui est ce qui donnait l'aspect « bonhomme bâton ».
 */
export function capsule(a: P, b: P, w1: number, w2: number): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 0.0001;
  const nx = -dy / len;
  const ny = dx / len;
  const r1 = w1 / 2;
  const r2 = w2 / 2;
  const q = (x: number, y: number) => `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
  return [
    `M${q(a[0] + nx * r1, a[1] + ny * r1)}`,
    `L${q(b[0] + nx * r2, b[1] + ny * r2)}`,
    `A${r2},${r2} 0 0 0 ${q(b[0] - nx * r2, b[1] - ny * r2)}`,
    `L${q(a[0] - nx * r1, a[1] - ny * r1)}`,
    `A${r1},${r1} 0 0 0 ${q(a[0] + nx * r1, a[1] + ny * r1)}`,
    "Z",
  ].join(" ");
}
