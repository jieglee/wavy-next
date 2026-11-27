import { useId } from "react";

/**
 * Siluet penonton konser untuk dasar hero (SVG, tanpa aset gambar).
 * Posisi orang dibangkitkan dari seed tetap supaya hasil SSR dan klien identik.
 * Warna lewat token: lapisan belakang biru-ungu, lapisan depan navy (--foreground).
 */

const W = 1440;
const H = 320;

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Arm = { sx: number; sy: number; hx: number; hy: number; phone: boolean };
type Person = { x: number; sy: number; w: number; r: number; arms: Arm[] };

function crowd(seed: number, opts: { gap: [number, number]; rise: [number, number]; w: [number, number]; r: number; armChance: number; phoneChance: number }): Person[] {
  const rand = rng(seed);
  const between = ([a, b]: [number, number]) => a + rand() * (b - a);
  const people: Person[] = [];
  let gap = between(opts.gap);
  for (let x = -30; x < W + 30; x += gap) {
    const prevGap = gap;
    gap = between(opts.gap);
    // badan selalu bertumpuk dengan kedua tetangga supaya tidak ada celah tipis di antara siluet
    const w = Math.max(between(opts.w), Math.max(prevGap, gap) + 6);
    const sy = H - between(opts.rise);
    const r = opts.r * (0.9 + rand() * 0.2);
    const arms: Arm[] = [];
    for (const side of [-1, 1]) {
      if (rand() > opts.armChance) continue;
      const sx = x + side * (w / 2 - 7);
      const reach = 60 + rand() * 40;
      arms.push({
        sx,
        sy: sy + 12,
        hx: sx + side * (4 + rand() * 20),
        hy: sy - reach * (opts.r / 15),
        phone: rand() < opts.phoneChance,
      });
    }
    people.push({ x, sy, w, r, arms });
  }
  return people;
}

// lapisan belakang: lebih rapat, lebih kecil, lebih tinggi (jauh dari kamera)
const BACK = crowd(7, { gap: [26, 38], rise: [150, 205], w: [36, 46], r: 11, armChance: 0.32, phoneChance: 0.3 });
// lapisan depan: lebih besar dan rendah supaya tidak menutupi tombol
const FRONT = crowd(21, { gap: [44, 62], rise: [92, 140], w: [56, 72], r: 16, armChance: 0.38, phoneChance: 0.4 });

function body(p: Person) {
  const l = p.x - p.w / 2;
  const rr = p.w * 0.42;
  return `M${l} ${H}V${p.sy + rr}Q${l} ${p.sy} ${l + rr} ${p.sy}H${l + p.w - rr}Q${l + p.w} ${p.sy} ${l + p.w} ${p.sy + rr}V${H}Z`;
}

function Layer({ people, fill, armWidth, glowId }: { people: Person[]; fill: string; armWidth: number; glowId: string }) {
  return (
    <g fill={fill} stroke={fill}>
      {people.map((p, i) => (
        <g key={i}>
          <path d={body(p)} stroke="none" />
          <circle cx={p.x} cy={p.sy - p.r - 4} r={p.r} stroke="none" />
          <rect x={p.x - p.r * 0.45} y={p.sy - 8} width={p.r * 0.9} height={10} stroke="none" />
          {p.arms.map((a, j) => (
            <g key={j}>
              {/* lengan sedikit menekuk di siku, lalu kepalan tangan */}
              <path
                d={`M${a.sx} ${a.sy}Q${a.sx + (a.hx - a.sx) * 1.5} ${(a.sy + a.hy) / 2} ${a.hx} ${a.hy}`}
                fill="none"
                strokeWidth={armWidth}
                strokeLinecap="round"
              />
              <circle cx={a.hx} cy={a.hy} r={armWidth * 0.72} stroke="none" />
              {a.phone && (
                <>
                  <circle cx={a.hx} cy={a.hy - armWidth * 1.4} r={armWidth * 2.2} filter={`url(#${glowId})`} stroke="none" style={{ fill: "var(--primary)" }} opacity={0.45} />
                  <rect x={a.hx - armWidth * 0.6} y={a.hy - armWidth * 2.6} width={armWidth * 1.2} height={armWidth * 2} rx={armWidth * 0.25} stroke="none" />
                  <rect x={a.hx - armWidth * 0.42} y={a.hy - armWidth * 2.42} width={armWidth * 0.84} height={armWidth * 1.64} rx={armWidth * 0.15} stroke="none" style={{ fill: "color-mix(in oklab, var(--background) 80%, var(--primary))" }} />
                </>
              )}
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

export function HeroCrowd({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const front = `crowd-front-${id}`;
  const back = `crowd-back-${id}`;
  const glow = `crowd-glow-${id}`;
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={back} gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="0" y2={H}>
            <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--info) 55%, var(--primary-glow))" }} />
            <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--foreground) 60%, var(--primary-glow))" }} />
          </linearGradient>
          <linearGradient id={front} gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2={H}>
            <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--foreground) 80%, var(--info))" }} />
            <stop offset="1" style={{ stopColor: "var(--foreground)" }} />
          </linearGradient>
          <filter id={glow} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          {/* lapisan belakang memudar ke atas supaya menyatu dengan haze */}
          <linearGradient id={`${back}-fade`} gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="230">
            <stop offset="0" stopColor="white" stopOpacity="0.15" />
            <stop offset="1" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id={`${back}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect width={W} height={H} fill={`url(#${back}-fade)`} />
          </mask>
        </defs>
        <g opacity={0.6} mask={`url(#${back}-mask)`}>
          <Layer people={BACK} fill={`url(#${back})`} armWidth={7} glowId={glow} />
        </g>
        <Layer people={FRONT} fill={`url(#${front})`} armWidth={10} glowId={glow} />
      </svg>
    </div>
  );
}
