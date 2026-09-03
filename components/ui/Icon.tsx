import type { SVGProps } from "react";

const P: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5",
  dumbbell: "M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10",
  nutrition: "M12 8c0-3 2-5 5-5 0 3-2 5-5 5Zm0 0c-1.5-2-4-2.5-6-1.5C4 8 4 13 6 17c1.2 2.4 2.7 4 4 4 .8 0 1.4-.4 2-.4s1.2.4 2 .4c1.3 0 2.8-1.6 4-4 .9-1.8 1.3-3.6 1.2-5",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c1.2-3.4 4-5 7.5-5s6.3 1.6 7.5 5",
  play: "M7 4.5v15l13-7.5-13-7.5Z",
  check: "m4.5 12.5 5 5 10-11",
  x: "M6 6l12 12M18 6 6 18",
  right: "m9 5 7 7-7 7",
  left: "m15 5-7 7 7 7",
  down: "m5 9 7 7 7-7",
  up: "m5 15 7-7 7 7",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  flame: "M12 22c4 0 6.5-2.7 6.5-6 0-4.5-4-5.5-3-11-3.5 1.5-5 4.5-5 7 0 1.2-.6 1.8-1.3 1.8-.9 0-1.4-.8-1.4-2C6 13 5.5 14.6 5.5 16c0 3.3 2.5 6 6.5 6Z",
  trophy: "M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8.5 21h7l-.7-3h-5.6l-.7 3Z",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5.5l3.5 2",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v6M12 7.5h.01",
  alert: "M12 3 2.5 20h19L12 3ZM12 9v5M12 17.5h.01",
  swap: "M4 8h13l-3.5-3.5M20 16H7l3.5 3.5",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-3.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  calendar: "M4 8.5h16M7 3.5v3M17 3.5v3M5 5.5h14a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z",
  spark: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z",
  weight: "M6 8h12l2 12H4L6 8Zm3 0a3 3 0 0 1 6 0",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z",
  edit: "M4 20h4L19 9l-4-4L4 16v4ZM14.5 5.5l4 4",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5.5-1.5L21 21",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 0 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 0 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.1a2 2 0 0 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 0 1 0 4",
  chef: "M7 21h10M6 17h12l1-7.5a4 4 0 1 0-4.5-5.6 4 4 0 0 0-5 0A4 4 0 1 0 5 9.5L6 17Z",
  cart: "M3 4h2l2.2 10.5a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6.5M9 20h.01M17 20h.01",
  ruler: "M3 9.5h18v5H3v-5Zm4 0v2.5m4-2.5v3.5m4-3.5v2.5",
  camera: "M4 8h3l1.5-2h7L17 8h3v11H4V8Zm8 8.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13V11Z",
  refresh: "M20 12a8 8 0 1 1-2.5-5.8M20 4v4.5h-4.5",
  filter: "M3 5h18l-7 8v6l-4 2v-8L3 5Z",
  book: "M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm12 3h2v13H8",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  pause: "M9 5v14M15 5v14",
  skip: "M6 5v14l9-7-9-7ZM18 5v14",
  arrowUp: "M12 20V6M6 12l6-6 6 6",
  arrowDown: "M12 4v14M18 12l-6 6-6-6",
};

export type IconName = keyof typeof P;

export function Icon({
  name,
  size = 20,
  ...props
}: { name: string; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={P[name] ?? P.info} />
    </svg>
  );
}
