import { Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function GlobeControls({
  search,
  setSearch,
  filter,
  setFilter,
  suggestions,
  savedMatches = [],
  onSelectCountry,
  onOpenSaved,
  countriesLoaded,
}) {
  function handleKeyDown(event) {
    if (event.key === "Enter" && suggestions[0])
      onSelectCountry(suggestions[0]);
  }

  return (
    <div className="globe-controls">
      <div className="globe-search">
        <Search size={17} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search a country to add it..."
          aria-label="Search a country"
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear country search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="filter-segment">
        {[
          ["all", "All"],
          ["visited", "Visited"],
          ["wishlist", "Wishlist"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {(suggestions.length > 0 ||
          savedMatches.length > 0 ||
          (search.trim() && countriesLoaded)) && (
          <motion.div
            className="country-suggestions"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {suggestions.map((country) => {
              const name = country.name?.common || country.name || "Unknown";
              return (
                <button key={name} onClick={() => onSelectCountry(country)}>
                  <span>
                    <Plus size={15} /> Add {name}
                  </span>
                  <small>{country.region || "Destination"}</small>
                </button>
              );
            })}

            {savedMatches.map((country) => {
              const name = country.name?.common || country.name || "Unknown";
              return (
                <button
                  key={`saved-${name}`}
                  className="saved-search-result"
                  onClick={() => onOpenSaved(country)}
                >
                  <span>
                    <strong>{name}</strong>
                    <small>
                      {country.region || "Destination"} · Already saved
                    </small>
                  </span>
                  <small>Open</small>
                </button>
              );
            })}

            {!suggestions.length &&
              !savedMatches.length &&
              search.trim() &&
              countriesLoaded && (
                <div className="search-empty">
                  No country found for “{search.trim()}”.
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GlobeControls;
