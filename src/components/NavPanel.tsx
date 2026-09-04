import { useMemo, useState } from "react";
import {
  SUN, PLANETS, DWARFS, MOONS, REGIONS, MISSIONS, TOPICS, INDEX, AnyEntry,
} from "../data/solarSystem";

export type NavTab = "explore" | "learn" | "missions";

interface Props {
  tab: NavTab;
  selectedId: string | null;
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

function Dot({ color }: { color: string }) {
  return (
    <span className="w-2.5 h-2.5 rounded-full shrink-0"
      style={{ background: color, boxShadow: `0 0 8px ${color}aa` }} aria-hidden />
  );
}

function Group({ title, items, selectedId, onSelect }: {
  title: string; items: AnyEntry[]; selectedId: string | null; onSelect: (id: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <div className="font-data text-[9px] uppercase tracking-[0.2em] text-[#5d6f8f] px-2.5 mb-1.5">{title}</div>
      {items.map((it) => (
        <button key={it.id} className="nav-item" data-active={selectedId === it.id}
          onClick={() => onSelect(it.id)} aria-pressed={selectedId === it.id}>
          <Dot color={it.color} />
          <span className="flex-1 truncate">{it.name}</span>
          <span className="font-data text-[9px] text-[#5d6f8f]">{it.typeLabel.split("·")[0].trim()}</span>
        </button>
      ))}
    </div>
  );
}

export default function NavPanel({ tab, selectedId, onSelect, open, onClose }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return Object.values(INDEX).filter(
      (e) => e.name.toLowerCase().includes(q) || e.typeLabel.toLowerCase().includes(q) || e.tagline.toLowerCase().includes(q)
    ).slice(0, 9);
  }, [query]);

  const pick = (id: string) => { onSelect(id); onClose(); };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} aria-hidden />
      )}
      <nav
        className={`panel-glass absolute z-[35] flex flex-col overflow-hidden transition-transform duration-300
          max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:w-[280px] max-md:rounded-none max-md:pt-16
          md:left-3 md:top-[62px] md:bottom-[76px] md:w-[262px] md:rounded-2xl
          ${open ? "translate-x-0" : "max-md:-translate-x-full"}`}
        aria-label="Solar system navigation"
      >
        <div className="p-3 border-b border-[rgba(160,190,255,0.1)] shrink-0">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5d6f8f]" width="13" height="13" viewBox="0 0 14 14" aria-hidden>
              <circle cx="6" cy="6" r="4.4" stroke="currentColor" strokeWidth="1.6" fill="none" />
              <path d="M9.4 9.4L13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Explore the Solar System…"
              aria-label="Search the Solar System"
              className="w-full rounded-lg bg-[rgba(143,216,255,0.05)] border border-[rgba(160,190,255,0.14)]
                pl-8 pr-8 py-2 text-[12.5px] placeholder-[#5d6f8f] focus:border-[#8fd8ff] focus:outline-none transition-colors"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5d6f8f] hover:text-white">✕</button>
            )}
          </div>
          {results && (
            <div className="mt-2 rounded-lg border border-[rgba(160,190,255,0.14)] bg-[#0a101d] overflow-hidden anim-rise">
              {results.length === 0 && <div className="px-3 py-2.5 text-[11.5px] text-[#5d6f8f]">Nothing found out there…</div>}
              {results.map((r, i) => (
                <button key={r.id} onClick={() => { pick(r.id); setQuery(""); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[rgba(143,216,255,0.07)] transition-colors anim-rise"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  <Dot color={r.color} />
                  <span className="text-[12.5px] font-semibold flex-1 truncate">{r.name}</span>
                  <span className="font-data text-[8.5px] uppercase tracking-wider text-[#5d6f8f]">{r.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scroll-slim p-2.5">
          {tab === "explore" && (
            <>
              <Group title="The Star" items={[SUN]} selectedId={selectedId} onSelect={pick} />
              <Group title="Planets" items={PLANETS} selectedId={selectedId} onSelect={pick} />
              <Group title="Dwarf Planets" items={DWARFS} selectedId={selectedId} onSelect={pick} />
              <Group title="Moons" items={MOONS} selectedId={selectedId} onSelect={pick} />
              <Group title="Small Bodies & Regions" items={REGIONS} selectedId={selectedId} onSelect={pick} />
            </>
          )}
          {tab === "learn" && (
            <>
              <Group title="Concepts" items={TOPICS} selectedId={selectedId} onSelect={pick} />
              <Group title="Regions" items={REGIONS.filter((r) => r.category === "region")} selectedId={selectedId} onSelect={pick} />
            </>
          )}
          {tab === "missions" && (
            <>
              <Group title="Spacecraft & Missions" items={MISSIONS} selectedId={selectedId} onSelect={pick} />
              <p className="text-[11px] text-[#5d6f8f] leading-relaxed px-2.5 mt-2">
                Tip: select a mission, then press ⌖ focus — its trajectory appears as a dashed line across the map.
              </p>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
