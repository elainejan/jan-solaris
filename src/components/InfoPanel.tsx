import {
  AnyEntry, BodyData, TopicData, MissionData, INDEX, isMission, isTopic,
} from "../data/solarSystem";
import {
  MoonPhaseWidget, EnergyFlowWidget, MeteorStagesWidget, DwarfCompareWidget,
  ScaleDemoWidget, FormationWidget, PlanetTypesWidget,
} from "./widgets";

interface Props {
  entry: AnyEntry;
  onClose: () => void;
  onSelect: (id: string) => void;
  showAsteroids: boolean;
  onToggleAsteroids: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  star: "#ffb547", planet: "#8fd8ff", dwarf: "#e8c9a0", moon: "#c8ccd4",
  comet: "#bfe8ff", region: "#9b8d7e", concept: "#8fd8ff", mission: "#ffd88f",
};

function Widget({ w }: { w: string }) {
  switch (w) {
    case "moonphases": return <MoonPhaseWidget />;
    case "energy": return <EnergyFlowWidget />;
    case "meteors": return <MeteorStagesWidget />;
    case "dwarfcompare": return <DwarfCompareWidget />;
    case "scale": return <ScaleDemoWidget />;
    case "formation": return <FormationWidget />;
    case "types": return <PlanetTypesWidget />;
    default: return null;
  }
}

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <section className="anim-rise" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="font-data text-[10px] uppercase tracking-[0.18em] text-[#8fd8ff] mb-2 flex items-center gap-2">
        <span className="inline-block w-4 h-px bg-[#8fd8ff] opacity-60" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function InfoPanel({ entry, onClose, onSelect, showAsteroids, onToggleAsteroids }: Props) {
  const color = CATEGORY_COLORS[entry.category] ?? "#8fd8ff";
  const mission = isMission(entry) ? entry : null;
  const topic = isTopic(entry) ? entry : null;
  const body = !mission && !topic ? (entry as BodyData) : null;

  return (
    <aside
      className="panel-glass absolute z-40 flex flex-col overflow-hidden
        max-md:inset-x-2 max-md:bottom-[96px] max-md:max-h-[52vh] max-md:rounded-2xl
        md:right-3 md:top-[62px] md:bottom-[76px] md:w-[392px] md:rounded-2xl"
      role="dialog" aria-label={`Details about ${entry.name}`}
    >
      {/* header */}
      <div className="px-5 pt-4 pb-3 border-b border-[rgba(160,190,255,0.1)] relative shrink-0"
        style={{ background: `linear-gradient(135deg, ${color}14, transparent 60%)` }}>
        <button
          onClick={onClose} aria-label="Close details panel"
          className="btn-icon absolute right-3 top-3 !w-8 !h-8"
        >
          <svg width="13" height="13" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="chip" style={{ color, borderColor: `${color}66` }}>{entry.typeLabel}</span>
        </div>
        <h2 className="font-display text-[26px] leading-tight font-black mt-2 tracking-tight" style={{ color }}>
          {entry.name}
        </h2>
        <p className="text-[13px] text-[#c6d2e6] mt-1.5 leading-relaxed anim-rise" style={{ animationDelay: "60ms" }}>
          {"definition" in entry ? entry.definition : entry.tagline}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scroll-slim px-5 py-4 space-y-5">
        {body?.id === "asteroid-belt" && (
          <div className="flex items-center justify-between rounded-lg border border-[rgba(160,190,255,0.15)] px-3 py-2.5">
            <span className="text-[12px] font-semibold">Show asteroids</span>
            <button
              role="switch" aria-checked={showAsteroids} onClick={onToggleAsteroids}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ background: showAsteroids ? "rgba(255,181,71,0.85)" : "rgba(120,140,170,0.3)" }}
              aria-label="Toggle asteroid belt particles"
            >
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                style={{ left: showAsteroids ? 22 : 2 }} />
            </button>
          </div>
        )}

        {/* widget */}
        {(body?.widget || topic?.widget) && (
          <Section title={body?.widget === "energy" ? "Sun → Earth Energy" : "Interactive"} delay={80}>
            <Widget w={(body?.widget ?? topic!.widget) as string} />
          </Section>
        )}

        {/* stats */}
        {body && body.stats.length > 0 && (
          <Section title="Key Facts" delay={120}>
            <div className="grid grid-cols-2 gap-2">
              {body.stats.map((s, i) => (
                <div key={s.label} className="stat-card anim-rise" style={{ animationDelay: `${140 + i * 45}ms` }}>
                  <div className="font-data text-[9px] uppercase tracking-[0.14em] text-[#8ea0bf]">{s.label}</div>
                  <div className="text-[13px] font-semibold mt-1 text-[#eef3fb]">{s.value}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* mission details */}
        {mission && (
          <Section title="Mission File" delay={120}>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Agency", mission.agency], ["Launched", mission.launched],
                ["Destination", mission.destination], ["Status", mission.status],
              ].map(([l, v], i) => (
                <div key={l} className={`stat-card anim-rise ${l === "Destination" || l === "Status" ? "col-span-2" : ""}`} style={{ animationDelay: `${140 + i * 45}ms` }}>
                  <div className="font-data text-[9px] uppercase tracking-[0.14em] text-[#8ea0bf]">{l}</div>
                  <div className="text-[13px] font-semibold mt-1 text-[#eef3fb]">{v}</div>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#c6d2e6] leading-relaxed mt-3">{mission.purpose}</p>
          </Section>
        )}
        {mission && (
          <Section title="Major Discoveries" delay={260}>
            <ul className="space-y-1.5">
              {mission.discoveries.map((d) => (
                <li key={d} className="flex gap-2 text-[12px] text-[#c6d2e6] leading-relaxed">
                  <span className="text-[#ffb547] mt-0.5">◆</span>{d}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* topic sections */}
        {topic && topic.sections.map((s, i) => (
          <Section key={s.heading} title={s.heading} delay={140 + i * 70}>
            <p className="text-[12.5px] text-[#c6d2e6] leading-relaxed">{s.text}</p>
          </Section>
        ))}

        {/* why it matters */}
        {body?.why && (
          <Section title="Why It Matters" delay={240}>
            <p className="text-[12.5px] text-[#c6d2e6] leading-relaxed border-l-2 pl-3" style={{ borderColor: color }}>
              {body.why}
            </p>
          </Section>
        )}

        {/* facts */}
        {(body?.facts?.length || topic?.facts?.length) ? (
          <Section title="Did You Know?" delay={300}>
            <ul className="space-y-1.5">
              {(body?.facts ?? topic!.facts ?? []).map((f) => (
                <li key={f} className="flex gap-2 text-[12px] text-[#c6d2e6] leading-relaxed">
                  <span className="text-[#8fd8ff] mt-0.5 shrink-0">✦</span>{f}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {/* related missions */}
        {body?.missionIds && body.missionIds.length > 0 && (
          <Section title="Notable Missions" delay={340}>
            <div className="flex flex-wrap gap-2">
              {body.missionIds.map((m) => {
                const mi = INDEX[m];
                if (!mi) return null;
                return (
                  <button key={m} onClick={() => onSelect(m)}
                    className="chip hover:!text-[#ffb547] hover:!border-[rgba(255,181,71,0.5)] transition-colors cursor-pointer">
                    ▸ {mi.name}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* explore more */}
        {(body?.related || topic?.related || mission?.related) && (
          <Section title="Explore More" delay={380}>
            <div className="flex flex-wrap gap-2 pb-2">
              {(body?.related ?? topic?.related ?? mission!.related!).map((r) => {
                const re = INDEX[r];
                if (!re) return null;
                return (
                  <button key={r} onClick={() => onSelect(r)}
                    className="rounded-lg border border-[rgba(160,190,255,0.15)] px-3 py-1.5 text-[12px] font-semibold
                      hover:border-[#8fd8ff] hover:text-[#8fd8ff] hover:-translate-y-0.5 transition-all cursor-pointer">
                    {re.name} →
                  </button>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </aside>
  );
}

export type { Props as InfoPanelProps };
