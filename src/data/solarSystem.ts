/* ------------------------------------------------------------------ */
/*  SOLARIS data layer — every object in the explorer lives here.      */
/* ------------------------------------------------------------------ */

export interface Stat { label: string; value: string }

export interface CompareNums {
  diameterKm: number;
  mass10_24: number;   // mass in 10^24 kg
  gravity: number;     // m/s²
  distAU: number;
  dayHours: number;
  yearDays: number;
  moons: number;
  tempC: number;       // mean surface / cloud-top temp
}

export interface BodyData {
  id: string;
  name: string;
  category: "star" | "planet" | "dwarf" | "moon" | "comet" | "region" | "concept" | "mission";
  typeLabel: string;
  tagline: string;
  definition: string;
  why?: string;
  facts: string[];
  stats: Stat[];
  nums?: CompareNums;
  color: string;
  glow: string;
  surface: string;
  radius?: number;        // balanced-view world radius
  orbit?: number;         // balanced-view orbit radius
  periodDays?: number;    // orbital period
  spinDays?: number;
  tiltDeg?: number;
  ring?: { inner: number; outer: number };
  au?: number;
  angle0?: number;        // starting orbital angle (rad)
  parent?: string;        // for moons
  moonOrbit?: number;     // world units from parent
  related?: string[];
  missionIds?: string[];
  widget?: "moonphases" | "energy" | "meteors" | "dwarfcompare" | "types";
}

export interface TopicData {
  id: string;
  name: string;
  category: "concept";
  typeLabel: string;
  tagline: string;
  definition: string;
  sections: { heading: string; text: string }[];
  color: string;
  glow: string;
  widget?: "moonphases" | "meteors" | "dwarfcompare" | "types" | "formation" | "scale";
  related?: string[];
  facts?: string[];
}

export interface MissionData {
  id: string;
  name: string;
  category: "mission";
  typeLabel: string;
  tagline: string;
  agency: string;
  launched: string;
  destination: string;
  status: string;
  purpose: string;
  discoveries: string[];
  color: string;
  path: { from: number; to: number; angle: number; speed: number };
  related?: string[];
}

export type AnyEntry = BodyData | TopicData | MissionData;

/* ------------------------------- SUN ------------------------------ */

export const SUN: BodyData = {
  id: "sun", name: "Sun", category: "star", typeLabel: "G-Type Main-Sequence Star",
  tagline: "The star that powers everything in our Solar System.",
  definition: "The Sun is a 4.6-billion-year-old star — a giant ball of hot plasma held together by gravity. Nuclear fusion in its core converts hydrogen into helium, releasing the light and heat that makes life on Earth possible.",
  why: "The Sun contains 99.86% of all mass in the Solar System, and its gravity choreographs every orbit. Its magnetic activity — flares and coronal mass ejections — shapes space weather across the whole system.",
  facts: [
    "About 1.3 million Earths could fit inside the Sun.",
    "Light from the Sun takes 8 minutes 20 seconds to reach Earth.",
    "The core temperature is roughly 15 million °C.",
    "The Sun will eventually swell into a red giant in about 5 billion years."
  ],
  stats: [
    { label: "Type", value: "Yellow dwarf (G2V)" },
    { label: "Age", value: "4.6 billion years" },
    { label: "Diameter", value: "1.39 million km" },
    { label: "Surface temp", value: "5,505 °C" },
    { label: "Core temp", value: "15,000,000 °C" },
    { label: "Composition", value: "73% H · 25% He" },
    { label: "Distance to Earth", value: "149.6 million km" },
    { label: "Mass share", value: "99.86% of system" }
  ],
  color: "#ffb547", glow: "#ff8a3c", surface: "sun", radius: 26, angle0: 0,
  related: ["mercury", "earth", "parker", "great-red-spot"],
  widget: "energy"
};

/* ----------------------------- PLANETS ---------------------------- */

export const PLANETS: BodyData[] = [
  {
    id: "mercury", name: "Mercury", category: "planet", typeLabel: "Terrestrial Planet",
    tagline: "The smallest planet and the closest to the Sun.",
    definition: "Mercury is a small, cratered rocky world that races around the Sun faster than any other planet. With almost no atmosphere, its surface swings between scorching days and freezing nights.",
    why: "Mercury is a time capsule of the early Solar System — its battered crust records billions of years of impacts, and its huge iron core hints at how rocky planets assemble.",
    facts: [
      "A year on Mercury is just 88 Earth days — but one solar day lasts 176 Earth days.",
      "Temperatures swing from −173 °C at night to 427 °C by day.",
      "Mercury has a giant iron core making up about 85% of its radius.",
      "Despite being closest to the Sun, ice hides in permanently shadowed craters at its poles."
    ],
    stats: [
      { label: "Order from Sun", value: "1st" }, { label: "Type", value: "Terrestrial" },
      { label: "Diameter", value: "4,879 km" }, { label: "Distance from Sun", value: "57.9 million km" },
      { label: "Day length", value: "59 Earth days" }, { label: "Year length", value: "88 Earth days" },
      { label: "Moons", value: "0" }, { label: "Temperature", value: "−173 to 427 °C" },
      { label: "Atmosphere", value: "Virtually none" }, { label: "Gravity", value: "3.7 m/s²" }
    ],
    nums: { diameterKm: 4879, mass10_24: 0.33, gravity: 3.7, distAU: 0.39, dayHours: 1407.6, yearDays: 88, moons: 0, tempC: 167 },
    color: "#a8998a", glow: "#c8b8a6", surface: "mercury", radius: 4.6, orbit: 64, periodDays: 88, au: 0.39, angle0: 0.6,
    related: ["venus", "sun", "messenger"], missionIds: ["messenger", "voyager1"],
  },
  {
    id: "venus", name: "Venus", category: "planet", typeLabel: "Terrestrial Planet",
    tagline: "Earth's scorching twin, wrapped in thick acid clouds.",
    definition: "Venus is a rocky planet similar in size to Earth, but its runaway greenhouse atmosphere of carbon dioxide traps heat so efficiently that it is the hottest planet in the Solar System.",
    why: "Venus shows what a runaway greenhouse effect looks like — studying it helps scientists understand how delicate Earth's climate balance really is.",
    facts: [
      "One day on Venus (243 Earth days) is longer than its year (225 Earth days).",
      "Venus spins backwards compared to most planets.",
      "Surface pressure is 92× Earth's — like being 900 m underwater.",
      "Its clouds are made of sulfuric acid droplets."
    ],
    stats: [
      { label: "Order from Sun", value: "2nd" }, { label: "Type", value: "Terrestrial" },
      { label: "Diameter", value: "12,104 km" }, { label: "Distance from Sun", value: "108.2 million km" },
      { label: "Day length", value: "243 Earth days" }, { label: "Year length", value: "225 Earth days" },
      { label: "Moons", value: "0" }, { label: "Temperature", value: "~465 °C" },
      { label: "Atmosphere", value: "96% CO₂, acid clouds" }, { label: "Gravity", value: "8.9 m/s²" }
    ],
    nums: { diameterKm: 12104, mass10_24: 4.87, gravity: 8.9, distAU: 0.72, dayHours: 5832.5, yearDays: 224.7, moons: 0, tempC: 464 },
    color: "#e8c46f", glow: "#ffd98a", surface: "venus", radius: 7.4, orbit: 92, periodDays: 225, au: 0.72, angle0: 2.4,
    related: ["earth", "mercury", "magellan"], missionIds: ["magellan"],
  },
  {
    id: "earth", name: "Earth", category: "planet", typeLabel: "Terrestrial Planet",
    tagline: "Our home — the only known world with life.",
    definition: "Earth is the third planet from the Sun and the only place in the universe confirmed to host life. Liquid-water oceans cover 71% of its surface, and a protective atmosphere and magnetic field shield it from space radiation.",
    why: "Earth is the reference point for every habitability study. Its plate tectonics, magnetic field, and large stabilizing Moon make it a rare, self-regulating oasis.",
    facts: [
      "Earth is the densest planet in the Solar System.",
      "The Moon slowly drifts away from Earth by about 3.8 cm every year.",
      "Earth's magnetic field deflects solar wind, creating auroras at the poles.",
      "71% of Earth's surface is ocean, yet over 80% of it remains unexplored."
    ],
    stats: [
      { label: "Order from Sun", value: "3rd" }, { label: "Type", value: "Terrestrial" },
      { label: "Diameter", value: "12,742 km" }, { label: "Distance from Sun", value: "149.6 million km" },
      { label: "Day length", value: "23h 56m" }, { label: "Year length", value: "365.25 days" },
      { label: "Moons", value: "1" }, { label: "Temperature", value: "−88 to 58 °C" },
      { label: "Atmosphere", value: "78% N₂ · 21% O₂" }, { label: "Gravity", value: "9.8 m/s²" }
    ],
    nums: { diameterKm: 12742, mass10_24: 5.97, gravity: 9.8, distAU: 1, dayHours: 23.9, yearDays: 365.25, moons: 1, tempC: 15 },
    color: "#4f9df5", glow: "#7fc4ff", surface: "earth", radius: 8, orbit: 122, periodDays: 365, au: 1, angle0: 4.4,
    related: ["moon", "mars", "asteroid-belt"], missionIds: [],
  },
  {
    id: "mars", name: "Mars", category: "planet", typeLabel: "Terrestrial Planet",
    tagline: "The red planet — future home of human explorers?",
    definition: "Mars is a cold desert world with the largest volcano and canyon in the Solar System. Its rusty color comes from iron-oxide dust, and evidence shows liquid water once flowed across its surface.",
    why: "Mars is the most Earth-like frontier for exploration. Rovers are actively searching for signs of ancient microbial life, and it is the leading candidate for future human missions.",
    facts: [
      "Olympus Mons on Mars is ~22 km tall — nearly 3× Mount Everest.",
      "Mars has seasons like Earth because of a similar axial tilt (25°).",
      "Sunsets on Mars appear blue because of fine dust in the atmosphere.",
      "A day on Mars (a 'sol') lasts 24 hours 37 minutes."
    ],
    stats: [
      { label: "Order from Sun", value: "4th" }, { label: "Type", value: "Terrestrial" },
      { label: "Diameter", value: "6,779 km" }, { label: "Distance from Sun", value: "227.9 million km" },
      { label: "Day length", value: "24h 37m" }, { label: "Year length", value: "687 Earth days" },
      { label: "Moons", value: "2" }, { label: "Temperature", value: "−153 to 20 °C" },
      { label: "Atmosphere", value: "95% CO₂, very thin" }, { label: "Gravity", value: "3.7 m/s²" }
    ],
    nums: { diameterKm: 6779, mass10_24: 0.64, gravity: 3.7, distAU: 1.52, dayHours: 24.6, yearDays: 687, moons: 2, tempC: -63 },
    color: "#e07b54", glow: "#ff9a70", surface: "mars", radius: 5.6, orbit: 156, periodDays: 687, au: 1.52, angle0: 1.2,
    related: ["earth", "asteroid-belt", "perseverance"], missionIds: ["perseverance"],
  },
  {
    id: "jupiter", name: "Jupiter", category: "planet", typeLabel: "Gas Giant",
    tagline: "The giant planet with a centuries-old storm.",
    definition: "Jupiter is the largest planet — a gas giant of hydrogen and helium with colorful cloud bands and the Great Red Spot, a storm bigger than Earth that has raged for at least 190 years.",
    why: "Jupiter's immense gravity shapes the architecture of the Solar System, deflecting comets and asteroids. Its 95+ moons include ocean worlds that are prime targets in the search for life.",
    facts: [
      "Jupiter has more than twice the mass of all other planets combined.",
      "The Great Red Spot is a storm wider than Earth, observed since 1831 (possibly since 1665).",
      "Jupiter's moon Ganymede is larger than the planet Mercury.",
      "Jupiter has the shortest day of any planet — just under 10 hours."
    ],
    stats: [
      { label: "Order from Sun", value: "5th" }, { label: "Type", value: "Gas giant" },
      { label: "Diameter", value: "139,820 km" }, { label: "Distance from Sun", value: "778.5 million km" },
      { label: "Day length", value: "9h 56m" }, { label: "Year length", value: "11.9 Earth years" },
      { label: "Moons", value: "95 known" }, { label: "Temperature", value: "−108 °C (cloud tops)" },
      { label: "Atmosphere", value: "90% H₂ · 10% He" }, { label: "Gravity", value: "24.8 m/s²" }
    ],
    nums: { diameterKm: 139820, mass10_24: 1898, gravity: 24.8, distAU: 5.2, dayHours: 9.9, yearDays: 4333, moons: 95, tempC: -108 },
    color: "#d8b48e", glow: "#f2cfa4", surface: "jupiter", radius: 20, orbit: 258, periodDays: 4333, au: 5.2, angle0: 5.6,
    related: ["io", "europa", "ganymede", "callisto", "great-red-spot", "saturn"], missionIds: ["juno", "galileo"],
  },
  {
    id: "saturn", name: "Saturn", category: "planet", typeLabel: "Gas Giant",
    tagline: "The ringed jewel of the Solar System.",
    definition: "Saturn is the sixth planet from the Sun, famous for its spectacular ring system made of countless chunks of ice and rock, from dust grains to house-sized boulders.",
    why: "Saturn's rings are a natural laboratory for studying how disks of material behave — the same physics that built planets. Its moon Titan has rain, rivers and lakes of liquid methane.",
    facts: [
      "Saturn's average density is lower than water — it would float in a giant bathtub.",
      "The rings span ~280,000 km but are mostly only ~10 meters thick.",
      "Saturn has 146 confirmed moons — the most of any planet.",
      "Winds near Saturn's equator reach 1,800 km/h."
    ],
    stats: [
      { label: "Order from Sun", value: "6th" }, { label: "Type", value: "Gas giant" },
      { label: "Diameter", value: "116,460 km" }, { label: "Distance from Sun", value: "1.43 billion km" },
      { label: "Day length", value: "10h 42m" }, { label: "Year length", value: "29.4 Earth years" },
      { label: "Moons", value: "146 known" }, { label: "Temperature", value: "−139 °C" },
      { label: "Atmosphere", value: "96% H₂ · 3% He" }, { label: "Gravity", value: "10.4 m/s²" }
    ],
    nums: { diameterKm: 116460, mass10_24: 568, gravity: 10.4, distAU: 9.58, dayHours: 10.7, yearDays: 10759, moons: 146, tempC: -139 },
    color: "#e6d3a3", glow: "#f7e7bd", surface: "saturn", radius: 17, orbit: 318, periodDays: 10759, au: 9.58, angle0: 3.5,
    ring: { inner: 21, outer: 34 },
    related: ["titan", "jupiter", "cassini", "uranus"], missionIds: ["cassini"],
  },
  {
    id: "uranus", name: "Uranus", category: "planet", typeLabel: "Ice Giant",
    tagline: "The sideways ice giant.",
    definition: "Uranus is a pale blue ice giant tipped almost completely on its side — it orbits the Sun rolling like a barrel, likely knocked over by an ancient collision.",
    why: "Uranus's extreme 98° tilt produces 42-year-long seasons and challenges every theory of how planets form and migrate. It is the coldest planetary atmosphere known.",
    facts: [
      "Uranus rotates on its side with a 98° axial tilt.",
      "Each pole gets 42 years of continuous sunlight, then 42 years of darkness.",
      "Its blue-green color comes from methane absorbing red light.",
      "Uranus holds the record for coldest temperature measured in the Solar System: −224 °C."
    ],
    stats: [
      { label: "Order from Sun", value: "7th" }, { label: "Type", value: "Ice giant" },
      { label: "Diameter", value: "50,724 km" }, { label: "Distance from Sun", value: "2.87 billion km" },
      { label: "Day length", value: "17h 14m" }, { label: "Year length", value: "84 Earth years" },
      { label: "Moons", value: "28 known" }, { label: "Temperature", value: "−224 °C" },
      { label: "Atmosphere", value: "H₂, He, methane" }, { label: "Gravity", value: "8.9 m/s²" }
    ],
    nums: { diameterKm: 50724, mass10_24: 86.8, gravity: 8.9, distAU: 19.2, dayHours: 17.2, yearDays: 30687, moons: 28, tempC: -195 },
    color: "#9fd8dd", glow: "#c4f0f4", surface: "uranus", radius: 12, orbit: 378, periodDays: 30687, au: 19.2, angle0: 0.2, tiltDeg: 98,
    ring: { inner: 15, outer: 19 },
    related: ["neptune", "saturn", "voyager2"], missionIds: ["voyager2"],
  },
  {
    id: "neptune", name: "Neptune", category: "planet", typeLabel: "Ice Giant",
    tagline: "The windiest world — found by mathematics.",
    definition: "Neptune is the most distant planet, a deep-blue ice giant discovered in 1846 because mathematicians predicted where it must be from irregularities in Uranus's orbit.",
    why: "Neptune's supersonic winds — the fastest in the Solar System — flow despite receiving little solar energy, challenging atmospheric science. Its moon Triton orbits backwards.",
    facts: [
      "Neptune's winds exceed 2,100 km/h — the fastest known in the Solar System.",
      "It was the first planet found by mathematical prediction rather than observation.",
      "One Neptune year equals 165 Earth years; it completed its first observed orbit in 2011.",
      "Its moon Triton is a captured Kuiper Belt object that orbits in reverse."
    ],
    stats: [
      { label: "Order from Sun", value: "8th" }, { label: "Type", value: "Ice giant" },
      { label: "Diameter", value: "49,244 km" }, { label: "Distance from Sun", value: "4.50 billion km" },
      { label: "Day length", value: "16h 6m" }, { label: "Year length", value: "165 Earth years" },
      { label: "Moons", value: "16 known" }, { label: "Temperature", value: "−201 °C" },
      { label: "Atmosphere", value: "H₂, He, methane" }, { label: "Gravity", value: "11.2 m/s²" }
    ],
    nums: { diameterKm: 49244, mass10_24: 102, gravity: 11.2, distAU: 30.05, dayHours: 16.1, yearDays: 60190, moons: 16, tempC: -201 },
    color: "#4f6df5", glow: "#7f9bff", surface: "neptune", radius: 11.6, orbit: 432, periodDays: 60190, au: 30.05, angle0: 5.0,
    related: ["uranus", "kuiper-belt", "voyager2"], missionIds: ["voyager2"],
  },
];

/* --------------------------- DWARF PLANETS ------------------------ */

export const DWARFS: BodyData[] = [
  {
    id: "pluto", name: "Pluto", category: "dwarf", typeLabel: "Dwarf Planet · Kuiper Belt",
    tagline: "The beloved dwarf planet with a heart-shaped glacier.",
    definition: "Pluto is a dwarf planet in the Kuiper Belt, reclassified in 2006 because it has not cleared its orbital neighborhood. NASA's New Horizons revealed a surprisingly active world with mountains of water ice and a giant heart-shaped nitrogen glacier, Sputnik Planitia.",
    why: "Pluto reshaped how we classify worlds and opened our eyes to the rich diversity of the Kuiper Belt — a frozen archive of the Solar System's building blocks.",
    facts: [
      "Pluto's heart-shaped region, Sputnik Planitia, is a glacier of nitrogen ice.",
      "Pluto has five moons; Charon is so large the two orbit a point between them.",
      "Sunlight on Pluto is still ~250× brighter than a full Moon on Earth.",
      "New Horizons flew past Pluto in 2015 after a 9.5-year journey."
    ],
    stats: [
      { label: "Type", value: "Dwarf planet" }, { label: "Diameter", value: "2,377 km" },
      { label: "Distance from Sun", value: "5.9 billion km" }, { label: "Day length", value: "6.4 Earth days" },
      { label: "Year length", value: "248 Earth years" }, { label: "Moons", value: "5" },
      { label: "Temperature", value: "−229 °C" }, { label: "Region", value: "Kuiper Belt" }
    ],
    color: "#c9a97f", glow: "#e8c9a0", surface: "pluto", radius: 3.4, orbit: 505, periodDays: 90560, au: 39.5, angle0: 2.9,
    related: ["kuiper-belt", "neptune", "eris", "new-horizons"], missionIds: ["new-horizons"],
    widget: "dwarfcompare"
  },
  {
    id: "eris", name: "Eris", category: "dwarf", typeLabel: "Dwarf Planet · Scattered Disc",
    tagline: "The distant dwarf that sparked Pluto's reclassification.",
    definition: "Eris is a dwarf planet in the scattered disc, slightly smaller than Pluto but 27% more massive. Its discovery in 2005 forced astronomers to define what a 'planet' is.",
    facts: [
      "Eris is named after the Greek goddess of discord — fitting, given the debate it caused.",
      "Eris orbits the Sun at about three times Pluto's average distance.",
      "Its surface is coated in bright frozen methane.",
      "One Eris year lasts 558 Earth years."
    ],
    stats: [
      { label: "Type", value: "Dwarf planet" }, { label: "Diameter", value: "2,326 km" },
      { label: "Distance from Sun", value: "10.1 billion km" }, { label: "Year length", value: "558 Earth years" },
      { label: "Moons", value: "1 (Dysnomia)" }, { label: "Region", value: "Scattered disc" }
    ],
    color: "#d8d5cc", glow: "#f0ede4", surface: "ice", radius: 3.2, orbit: 560, periodDays: 204000, au: 68, angle0: 4.1,
    related: ["pluto", "kuiper-belt"]
  },
  {
    id: "haumea", name: "Haumea", category: "dwarf", typeLabel: "Dwarf Planet · Kuiper Belt",
    tagline: "The egg-shaped dwarf that spins in 4 hours.",
    definition: "Haumea is one of the fastest-spinning large objects known. Its rapid rotation stretches it into an ellipsoid, and it even has two small moons and a thin ring.",
    facts: [
      "A day on Haumea lasts only 3.9 hours.",
      "Haumea has its own ring, discovered in 2017.",
      "Its surface is nearly pure crystalline water ice."
    ],
    stats: [
      { label: "Type", value: "Dwarf planet" }, { label: "Diameter", value: "~1,632 km (long axis)" },
      { label: "Distance from Sun", value: "6.5 billion km" }, { label: "Day length", value: "3.9 hours" },
      { label: "Year length", value: "285 Earth years" }, { label: "Moons", value: "2" }
    ],
    color: "#cfd8dc", glow: "#e6f0f3", surface: "ice", radius: 3, orbit: 540, periodDays: 104000, au: 43, angle0: 0.9,
    related: ["pluto", "makemake"]
  },
  {
    id: "makemake", name: "Makemake", category: "dwarf", typeLabel: "Dwarf Planet · Kuiper Belt",
    tagline: "A reddish frozen world named after a creation deity.",
    definition: "Makemake is a reddish dwarf planet in the Kuiper Belt, named after the creator god of Rapa Nui (Easter Island). It is one of the brightest Kuiper Belt objects.",
    facts: [
      "Makemake has almost no atmosphere, despite being Pluto-like in size.",
      "Its surface is covered in frozen methane and ethane.",
      "A small moon, MK2, was discovered orbiting it in 2016."
    ],
    stats: [
      { label: "Type", value: "Dwarf planet" }, { label: "Diameter", value: "1,430 km" },
      { label: "Distance from Sun", value: "6.9 billion km" }, { label: "Year length", value: "305 Earth years" },
      { label: "Moons", value: "1" }, { label: "Region", value: "Kuiper Belt" }
    ],
    color: "#c98d6b", glow: "#e8b08f", surface: "rock", radius: 2.9, orbit: 522, periodDays: 111800, au: 45.4, angle0: 5.4,
    related: ["pluto", "haumea"]
  },
  {
    id: "ceres", name: "Ceres", category: "dwarf", typeLabel: "Dwarf Planet · Asteroid Belt",
    tagline: "The smallest dwarf planet, hiding in the asteroid belt.",
    definition: "Ceres is the largest object in the asteroid belt and the only dwarf planet in the inner Solar System. NASA's Dawn spacecraft found bright salt deposits in its craters — evidence of subsurface briny water.",
    facts: [
      "Ceres contains about a third of the asteroid belt's total mass.",
      "Occator Crater's bright spots are salty deposits left by briny fluid.",
      "Ceres may have a remnant ocean beneath its crust.",
      "It was first discovered in 1801 — and called a planet!"
    ],
    stats: [
      { label: "Type", value: "Dwarf planet" }, { label: "Diameter", value: "940 km" },
      { label: "Distance from Sun", value: "414 million km" }, { label: "Day length", value: "9.1 hours" },
      { label: "Year length", value: "4.6 Earth years" }, { label: "Region", value: "Asteroid Belt" }
    ],
    color: "#9aa3ad", glow: "#c2ccd6", surface: "rock", radius: 2.6, orbit: 197, periodDays: 1682, au: 2.77, angle0: 3.9,
    related: ["asteroid-belt", "mars"]
  },
];

/* ------------------------------ MOONS ----------------------------- */

export const MOONS: BodyData[] = [
  {
    id: "moon", name: "Moon (Luna)", category: "moon", typeLabel: "Natural Satellite · Earth",
    tagline: "Earth's constant companion — gateway to deep space.",
    definition: "The Moon is Earth's only natural satellite, formed about 4.5 billion years ago likely from debris of a giant impact. Its gravity drives Earth's tides, and it is the only other world humans have walked on.",
    why: "The Moon stabilizes Earth's axial tilt, moderating our climate. It is also humanity's proving ground — the Artemis program aims to return astronauts there as a stepping stone to Mars.",
    facts: [
      "The same side of the Moon always faces Earth — we never see the far side from the ground.",
      "Twelve astronauts have walked on the Moon, all between 1969 and 1972.",
      "The Moon causes Earth's ocean tides through gravitational pull.",
      "A day-night cycle on the Moon (from new Moon to new Moon) lasts 29.5 Earth days."
    ],
    stats: [
      { label: "Distance from Earth", value: "384,400 km" }, { label: "Diameter", value: "3,475 km" },
      { label: "Gravity", value: "1.62 m/s² (0.17 g)" }, { label: "Orbital period", value: "27.3 days" },
      { label: "Phase cycle", value: "29.5 days" }, { label: "Temperature", value: "−173 to 127 °C" },
      { label: "Age", value: "~4.5 billion years" }, { label: "Visitors", value: "12 humans" }
    ],
    color: "#c8ccd4", glow: "#e8edf5", surface: "moon", radius: 2.3, parent: "earth", moonOrbit: 15, periodDays: 27.3,
    related: ["earth", "mars", "moon-phases"], widget: "moonphases"
  },
  {
    id: "io", name: "Io", category: "moon", typeLabel: "Galilean Moon · Jupiter",
    tagline: "The most volcanically active world known.",
    definition: "Io is Jupiter's innermost large moon, tortured by tidal gravity into constant volcanic eruptions that paint its surface yellow, red and black.",
    facts: [
      "Some of Io's volcanic plumes rise 500 km above the surface.",
      "Io is resurfaced so fast it has almost no impact craters.",
      "Tidal squeezing from Jupiter heats Io's interior."
    ],
    stats: [
      { label: "Diameter", value: "3,643 km" }, { label: "Orbits", value: "Jupiter" },
      { label: "Orbital period", value: "1.8 days" }, { label: "Claim to fame", value: "400+ active volcanoes" }
    ],
    color: "#e8d36f", glow: "#ffe98f", surface: "io", radius: 1.9, parent: "jupiter", moonOrbit: 27, periodDays: 1.77,
    related: ["jupiter", "europa"]
  },
  {
    id: "europa", name: "Europa", category: "moon", typeLabel: "Galilean Moon · Jupiter",
    tagline: "An icy moon hiding a vast saltwater ocean.",
    definition: "Europa is Jupiter's ice-crusted moon with a global liquid-water ocean beneath its shell — containing about twice the water of all Earth's oceans. It is a top target in the search for extraterrestrial life.",
    facts: [
      "Europa's ocean may hold twice the liquid water of Earth.",
      "NASA's Europa Clipper arrived at Jupiter in 2030 to study its habitability.",
      "Cracks in the ice suggest the shell shifts like Earth's plate tectonics."
    ],
    stats: [
      { label: "Diameter", value: "3,122 km" }, { label: "Orbits", value: "Jupiter" },
      { label: "Orbital period", value: "3.6 days" }, { label: "Ocean depth", value: "~60–150 km" }
    ],
    color: "#d8c8b0", glow: "#f0e4d0", surface: "europa", radius: 1.7, parent: "jupiter", moonOrbit: 33, periodDays: 3.55,
    related: ["jupiter", "ganymede"]
  },
  {
    id: "ganymede", name: "Ganymede", category: "moon", typeLabel: "Galilean Moon · Jupiter",
    tagline: "The largest moon in the Solar System.",
    definition: "Ganymede is bigger than the planet Mercury and the only moon known to generate its own magnetic field. Like Europa, it likely hosts a buried ocean.",
    facts: [
      "Ganymede is the only moon with its own magnetosphere.",
      "It is larger than Mercury, yet only half Mercury's mass.",
      "ESA's JUICE spacecraft is on its way to study Ganymede in detail."
    ],
    stats: [
      { label: "Diameter", value: "5,268 km" }, { label: "Orbits", value: "Jupiter" },
      { label: "Orbital period", value: "7.2 days" }, { label: "Rank", value: "Largest moon" }
    ],
    color: "#b0a494", glow: "#d4c8b8", surface: "ganymede", radius: 2.2, parent: "jupiter", moonOrbit: 40, periodDays: 7.15,
    related: ["jupiter", "callisto"]
  },
  {
    id: "callisto", name: "Callisto", category: "moon", typeLabel: "Galilean Moon · Jupiter",
    tagline: "The most cratered world in the Solar System.",
    definition: "Callisto is Jupiter's outermost Galilean moon — an ancient, crater-saturated ball of ice and rock that has barely changed in 4 billion years.",
    facts: [
      "Callisto's surface is the oldest and most heavily cratered known.",
      "It may also harbor a subsurface ocean, deep below its icy shell.",
      "Because radiation there is low, a future base could orbit Callisto."
    ],
    stats: [
      { label: "Diameter", value: "4,821 km" }, { label: "Orbits", value: "Jupiter" },
      { label: "Orbital period", value: "16.7 days" }, { label: "Claim to fame", value: "Crater record holder" }
    ],
    color: "#8f857a", glow: "#b3a99e", surface: "callisto", radius: 2.1, parent: "jupiter", moonOrbit: 48, periodDays: 16.7,
    related: ["jupiter", "ganymede"]
  },
  {
    id: "titan", name: "Titan", category: "moon", typeLabel: "Moon · Saturn",
    tagline: "The only moon with a dense atmosphere and liquid on its surface.",
    definition: "Titan is Saturn's largest moon, wrapped in a thick orange nitrogen atmosphere with methane rain, rivers and lakes — a strangely familiar alien landscape.",
    facts: [
      "Titan's atmosphere is ~4× denser than Earth's at the surface.",
      "NASA's Dragonfly rotorcraft will launch in 2028 to explore Titan's dunes.",
      "On Titan, you could strap on wings and fly — gravity is that weak."
    ],
    stats: [
      { label: "Diameter", value: "5,150 km" }, { label: "Orbits", value: "Saturn" },
      { label: "Orbital period", value: "15.9 days" }, { label: "Surface liquids", value: "Methane & ethane" }
    ],
    color: "#e0a860", glow: "#f7c98c", surface: "titan", radius: 2.2, parent: "saturn", moonOrbit: 40, periodDays: 15.9,
    related: ["saturn", "cassini"]
  },
];

/* -------------------------- REGIONS (canvas) ---------------------- */

export const REGIONS: BodyData[] = [
  {
    id: "asteroid-belt", name: "Asteroid Belt", category: "region", typeLabel: "Region · Between Mars & Jupiter",
    tagline: "Millions of rocky leftovers from planet formation.",
    definition: "A region between Mars and Jupiter containing millions of rocky objects left over from the early formation of the Solar System. Jupiter's gravity stirred this zone so much that a planet could never form here.",
    why: "Asteroids are pristine rubble from the Solar System's construction site. Studying them tells us what the building blocks of rocky planets were made of.",
    facts: [
      "Despite movie scenes, asteroids are usually millions of km apart.",
      "The belt's total mass is only ~4% of the Moon's.",
      "Ceres alone holds a third of the belt's mass.",
      "Vesta, Pallas and Hygiea are the other largest asteroids."
    ],
    stats: [
      { label: "Location", value: "2.2–3.2 AU from Sun" }, { label: "Objects", value: "Millions, 1M+ over 1 km" },
      { label: "Total mass", value: "~4% of the Moon" }, { label: "Largest body", value: "Ceres (940 km)" },
      { label: "Composition", value: "Rock & metal" }, { label: "Age", value: "~4.6 billion years" }
    ],
    color: "#9b8d7e", glow: "#c4b4a2", surface: "rock",
    related: ["ceres", "mars", "jupiter", "space-objects"]
  },
  {
    id: "kuiper-belt", name: "Kuiper Belt", category: "region", typeLabel: "Region · Beyond Neptune",
    tagline: "A frozen ring of icy worlds past Neptune.",
    definition: "The Kuiper Belt is a vast doughnut-shaped region beyond Neptune populated by icy bodies — including Pluto, Haumea and Makemake — left over from the Solar System's formation.",
    why: "Kuiper Belt objects are deep-frozen time capsules. Short-period comets peel off from this region, and New Horizons has visited two of its members up close.",
    facts: [
      "The Kuiper Belt stretches from ~30 to ~55 AU from the Sun.",
      "It is similar to the asteroid belt but ~20× wider and far icier.",
      "Eris, though farther out, was found in the related scattered disc.",
      "New Horizons flew past Kuiper object Arrokoth in 2019."
    ],
    stats: [
      { label: "Location", value: "30–55 AU" }, { label: "Composition", value: "Frozen volatiles" },
      { label: "Famous members", value: "Pluto, Haumea, Makemake" }, { label: "Estimated objects", value: "100,000+ over 100 km" }
    ],
    color: "#8fb8d8", glow: "#b8dcf5", surface: "ice",
    related: ["pluto", "neptune", "oort-cloud", "new-horizons"]
  },
  {
    id: "oort-cloud", name: "Oort Cloud", category: "region", typeLabel: "Region · Outermost Shell",
    tagline: "The Solar System's distant icy frontier — still theoretical.",
    definition: "The Oort Cloud is a hypothesized spherical shell of trillions of icy objects surrounding the Solar System far beyond the planets — from roughly 2,000 to over 100,000 AU. It has never been observed directly, but long-period comets strongly suggest it exists.",
    why: "If confirmed, the Oort Cloud would mark the true gravitational boundary of the Sun's realm and preserve material scattered outward when the planets were young.",
    facts: [
      "The Oort Cloud may extend nearly a light-year from the Sun.",
      "Comet Hale-Bopp likely originated there.",
      "It was proposed by Jan Oort in 1950 to explain long-period comets.",
      "No spacecraft has reached it — Voyager 1 will take ~300 years."
    ],
    stats: [
      { label: "Location", value: "~2,000–100,000 AU" }, { label: "Status", value: "Theoretical" },
      { label: "Objects", value: "Trillions (est.)" }, { label: "Evidence", value: "Long-period comets" }
    ],
    color: "#7f96c8", glow: "#a8c0e8", surface: "ice",
    related: ["kuiper-belt", "comets", "voyager1"]
  },
  {
    id: "halley", name: "Comet Halley", category: "comet", typeLabel: "Short-Period Comet",
    tagline: "The most famous comet — returning every 76 years.",
    definition: "Halley is a periodic comet made of ice, dust and rock that swings through the inner Solar System about every 76 years. When sunlight heats its nucleus, escaping gas and dust form a glowing coma and a tail that always streams away from the Sun.",
    why: "Comets are pristine samples of the early Solar System. When Halley returned in 1986, five spacecraft — including Giotto — flew through its coma and returned the first close-up of a comet nucleus.",
    facts: [
      "Halley's next close approach is in July 2061.",
      "Its nucleus is just 15 km long — dark as coal.",
      "Records of Halley go back to 240 BC in Chinese chronicles.",
      "It is the source of the Orionid meteor shower every October."
    ],
    stats: [
      { label: "Nucleus", value: "15 × 8 km" }, { label: "Period", value: "~76 years" },
      { label: "Last perihelion", value: "1986" }, { label: "Next return", value: "2061" },
      { label: "Composition", value: "Ice, dust, organics" }, { label: "Origin", value: "Kuiper Belt region" }
    ],
    color: "#bfe8ff", glow: "#8fd8ff", surface: "comet", periodDays: 27759, angle0: 0.8,
    related: ["comets", "oort-cloud", "kuiper-belt"]
  },
  {
    id: "comet-borisov", name: "Comet Borisov", category: "comet", typeLabel: "Interstellar Comet",
    tagline: "A comet that came from another star system.",
    definition: "2I/Borisov is only the second interstellar object ever detected — a comet ejected from a distant planetary system that passed through ours in 2019, confirming that other stars throw comets into the galaxy too.",
    facts: [
      "'2I' means it is the second confirmed interstellar object, after 'Oumuamua.",
      "It carried about 10× more carbon monoxide than typical comets.",
      "It is leaving the Solar System and will never return."
    ],
    stats: [
      { label: "Nucleus", value: "~1 km" }, { label: "Discovered", value: "2019" },
      { label: "Origin", value: "Another star system" }, { label: "Trajectory", value: "Hyperbolic escape" }
    ],
    color: "#d8f5e8", glow: "#a8f0cf", surface: "comet", periodDays: 40000, angle0: 3.4,
    related: ["comets", "halley", "oort-cloud"]
  },
];

/* ------------------------------ TOPICS ---------------------------- */

export const TOPICS: TopicData[] = [
  {
    id: "comets", name: "Comets & Asteroids", category: "concept", typeLabel: "Learn · Small Bodies",
    tagline: "Dirty snowballs vs. rocky rubble.",
    definition: "Comets and asteroids are both leftovers debris from the Solar System's formation 4.6 billion years ago — but they formed in different places and are made of different stuff.",
    color: "#8fd8ff", glow: "#8fd8ff",
    sections: [
      { heading: "What is a comet?", text: "A comet is an icy body — a 'dirty snowball' of frozen gas, water ice, dust and rock. Most come from the Kuiper Belt or the distant Oort Cloud." },
      { heading: "Why the tail?", text: "Near the Sun, ice sublimates into gas, releasing dust. Sunlight and the solar wind push this material away, forming a coma and a tail that always points away from the Sun — even when the comet is moving outward." },
      { heading: "Comet vs asteroid", text: "Asteroids are rocky or metallic and mostly live between Mars and Jupiter. Comets are icy and grow tails when warmed by the Sun. Blurred line: some 'active asteroids' show both behaviors." }
    ],
    facts: ["Comet tails can stretch over 100 million km.", "Sungrazing comets can vaporize completely."],
    related: ["halley", "asteroid-belt", "oort-cloud"]
  },
  {
    id: "great-red-spot", name: "Great Red Spot", category: "concept", typeLabel: "Feature · Jupiter",
    tagline: "A storm larger than Earth, raging for centuries.",
    definition: "The Great Red Spot is a gigantic anticyclonic storm in Jupiter's southern atmosphere, observed continuously since at least 1831 and possibly since 1665 — making it the longest-lived storm known.",
    color: "#ff7f6b", glow: "#ff9a70",
    sections: [
      { heading: "How big is it?", text: "The storm is about 16,000 km wide — roughly 1.3 Earths could line up across it. It has been slowly shrinking for decades." },
      { heading: "How fast?", text: "Winds at its edges exceed 430 km/h, circling the storm every 4–5 Earth days." },
      { heading: "Why is it red?", text: "No one is certain. Sunlight likely alters chemicals dredged up from deeper clouds — candidates include ammonia compounds and organic molecules." }
    ],
    facts: ["The Red Spot extends ~300 km above surrounding clouds.", "It may have been seen by Robert Hooke in 1664."],
    related: ["jupiter", "juno"]
  },
  {
    id: "space-objects", name: "Meteoroids, Meteors & Meteorites", category: "concept", typeLabel: "Learn · Space Rocks",
    tagline: "Three names for one rock, depending on where it is.",
    definition: "These three words describe the same object at three stages of a journey: drifting in space, blazing through a planet's atmosphere, and resting on the ground.",
    color: "#ffb547", glow: "#ffb547", widget: "meteors",
    sections: [
      { heading: "Why three words?", text: "Astronomers name the rock by its location: a meteoroid is in space; the streak of light it makes while burning up is the meteor; any fragment that survives to the surface is a meteorite." },
      { heading: "Where do they come from?", text: "Most are fragments from asteroid collisions; some are dust shed by comets, creating meteor showers when Earth crosses the stream." }
    ],
    facts: ["Earth sweeps up about 44 tons of meteoritic material daily.", "The Chelyabinsk meteor (2013) released ~30× the energy of the Hiroshima bomb."],
    related: ["asteroid-belt", "comets", "mars"]
  },
  {
    id: "planet-types", name: "Planet Types", category: "concept", typeLabel: "Learn · Classification",
    tagline: "Terrestrial, gas giant, ice giant — three planetary families.",
    definition: "The eight planets divide into three families based on what they are made of and where they formed relative to the Sun's 'frost line'.",
    color: "#8fd8ff", glow: "#8fd8ff", widget: "types",
    sections: [
      { heading: "Terrestrial worlds", text: "Mercury, Venus, Earth and Mars are compact rocky planets with metal cores and solid surfaces, built inside the frost line where ice couldn't survive." },
      { heading: "Gas giants", text: "Jupiter and Saturn grew massive cores fast enough to capture huge envelopes of hydrogen and helium — the Sun's own recipe." },
      { heading: "Ice giants", text: "Uranus and Neptune accreted more slowly, so they hold less hydrogen and far more 'ices' — water, methane and ammonia." }
    ],
    related: ["earth", "jupiter", "neptune"]
  },
  {
    id: "moon-phases", name: "Moon Phases", category: "concept", typeLabel: "Learn · Cycles",
    tagline: "Why the Moon's face changes through the month.",
    definition: "The Moon always keeps half of itself lit by the Sun. As it orbits Earth over 29.5 days, we see different fractions of that sunlit half — the cycle of phases.",
    color: "#e8edf5", glow: "#e8edf5", widget: "moonphases",
    sections: [
      { heading: "Waxing & waning", text: "After New Moon, the lit portion grows ('waxes') until Full Moon, then shrinks ('wanes'). First and Third Quarter show exactly half of the lit side." },
      { heading: "Why eclipses aren't monthly", text: "The Moon's orbit is tilted ~5° from Earth's orbital plane, so the three bodies usually miss perfect alignment." }
    ],
    facts: ["The Moon rises ~50 minutes later each day."],
    related: ["moon", "earth"]
  },
  {
    id: "planet-vs-dwarf", name: "Planet vs Dwarf Planet", category: "concept", typeLabel: "Learn · Definitions",
    tagline: "What actually separates the two?",
    definition: "Since 2006, the IAU recognizes a body as a planet only if it (1) orbits the Sun, (2) is round under its own gravity, and (3) has cleared its orbital neighborhood of other debris. Dwarf planets pass the first two tests but fail the third.",
    color: "#c9a97f", glow: "#e8c9a0", widget: "dwarfcompare",
    sections: [
      { heading: "Why was Pluto reclassified?", text: "Pluto orbits inside the crowded Kuiper Belt — it shares its zone with countless icy neighbors and is far from gravitationally dominant there." },
      { heading: "It's not a demotion of value", text: "Dwarf planets like Pluto, Eris and Ceres are scientifically rich worlds with geology, moons and atmospheres. The category simply describes their dynamical context." }
    ],
    related: ["pluto", "ceres", "kuiper-belt"]
  },
  {
    id: "formation", name: "Solar System Formation", category: "concept", typeLabel: "Learn · Origins",
    tagline: "From collapsing cloud to eight worlds.",
    definition: "About 4.6 billion years ago, a cold cloud of gas and dust collapsed — likely triggered by a nearby supernova. The center became the Sun; the swirling disk around it built everything else.",
    color: "#ffb547", glow: "#ffb547", widget: "formation",
    sections: [
      { heading: "The disk", text: "Dust grains stuck together into pebbles, then planetesimals, then protoplanets. Inside the frost line only rock and metal survived — the terrestrial planets. Beyond it, ice turbocharged growth into giants." },
      { heading: "The leftovers", text: "Asteroids are failed inner planets; comets are deep-frozen outer leftovers. Their orbits still record ancient migrations of Jupiter and Saturn." },
      { heading: "Timescale", text: "The Sun ignited within ~50 million years; Earth took another ~50 million to assemble; the Late Heavy Bombardment resurfaced worlds ~4.1–3.8 billion years ago." }
    ],
    related: ["sun", "asteroid-belt", "comets"]
  },
  {
    id: "scale", name: "Why Not to Scale?", category: "concept", typeLabel: "Learn · Scale",
    tagline: "The real Solar System barely fits on any screen.",
    definition: "True-scale maps of the Solar System are nearly impossible to display: if Earth were a single pixel, Neptune would be ~3,000 pixels away and the Sun a glowing dot you could barely see.",
    color: "#8fd8ff", glow: "#8fd8ff", widget: "scale",
    sections: [
      { heading: "Try it in your head", text: "Shrink the Sun to a 2-meter-wide sphere. Earth becomes a 1.8 cm marble located 215 meters away. Neptune sits 6.4 km out, and the Oort Cloud stretches nearly a light-year farther." },
      { heading: "What SOLARIS does", text: "Planet sizes and distances are adjusted in the main view so you can explore comfortably. Switch to 'Sizes' or 'Distances' mode at the bottom to see one dimension closer to truth — then notice how the other must be bent." }
    ],
    related: ["sun", "neptune", "oort-cloud"]
  },
];

/* ------------------------------ MISSIONS -------------------------- */

export const MISSIONS: MissionData[] = [
  {
    id: "voyager1", name: "Voyager 1", category: "mission", typeLabel: "Interstellar Probe",
    tagline: "The farthest human-made object ever.",
    agency: "NASA", launched: "1977", destination: "Jupiter → Saturn → Interstellar space",
    status: "Active · left the heliosphere in 2012, over 24 billion km out",
    purpose: "Grand Tour of the outer planets, now probing the boundary of the Sun's influence.",
    discoveries: ["Volcanoes on Io", "Complex structure in Saturn's rings", "First interstellar space measurements", "Carries the Golden Record"],
    color: "#ffd88f", path: { from: 180, to: 2050, angle: 5.15, speed: 9 },
    related: ["jupiter", "saturn", "oort-cloud"]
  },
  {
    id: "voyager2", name: "Voyager 2", category: "mission", typeLabel: "Interstellar Probe",
    tagline: "The only craft to visit Uranus and Neptune.",
    agency: "NASA", launched: "1977", destination: "Jupiter → Saturn → Uranus → Neptune → Interstellar space",
    status: "Active · interstellar space since 2018",
    purpose: "Grand Tour of all four giant planets; still returning plasma and field data.",
    discoveries: ["10 new moons at Uranus", "Neptune's Great Dark Spot & fastest winds", "Uranus's odd tilted magnetosphere"],
    color: "#bfe8ff", path: { from: 180, to: 1900, angle: 3.6, speed: 7 },
    related: ["uranus", "neptune"]
  },
  {
    id: "new-horizons", name: "New Horizons", category: "mission", typeLabel: "Kuiper Belt Explorer",
    tagline: "First close-up of Pluto — then kept going.",
    agency: "NASA", launched: "2006", destination: "Pluto (2015) → Arrokoth (2019) → Kuiper Belt",
    status: "Active · cruising the outer Kuiper Belt",
    purpose: "Reveal the geology of Pluto and its moons, then sample the ancient Kuiper Belt.",
    discoveries: ["Pluto's heart-shaped nitrogen glacier", "Blue hazes in Pluto's atmosphere", "Arrokoth: most pristine object ever visited"],
    color: "#e8c9a0", path: { from: 200, to: 2150, angle: 2.55, speed: 6 },
    related: ["pluto", "kuiper-belt"]
  },
  {
    id: "cassini", name: "Cassini–Huygens", category: "mission", typeLabel: "Saturn Orbiter",
    tagline: "Thirteen years inside Saturn's rings.",
    agency: "NASA / ESA / ASI", launched: "1997", destination: "Saturn system",
    status: "Completed · ended with a deliberate plunge into Saturn, 2017",
    purpose: "Orbit Saturn, study its rings and moons, and land a probe on Titan.",
    discoveries: ["Enceladus shoots geysers from a hidden ocean", "Lakes of liquid methane on Titan", "Moonlets sculpting Saturn's rings"],
    color: "#f7e7bd", path: { from: 140, to: 340, angle: 3.75, speed: 5 },
    related: ["saturn", "titan"]
  },
  {
    id: "juno", name: "Juno", category: "mission", typeLabel: "Jupiter Orbiter",
    tagline: "Mapping Jupiter's heart from pole to pole.",
    agency: "NASA", launched: "2011", destination: "Jupiter",
    status: "Active · orbiting Jupiter since 2016",
    purpose: "Peer beneath Jupiter's clouds to measure its gravity, magnetic field and deep water content.",
    discoveries: ["Cyclones arranged in polygons at Jupiter's poles", "Jupiter's core is 'fuzzy' and diluted", "Dazzling close-ups of cloud belts"],
    color: "#f2cfa4", path: { from: 140, to: 280, angle: 5.75, speed: 5 },
    related: ["jupiter", "great-red-spot", "europa"]
  },
  {
    id: "parker", name: "Parker Solar Probe", category: "mission", typeLabel: "Sun Probe",
    tagline: "Touching the Sun's atmosphere.",
    agency: "NASA", launched: "2018", destination: "The Sun (corona)",
    status: "Active · fastest human-made object ever (~692,000 km/h)",
    purpose: "Fly through the Sun's outer atmosphere to learn how the corona is heated and how solar wind is born.",
    discoveries: ["Magnetic 'switchbacks' in solar wind", "Direct sampling of the corona", "Dust-free zone near the Sun"],
    color: "#ffb547", path: { from: 30, to: 130, angle: 4.6, speed: 10 },
    related: ["sun"]
  },
  {
    id: "perseverance", name: "Perseverance Rover", category: "mission", typeLabel: "Mars Rover",
    tagline: "Hunting ancient life in an old river delta.",
    agency: "NASA", launched: "2020", destination: "Jezero Crater, Mars",
    status: "Active · driving Mars since Feb 2021, caching samples for return",
    purpose: "Search for signs of ancient microbial life and collect rock samples for a future Mars Sample Return mission.",
    discoveries: ["Jezero was once a lake with a river delta", "Organic-rich rocks cached for Earth return", "Ingenuity: first powered flight on another world"],
    color: "#ff9a70", path: { from: 130, to: 168, angle: 1.05, speed: 4 },
    related: ["mars"]
  },
  {
    id: "galileo", name: "Galileo", category: "mission", typeLabel: "Jupiter Orbiter",
    tagline: "Eight years studying Jupiter and its moons.",
    agency: "NASA", launched: "1989", destination: "Jupiter system",
    status: "Completed · plunged into Jupiter in 2003 to protect Europa",
    purpose: "First Jupiter orbiter; dropped a probe into the atmosphere in 1995.",
    discoveries: ["Strong evidence for Europa's subsurface ocean", "First direct atmospheric entry at a giant planet", "Io's intense volcanic activity up close"],
    color: "#d4c8b8", path: { from: 140, to: 272, angle: 6.0, speed: 4 },
    related: ["jupiter", "europa", "io"]
  },
  {
    id: "messenger", name: "MESSENGER", category: "mission", typeLabel: "Mercury Orbiter",
    tagline: "The first spacecraft to orbit Mercury.",
    agency: "NASA", launched: "2004", destination: "Mercury",
    status: "Completed · impacted Mercury in 2015 as planned",
    purpose: "Map Mercury's entire surface and measure its composition, magnetosphere and exosphere.",
    discoveries: ["Water ice confirmed in polar shadow craters", "Unexpected volcanic history", "Abundant carbon at the surface"],
    color: "#c8b8a6", path: { from: 40, to: 74, angle: 0.45, speed: 8 },
    related: ["mercury"]
  },
  {
    id: "magellan", name: "Magellan", category: "mission", typeLabel: "Venus Mapper",
    tagline: "Radar-mapping Venus through its clouds.",
    agency: "NASA", launched: "1989", destination: "Venus",
    status: "Completed · deorbited into Venus in 1994",
    purpose: "Use synthetic-aperture radar to see through Venus's opaque clouds and map 98% of the surface.",
    discoveries: ["A surface dominated by volcanic plains", "Giant pancake domes unique to Venus", "No evidence for plate tectonics like Earth's"],
    color: "#ffd98a", path: { from: 60, to: 102, angle: 2.25, speed: 8 },
    related: ["venus"]
  },
];

/* ------------------------------ INDEX ----------------------------- */

export const ALL_BODIES: BodyData[] = [SUN, ...PLANETS, ...DWARFS, ...MOONS, ...REGIONS];

export const INDEX: Record<string, AnyEntry> = Object.fromEntries(
  [...ALL_BODIES, ...TOPICS, ...MISSIONS].map((e) => [e.id, e])
);

export const isMission = (e: AnyEntry): e is MissionData => e.category === "mission";
export const isTopic = (e: AnyEntry): e is TopicData =>
  e.category === "concept" && "sections" in e;
export const isBody = (e: AnyEntry): e is BodyData =>
  !isMission(e) && !isTopic(e);

export const RANDOM_FACTS: string[] = [
  "One day on Venus is longer than one year on Venus.",
  "Jupiter has more than twice the mass of all the other planets combined.",
  "Saturn's average density is lower than water — it would float.",
  "Neutron stars can spin 700 times per second. (Okay, that one's beyond our Solar System.)",
  "The Sun loses about 4 million tons of mass every second — converted to sunlight.",
  "A teaspoon of comet material would weigh less than a gram.",
  "Olympus Mons is so wide that its summit would be above the clouds.",
  "Triton orbits Neptune backwards — it's a captured Kuiper Belt object.",
  "Sunlight hitting Saturn left the Sun about 80 minutes earlier.",
  "There is an asteroid named 433 Eros — visited by the NEAR spacecraft in 2000.",
  "Pluto was only halfway through its orbit since discovery when it was reclassified.",
  "Europa's ocean may contain twice the water of all Earth's oceans.",
  "The Oort Cloud may extend halfway to the next star.",
  "Voyager 1 is over 24 billion km away — yet its signal takes 22+ hours to reach us."
];

export const SURPRISE_POOL: string[] = [
  "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune",
  "moon", "io", "europa", "ganymede", "callisto", "titan",
  "pluto", "ceres", "eris", "haumea", "makemake",
  "asteroid-belt", "kuiper-belt", "oort-cloud", "halley", "comet-borisov",
  "great-red-spot", "comets", "space-objects",
  "voyager1", "new-horizons", "cassini", "juno", "parker"
];

export const DISCOVERY_TOTAL = Object.keys(INDEX).length;
