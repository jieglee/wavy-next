"use client";

import { useState, useEffect } from "react";

const PHRASES = [
  "2026 HWANG IN YOUP FANMEETING TOUR <To you> in JAKARTA",
  "BIGBANG JAKARTA 2027",
  "ENHYPEN JAKARTA 2027",
  "Pestapora 2026",
  "YE JAKARTA 2026",
  "GONG YOO FAN MEETING <THE LONG TAKE> in JAKARTA",
  "T.O.P JAKARTA",
  "ROSETOPIA IN JAKARTA",
];

export default function AnimatedSearchPlaceholder({ active }: { active: boolean }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setIdx((p) => (p + 1) % PHRASES.length);
        setPhase("in");
      }, 220);
    }, 2600);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  return (
    <span
      className={`pointer-events-none absolute inset-0 flex items-center truncate text-sm transition-all duration-200 ${phase === "in" ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
    >
      <span className="shrink-0 font-normal text-[#8B889C]">Cari event&nbsp;</span>
      <span className="truncate font-bold text-[#1B1A3A]">{PHRASES[idx]}</span>
    </span>
  );
}
