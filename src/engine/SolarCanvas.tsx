import { useEffect, useRef } from "react";
import {
  SUN, PLANETS, DWARFS, MOONS, REGIONS, MISSIONS, INDEX,
} from "../data/solarSystem";
import { drawBody, drawRing } from "./render";

export interface SimControls {
  selectedId: string | null;
  focusId: string | null;
  focusToken: number;
  resetToken: number;
  zoomInToken: number;
  zoomOutToken: number;
  hoveredId: string | null;
  paused: boolean;
  speed: number;
  scaleMode: "balanced" | "size" | "distance";
  showAsteroids: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  learnMode: boolean;
  missionsMode: boolean;
  era: "present" | "formation" | "exploration";
  reducedMotion: boolean;
  flareToken: number;
}

export function createControls(): SimControls {
  return {
    selectedId: null, focusId: null, focusToken: 0, resetToken: 0,
    zoomInToken: 0, zoomOutToken: 0, hoveredId: null,
    paused: false, speed: 1, scaleMode: "balanced",
    showAsteroids: true, showOrbits: true, showLabels: false,
    learnMode: false, missionsMode: false, era: "present",
    reducedMotion: false, flareToken: 0,
  };
}

interface Props {
  controls: React.MutableRefObject<SimControls>;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onDiscover: (id: string) => void;
}

const TAU = Math.PI * 2;
const SIM_DAYS_PER_SEC = 14;

interface RBody {
  id: string;
  kind: "star" | "planet" | "dwarf" | "moon" | "comet" | "craft";
  surface: string;
  color: string;
  glow: string;
  radius: number;
  orbitR: number;
  period: number;
  angle: number;
  au: number;
  parent?: string;
  moonOrbit: number;
  ring?: { inner: number; outer: number };
  tiltDeg: number;
  x: number; y: number;
  dispR: number;
  dispOrbit: number;
  hover: number;
  visible: boolean;
  // comet params
  ecc?: number;
  semi?: number;
  rot?: number;
  // craft params
  from?: number; to?: number; pathAngle?: number; pathSpeed?: number; dist?: number;
}

export default function SolarCanvas({ controls, onSelect, onHover, onDiscover }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cb = useRef({ onSelect, onHover, onDiscover });
  cb.current = { onSelect, onHover, onDiscover };

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const c = () => controls.current;

    let W = 0, H = 0, DPR = 1, mobile = false;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width; H = rect.height;
      mobile = W < 640;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
    };
    resize();
    window.addEventListener("resize", resize);

    /* ---------------- build runtime bodies ---------------- */
    const bodies: RBody[] = [];
    const push = (
      id: string, kind: RBody["kind"], data: { surface: string; color: string; glow: string },
      radius: number, orbitR: number, period: number, angle: number, au: number,
      extra: Partial<RBody> = {}
    ) => {
      bodies.push({
        id, kind, surface: data.surface, color: data.color, glow: data.glow,
        radius, orbitR, period, angle, au, moonOrbit: 0, tiltDeg: 0,
        x: 0, y: 0, dispR: radius, dispOrbit: orbitR, hover: 0, visible: true, ...extra,
      });
    };

    push(SUN.id, "star", SUN, SUN.radius!, 0, 0, 0, 0);
    for (const p of PLANETS) push(p.id, "planet", p, p.radius!, p.orbit!, p.periodDays!, p.angle0!, p.au!, { ring: p.ring, tiltDeg: p.tiltDeg ?? 0 });
    for (const d of DWARFS) push(d.id, "dwarf", d, d.radius!, d.orbit!, d.periodDays!, d.angle0!, d.au!);
    for (const m of MOONS) push(m.id, "moon", m, m.radius!, 0, m.periodDays!, Math.random() * TAU, 0, { parent: m.parent, moonOrbit: m.moonOrbit! });
    // comets — elliptical orbits, sun at focus
    push("halley", "comet", REGIONS.find((r) => r.id === "halley")!, 1.6, 0, 0, 0.9, 17.8, { ecc: 0.72, semi: 380, rot: 0.9 });
    push("comet-borisov", "comet", REGIONS.find((r) => r.id === "comet-borisov")!, 1.3, 0, 0, 3.6, 37, { ecc: 0.6, semi: 560, rot: 3.5 });
    for (const m of MISSIONS) push(m.id, "craft", { surface: "craft", color: m.color, glow: m.color }, 2.4, 0, 0, m.path.angle, 0, { from: m.path.from, to: m.path.to, pathAngle: m.path.angle, pathSpeed: m.path.speed, dist: m.path.from });

    const byId = new Map(bodies.map((b) => [b.id, b]));
    const orbiters = bodies.filter((b) => (b.kind === "planet" || b.kind === "dwarf") && b.orbitR > 0);
    const marsB = byId.get("mars")!, jupB = byId.get("jupiter")!, nepB = byId.get("neptune")!;
    const sunB = byId.get("sun")!;

    /* ---------------- particles & backdrop ---------------- */
    const rng = (() => { let s = 20240501; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();
    const makeBelt = (n: number) =>
      Array.from({ length: n }, () => ({ n: rng(), a: rng() * TAU, w: 0.6 + rng() * 0.8, s: 0.6 + rng() * 1.3, sh: 0.35 + rng() * 0.65 }));
    const beltP = makeBelt(0);
    const kuiperP = makeBelt(0);
    const diskP = makeBelt(0);
    const oortP = makeBelt(0);
    const fillBelts = () => {
      const scale = mobile ? 0.45 : 1;
      const refill = (arr: typeof beltP, n: number) => { arr.length = 0; arr.push(...makeBelt(Math.round(n * scale))); };
      refill(beltP, 560); refill(kuiperP, 720); refill(diskP, 900); refill(oortP, 900);
    };
    fillBelts();
    window.addEventListener("resize", fillBelts);

    const starLayers = [0.12, 0.28, 0.5].map((p, li) => ({
      p,
      stars: Array.from({ length: Math.round((li === 0 ? 220 : li === 1 ? 140 : 70) * (mobile ? 0.5 : 1)) }, () => ({
        x: rng() * 2400, y: rng() * 2400, s: 0.4 + rng() * (li === 2 ? 1.6 : 1.0), tw: rng() * TAU,
      })),
    }));

    /* ---------------- state ---------------- */
    const cam = { x: 0, y: 0, z: 1, tx: 0, ty: 0, tz: 1, follow: null as string | null };
    const defaultZoom = () => Math.max(0.45, Math.min(1.15, Math.min(W, H) / 820));
    cam.z = cam.tz = defaultZoom();

    const flares: { x: number; y: number; vx: number; vy: number; life: number; hue: number }[] = [];
    const sats: { a: number }[] = [];
    const discovered = new Set<string>();
    let spotPulse = 0, farOutT = 0, simDays = 0, lastFlareToken = 0;
    const sunClicks: number[] = [];
    let kuiperAlpha = 0.06, oortAlpha = 0;

    let lastFocusToken = -1, lastResetToken = -1, lastZIn = -1, lastZOut = -1;

    /* ---------------- coordinate helpers ---------------- */
    const w2sx = (wx: number) => (wx - cam.x) * cam.z + W / 2;
    const w2sy = (wy: number) => (wy - cam.y) * cam.z + H / 2;

    const focusZoomFor = (b: RBody) => {
      if (b.id === "asteroid-belt") return 1.15;
      if (b.id === "kuiper-belt") return 0.5;
      if (b.id === "oort-cloud") return 0.24;
      return Math.max(0.8, Math.min(3.0, 70 / (b.radius + 10)));
    };

    /* ---------------- targets per scale mode ---------------- */
    const targetOrbit = (b: RBody) => {
      if (c().scaleMode === "distance" && b.au > 0) return Math.pow(b.au, 0.72) * 128;
      return b.orbitR;
    };
    const targetRadius = (b: RBody) => {
      const mode = c().scaleMode;
      if (b.kind === "star") return mode === "size" ? 40 : b.radius;
      if (mode === "size") {
        const d = INDEX[b.id] as { nums?: { diameterKm: number } } | undefined;
        if (d?.nums) return Math.max(3.2, Math.sqrt(d.nums.diameterKm / 12742) * 8);
      }
      return b.radius;
    };

    /* ---------------- input ---------------- */
    const pointers = new Map<number, { x: number; y: number }>();
    let downPos = { x: 0, y: 0 }, downTime = 0, moved = 0, pinchDist = 0, dragFollowOff = false, pinchUsed = false;

    const setCursor = (v: string) => { wrap.style.cursor = v; };

    const hitTest = (sx: number, sy: number): string | null => {
      const wx = (sx - W / 2) / cam.z + cam.x;
      const wy = (sy - H / 2) / cam.z + cam.y;
      let best: { id: string; d: number } | null = null;

      // Great Red Spot hot zone (when zoomed into Jupiter)
      const jup = byId.get("jupiter")!;
      if (jup.visible && cam.z * jup.dispR > 40) {
        const spx = jup.x + jup.dispR * 0.42, spy = jup.y + jup.dispR * 0.34;
        if (Math.hypot(wx - spx, wy - spy) < jup.dispR * 0.28) return "great-red-spot";
      }

      for (const b of bodies) {
        if (!b.visible) continue;
        const slack = Math.max(7 / cam.z, b.dispR * 0.35);
        const d = Math.hypot(wx - b.x, wy - b.y);
        if (d < b.dispR + slack && (!best || d < best.d)) best = { id: b.id, d };
      }
      if (best) return best.id;

      // regions (annuli around the sun)
      const dSun = Math.hypot(wx, wy);
      if (c().showAsteroids && dSun > beltR0 && dSun < beltR1) return "asteroid-belt";
      if (dSun > kuiperR0 && dSun < kuiperR1) return "kuiper-belt";
      if (dSun > 1420 && dSun < 2250) return "oort-cloud";
      return null;
    };

    let beltR0 = 172, beltR1 = 240, kuiperR0 = 466, kuiperR1 = 582;

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        downPos = { x: e.clientX, y: e.clientY };
        downTime = performance.now();
        moved = 0;
        pinchUsed = false;
        setCursor("grabbing");
      } else if (pointers.size === 2) {
        pinchUsed = true;
        const [p1, p2] = [...pointers.values()];
        pinchDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      }
      wrap.focus();
    };

    const onPointerMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) {
        // pure hover
        const rect = canvas.getBoundingClientRect();
        const id = hitTest(e.clientX - rect.left, e.clientY - rect.top);
        if (id !== c().hoveredId) { c().hoveredId = id; cb.current.onHover(id); }
        setCursor(id ? "pointer" : "grab");
        mouse.sx = e.clientX - rect.left; mouse.sy = e.clientY - rect.top;
        return;
      }
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      prev.x = e.clientX; prev.y = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);

      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        const nd = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (pinchDist > 0) zoomAt((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, nd / pinchDist);
        pinchDist = nd;
        return;
      }
      if (moved > 4) {
        cam.tx -= dx / cam.z; cam.ty -= dy / cam.z;
        if (!dragFollowOff && moved > 12) { cam.follow = null; dragFollowOff = true; }
        cam.x = cam.tx; cam.y = cam.ty;
      }
    };

    const zoomAt = (sx: number, sy: number, factor: number) => {
      const rect = canvas.getBoundingClientRect();
      const cx = sx - rect.left, cy = sy - rect.top;
      const wx = (cx - W / 2) / cam.z + cam.x;
      const wy = (cy - H / 2) / cam.z + cam.y;
      cam.tz = Math.max(0.1, Math.min(7, cam.z * factor));
      cam.tx = wx - (cx - W / 2) / cam.tz;
      cam.ty = wy - (cy - H / 2) / cam.tz;
      cam.follow = null;
      cam.x += (cam.tx - cam.x) * 0.5;
      cam.y += (cam.ty - cam.y) * 0.5;
      cam.z += (cam.tz - cam.z) * 0.5;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0011));
    };

    const onPointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinchDist = 0;
      if (pointers.size === 0) {
        setCursor("grab");
        const quick = performance.now() - downTime < 400 && moved < 8 && !pinchUsed;
        if (quick) {
          const rect = canvas.getBoundingClientRect();
          const id = hitTest(e.clientX - rect.left, e.clientY - rect.top);
          if (id) {
            funClick(id);
            cb.current.onSelect(id);
          }
        }
        dragFollowOff = false;
      }
    };

    const funClick = (id: string) => {
      if (id === "sun") {
        sunClicks.push(performance.now());
        const recent = sunClicks.filter((t) => performance.now() - t < 1600);
        sunClicks.length = 0; sunClicks.push(...recent);
        if (sunClicks.length >= 3) {
          sunClicks.length = 0;
          spawnFlare(46);
          cb.current.onDiscover("fx-flare");
        }
      }
      if (id === "earth" && sats.length < 4) sats.push({ a: Math.random() * TAU });
      if (id === "jupiter") spotPulse = 1;
      if (id === "pluto") { farOutT = 1; if (!discovered.has("fx-farout")) { discovered.add("fx-farout"); cb.current.onDiscover("fx-farout"); } }
    };

    const spawnFlare = (n: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, sp = 40 + Math.random() * 160;
        flares.push({ x: 0, y: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, hue: 30 + Math.random() * 30 });
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const cc = c();
      const k = e.key;
      if (["+", "="].includes(k)) { cc.zoomInToken++; }
      else if (k === "-") { cc.zoomOutToken++; }
      else if (k === "0") { cc.resetToken++; }
      else if (k === " ") { cc.paused = !cc.paused; e.preventDefault(); }
      else if (k === "ArrowLeft") { cam.tx -= 60 / cam.z; }
      else if (k === "ArrowRight") { cam.tx += 60 / cam.z; }
      else if (k === "ArrowUp") { cam.ty -= 60 / cam.z; }
      else if (k === "ArrowDown") { cam.ty += 60 / cam.z; }
      else if (k === "Enter" && cc.hoveredId) { cb.current.onSelect(cc.hoveredId); }
      else if (/^[1-8]$/.test(k)) { const p = PLANETS[+k - 1]; if (p) cb.current.onSelect(p.id); }
      else if (k.toLowerCase() === "s") { cb.current.onSelect("sun"); }
      else return;
      e.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mouseleave", () => { if (c().hoveredId) { c().hoveredId = null; cb.current.onHover(null); } });
    wrap.addEventListener("keydown", onKey);
    setCursor("grab");

    const mouse = { sx: W / 2, sy: H / 2 };

    /* ---------------- main loop ---------------- */
    let raf = 0, last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const cc = c();
      const dtDays = cc.paused || cc.reducedMotion ? 0 : dt * SIM_DAYS_PER_SEC * cc.speed;
      simDays += dtDays;

      /* ---- consume control tokens ---- */
      if (cc.focusToken !== lastFocusToken) {
        lastFocusToken = cc.focusToken;
        const b = cc.focusId ? byId.get(cc.focusId) : null;
        if (b) {
          cam.follow = b.id;
          cam.tz = focusZoomFor(b);
        } else if (cc.focusId === "asteroid-belt" || cc.focusId === "kuiper-belt" || cc.focusId === "oort-cloud") {
          cam.follow = null;
          cam.tx = 0;
          cam.ty = 0;
          cam.tz = cc.focusId === "asteroid-belt" ? 1.15 : cc.focusId === "kuiper-belt" ? 0.5 : 0.24;
        }
      }
      if (cc.resetToken !== lastResetToken) {
        lastResetToken = cc.resetToken;
        cam.follow = null; cam.tx = 0; cam.ty = 0; cam.tz = defaultZoom();
      }
      if (cc.zoomInToken !== lastZIn) { lastZIn = cc.zoomInToken; cam.tz = Math.min(7, cam.tz * 1.4); }
      if (cc.zoomOutToken !== lastZOut) { lastZOut = cc.zoomOutToken; cam.tz = Math.max(0.1, cam.tz / 1.4); }
      if (cc.flareToken !== lastFlareToken) { lastFlareToken = cc.flareToken; spawnFlare(30); }

      /* ---- camera ---- */
      const k = 1 - Math.exp(-dt * 4.2);
      if (cam.follow) {
        const fb = byId.get(cam.follow);
        if (fb) { cam.tx = fb.x; cam.ty = fb.y; }
      }
      cam.x += (cam.tx - cam.x) * k;
      cam.y += (cam.ty - cam.y) * k;
      cam.z += (cam.tz - cam.z) * (1 - Math.exp(-dt * 3.2));

      /* ---- update bodies ---- */
      for (const b of bodies) {
        const isHover = cc.hoveredId === b.id;
        const isSel = cc.selectedId === b.id;
        b.hover += ((isHover || isSel ? 1 : 0) - b.hover) * (1 - Math.exp(-dt * 8));
        b.dispR += (targetRadius(b) - b.dispR) * (1 - Math.exp(-dt * 3));
        b.dispOrbit += (targetOrbit(b) - b.dispOrbit) * (1 - Math.exp(-dt * 3));

        if (b.kind === "planet" || b.kind === "dwarf") {
          const slow = isHover && !cc.reducedMotion ? 0.22 : 1;
          b.angle += (dtDays / b.period) * TAU * slow;
          b.x = Math.cos(b.angle) * b.dispOrbit;
          b.y = Math.sin(b.angle) * b.dispOrbit;
        } else if (b.kind === "comet") {
          const semi = b.semi! * (cc.scaleMode === "distance" ? 1.9 : 1);
          const p = semi * (1 - b.ecc! * b.ecc!);
          const rr = p / (1 + b.ecc! * Math.cos(b.angle));
          b.angle += (dtDays * 520) / (rr * rr) * (isHover ? 1.8 : 1);
          const ca = Math.cos(b.angle) * rr, sa = Math.sin(b.angle) * rr;
          const cosR = Math.cos(b.rot!), sinR = Math.sin(b.rot!);
          b.x = ca * cosR - sa * sinR;
          b.y = ca * sinR + sa * cosR;
          b.dispR = 1.2 + Math.max(0, 60 / Math.max(rr, 40));
        } else if (b.kind === "craft") {
          const span = b.to! - b.from!;
          b.dist = b.from! + ((simDays * b.pathSpeed!) % span);
          b.x = Math.cos(b.pathAngle!) * b.dist!;
          b.y = Math.sin(b.pathAngle!) * b.dist!;
        }
      }

      /* moons */
      for (const b of bodies) {
        if (b.kind !== "moon") continue;
        const parent = byId.get(b.parent!)!;
        const parentScreenR = cam.z * parent.dispR;
        b.visible = b.id === "moon" || parentScreenR > 24 || cc.hoveredId === parent.id || cc.selectedId === parent.id;
        const mo = b.moonOrbit * (parent.dispR / parent.radius);
        b.angle += (dtDays / b.period) * TAU * 0.12;
        b.x = parent.x + Math.cos(b.angle) * mo;
        b.y = parent.y + Math.sin(b.angle) * mo;
      }

      /* visibility: craft only in mission contexts */
      const showCraft = cc.era === "exploration" || cc.missionsMode;
      for (const b of bodies) if (b.kind === "craft") b.visible = showCraft;

      /* belt radii (follow mars/jupiter display orbits) */
      beltR0 = marsB.dispOrbit + 18; beltR1 = jupB.dispOrbit - 20;
      kuiperR0 = nepB.dispOrbit + 34; kuiperR1 = nepB.dispOrbit + 150;

      /* discoveries */
      if (cam.z < 0.8 && !discovered.has("kuiper-belt")) { discovered.add("kuiper-belt"); cb.current.onDiscover("kuiper-belt"); }
      if (cam.z < 0.4 && !discovered.has("oort-cloud")) { discovered.add("oort-cloud"); cb.current.onDiscover("oort-cloud"); }
      if (cc.selectedId === "pluto") discovered.add("kuiper-belt");
      const kTarget = discovered.has("kuiper-belt") ? 0.6 : 0.06;
      kuiperAlpha += (kTarget - kuiperAlpha) * (1 - Math.exp(-dt * 2));
      const oTarget = cam.z < 0.55 ? Math.min(1, (0.55 - cam.z) / 0.25) * (discovered.has("oort-cloud") ? 1 : 0.7) : 0;
      oortAlpha += (oTarget - oortAlpha) * (1 - Math.exp(-dt * 2));

      spotPulse = Math.max(0, spotPulse - dt * 0.5);
      farOutT = Math.max(0, farOutT - dt * 0.4);

      draw(dt, cc);
      raf = requestAnimationFrame(frame);
    };

    /* ---------------- draw ---------------- */
    const draw = (dt: number, cc: SimControls) => {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#05070f");
      bg.addColorStop(0.5, "#070b18");
      bg.addColorStop(1, "#04050c");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* nebulae */
      const nebs = [
        { x: -900, y: -700, r: 1150, col: "rgba(32,84,96,0.10)" },
        { x: 1000, y: 500, r: 1300, col: "rgba(96,60,32,0.07)" },
        { x: 200, y: 1200, r: 950, col: "rgba(38,52,110,0.09)" },
      ];
      for (const n of nebs) {
        const sx = W / 2 + (n.x * 0.22 - cam.x * cam.z * 0.22);
        const sy = H / 2 + (n.y * 0.22 - cam.y * cam.z * 0.22);
        const sr = n.r * (0.4 + Math.min(cam.z, 1) * 0.7);
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
        g.addColorStop(0, n.col);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      }

      /* stars */
      const t = performance.now() / 1000;
      for (const layer of starLayers) {
        for (const st of layer.stars) {
          let sx = ((st.x - cam.x * cam.z * layer.p) % 2400 + 2400) % 2400 - 600;
          let sy = ((st.y - cam.y * cam.z * layer.p) % 2400 + 2400) % 2400 - 600;
          if (sx > W + 40 || sy > H + 40 || sx < -40 || sy < -40) continue;
          const tw = cc.reducedMotion ? 0.7 : 0.55 + 0.45 * Math.sin(t * 1.4 + st.tw);
          ctx.globalAlpha = tw * (layer.p + 0.3);
          ctx.fillStyle = layer.p > 0.4 ? "#cfe4ff" : "#9db4d8";
          ctx.fillRect(sx, sy, st.s, st.s);
        }
      }
      ctx.globalAlpha = 1;

      const formation = cc.era === "formation";

      /* Oort cloud */
      if (oortAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = oortAlpha;
        for (const p of oortP) {
          const rr = 1480 + p.n * 720;
          const a = p.a + simDays * 0.00002 * p.w;
          const sx = w2sx(Math.cos(a) * rr), sy = w2sy(Math.sin(a) * rr);
          if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
          ctx.globalAlpha = oortAlpha * p.sh * 0.5;
          ctx.fillStyle = "#9db8e8";
          ctx.fillRect(sx, sy, 1.4, 1.4);
        }
        ctx.globalAlpha = oortAlpha * 0.14;
        ctx.strokeStyle = "#8fb0e0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w2sx(0), w2sy(0), 1820 * cam.z, 0, TAU);
        ctx.stroke();
        if (cam.z < 0.45) {
          ctx.globalAlpha = oortAlpha * 0.85;
          ctx.fillStyle = "#a8c4f0";
          ctx.font = `600 13px "Space Grotesk"`;
          ctx.textAlign = "center";
          ctx.fillText("OORT CLOUD", w2sx(0), w2sy(-1820) - 10);
          ctx.font = `400 10px "Space Mono"`;
          ctx.fillStyle = "#7f96c8";
          ctx.fillText("~2,000 – 100,000 AU · theoretical shell of icy bodies", w2sx(0), w2sy(-1820) + 6);
        }
        ctx.restore();
      }

      /* Kuiper belt */
      ctx.save();
      for (const p of kuiperP) {
        const rr = kuiperR0 + p.n * (kuiperR1 - kuiperR0);
        const a = p.a + simDays * 0.0006 * p.w;
        const sx = w2sx(Math.cos(a) * rr), sy = w2sy(Math.sin(a) * rr);
          if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
          const hovered = cc.hoveredId === "kuiper-belt";
          const kA = hovered ? Math.max(kuiperAlpha, 0.55) : kuiperAlpha;
          ctx.globalAlpha = Math.min(1, kA * p.sh * (hovered ? 1.5 : 1));
          ctx.fillStyle = hovered ? "#cfe6ff" : "#8fb8d8";        const s = p.s * Math.min(cam.z * 1.4, 1.6);
        ctx.fillRect(sx, sy, s, s);
      }
      ctx.restore();

      /* asteroid belt / formation disk */
      if (cc.showAsteroids || formation) {
        const arr = formation ? diskP : beltP;
        const r0 = formation ? 50 : beltR0;
        const r1 = formation ? 450 : beltR1;
        const hovered = cc.hoveredId === "asteroid-belt";
        ctx.save();
        for (const p of arr) {
          const rr = r0 + p.n * (r1 - r0);
          const a = p.a + simDays * 0.0016 * p.w * (formation ? 0.6 : 1);
          const sx = w2sx(Math.cos(a) * rr), sy = w2sy(Math.sin(a) * rr);
          if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
          ctx.globalAlpha = Math.min(1, p.sh * (hovered ? 1.6 : 1) * (formation ? 0.7 : 1));
          ctx.fillStyle = hovered ? "#e8d9c4" : "#b8a894";
          const s = p.s * Math.min(cam.z * 1.5, 2);
          ctx.fillRect(sx, sy, s, s);
        }
        if (hovered) {
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = "#e8d9c4";
          ctx.font = `700 12px "Space Grotesk"`;
          ctx.textAlign = "left";
          ctx.fillText("ASTEROID BELT", w2sx(beltR1) + 8, w2sy(0) + 4);
        }
        ctx.restore();
      }

      /* world-space pass */
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(cam.z, cam.z);
      ctx.translate(-cam.x, -cam.y);

      /* orbits */
      if (cc.showOrbits && !formation) {
        for (const b of orbiters) {
          const active = cc.hoveredId === b.id || cc.selectedId === b.id;
          ctx.globalAlpha = active ? 0.75 : 0.16;
          ctx.strokeStyle = active ? b.glow : "#8fb0d8";
          ctx.lineWidth = (active ? 1.6 : 0.8) / cam.z;
          ctx.beginPath();
          ctx.arc(0, 0, b.dispOrbit, 0, TAU);
          ctx.stroke();
          if (cc.learnMode && cam.z * b.dispOrbit > 30) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "#7f96c8";
            ctx.font = `400 ${10 / cam.z}px "Space Mono"`;
            ctx.textAlign = "left";
            ctx.fillText(`${b.au} AU`, b.dispOrbit + 6 / cam.z, 0);
          }
        }
      }

      /* mission paths */
      if (showCraftRef(cc)) {
        for (const b of bodies) {
          if (b.kind !== "craft") continue;
          const active = cc.hoveredId === b.id || cc.selectedId === b.id;
          ctx.globalAlpha = active ? 0.5 : 0.18;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = (active ? 1.4 : 0.8) / cam.z;
          ctx.setLineDash([6 / cam.z, 6 / cam.z]);
          ctx.beginPath();
          ctx.moveTo(Math.cos(b.pathAngle!) * b.from!, Math.sin(b.pathAngle!) * b.from!);
          ctx.lineTo(Math.cos(b.pathAngle!) * b.to!, Math.sin(b.pathAngle!) * b.to!);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      /* sun glow */
      const sunR = sunB.dispR * (formation ? 1.3 : 1);
      const pulse = cc.reducedMotion ? 1 : 1 + Math.sin(t * 1.6) * 0.04 + sunB.hover * 0.08;
      const glowR = sunR * 7 * pulse;
      const sg = ctx.createRadialGradient(0, 0, sunR * 0.4, 0, 0, glowR);
      sg.addColorStop(0, "rgba(255,190,90,0.5)");
      sg.addColorStop(0.25, "rgba(255,140,50,0.18)");
      sg.addColorStop(1, "rgba(255,120,40,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(0, 0, glowR, 0, TAU);
      ctx.fill();
      /* corona rays */
      ctx.save();
      ctx.rotate(cc.reducedMotion ? 0 : t * 0.05);
      ctx.globalAlpha = 0.05 + sunB.hover * 0.06;
      ctx.fillStyle = "#ffd88f";
      for (let i = 0; i < 14; i++) {
        ctx.rotate(TAU / 14);
        ctx.beginPath();
        ctx.moveTo(sunR * 0.9, 0);
        ctx.lineTo(sunR * (2.6 + sunB.hover), sunR * 0.16);
        ctx.lineTo(sunR * (2.6 + sunB.hover), -sunR * 0.16);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      /* bodies (planets, dwarfs, moons, comets) */
      const drawList = bodies.filter((b) => b.visible && b.kind !== "star");
      for (const b of drawList) {
        const scale = formation && (b.kind === "planet" || b.kind === "dwarf") ? 0.35 : 1;
        const r = b.dispR * scale * (1 + b.hover * 0.16);
        const sunAngle = Math.atan2(-b.y, -b.x);
        const dim = cc.selectedId && cc.selectedId !== b.id && !INDEX[cc.selectedId] ? 1 : cc.selectedId && cc.selectedId !== b.id ? 0.55 : 1;

        /* hover halo */
        if (b.hover > 0.02 && b.kind !== "craft") {
          const hg = ctx.createRadialGradient(b.x, b.y, r * 0.5, b.x, b.y, r * 3.4);
          hg.addColorStop(0, hexA(b.glow, 0.3 * b.hover));
          hg.addColorStop(1, hexA(b.glow, 0));
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(b.x, b.y, r * 3.4, 0, TAU);
          ctx.fill();
        }

        if (b.kind === "comet") {
          /* tail away from sun */
          const d = Math.hypot(b.x, b.y) || 1;
          const ux = b.x / d, uy = b.y / d;
          const len = Math.max(26, Math.min(240, 22000 / d)) * (1 + b.hover * 0.5);
          const tg = ctx.createLinearGradient(b.x, b.y, b.x + ux * len, b.y + uy * len);
          tg.addColorStop(0, hexA(b.glow, 0.5 + b.hover * 0.3));
          tg.addColorStop(1, hexA(b.glow, 0));
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = tg;
          ctx.beginPath();
          ctx.moveTo(b.x - uy * r * 2.2, b.y + ux * r * 2.2);
          ctx.lineTo(b.x + ux * len, b.y + uy * len);
          ctx.lineTo(b.x + uy * r * 2.2, b.y - ux * r * 2.2);
          ctx.closePath();
          ctx.fill();
          /* coma */
          const cg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * 5);
          cg.addColorStop(0, hexA(b.glow, 0.8));
          cg.addColorStop(1, hexA(b.glow, 0));
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.arc(b.x, b.y, r * 5, 0, TAU);
          ctx.fill();
          ctx.restore();
        }

        if (b.kind === "craft") {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.pathAngle! + Math.PI / 2);
          const active = cc.hoveredId === b.id || cc.selectedId === b.id;
          ctx.globalAlpha = active ? 1 : 0.8;
          ctx.fillStyle = b.color;
          const cs = Math.max(2.6 / cam.z, 2.6);
          ctx.beginPath();
          ctx.moveTo(0, -cs * 1.6); ctx.lineTo(cs, cs); ctx.lineTo(0, cs * 0.5); ctx.lineTo(-cs, cs);
          ctx.closePath(); ctx.fill();
          if (active) {
            ctx.strokeStyle = b.color; ctx.lineWidth = 1 / cam.z;
            ctx.beginPath(); ctx.arc(0, 0, cs * 3.2 + Math.sin(t * 4) * cs * 0.4, 0, TAU); ctx.stroke();
          }
          ctx.restore();
          continue;
        }

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.globalAlpha = dim * (formation && (b.kind === "planet" || b.kind === "dwarf") ? 0.5 : 1);

        if (b.ring) {
          const tilt = b.id === "uranus" ? 0.62 : 0.3;
          const shimmer = b.id === "saturn" ? 1 + (b.hover > 0.05 && !cc.reducedMotion ? Math.sin(t * 5) * 0.12 : 0) : 1;
          drawRing(ctx, r, b.ring.inner * (r / b.radius), b.ring.outer * (r / b.radius) * shimmer, b.id === "uranus" ? "#a8d8dc" : "#d8c8a0", tilt, 0.5 + b.hover * 0.3, false);
          drawBody(ctx, b.surface, r, hashCode(b.id), { time: t, sunAngle, hover: b.hover, selected: cc.selectedId === b.id ? 1 : 0, reduced: cc.reducedMotion });
          drawRing(ctx, r, b.ring.inner * (r / b.radius), b.ring.outer * (r / b.radius) * shimmer, b.id === "uranus" ? "#a8d8dc" : "#e8dcb4", tilt, 0.62 + b.hover * 0.3, true);
        } else {
          drawBody(ctx, b.surface, r, hashCode(b.id), { time: t, sunAngle, hover: b.hover, selected: cc.selectedId === b.id ? 1 : 0, reduced: cc.reducedMotion });
        }

        /* neptune wind wisps */
        if (b.id === "neptune" && b.hover > 0.05 && !cc.reducedMotion) {
          ctx.globalAlpha = b.hover * 0.5;
          ctx.strokeStyle = "#b8d0ff";
          ctx.lineWidth = Math.max(0.6 / cam.z, r * 0.05);
          for (let i = 0; i < 3; i++) {
            const off = ((t * 0.9 + i * 0.33) % 1);
            ctx.beginPath();
            ctx.arc(0, 0, r * (1.3 + i * 0.22), off * TAU, off * TAU + 1.4);
            ctx.stroke();
          }
        }
        ctx.restore();

        /* jupiter spot pulse ring */
        if (b.id === "jupiter" && spotPulse > 0) {
          ctx.save();
          ctx.globalAlpha = spotPulse * 0.8;
          ctx.strokeStyle = "#ff7f6b";
          ctx.lineWidth = 2 / cam.z;
          ctx.beginPath();
          ctx.arc(b.x + r * 0.42, b.y + r * 0.34, r * 0.24 + (1 - spotPulse) * r * 0.6, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
      }

      /* earth satellites (easter egg) */
      const earth = byId.get("earth")!;
      for (const s of sats) {
        s.a += dt * 2.4;
        const sr = earth.dispR + 6;
        ctx.save();
        ctx.fillStyle = "#cfe4ff";
        ctx.globalAlpha = 0.9;
        ctx.fillRect(earth.x + Math.cos(s.a) * sr - 1 / cam.z, earth.y + Math.sin(s.a) * sr - 1 / cam.z, 2 / cam.z, 2 / cam.z);
        ctx.restore();
      }

      /* sun body */
      ctx.save();
      const sunScale = 1 + sunB.hover * 0.07;
      const sr2 = sunR * sunScale;
      const body = ctx.createRadialGradient(-sr2 * 0.2, -sr2 * 0.2, sr2 * 0.1, 0, 0, sr2);
      body.addColorStop(0, "#fff8e0");
      body.addColorStop(0.4, "#ffd870");
      body.addColorStop(0.8, "#ff9a3c");
      body.addColorStop(1, "#e0641e");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(0, 0, sr2, 0, TAU);
      ctx.fill();
      /* granulation */
      if (!cc.reducedMotion) {
        ctx.globalAlpha = 0.12;
        for (let i = 0; i < 12; i++) {
          const a = i * 0.83 + t * 0.12;
          const rr = sr2 * (0.3 + ((i * 37) % 10) / 18);
          ctx.beginPath();
          ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, sr2 * 0.16, 0, TAU);
          ctx.fillStyle = i % 2 ? "#fff0c0" : "#ff8a3c";
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      /* flare particles */
      for (let i = flares.length - 1; i >= 0; i--) {
        const f = flares[i];
        f.life -= dt * 0.55;
        if (f.life <= 0) { flares.splice(i, 1); continue; }
        f.x += f.vx * dt; f.y += f.vy * dt;
        f.vx *= 0.985; f.vy *= 0.985;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = f.life;
        ctx.fillStyle = `hsl(${f.hue} 100% ${55 + f.life * 20}%)`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2.4 * f.life + 0.6, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      /* selection reticle */
      const sel = cc.selectedId ? byId.get(cc.selectedId) : null;
      if (sel && sel.kind !== "craft" && sel.orbitR >= 0) {
        ctx.save();
        ctx.strokeStyle = "#ffb547";
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1.4 / cam.z;
        ctx.setLineDash([5 / cam.z, 5 / cam.z]);
        ctx.lineDashOffset = cc.reducedMotion ? 0 : -t * 10 / cam.z;
        ctx.beginPath();
        ctx.arc(sel.x, sel.y, sel.dispR * 1.9 + 6 / cam.z, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore(); /* end world pass */

      /* ------- screen-space pass: labels & tooltip ------- */
      if (cc.showLabels || cc.learnMode) {
        ctx.textAlign = "center";
        for (const b of bodies) {
          if (!b.visible) continue;
          if (b.kind === "moon" && cam.z < 1.4 && b.id !== "moon") continue;
          if (b.kind === "craft" && !showCraftRef(cc)) continue;
          const sx = w2sx(b.x), sy = w2sy(b.y);
          if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
          ctx.globalAlpha = b.kind === "craft" ? 0.7 : 0.85;
          ctx.fillStyle = "#dfe7f5";
          ctx.font = `600 ${b.kind === "craft" ? 9 : 11}px "Space Grotesk"`;
          ctx.fillText(b.id === "comet-borisov" ? "2I/Borisov" : capName(b.id), sx, sy + b.dispR * cam.z + 14);
        }
        ctx.globalAlpha = 1;
      }

      /* far out! easter egg */
      if (farOutT > 0) {
        const pluto = byId.get("pluto")!;
        ctx.save();
        ctx.globalAlpha = farOutT;
        ctx.fillStyle = "#ffd88f";
        ctx.font = `700 15px "Unbounded"`;
        ctx.textAlign = "center";
        ctx.fillText("FAR OUT!", w2sx(pluto.x), w2sy(pluto.y) - pluto.dispR * cam.z - 22 - (1 - farOutT) * 18);
        ctx.restore();
      }

      /* tooltip */
      const hid = cc.hoveredId;
      if (hid && hid !== cc.selectedId) {
        const entry = INDEX[hid];
        if (entry) {
          const name = "name" in entry ? entry.name : hid;
          const type = entry.typeLabel;
          const tag = "tagline" in entry ? entry.tagline : "";
          const tagShort = tag.length > 52 ? tag.slice(0, 52) + "…" : tag;
          ctx.font = `700 12px "Unbounded"`;
          const w1 = ctx.measureText(name.toUpperCase()).width;
          ctx.font = `400 10px "Space Mono"`;
          const w2 = Math.max(ctx.measureText(type.toUpperCase()).width, tagShort ? ctx.measureText(tagShort).width * 0.98 : 0);
          const bw = Math.max(w1, w2) + 28;
          const bh = cc.learnMode || tagShort ? 64 : 48;
          let bx = mouse.sx + 18, by = mouse.sy + 16;
          if (bx + bw > W - 8) bx = mouse.sx - bw - 14;
          if (by + bh > H - 8) by = mouse.sy - bh - 12;
          ctx.save();
          ctx.fillStyle = "rgba(8,13,26,0.92)";
          ctx.strokeStyle = "rgba(143,216,255,0.25)";
          ctx.lineWidth = 1;
          roundRect(ctx, bx, by, bw, bh, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#ffb547";
          ctx.beginPath();
          ctx.arc(bx + 13, by + 15, 3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#f2f6ff";
          ctx.font = `700 12px "Unbounded"`;
          ctx.textAlign = "left";
          ctx.fillText(name.toUpperCase(), bx + 22, by + 19);
          ctx.fillStyle = "#8fd8ff";
          ctx.font = `400 9px "Space Mono"`;
          ctx.fillText(type.toUpperCase(), bx + 14, by + 35);
          if (tagShort) {
            ctx.fillStyle = "#9db0cc";
            ctx.font = `400 10px "Space Grotesk"`;
            ctx.fillText(tagShort, bx + 14, by + 51);
          }
          ctx.restore();
        }
      }
    };

    const showCraftRef = (cc: SimControls) => cc.era === "exploration" || cc.missionsMode;

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", fillBelts);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      aria-label="Interactive solar system map. Use arrow keys to pan, plus and minus to zoom, Enter to select."
      className="absolute inset-0 outline-none"
    >
      <canvas ref={canvasRef} className="block h-full w-full touch-none" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/* ---------------- utils ---------------- */

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h || 7;
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function capName(id: string) {
  const special: Record<string, string> = {
    sun: "Sun", moon: "Moon", halley: "Comet Halley", "comet-borisov": "2I/Borisov",
    "asteroid-belt": "Asteroid Belt", "kuiper-belt": "Kuiper Belt", "oort-cloud": "Oort Cloud",
  };
  if (special[id]) return special[id];
  const map = new Map(
    [...PLANETS, ...DWARFS, ...MOONS, ...MISSIONS].map((b) => [b.id, b.name])
  );
  return map.get(id) ?? id;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
