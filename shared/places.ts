import { placeData } from "./places-data.js";
export const CONTINENTS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
] as const;
export type Continent = (typeof CONTINENTS)[number];
export type PlaceRegion = {
  name: string;
  cities: readonly string[];
  profiles?: readonly string[];
};
export type PlaceCountry = {
  id: string;
  name: string;
  aliases: readonly string[];
  continents: readonly string[];
  profiles: readonly string[];
  regions: readonly PlaceRegion[];
};
export const countries: readonly PlaceCountry[] = placeData;
export type PlaceMatch = { countryId: string; region: string; city: string };
export const normalizePlace = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[’'ʻʼ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const aliases: Record<string, string[]> = {
  "new york city": ["nyc"],
  bengaluru: ["bangalore"],
  mumbai: ["bombay"],
  kolkata: ["calcutta"],
  chennai: ["madras"],
  mysuru: ["mysore"],
  chattogram: ["chittagong"],
  thiruvananthapuram: ["trivandrum"],
  gqeberha: ["port elizabeth"],
};
const mentions = (text: string, term: string) =>
  ` ${text} `.includes(` ${normalizePlace(term)} `);
const mentionsCity = (text: string, city: string) =>
  [city, ...(aliases[normalizePlace(city)] || [])].some((term) =>
    mentions(text, term),
  );
export function matchPlace(value: string): PlaceMatch | null {
  const text = normalizePlace(value);
  if (!text || mentions(text, "Antarctica")) return null;
  // Exact comma-delimited country components avoid confusing New Mexico with Mexico.
  const components = value.split(/[,;·/]/).map(normalizePlace);
  const explicit = countries.filter((c) =>
    [c.name, ...c.aliases].some((n) => components.includes(normalizePlace(n))),
  );
  const scope = explicit.length ? explicit : countries;
  if (!explicit.length) {
    const exactCountries = countries.filter((c) =>
      c.regions.some(
        (r) =>
          normalizePlace(r.name) === text ||
          r.cities.some((city) => normalizePlace(city) === text),
      ),
    );
    if (exactCountries.length > 1) return null;
  }
  const regionMatches = scope.flatMap((c) =>
    c.regions.filter((r) => mentions(text, r.name)).map((r) => ({ c, r })),
  );
  // Prefer the longest region match: West Virginia is not Virginia; New York is not York.
  const maxRegion = Math.max(
    0,
    ...regionMatches.map((x) => normalizePlace(x.r.name).length),
  );
  const regions = regionMatches.filter(
    (x) => normalizePlace(x.r.name).length === maxRegion,
  );
  if (regions.length === 1) {
    const { c, r } = regions[0];
    // A region-only selection must not quietly become its same-named capital.
    if (
      explicit.length === 1 &&
      components.length === 2 &&
      components[0] === normalizePlace(r.name)
    )
      return { countryId: c.id, region: r.name, city: "" };
    const city =
      r.cities
        .filter((city) => mentionsCity(text, city))
        .sort(
          (a, b) =>
            Number(mentionsCity(components[0], b)) -
              Number(mentionsCity(components[0], a)) || b.length - a.length,
        )[0] || "";
    return { countryId: c.id, region: r.name, city };
  }
  const candidates = (
    regions.length
      ? regions
      : scope.flatMap((c) => c.regions.map((r) => ({ c, r })))
  ).flatMap(({ c, r }) =>
    r.cities
      .filter((city) => mentionsCity(text, city))
      .map((city) => ({ countryId: c.id, region: r.name, city })),
  );
  const longest = Math.max(
    0,
    ...candidates.map((x) => normalizePlace(x.city).length),
  );
  const best = candidates.filter(
    (x) => normalizePlace(x.city).length === longest,
  );
  if (best.length === 1) return best[0];
  if (best.length > 1) {
    const ids = new Set(best.map((x) => x.countryId));
    return ids.size === 1
      ? { countryId: best[0].countryId, region: "", city: "" }
      : null;
  }
  if (explicit.length === 1)
    return { countryId: explicit[0].id, region: "", city: "" };
  return null;
}
export function placeLabel(countryId: string, region = "", city = ""): string {
  const c = countries.find((c) => c.id === countryId);
  if (!c) return "";
  return [city, region, c.name].filter(Boolean).join(", ");
}
export const placeStats = {
  countries: countries.length,
  regions: countries.reduce((n, c) => n + c.regions.length, 0),
  cities: countries.reduce(
    (n, c) => n + c.regions.reduce((m, r) => m + r.cities.length, 0),
    0,
  ),
};

export const antarcticStations = [
  {
    name: "McMurdo Station",
    location: "McMurdo Station, Ross Island, Antarctica",
  },
  {
    name: "Amundsen–Scott South Pole Station",
    location: "Amundsen–Scott South Pole Station, South Pole, Antarctica",
  },
  {
    name: "Rothera Research Station",
    location: "Rothera Research Station, Adelaide Island, Antarctica",
  },
  {
    name: "Vostok Station",
    location: "Vostok Station, East Antarctica, Antarctica",
  },
] as const;
export const continentCounts = Object.fromEntries(
  CONTINENTS.map((continent) => [
    continent,
    countries.filter((c) => c.continents.includes(continent)).length,
  ]),
);
