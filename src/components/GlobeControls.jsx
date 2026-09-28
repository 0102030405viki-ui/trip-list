import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function GlobeControls({ search, setSearch, filter, setFilter, suggestions, onSelectCountry }) {
  function handleKeyDown(event) {
    if (event.key === "Enter" && suggestions[0]) onSelectCountry(suggestions[0]);
  }

  return (
    <div className="globe-controls">
      <div className="globe-search">
        <Search size={17} />
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleKeyDown} placeholder="Search a country to add it..." />
      </div>

      <div className="filter-segment">
        {[["all", "All"], ["visited", "Visited"], ["wishlist", "Wishlist"]].map(([key, label]) => (
          <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div className="country-suggestions" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {suggestions.map(country => {
              const name = country.name?.common || country.name || "Unknown";
              return (
                <button key={name} onClick={() => onSelectCountry(country)}>
                  <span><Plus size={15} /> Add {name}</span>
                  <small>{country.region || "Destination"}</small>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <span className="control-label"><SlidersHorizontal size={14} /> Filter the globe — only saved countries appear</span>
    </div>
  );
}

export default GlobeControls;