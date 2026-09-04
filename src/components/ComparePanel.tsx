import { useMemo, useState } from "react";
import { PLANETS, BodyData } from "../data/solarSystem";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

const METRICS: { key: keyof NonNullable<BodyData["nums"]>; label: string; unit: string; log?: boolean; fmt: (v: number) => string }[] = [
  { key: "diameterKm", label: "Diameter", unit: "km", log: true, fmt: (v) => v.toLocaleString() },
  { key: "mass10_24", label: "Mass", unit: "10²⁴ kg", log: true, fmt: (v) => v.toLocaleString() },
  { key: "gravity", label: "Surface gravity", unit: "m/s²", fmt: (v) => v.toFixed(1) },
  { key: "distAU", label: "Distance from Sun", unit: "AU", log: true, fmt: (v) => v.toFixed(2) },
  { key: "dayHours", label: "Day length", unit: "hours", log: true, fmt: (v) => (v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1)) },
  { key: "yearDays", label: "Year length", unit: "days", log: true, fmt: (v) => v.toLocaleString() },
  { key: "moons", label: "Moons", unit: "", fmt: (v) => `${v}` },
  { key: "tempC", label: "Mean temperature", unit: "°C", fmt: (v) => `${v > 0 ? "+" : ""}${v}` },
];

export default function ComparePanel({ open, onClose, onSelect }: Props) {
  const [ids, setIds] = useState<string[]>(["earth", "mars"]);

  const planets = useMemo(() => ids.map((id) => PLANETS.find((p) => p.id === id)!).filter(Boolean), [ids]);

  if (!open) return null;

  const maxDiam = Math.max(...planets.map((p) => p.nums!.diameterKm));

  const setSlot = (i: number, id: string) => {
    const next = [...ids];
    next[i] = id;
    setIds(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
      style={{ background: "rgba(3,5,10,0.78)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog" aria-modal="true" aria-label="Compare planets"
    >
      <div
        className="panel-glass rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto scroll-slim anim-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-4 border-b border-[rgba(160,190,255,0.1)] flex items-start justify-between gap-3">
          <div>
            <div className="chip !text-[#ffb547] !border-[rgba(255,181,71,0.4)]">Comparison Lab</div>
            <h2 className="font-display text-xl md:text-2xl font-black mt-2 tracking-tight">
              {planets.map((p) => p.name).join(" vs ")}
            </h2>
            <p className="text-[12px] text-[#8ea0bf] mt-1">Pick up to three planets and weigh them against each other.</p>
          </div>
          <button onClick={onClose} aria-label="Close comparison" className="btn-icon !w-8 !h-8 shrink-0">
            <svg width="13" height="13" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* selectors */}
        <div className="px-5 py-4 flex flex-wrap items-center gap-2">
          {ids.map((id, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={id} onChange={(e) => setSlot(i, e.target.value)}
                aria-label={`Planet slot ${i + 1}`}
                className="rounded-lg bg-[rgba(143,216,255,0.05)] border border-[rgba(160,190,255,0.16)] px-3 py-2 text-[12.5px] font-semibold focus:outline-none focus:border-[#8fd8ff] cursor-pointer"
              >
                {PLANETS.map((p) => <option key={p.id} value={p.id} className="bg-[#0a101d]">{p.name}</option>)}
              </select>
              {ids.length > 2 && (
                <button onClick={() => setIds(ids.filter((_, j) => j !== i))} aria-label={`Remove planet ${i + 1}`}
                  className="text-[#5d6f8f] hover:text-[#ff7f6b] transition-colors">✕</button>
              )}
            </div>
          ))}
          {ids.length < 3 && (
            <button
              onClick={() => {
                const free = PLANETS.find((p) => !ids.includes(p.id));
                if (free) setIds([...ids, free.id]);
              }}
              className="rounded-lg border border-dashed border-[rgba(160,190,255,0.3)] px-3 py-2 text-[12px] text-[#8fd8ff] hover:border-[#8fd8ff] transition-colors"
            >
              + Add planet
            </button>
          )}
        </div>

        {/* size visual */}
        <div className="px-5 pb-2">
          <div className="font-data text-[9px] uppercase tracking-[0.2em] text-[#5d6f8f] mb-3">Relative size (diameter, √scale)</div>
          <div className="rounded-xl border border-[rgba(160,190,255,0.1)] bg-[#060a14] px-4 pt-6 pb-3 flex items-end justify-around gap-4 min-h-[150px]">
            {planets.map((p) => {
              const d = 26 + Math.sqrt(p.nums!.diameterKm / maxDiam) * 96;
              return (
                <button key={p.id} onClick={() => onSelect(p.id)} className="flex flex-col items-center gap-2 group cursor-pointer" title={`Open ${p.name}`}>
                  <span
                    className="rounded-full transition-transform group-hover:scale-105"
                    style={{
                      width: d, height: d,
                      background: `radial-gradient(circle at 32% 30%, ${p.glow}, ${p.color} 55%, #10141f 130%)`,
                      boxShadow: `0 0 ${d / 2.5}px ${p.glow}55`,
                    }}
                    aria-hidden
                  />
                  <span className="text-[11.5px] font-semibold group-hover:text-[#8fd8ff] transition-colors">{p.name}</span>
                  <span className="font-data text-[9px] text-[#5d6f8f]">{p.nums!.diameterKm.toLocaleString()} km</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* metric table */}
        <div className="px-5 pb-6 pt-2">
          <table className="w-full border-collapse" aria-label="Planet metrics comparison">
            <thead>
              <tr>
                <th className="text-left font-data text-[9px] uppercase tracking-[0.16em] text-[#5d6f8f] pb-2 font-normal w-[34%]">Metric</th>
                {planets.map((p) => (
                  <th key={p.id} className="text-left font-data text-[9px] uppercase tracking-[0.16em] pb-2 font-normal" style={{ color: p.glow }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => {
                const vals = planets.map((p) => p.nums![m.key]);
                const maxV = Math.max(...vals.map((v) => (m.log ? Math.log10(Math.abs(v) + 1) : Math.abs(v))), 0.0001);
                return (
                  <tr key={m.key} className="align-top">
                    <td className="py-2.5 pr-3 text-[12px] text-[#c6d2e6] border-t border-[rgba(160,190,255,0.07)]">
                      {m.label}{m.unit && <span className="text-[#5d6f8f]"> · {m.unit}</span>}
                    </td>
                    {planets.map((p, i) => {
                      const v = vals[i];
                      const scaled = m.log ? Math.log10(Math.abs(v) + 1) : Math.abs(v);
                      const w = Math.max(6, (scaled / maxV) * 100);
                      const isMax = Math.abs(v) === Math.max(...vals.map((x) => Math.abs(x))) && new Set(vals.map((x) => Math.abs(x))).size > 1;
                      return (
                        <td key={p.id} className="py-2.5 pr-4 border-t border-[rgba(160,190,255,0.07)]">
                          <div className="text-[12.5px] font-bold" style={{ color: isMax ? p.glow : "#eef3fb" }}>
                            {m.fmt(v)}{isMax && <span className="ml-1.5 text-[9px] font-data text-[#5d6f8f]">MAX</span>}
                          </div>
                          <div className="h-[3px] rounded-full mt-1.5 bg-[rgba(143,216,255,0.08)] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${w}%`, background: `linear-gradient(90deg, ${p.color}, ${p.glow})` }} />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[10.5px] text-[#5d6f8f] mt-3 font-data">BAR SCALE: LOGARITHMIC WHERE MARKED · VALUES: NASA PLANETARY FACT SHEETS</p>
        </div>
      </div>
    </div>
  );
}
