import { useCallback, useEffect, useRef, useState } from "react";
import SolarCanvas, { createControls } from "./engine/SolarCanvas";
import { INDEX, RANDOM_FACTS, SURPRISE_POOL, DISCOVERY_TOTAL, isMission } from "./data/solarSystem";
import InfoPanel from "./components/InfoPanel";
import NavPanel, { NavTab } from "./components/NavPanel";
import ComparePanel from "./components/ComparePanel";
import { Header, BottomBar, Toast, FactCard, HintBar, ScaleNote } from "./components/Chrome";

const prefersReduced =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function App() {
  const controlsRef = useRef(createControls());

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [navTab, setNavTab] = useState<NavTab>("explore");
  const [navOpen, setNavOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  const [paused, setPaused] = useState(prefersReduced);
  const [speed, setSpeed] = useState(1);
  const [scaleMode, setScaleMode] = useState<"balanced" | "size" | "distance">("balanced");
  const [era, setEra] = useState<"present" | "formation" | "exploration">("present");
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [learnMode, setLearnMode] = useState(false);
  const [missionsMode, setMissionsMode] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  const [discovered, setDiscovered] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<{ msg: string; sub?: string; key: number } | null>(null);
  const [factIdx, setFactIdx] = useState(0);
  const [factVisible, setFactVisible] = useState(false);

  const audioRef = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);

  /* ------------- sync UI state → engine ------------- */
  useEffect(() => {
    const cc = controlsRef.current;
    cc.paused = paused;
    cc.speed = speed;
    cc.scaleMode = scaleMode;
    cc.era = era;
    cc.showAsteroids = showAsteroids;
    cc.showOrbits = showOrbits;
    cc.showLabels = showLabels;
    cc.learnMode = learnMode;
    cc.missionsMode = missionsMode;
    cc.reducedMotion = prefersReduced;
  }, [paused, speed, scaleMode, era, showAsteroids, showOrbits, showLabels, learnMode, missionsMode]);

  /* ------------- toast helper ------------- */
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string, sub?: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, sub, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 5200);
  }, []);

  /* ------------- selection ------------- */
  const selectObject = useCallback((id: string) => {
    const e = INDEX[id];
    if (!e) return;
    setSelectedId(id);
    const cc = controlsRef.current;
    cc.selectedId = id;
    if (e.category !== "concept") {
      cc.focusId = id;
      cc.focusToken++;
    }
    if (isMission(e)) setMissionsMode(true);
    setDiscovered((prev) => {
      if (prev.has(id)) return prev;
      const n = new Set(prev);
      n.add(id);
      return n;
    });
  }, []);

  const closePanel = useCallback(() => {
    setSelectedId(null);
    controlsRef.current.selectedId = null;
  }, []);

  /* ------------- engine callbacks ------------- */
  const onDiscover = useCallback((id: string) => {
    if (id === "fx-flare") {
      showToast("Solar flare!", "Three quick taps woke the Sun — a burst of plasma erupts.");
      return;
    }
    if (id === "fx-farout") {
      showToast("Far out!", "You poked Pluto, king of the Kuiper Belt.");
      return;
    }
    const e = INDEX[id];
    setDiscovered((prev) => {
      if (prev.has(id)) return prev;
      const n = new Set(prev);
      n.add(id);
      return n;
    });
    if (e) showToast(`You discovered: ${e.name}`, e.tagline);
  }, [showToast]);

  /* ------------- surprise me ------------- */
  const surprise = useCallback(() => {
    let id = SURPRISE_POOL[Math.floor(Math.random() * SURPRISE_POOL.length)];
    if (id === selectedId) id = SURPRISE_POOL[(SURPRISE_POOL.indexOf(id) + 7) % SURPRISE_POOL.length];
    selectObject(id);
    const e = INDEX[id];
    const facts = e && "facts" in e ? e.facts : undefined;
    const fact = facts && facts.length ? facts[Math.floor(Math.random() * facts.length)] : e?.tagline;
    showToast(`You discovered: ${e?.name}`, fact);
  }, [selectedId, selectObject, showToast]);

  /* ------------- rotating fact card ------------- */
  useEffect(() => {
    const rotate = () => {
      setFactIdx((i) => (i + 1 + Math.floor(Math.random() * 3)) % RANDOM_FACTS.length);
      setFactVisible(true);
    };
    const t1 = setTimeout(rotate, 16000);
    const t2 = setInterval(rotate, 55000);
    return () => {
      clearTimeout(t1);
      clearInterval(t2);
    };
  }, []);

  /* ------------- keyboard: escape closes things ------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT")) return;
      if (compareOpen) setCompareOpen(false);
      else if (navOpen) setNavOpen(false);
      else if (selectedId) closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [compareOpen, navOpen, selectedId, closePanel]);

  /* ------------- ambient sound ------------- */
  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      const next = !v;
      if (next) {
        if (!audioRef.current) {
          const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new Ctor();
          const gain = ctx.createGain();
          gain.gain.value = 0;
          const filt = ctx.createBiquadFilter();
          filt.type = "lowpass";
          filt.frequency.value = 320;
          const o1 = ctx.createOscillator();
          o1.type = "sine";
          o1.frequency.value = 54;
          const o2 = ctx.createOscillator();
          o2.type = "triangle";
          o2.frequency.value = 81.5;
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.07;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 0.014;
          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);
          o1.connect(filt);
          o2.connect(filt);
          filt.connect(gain);
          gain.connect(ctx.destination);
          o1.start();
          o2.start();
          lfo.start();
          audioRef.current = { ctx, gain };
        }
        void audioRef.current.ctx.resume();
        audioRef.current.gain.gain.linearRampToValueAtTime(0.05, audioRef.current.ctx.currentTime + 1.4);
      } else if (audioRef.current) {
        audioRef.current.gain.gain.linearRampToValueAtTime(0.0001, audioRef.current.ctx.currentTime + 0.5);
      }
      return next;
    });
  }, []);

  /* ------------- camera button handlers ------------- */
  const cc = controlsRef.current;
  const zoomIn = () => cc.zoomInToken++;
  const zoomOut = () => cc.zoomOutToken++;
  const resetView = () => cc.resetToken++;
  const focusSelected = () => {
    if (selectedId) {
      cc.focusId = selectedId;
      cc.focusToken++;
    } else {
      cc.resetToken++;
    }
  };

  const selectedEntry = selectedId ? INDEX[selectedId] : null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#04060d] text-[#dfe7f5]">
      <SolarCanvas
        controls={controlsRef}
        onSelect={selectObject}
        onHover={() => undefined}
        onDiscover={onDiscover}
      />

      {/* vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{ background: "radial-gradient(ellipse at center, transparent 52%, rgba(2,3,8,0.6) 100%)" }}
        aria-hidden
      />

      <Header
        navTab={navTab}
        onTab={(t) => {
          setNavTab(t);
          setNavOpen(false);
        }}
        onCompare={() => setCompareOpen((v) => !v)}
        compareOpen={compareOpen}
        onMenu={() => setNavOpen((v) => !v)}
      />

      <NavPanel
        tab={navTab}
        selectedId={selectedId}
        onSelect={selectObject}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />

      {selectedEntry && (
        <InfoPanel
          entry={selectedEntry}
          onClose={closePanel}
          onSelect={selectObject}
          showAsteroids={showAsteroids}
          onToggleAsteroids={() => setShowAsteroids((v) => !v)}
        />
      )}

      <BottomBar
        paused={paused}
        onTogglePause={() => setPaused((v) => !v)}
        speed={speed}
        onCycleSpeed={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : s === 4 ? 0.5 : 1))}
        scaleMode={scaleMode}
        onScaleMode={setScaleMode}
        era={era}
        onEra={setEra}
        showAsteroids={showAsteroids}
        onAsteroids={() => setShowAsteroids((v) => !v)}
        showOrbits={showOrbits}
        onOrbits={() => setShowOrbits((v) => !v)}
        showLabels={showLabels}
        onLabels={() => setShowLabels((v) => !v)}
        learnMode={learnMode}
        onLearn={() => setLearnMode((v) => !v)}
        soundOn={soundOn}
        onSound={toggleSound}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFocus={focusSelected}
        onReset={resetView}
        onSurprise={surprise}
        onScaleInfo={() => {
          setLearnMode(true);
          selectObject("scale");
        }}
        discoveredCount={discovered.size}
        total={DISCOVERY_TOTAL}
      />

      {toast && <Toast key={toast.key} msg={toast.msg} sub={toast.sub} />}
      {factVisible && <FactCard text={RANDOM_FACTS[factIdx]} onClose={() => setFactVisible(false)} />}
      <HintBar />
      {scaleMode !== "balanced" && <ScaleNote mode={scaleMode} />}

      <ComparePanel
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        onSelect={(id) => {
          setCompareOpen(false);
          selectObject(id);
        }}
      />
    </div>
  );
}
