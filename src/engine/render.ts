/* Procedural surface rendering for SOLARIS bodies (canvas 2D). */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const detailCache = new Map<string, unknown[]>();
function details(key: string, seed: number, n: number, maker: (r: () => number) => unknown): unknown[] {
  const k = `${key}:${seed}:${n}`;
  let d = detailCache.get(k);
  if (!d) {
    const rng = mulberry32(seed * 9973 + key.length * 131);
    d = Array.from({ length: n }, () => maker(rng));
    detailCache.set(k, d);
  }
  return d;
}

export interface DrawOpts {
  time: number;
  sunAngle: number;   // angle from body toward the sun
  hover: number;      // 0..1
  selected: number;   // 0..1
  reduced: boolean;
}

/** Clip to a circle of radius r at origin, draw surface, then shade toward/away from sun. */
export function drawBody(
  ctx: CanvasRenderingContext2D,
  surface: string,
  r: number,
  seed: number,
  o: DrawOpts
) {
  if (r < 0.4) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip();

  surfacePass(ctx, surface, r, seed, o);

  // terminator shading: darken side facing away from the sun
  const g = ctx.createRadialGradient(
    Math.cos(o.sunAngle) * r * 0.55, Math.sin(o.sunAngle) * r * 0.55, r * 0.2,
    Math.cos(o.sunAngle) * r * 0.55, Math.sin(o.sunAngle) * r * 0.55, r * 2.1
  );
  g.addColorStop(0, "rgba(255,240,220,0.10)");
  g.addColorStop(0.45, "rgba(0,0,10,0)");
  g.addColorStop(1, "rgba(2,4,12,0.72)");
  ctx.fillStyle = g;
  ctx.fillRect(-r, -r, r * 2, r * 2);

  ctx.restore();

  // atmosphere rim on the sunlit side
  if (["earth", "venus", "jupiter", "saturn", "uranus", "neptune", "titan", "pluto"].includes(surface) && r > 3) {
    ctx.save();
    ctx.globalAlpha = 0.5 + o.hover * 0.4;
    ctx.strokeStyle = ATMOSPHERE[surface] ?? "rgba(160,200,255,0.5)";
    ctx.lineWidth = Math.max(0.8, r * 0.06);
    ctx.beginPath();
    ctx.arc(0, 0, r + ctx.lineWidth * 0.5, o.sunAngle - 2.1, o.sunAngle + 2.1);
    ctx.stroke();
    ctx.restore();
  }
}

const ATMOSPHERE: Record<string, string> = {
  earth: "rgba(120,190,255,0.75)",
  venus: "rgba(255,220,150,0.6)",
  jupiter: "rgba(240,210,170,0.5)",
  saturn: "rgba(245,230,190,0.5)",
  uranus: "rgba(190,240,245,0.55)",
  neptune: "rgba(130,160,255,0.6)",
  titan: "rgba(250,200,130,0.6)",
  pluto: "rgba(200,220,255,0.4)",
};

function surfacePass(
  ctx: CanvasRenderingContext2D,
  surface: string,
  r: number,
  seed: number,
  o: DrawOpts
) {
  switch (surface) {
    case "mercury": {
      fill(ctx, r, "#8a8075", "#6b6257", "#4c453d");
      const craters = details(surface, seed, 9, (rnd) => ({
        a: rnd() * Math.PI * 2, d: Math.sqrt(rnd()) * 0.8, s: 0.08 + rnd() * 0.14
      })) as { a: number; d: number; s: number }[];
      for (const c of craters) {
        ctx.beginPath();
        ctx.arc(Math.cos(c.a) * c.d * r, Math.sin(c.a) * c.d * r, c.s * r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(30,26,22,0.35)";
        ctx.fill();
      }
      break;
    }
    case "venus": {
      fill(ctx, r, "#f2d489", "#e0b563", "#b98a3e");
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 4; i++) {
        const y = -r * 0.7 + (i / 3.4) * r * 1.5 + Math.sin(o.time * 0.2 + i) * r * 0.04;
        ctx.beginPath();
        ctx.ellipse(0, y, r * 1.15, r * (0.16 + i * 0.05), 0.15 * (i % 2 ? 1 : -1), 0, Math.PI * 2);
        ctx.fillStyle = i % 2 ? "rgba(255,240,200,0.35)" : "rgba(160,110,40,0.28)";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "earth": {
      fill(ctx, r, "#2e6fd8", "#1f4fa8", "#122d66");
      const land = details(surface, seed, 6, (rnd) => ({
        a: rnd() * Math.PI * 2, d: rnd() * 0.65, s: 0.25 + rnd() * 0.34, rot: rnd() * 3
      })) as { a: number; d: number; s: number; rot: number }[];
      const drift = o.reduced ? 0 : o.time * 0.02;
      for (const l of land) {
        ctx.save();
        ctx.translate(Math.cos(l.a + drift) * l.d * r, Math.sin(l.a) * l.d * r);
        ctx.rotate(l.rot);
        ctx.beginPath();
        for (let k = 0; k <= 7; k++) {
          const t = (k / 7) * Math.PI * 2;
          const rr = l.s * r * (0.7 + 0.3 * Math.sin(t * 3 + l.rot * 5));
          const px = Math.cos(t) * rr, py = Math.sin(t) * rr * 0.72;
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(72,140,80,0.85)";
        ctx.fill();
        ctx.restore();
      }
      // ice caps + clouds
      ctx.fillStyle = "rgba(240,250,255,0.85)";
      ctx.beginPath(); ctx.ellipse(0, -r * 0.86, r * 0.5, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, r * 0.9, r * 0.44, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.42;
      const cd = o.reduced ? 0 : o.time * 0.05;
      for (let i = 0; i < 4; i++) {
        const y = -r * 0.5 + i * r * 0.34;
        ctx.beginPath();
        ctx.ellipse(Math.sin(cd + i * 2) * r * 0.4, y, r * 0.55, r * 0.1, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "mars": {
      fill(ctx, r, "#e0714a", "#c05a38", "#8c3d24");
      const spots = details(surface, seed, 7, (rnd) => ({
        a: rnd() * Math.PI * 2, d: rnd() * 0.7, s: 0.12 + rnd() * 0.2
      })) as { a: number; d: number; s: number }[];
      for (const s of spots) {
        ctx.beginPath();
        ctx.ellipse(Math.cos(s.a) * s.d * r, Math.sin(s.a) * s.d * r, s.s * r, s.s * r * 0.6, s.a, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(90,40,22,0.4)";
        ctx.fill();
      }
      ctx.fillStyle = "rgba(250,250,255,0.9)";
      ctx.beginPath(); ctx.ellipse(0, -r * 0.88, r * 0.36, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, r * 0.92, r * 0.28, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case "jupiter": {
      bands(ctx, r, ["#e8d3b0", "#c9a176", "#e0c398", "#a9765094", "#d8b98e", "#8f5f3e94", "#e5cda6", "#b98a5e"], seed);
      // Great Red Spot (screen-fixed so users can click it when zoomed)
      const sx = r * 0.42, sy = r * 0.34;
      const pulse = 1 + Math.sin(o.time * 2.4) * 0.06 + o.hover * 0.08;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(0.12);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.2 * pulse);
      gr.addColorStop(0, "#e05a3a");
      gr.addColorStop(0.65, "#c84a30");
      gr.addColorStop(1, "rgba(200,74,48,0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.2 * pulse, r * 0.13 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(240,220,190,0.55)";
      ctx.lineWidth = Math.max(0.5, r * 0.014);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.24 * pulse, r * 0.165 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case "saturn": {
      bands(ctx, r, ["#f0e0b8", "#dcc79a", "#ecdcB4", "#c9b28594", "#e6d4a8", "#cdb88c94", "#f2e4c0"], seed);
      break;
    }
    case "uranus": {
      fill(ctx, r, "#b8e4e8", "#8fd0d8", "#5aa8b5");
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.5 + i * r * 0.5, r * 1.1, r * 0.12, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "neptune": {
      fill(ctx, r, "#4a6cf0", "#3550cc", "#22348f");
      const streaks = details(surface, seed, 4, (rnd) => ({ y: -0.6 + rnd() * 1.2, w: 0.4 + rnd() * 0.5, ph: rnd() * 6 })) as { y: number; w: number; ph: number }[];
      ctx.globalAlpha = 0.5;
      for (const s of streaks) {
        const x = o.reduced ? 0 : Math.sin(o.time * 0.9 + s.ph) * r * 0.18;
        ctx.beginPath();
        ctx.ellipse(x, s.y * r, s.w * r, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(220,235,255,0.5)";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.ellipse(-r * 0.25, -r * 0.2, r * 0.2, r * 0.13, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16,24,90,0.75)";
      ctx.fill();
      break;
    }
    case "pluto": {
      fill(ctx, r, "#d8bd97", "#c4a67f", "#8c7458");
      ctx.beginPath();
      ctx.ellipse(-r * 0.18, r * 0.1, r * 0.55, r * 0.42, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245,238,225,0.85)";
      ctx.fill();
      const dots = details(surface, seed, 5, (rnd) => ({ a: rnd() * 6, d: rnd() * 0.8, s: 0.06 + rnd() * 0.1 })) as { a: number; d: number; s: number }[];
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(Math.cos(d.a) * d.d * r, Math.sin(d.a) * d.d * r, d.s * r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(70,50,35,0.45)";
        ctx.fill();
      }
      break;
    }
    case "moon":
    case "callisto":
    case "ganymede": {
      const base: Record<string, [string, string, string]> = {
        moon: ["#d8dce2", "#b4bac4", "#7f8794"],
        callisto: ["#a89a8a", "#8c7f70", "#5c5348"],
        ganymede: ["#c4b8a6", "#a2968480", "#6f6558"],
      };
      const [a, b, c] = base[surface] ?? base.moon;
      fill(ctx, r, a, b, c);
      const craters = details(surface, seed, 10, (rnd) => ({ a: rnd() * 6.28, d: Math.sqrt(rnd()) * 0.82, s: 0.05 + rnd() * 0.12 })) as { a: number; d: number; s: number }[];
      for (const cr of craters) {
        ctx.beginPath();
        ctx.arc(Math.cos(cr.a) * cr.d * r, Math.sin(cr.a) * cr.d * r, cr.s * r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(20,20,30,0.3)";
        ctx.fill();
      }
      if (surface === "moon") {
        ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.25, r * 0.3, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(90,100,120,0.35)"; ctx.fill();
      }
      break;
    }
    case "europa": {
      fill(ctx, r, "#e8dcc8", "#d4c4a8", "#9c8c70");
      ctx.strokeStyle = "rgba(160,90,60,0.55)";
      ctx.lineWidth = Math.max(0.5, r * 0.03);
      const lines = details(surface, seed, 5, (rnd) => ({ a: rnd() * 6.28, d: rnd() * 0.5, l: 0.5 + rnd() * 0.7, t: rnd() * 3 })) as { a: number; d: number; l: number; t: number }[];
      for (const ln of lines) {
        ctx.beginPath();
        const x = Math.cos(ln.a) * ln.d * r, y = Math.sin(ln.a) * ln.d * r;
        ctx.moveTo(x - Math.cos(ln.t) * ln.l * r, y - Math.sin(ln.t) * ln.l * r);
        ctx.quadraticCurveTo(x, y + ln.l * r * 0.2, x + Math.cos(ln.t) * ln.l * r, y + Math.sin(ln.t) * ln.l * r);
        ctx.stroke();
      }
      break;
    }
    case "io": {
      fill(ctx, r, "#ecd870", "#d8b84c", "#a08030");
      const spots = details(surface, seed, 6, (rnd) => ({ a: rnd() * 6.28, d: rnd() * 0.75, s: 0.08 + rnd() * 0.16 })) as { a: number; d: number; s: number }[];
      for (const s of spots) {
        ctx.beginPath();
        ctx.arc(Math.cos(s.a) * s.d * r, Math.sin(s.a) * s.d * r, s.s * r, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(180,60,20,0.5)" : "rgba(60,40,10,0.45)";
        ctx.fill();
      }
      break;
    }
    case "titan": {
      fill(ctx, r, "#e8b070", "#d89850", "#a06828");
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.99, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffd8a0"; ctx.lineWidth = r * 0.09; ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case "ice": {
      fill(ctx, r, "#e8f0f5", "#c8d8e4", "#8ca0b5");
      const dots = details(surface, seed, 5, (rnd) => ({ a: rnd() * 6.28, d: rnd() * 0.7, s: 0.06 + rnd() * 0.1 })) as { a: number; d: number; s: number }[];
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(Math.cos(d.a) * d.d * r, Math.sin(d.a) * d.d * r, d.s * r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120,140,165,0.4)";
        ctx.fill();
      }
      break;
    }
    case "rock":
    default: {
      fill(ctx, r, "#b8a898", "#988878", "#685c50");
      const dots = details(surface + "rock", seed, 6, (rnd) => ({ a: rnd() * 6.28, d: rnd() * 0.75, s: 0.06 + rnd() * 0.12 })) as { a: number; d: number; s: number }[];
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(Math.cos(d.a) * d.d * r, Math.sin(d.a) * d.d * r, d.s * r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(40,32,26,0.4)";
        ctx.fill();
      }
      break;
    }
  }
}

function fill(ctx: CanvasRenderingContext2D, r: number, a: string, b: string, c: string) {
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.35);
  g.addColorStop(0, a);
  g.addColorStop(0.6, b);
  g.addColorStop(1, c);
  ctx.fillStyle = g;
  ctx.fillRect(-r, -r, r * 2, r * 2);
}

function bands(ctx: CanvasRenderingContext2D, r: number, colors: string[], seed: number) {
  ctx.save();
  const rng = mulberry32(seed * 31);
  const n = colors.length;
  const h = (r * 2) / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[i].length === 9 ? colors[i] : colors[i];
    ctx.fillRect(-r, -r + i * h, r * 2, h + 0.5);
  }
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < n - 1; i++) {
    const y = -r + (i + 1) * h;
    ctx.beginPath();
    ctx.moveTo(-r, y);
    for (let x = -r; x <= r; x += r / 5) {
      ctx.quadraticCurveTo(x + r / 10, y + (rng() - 0.5) * r * 0.12, x + r / 5, y);
    }
    ctx.strokeStyle = "rgba(60,40,20,0.5)";
    ctx.lineWidth = Math.max(0.5, r * 0.02);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** Saturn-style ring drawn as a tilted ellipse. front=true draws the near half over the planet. */
export function drawRing(
  ctx: CanvasRenderingContext2D,
  _planetR: number,
  inner: number,
  outer: number,
  color: string,
  tilt: number,        // vertical squash 0..1
  alpha: number,
  front: boolean
) {
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const t0 = inner + ((outer - inner) * i) / steps;
    const t1 = inner + ((outer - inner) * (i + 1)) / steps;
    const gap = i === 3 ? 0.25 : 1; // Cassini division
    ctx.save();
    ctx.globalAlpha = alpha * gap * (0.55 + 0.45 * Math.sin((i / steps) * Math.PI));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, t1, t1 * tilt, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
    ctx.ellipse(0, 0, t0, t0 * tilt, 0, front ? Math.PI : Math.PI * 2, front ? 0 : Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
