import { useEffect, useRef, useState } from "react";

/* ---------------- Moon phase widget ---------------- */

const PHASE_NAMES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Third Quarter", "Waning Crescent",
];

export function phaseName(p: number) {
  const i = Math.round(p * 8) % 8;
  return PHASE_NAMES[i];
}

function drawMoon(ctx: CanvasRenderingContext2D, w: number, h: number, phase: number) {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 6;
  ctx.save();
  ctx.translate(cx, cy);
  // dark disc
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "#232a38"; ctx.fill();
  ctx.strokeStyle = "rgba(143,180,255,0.25)"; ctx.lineWidth = 1; ctx.stroke();

  const th = phase * Math.PI * 2;
  const rx = Math.abs(Math.cos(th)) * r;
  const waxing = th <= Math.PI;
  const quarter = Math.floor(((th % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 2)) % 4;
  const bulgeRight = quarter % 2 === 0;
  const HP = Math.PI / 2;

  ctx.beginPath();
  ctx.arc(0, 0, r, -HP, HP, !waxing);
  ctx.ellipse(0, 0, Math.max(rx, 0.01), r, 0, HP, -HP, bulgeRight);
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r * 1.2);
  g.addColorStop(0, "#fdfbf2");
  g.addColorStop(1, "#c8c2b0");
  ctx.fillStyle = g;
  ctx.fill();

  // a few craters clipped to the lit region for character
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#6b6558";
  for (const [px, py, pr] of [[-0.25, -0.2, 0.14], [0.2, 0.25, 0.1], [0.05, -0.35, 0.08]] as const) {
    ctx.beginPath();
    ctx.arc(px * r, py * r, pr * r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function MoonPhaseWidget() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [day, setDay] = useState(10.5);
  const phase = (day % 29.5) / 29.5;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = 130 * dpr; cv.height = 130 * dpr;
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawMoon(ctx, 130, 130, phase);
  }, [phase]);

  return (
    <div className="flex items-center gap-4">
      <canvas ref={ref} style={{ width: 130, height: 130 }} aria-label={`Moon phase: ${phaseName(phase)}`} />
      <div className="flex-1">
        <div className="font-display text-sm font-bold text-[#ffb547]">{phaseName(phase)}</div>
        <div className="font-data text-[10px] uppercase tracking-widest text-[#8ea0bf] mt-1">
          Day {day.toFixed(1)} of 29.5
        </div>
        <input
          type="range" min={0} max={29.5} step={0.1} value={day}
          onChange={(e) => setDay(parseFloat(e.target.value))}
          className="w-full mt-3 accent-[#8fd8ff]"
          aria-label="Drag through the lunar cycle"
        />
        <p className="text-[11px] text-[#8ea0bf] mt-2 leading-relaxed">
          Drag the slider to travel a full synodic month — watch the terminator sweep across the face.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Sun → Earth energy flow ---------------- */

export function EnergyFlowWidget() {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <div>
      <svg viewBox="0 0 340 90" className="w-full" role="img" aria-label="Animation of sunlight traveling from the Sun to Earth">
        <defs>
          <radialGradient id="efSun" cx="0.5" cy="0.5">
            <stop offset="0%" stopColor="#fff4d0" />
            <stop offset="55%" stopColor="#ffb547" />
            <stop offset="100%" stopColor="#e0641e" />
          </radialGradient>
          <radialGradient id="efEarth" cx="0.35" cy="0.35">
            <stop offset="0%" stopColor="#7fc4ff" />
            <stop offset="100%" stopColor="#1f4fa8" />
          </radialGradient>
        </defs>
        <circle cx="46" cy="45" r="34" fill="#ffb547" opacity="0.12" className={reduced ? "" : "anim-pulse-soft"} />
        <circle cx="46" cy="45" r="22" fill="url(#efSun)" />
        <circle cx="294" cy="45" r="13" fill="url(#efEarth)" />
        <circle cx="294" cy="45" r="17" fill="none" stroke="#7fc4ff" strokeOpacity="0.4" />
        <path id="efPath" d="M 74 45 C 140 30, 210 60, 276 45" fill="none" stroke="#8fd8ff" strokeOpacity="0.18" strokeDasharray="3 5" className={reduced ? "" : "anim-dash"} />
        {!reduced && [0, 1, 2, 3].map((i) => (
          <circle key={i} r="3" fill="#ffe2a0">
            <animateMotion dur="2.8s" repeatCount="indefinite" begin={`${i * 0.7}s`}>
              <mpath href="#efPath" />
            </animateMotion>
          </circle>
        ))}
        <text x="46" y="86" textAnchor="middle" fill="#ffb547" fontSize="9" fontFamily="Space Mono">SUN</text>
        <text x="294" y="86" textAnchor="middle" fill="#7fc4ff" fontSize="9" fontFamily="Space Mono">EARTH</text>
        <text x="175" y="20" textAnchor="middle" fill="#8ea0bf" fontSize="9" fontFamily="Space Mono">photons · 8 min 20 s journey</text>
      </svg>
      <p className="text-[11px] text-[#8ea0bf] leading-relaxed mt-1">
        Every second the Sun fuses ~600 million tons of hydrogen. A tiny slice of that energy crosses
        150 million km of vacuum to warm our planet, drive weather, and power photosynthesis.
      </p>
    </div>
  );
}

/* ---------------- Meteoroid → Meteor → Meteorite ---------------- */

const METEOR_STAGES = [
  { key: "meteoroid", name: "Meteoroid", text: "A chunk of rock or dust drifting in space — smaller than an asteroid, from a grain to a few meters across." },
  { key: "meteor", name: "Meteor", text: "The streak of light we see when the rock slams into the atmosphere at up to 72 km/s and vaporizes — a 'shooting star'." },
  { key: "meteorite", name: "Meteorite", text: "Any fragment that survives the fiery plunge and lands on the surface, carrying pristine material for scientists." },
];

export function MeteorStagesWidget() {
  const [stage, setStage] = useState(1);
  return (
    <div>
      <svg viewBox="0 0 340 150" className="w-full rounded-lg border border-[rgba(160,190,255,0.12)]" role="img" aria-label="Diagram of a meteoroid becoming a meteor, then a meteorite">
        <defs>
          <linearGradient id="msSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#05070f" />
            <stop offset="70%" stopColor="#0a1428" />
            <stop offset="100%" stopColor="#1a2f52" />
          </linearGradient>
        </defs>
        <rect width="340" height="120" fill="url(#msSky)" />
        <rect y="120" width="340" height="30" fill="#241a12" />
        <path d="M0 120 Q 60 112 120 120 T 240 120 T 340 118 L 340 150 L 0 150 Z" fill="#33241a" />
        {[[30, 20], [80, 40], [150, 15], [210, 35], [300, 22], [260, 55]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="#9db4d8" opacity="0.7" />
        ))}
        {/* atmosphere glow line */}
        <rect y="78" width="340" height="2" fill="#8fd8ff" opacity="0.25" />
        <text x="332" y="74" textAnchor="end" fill="#8fd8ff" opacity="0.6" fontSize="8" fontFamily="Space Mono">ATMOSPHERE</text>

        {/* meteoroid in space */}
        <g opacity={stage === 0 ? 1 : 0.35}>
          <circle cx="60" cy="24" r="7" fill="#8a8075" stroke={stage === 0 ? "#ffb547" : "none"} strokeWidth="1.5" />
          <circle cx="57" cy="22" r="1.6" fill="#4c453d" />
          <circle cx="63" cy="26" r="1.2" fill="#4c453d" />
        </g>
        {/* meteor streak */}
        <g opacity={stage === 1 ? 1 : 0.35}>
          <line x1="90" y1="34" x2="180" y2="92" stroke="#ffb547" strokeWidth={stage === 1 ? 3 : 2} strokeLinecap="round" opacity="0.9" />
          <line x1="90" y1="34" x2="180" y2="92" stroke="#fff4d0" strokeWidth="1" strokeLinecap="round" />
          <circle cx="180" cy="92" r="4.5" fill="#ffd88f" />
          <circle cx="180" cy="92" r="8" fill="#ffb547" opacity="0.3" />
        </g>
        {/* meteorite on ground */}
        <g opacity={stage === 2 ? 1 : 0.35}>
          <ellipse cx="238" cy="128" rx="14" ry="4" fill="#0a0704" opacity="0.6" />
          <path d="M 228 126 L 232 117 L 242 115 L 249 122 L 245 128 Z" fill="#5c5348" stroke={stage === 2 ? "#ffb547" : "none"} strokeWidth="1.5" />
        </g>
      </svg>
      <div className="flex gap-2 mt-3" role="tablist" aria-label="Stages of a falling space rock">
        {METEOR_STAGES.map((s, i) => (
          <button
            key={s.key} role="tab" aria-selected={stage === i}
            onClick={() => setStage(i)}
            className="flex-1 rounded-lg border px-2 py-2 font-data text-[10px] uppercase tracking-wider transition-all"
            style={{
              borderColor: stage === i ? "#ffb547" : "rgba(160,190,255,0.12)",
              background: stage === i ? "rgba(255,181,71,0.1)" : "transparent",
              color: stage === i ? "#ffb547" : "#8ea0bf",
            }}
          >
            {i + 1}. {s.name}
          </button>
        ))}
      </div>
      <p className="text-[12px] text-[#c6d2e6] leading-relaxed mt-3 min-h-[54px]">{METEOR_STAGES[stage].text}</p>
    </div>
  );
}

/* ---------------- Planet vs dwarf comparison ---------------- */

export function DwarfCompareWidget() {
  const rows = [
    { label: "Orbits the Sun", p: true, d: true },
    { label: "Round under own gravity", p: true, d: true },
    { label: "Cleared its orbital zone", p: true, d: false },
  ];
  return (
    <div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-y-2 gap-x-4 items-center text-[12px]">
        <div />
        <div className="font-data text-[10px] uppercase tracking-widest text-[#7fc4ff] text-center px-3">Planet</div>
        <div className="font-data text-[10px] uppercase tracking-widest text-[#e8c9a0] text-center px-3">Dwarf</div>
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <div className="text-[#c6d2e6]">{r.label}</div>
            <div className="text-center">{tick(r.p)}</div>
            <div className="text-center">{tick(r.d)}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[#8ea0bf] leading-relaxed mt-3">
        Pluto shares its orbital zone with the crowded Kuiper Belt, so it is a dwarf planet — one of
        five officially recognized, alongside Eris, Haumea, Makemake and Ceres.
      </p>
    </div>
  );
}

function tick(v: boolean) {
  return v ? (
    <svg width="16" height="16" viewBox="0 0 16 16" className="inline-block" aria-label="yes"><circle cx="8" cy="8" r="7" fill="rgba(127,220,160,0.15)" /><path d="M4.5 8.5l2.4 2.4 4.6-5.4" stroke="#7fdca0" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" className="inline-block" aria-label="no"><circle cx="8" cy="8" r="7" fill="rgba(255,127,107,0.12)" /><path d="M5 5l6 6M11 5l-6 6" stroke="#ff7f6b" strokeWidth="1.8" strokeLinecap="round" /></svg>
  );
}

/* ---------------- True-scale demo ---------------- */

export function ScaleDemoWidget() {
  return (
    <div>
      <div className="rounded-lg border border-[rgba(160,190,255,0.12)] bg-[#060a14] px-4 py-5 relative overflow-hidden">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 34, height: 34, background: "radial-gradient(circle at 35% 35%, #fff4d0, #ffb547 55%, #e0641e)", boxShadow: "0 0 24px rgba(255,181,71,0.6)" }}
          aria-label="Sun drawn to scale" />
        <div className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full bg-[#4f9df5]"
          style={{ width: 4, height: 4, boxShadow: "0 0 8px #7fc4ff" }} aria-label="Earth drawn to scale" />
        <div className="font-data text-[9px] text-[#8ea0bf] absolute right-2 top-2">EARTH →</div>
        <div className="font-data text-[9px] text-[#8ea0bf] absolute left-3 bottom-2">SUN · IF 2 M WIDE, EARTH IS 215 M AWAY</div>
      </div>
      <p className="text-[11px] text-[#8ea0bf] leading-relaxed mt-3">
        On this card the Sun is shrunk to 34 px. At the same scale, Earth is a 4-px dot — and Neptune
        would sit roughly 20 screen-widths to the right. That is why every comfortable map cheats a little.
      </p>
    </div>
  );
}

/* ---------------- Formation timeline widget ---------------- */

export function FormationWidget() {
  const steps = [
    { t: "0 Myr", d: "A cold cloud of gas and dust collapses, possibly nudged by a supernova shockwave." },
    { t: "~0.1 Myr", d: "A hot protostar ignites at the center; a spinning disk of debris spreads around it." },
    { t: "~1–10 Myr", d: "Dust grains stick into pebbles, then kilometer-sized planetesimals." },
    { t: "~10–100 Myr", d: "Planetesimals merge into planets. The young Sun's wind blows away leftover gas." },
    { t: "~600 Myr", d: "A Late Heavy Bombardment of comets and asteroids resurfaces the inner worlds — and may have delivered Earth's water." },
  ];
  return (
    <ol className="relative border-l border-[rgba(255,181,71,0.35)] ml-2 space-y-4 pl-5">
      {steps.map((s) => (
        <li key={s.t} className="relative">
          <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#ffb547] shadow-[0_0_10px_rgba(255,181,71,0.7)]" />
          <div className="font-data text-[10px] uppercase tracking-widest text-[#ffb547]">{s.t}</div>
          <p className="text-[12px] text-[#c6d2e6] leading-relaxed mt-0.5">{s.d}</p>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- Planet types widget ---------------- */

export function PlanetTypesWidget() {
  const fams = [
    { name: "Terrestrial", members: ["Mercury", "Venus", "Earth", "Mars"], color: "#e07b54", note: "Rocky surfaces, metal cores, thin or no atmospheres." },
    { name: "Gas giants", members: ["Jupiter", "Saturn"], color: "#d8b48e", note: "Massive envelopes of hydrogen & helium, no solid surface." },
    { name: "Ice giants", members: ["Uranus", "Neptune"], color: "#4f6df5", note: "Rich in water, methane and ammonia ices under thick skies." },
  ];
  return (
    <div className="space-y-3">
      {fams.map((f) => (
        <div key={f.name} className="rounded-lg border border-[rgba(160,190,255,0.12)] p-3" style={{ borderColor: `${f.color}44` }}>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: f.color, boxShadow: `0 0 10px ${f.color}` }} />
            <span className="font-display text-[12px] font-bold">{f.name}</span>
          </div>
          <div className="font-data text-[10px] text-[#8ea0bf] mt-1">{f.members.join(" · ")}</div>
          <p className="text-[11px] text-[#c6d2e6] mt-1.5 leading-relaxed">{f.note}</p>
        </div>
      ))}
    </div>
  );
}
