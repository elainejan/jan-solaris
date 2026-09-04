import type { NavTab } from "./NavPanel";

/* ---------------- inline icons ---------------- */
const I = {
  plus: <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />,
  minus: <path d="M1 7h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />,
  focus: <><circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" /><path d="M7 0v2.5M7 11.5V14M0 7h2.5M11.5 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
  reset: <><path d="M12.4 7A5.4 5.4 0 1 1 10.8 3.2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /><path d="M11 0.6v3h-3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>,
  play: <path d="M4 2l8 5-8 5z" fill="currentColor" />,
  pause: <path d="M3.5 2h2.6v10H3.5zM7.9 2h2.6v10H7.9z" fill="currentColor" />,
  sparkle: <path d="M7 0l1.7 4.9L14 7l-5.3 2.1L7 14 5.3 9.1 0 7l5.3-2.1z" fill="currentColor" />,
  orbit: <><circle cx="7" cy="7" r="2.4" fill="currentColor" /><ellipse cx="7" cy="7" rx="6.2" ry="2.6" stroke="currentColor" strokeWidth="1.2" fill="none" transform="rotate(-18 7 7)" /></>,
  tag: <><path d="M1 1h6l6 6-6 6-6-6z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" /><circle cx="4.4" cy="4.4" r="1.1" fill="currentColor" /></>,
  book: <path d="M2 1.8h4.2A1.8 1.8 0 0 1 8 3.6v9A1.8 1.8 0 0 0 6.2 10.8H2zM12 1.8H7.8A1.8 1.8 0 0 0 6 3.6v9a1.8 1.8 0 0 1 1.8-1.8H12z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />,
  rocks: <><circle cx="3" cy="9" r="1.8" fill="currentColor" /><circle cx="8" cy="4" r="1.2" fill="currentColor" /><circle cx="11.5" cy="10" r="2.2" fill="currentColor" /></>,
  sound: <><path d="M1 5v4h2.6L7 12V2L3.6 5z" fill="currentColor" /><path d="M9.2 4.2a4 4 0 0 1 0 5.6M11 2.4a6.4 6.4 0 0 1 0 9.2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" /></>,
  mute: <><path d="M1 5v4h2.6L7 12V2L3.6 5z" fill="currentColor" /><path d="M9.4 4.6l4 4.8M13.4 4.6l-4 4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>,
  menu: <path d="M1 3.5h12M1 7h12M1 10.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
};
export function Icon({ d, size = 14 }: { d: keyof typeof I; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">{I[d]}</svg>;
}

/* ---------------- header ---------------- */

interface HeaderProps {
  navTab: NavTab;
  onTab: (t: NavTab) => void;
  onCompare: () => void;
  compareOpen: boolean;
  onMenu: () => void;
}

export function Header({ navTab, onTab, onCompare, compareOpen, onMenu }: HeaderProps) {
  const tabs: { id: NavTab; label: string }[] = [
    { id: "explore", label: "Explore" },
    { id: "learn", label: "Learn" },
    { id: "missions", label: "Missions" },
  ];
  return (
    <header className="absolute inset-x-0 top-0 z-40 h-[58px] flex items-center gap-3 px-3 md:px-4 border-b border-[rgba(160,190,255,0.08)]"
      style={{ background: "linear-gradient(180deg, rgba(4,6,13,0.92), rgba(4,6,13,0.55) 70%, transparent)" }}>
      <button className="btn-icon md:hidden" onClick={onMenu} aria-label="Open navigation menu">
        <Icon d="menu" />
      </button>
      <div className="flex items-baseline gap-2.5 select-none">
        <span className="font-display font-black text-[17px] md:text-[19px] tracking-[0.08em] text-white leading-none">
          SOLAR<span className="text-[#ffb547]">IS</span>
        </span>
        <span className="hidden sm:block font-data text-[8.5px] uppercase tracking-[0.22em] text-[#5d6f8f]">
          Interactive Solar System Explorer
        </span>
      </div>

      <nav className="ml-auto flex items-center gap-1" aria-label="Primary">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => onTab(t.id)} data-on={navTab === t.id}
            className="hidden md:block px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all seg-btn"
            style={{
              color: navTab === t.id ? "#ffb547" : "#8ea0bf",
              background: navTab === t.id ? "rgba(255,181,71,0.1)" : "transparent",
            }}>
            {t.label}
          </button>
        ))}
        <button onClick={onCompare} data-on={compareOpen}
          className="hidden md:block px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all"
          style={{
            color: compareOpen ? "#ffb547" : "#8ea0bf",
            background: compareOpen ? "rgba(255,181,71,0.1)" : "transparent",
          }}>
          Compare
        </button>
        {/* mobile: single cycle button */}
        <button
          className="md:hidden btn-icon !w-auto !px-3 !h-8 font-data text-[10px] uppercase tracking-widest"
          onClick={() => {
            const order: NavTab[] = ["explore", "learn", "missions"];
            onTab(order[(order.indexOf(navTab) + 1) % order.length]);
          }}
          aria-label="Switch navigation category"
        >
          {navTab}
        </button>
        <button className="md:hidden btn-icon !w-8 !h-8" onClick={onCompare} aria-label="Compare planets">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><circle cx="4.5" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.4" fill="none" /><circle cx="10" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>
        </button>
      </nav>
    </header>
  );
}

/* ---------------- bottom control bar ---------------- */

interface BarProps {
  paused: boolean; onTogglePause: () => void;
  speed: number; onCycleSpeed: () => void;
  scaleMode: "balanced" | "size" | "distance"; onScaleMode: (m: "balanced" | "size" | "distance") => void;
  era: "present" | "formation" | "exploration"; onEra: (e: "present" | "formation" | "exploration") => void;
  showAsteroids: boolean; onAsteroids: () => void;
  showOrbits: boolean; onOrbits: () => void;
  showLabels: boolean; onLabels: () => void;
  learnMode: boolean; onLearn: () => void;
  soundOn: boolean; onSound: () => void;
  onZoomIn: () => void; onZoomOut: () => void; onFocus: () => void; onReset: () => void;
  onSurprise: () => void;
  onScaleInfo: () => void;
  discoveredCount: number; total: number;
}

export function BottomBar(p: BarProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-2 md:px-3 pb-2 md:pb-3 pointer-events-none">
      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 pointer-events-auto justify-center md:justify-between">
        {/* discovery cluster */}
        <div className="flex items-center gap-1.5 order-1">
          <button className="btn-accent" onClick={p.onSurprise} aria-label="Surprise me with a random discovery">
            <Icon d="sparkle" size={13} /> <span className="max-sm:hidden">Surprise Me</span><span className="sm:hidden">Surprise</span>
          </button>
          <span className="chip !text-[#8fd8ff] !border-[rgba(143,216,255,0.3)] max-sm:hidden" title="Objects you've opened or discovered">
            ✦ {p.discoveredCount}/{p.total}
          </span>
        </div>

        {/* era + scale */}
        <div className="flex items-center gap-1.5 order-3 md:order-2 flex-wrap justify-center">
          <div className="seg" role="group" aria-label="Timeline era">
            {(["present", "formation", "exploration"] as const).map((e) => (
              <button key={e} data-on={p.era === e} onClick={() => p.onEra(e)}>{e}</button>
            ))}
          </div>
          <div className="seg" role="group" aria-label="Visualization scale mode">
            {(["balanced", "size", "distance"] as const).map((m) => (
              <button key={m} data-on={p.scaleMode === m} onClick={() => p.onScaleMode(m)}>
                {m === "balanced" ? "bal" : m === "size" ? "sizes" : "dist"}
              </button>
            ))}
            <button onClick={p.onScaleInfo} aria-label="Why is the map not to scale?">?</button>
          </div>
        </div>

        {/* camera + toggles */}
        <div className="flex items-center gap-1.5 order-2 md:order-3">
          <div className="panel-glass rounded-xl px-1.5 py-1 flex items-center gap-1">
            <button className="btn-icon" onClick={p.onZoomOut} aria-label="Zoom out" title="Zoom out (−)"><Icon d="minus" /></button>
            <button className="btn-icon" onClick={p.onZoomIn} aria-label="Zoom in" title="Zoom in (+)"><Icon d="plus" /></button>
            <button className="btn-icon" onClick={p.onFocus} aria-label="Focus selected object" title="Focus selected (⌖)"><Icon d="focus" /></button>
            <button className="btn-icon" onClick={p.onReset} aria-label="Reset view" title="Reset view (0)"><Icon d="reset" /></button>
            <span className="w-px h-5 bg-[rgba(160,190,255,0.14)]" />
            <button className="btn-icon" onClick={p.onTogglePause} data-on={p.paused}
              aria-label={p.paused ? "Resume orbital motion" : "Pause orbital motion"} title="Play / pause (space)">
              <Icon d={p.paused ? "play" : "pause"} />
            </button>
            <button className="btn-icon !w-auto px-2 font-data text-[10.5px]" onClick={p.onCycleSpeed}
              aria-label={`Simulation speed ${p.speed}× — click to change`} title="Simulation speed">
              ×{p.speed}
            </button>
          </div>
          <div className="panel-glass rounded-xl px-1.5 py-1 flex items-center gap-1">
            <button className="btn-icon" data-on={p.showAsteroids} onClick={p.onAsteroids} aria-label="Toggle asteroid belt" aria-pressed={p.showAsteroids} title="Asteroid belt"><Icon d="rocks" /></button>
            <button className="btn-icon" data-on={p.showOrbits} onClick={p.onOrbits} aria-label="Toggle orbit paths" aria-pressed={p.showOrbits} title="Orbit paths"><Icon d="orbit" /></button>
            <button className="btn-icon" data-on={p.showLabels} onClick={p.onLabels} aria-label="Toggle labels" aria-pressed={p.showLabels} title="Labels"><Icon d="tag" /></button>
            <button className="btn-icon" data-on={p.learnMode} onClick={p.onLearn} aria-label="Toggle learn mode" aria-pressed={p.learnMode} title="Learn mode — richer tooltips & distances"><Icon d="book" /></button>
            <button className="btn-icon" data-on={p.soundOn} onClick={p.onSound} aria-label={p.soundOn ? "Mute ambient sound" : "Play ambient sound"} aria-pressed={p.soundOn} title="Ambient sound">
              <Icon d={p.soundOn ? "sound" : "mute"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- toast / fact card / hint ---------------- */

export function Toast({ msg, sub }: { msg: string; sub?: string }) {
  return (
    <div className="anim-toast absolute left-1/2 top-[66px] z-50 pointer-events-none" role="status">
      <div className="panel-glass rounded-xl px-4 py-2.5 text-center !border-[rgba(255,181,71,0.4)]">
        <div className="font-display text-[13px] font-bold text-[#ffb547]">{msg}</div>
        {sub && <div className="text-[11px] text-[#c6d2e6] mt-0.5 max-w-[280px]">{sub}</div>}
      </div>
    </div>
  );
}

export function FactCard({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="anim-slide-right absolute left-3 bottom-[128px] md:bottom-[72px] z-20 max-w-[300px] md:left-4" role="status">
      <div className="panel-glass rounded-xl p-3.5 !border-[rgba(143,216,255,0.25)]">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span className="font-data text-[9px] uppercase tracking-[0.2em] text-[#8fd8ff]">✦ Did you know?</span>
          <button onClick={onClose} aria-label="Dismiss fact" className="text-[#5d6f8f] hover:text-white text-[13px] leading-none">✕</button>
        </div>
        <p className="text-[12.5px] leading-relaxed text-[#dfe7f5]">{text}</p>
      </div>
    </div>
  );
}

export function HintBar() {
  return (
    <div className="anim-hint absolute inset-x-0 bottom-[118px] md:bottom-[70px] z-10 flex justify-center pointer-events-none px-4">
      <div className="panel-glass rounded-full px-4 py-2 font-data text-[10px] uppercase tracking-[0.14em] text-[#8ea0bf] whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
        drag to pan · scroll to zoom · click any world to explore · zoom far out to find hidden regions
      </div>
    </div>
  );
}

export function ScaleNote({ mode }: { mode: "size" | "distance" }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[64px] z-10 pointer-events-none px-3">
      <div className="font-data text-[9.5px] uppercase tracking-[0.14em] text-[#5d6f8f] bg-[rgba(4,6,13,0.7)] border border-[rgba(160,190,255,0.1)] rounded-full px-3 py-1.5 text-center">
        {mode === "size"
          ? "Sizes near-true relative scale · distances compressed for visibility"
          : "Orbital spacing ∝ real distance · planet sizes enlarged to stay visible"}
      </div>
    </div>
  );
}
