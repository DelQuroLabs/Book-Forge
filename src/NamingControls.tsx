import { useState } from "react";
import {
  countries,
  CONTINENTS,
  continentCounts,
  antarcticStations,
  matchPlace,
  placeLabel,
  placeStats,
} from "../shared/places";
import { cultureProfiles, locationSuggestions } from "../shared/naming";
export function PlacePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [continent, setContinent] = useState<string>(() =>
    antarcticStations.some((s) => s.location === value) ? "Antarctica" : "",
  );
  const visibleCountries = countries.filter(
    (c) => !continent || c.continents.includes(continent),
  );
  const match = matchPlace(value),
    country = countries.find((c) => c.id === match?.countryId),
    region = country?.regions.find((r) => r.name === match?.region);
  return (
    <details className="place-picker">
      <summary>
        Browse countries & places <span>{placeStats.countries} countries</span>
      </summary>
      <div className="place-picker-fields">
        <label className="field">
          <span>Continent</span>
          <select
            aria-label="Continent"
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
          >
            <option value="">All continents</option>
            {CONTINENTS.map((c) => (
              <option key={c} value={c}>
                {c === "Oceania" ? "Oceania (Australia & Pacific)" : c} ·{" "}
                {continentCounts[c]} countries
              </option>
            ))}
            <option value="Antarctica">Antarctica · research stations</option>
          </select>
        </label>
        {continent === "Antarctica" ? (
          <>
            <label className="field">
              <span>Research station</span>
              <select
                aria-label="Research station"
                value={
                  antarcticStations.find((s) => s.location === value)
                    ?.location || ""
                }
                onChange={(e) => {
                  if (e.target.value) onChange(e.target.value);
                }}
              >
                <option value="">Choose a station</option>
                {antarcticStations.map((s) => (
                  <option key={s.name} value={s.location}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="microcopy">
              Research stations are places, not countries or naming cultures.
              Choose each character’s own cultural background below; we do not
              invent an Antarctic naming tradition.
            </p>
          </>
        ) : (
          <>
            <label className="field">
              <span>Country</span>
              <select
                value={country?.id || ""}
                onChange={(e) => onChange(placeLabel(e.target.value))}
              >
                <option value="">Choose a country</option>
                {country &&
                  !visibleCountries.some((c) => c.id === country.id) && (
                    <optgroup label="Current selection — outside this filter">
                      <option value={country.id}>{country.name}</option>
                    </optgroup>
                  )}
                {visibleCountries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>State / province / region</span>
              <select
                disabled={!country}
                value={region?.name || ""}
                onChange={(e) =>
                  onChange(placeLabel(country!.id, e.target.value))
                }
              >
                <option value="">Country-wide / choose a region</option>
                {country?.regions.map((r) => (
                  <option key={r.name}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>City / locality</span>
              <select
                disabled={!region}
                value={match?.city || ""}
                onChange={(e) =>
                  onChange(
                    placeLabel(country!.id, region!.name, e.target.value),
                  )
                }
              >
                <option value="">Region-wide / choose a city</option>
                {region?.cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>
            {country && (
              <p className="microcopy">
                {country.name}: {country.regions.length} regions ·{" "}
                {country.regions.reduce((n, r) => n + r.cities.length, 0)} city
                entries. Browsing a continent does not change the saved place
                until you choose a country.
              </p>
            )}
          </>
        )}
        <p className="microcopy">
          A starter place catalog, not a complete gazetteer. Enter any unlisted
          hometown in the text field. Choosing a place never changes a
          character’s name or background.
        </p>
      </div>
    </details>
  );
}
export function NamingSuggestions({
  location,
  culture,
  onSelect,
  character = false,
}: {
  location: string;
  culture: string;
  onSelect: (id: string) => void;
  character?: boolean;
}) {
  const ids = locationSuggestions(location),
    profiles = ids
      .map((id) => cultureProfiles.find((p) => p.id === id)!)
      .filter(Boolean),
    match = matchPlace(location);
  if (!profiles.length)
    return match ? (
      <div className="location-suggestion">
        <p>
          No locally curated naming profile for this area yet. Choose a
          researched background below or enter a name manually; we won’t
          substitute a neighboring culture.
        </p>
      </div>
    ) : null;
  if (profiles.length === 1 && profiles[0].id === culture) return null;
  return (
    <div className="location-suggestion">
      <div>
        <p>
          {profiles.length === 1
            ? "One available naming option:"
            : "Available naming backgrounds for this place:"}{" "}
          {profiles.length === 1 ? profiles[0].label : ""}
        </p>
        {profiles.length === 1 ? (
          <button
            className="inline-link"
            onClick={() => onSelect(profiles[0].id)}
          >
            {character ? "Use suggestion" : "use the suggested profile"}
          </button>
        ) : (
          <div className="naming-options">
            {profiles.map((p) => (
              <button
                key={p.id}
                className={
                  "naming-option" + (p.id === culture ? " selected" : "")
                }
                aria-pressed={p.id === culture}
                onClick={() => onSelect(p.id)}
              >
                {p.label}
                {p.id === culture ? " · selected" : ""}
              </button>
            ))}
          </div>
        )}
        <p className="microcopy">
          Options are not demographic predictions. Keep any background for
          diaspora or mixed-cultural characters. Nothing changes until you
          choose.
        </p>
      </div>
    </div>
  );
}
// All profiles remain available regardless of location; existing values are preserved.
export function CultureOptions() {
  return (
    <>
      {cultureProfiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.label}
        </option>
      ))}
    </>
  );
}
