import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Compass, Heart, Map as MapIcon, Plus, Sparkles } from "lucide-react";
import GlobeView from "./components/Globe";
import GlobeControls from "./components/GlobeControls";
import CountryPanel from "./components/CountryPanel";
import "./App.css";

const COUNTRY_API = "https://countries.dev/countries";

function App() {
  const [destinations, setDestinations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tripList") || "[]"); } catch { return []; }
  });
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [journeyView, setJourneyView] = useState("all");
  const [journeySort, setJourneySort] = useState("recent");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [error, setError] = useState("");
  const globeRef = useRef();

  useEffect(() => {
    async function getCountries() {
      try {
        const response = await fetch(COUNTRY_API);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setCountries(data.data || data.countries || data);
      } catch { setError("We couldn't load the country database."); }
      finally { setLoadingCountries(false); }
    }
    getCountries();
  }, []);

  useEffect(() => { localStorage.setItem("tripList", JSON.stringify(destinations)); }, [destinations]);

  const destinationMap = useMemo(() => new Map(destinations.map(item => [item.name.toLowerCase(), item])), [destinations]);

  const visibleCountries = useMemo(() => countries.filter(country => {
    const name = (country.name?.common || country.name || "").toLowerCase();
    const saved = destinationMap.get(name);
    const matchesSearch = !search.trim() || name.includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "visited" && saved?.visited) || (filter === "wishlist" && saved?.wishlist);
    return matchesSearch && matchesFilter;
  }), [countries, destinationMap, search, filter]);

  function findDestination(country) {
    return destinationMap.get((country.name?.common || country.name || "").toLowerCase());
  }

  function buildDestination(country, existing = {}) {
    const name = country.name?.common || country.name || "Unknown";
    return {
      id: existing.id || crypto.randomUUID(),
      name,
      officialName: country.name?.official || name,
      capital: country.capital?.[0] || existing.capital || "No capital",
      region: country.region || existing.region || "Unknown",
      subregion: country.subregion || existing.subregion || "Unknown",
      population: country.population || existing.population || 0,
      flag: country.flags?.svg || country.flags?.png || existing.flag || "",
      image: existing.image || "",
      photoAuthor: existing.photoAuthor || "",
      photoAuthorUrl: existing.photoAuthorUrl || "",
      visited: existing.visited || false,
      wishlist: existing.wishlist ?? true,
      notes: existing.notes || "",
      photos: existing.photos || [],
    };
  }

  async function ensureDestination(country, options = {}) {
    const existing = findDestination(country);
    if (existing) return existing;

    const destination = buildDestination(country, {
      visited: options.visited || false,
      wishlist: options.wishlist ?? true,
    });

    setDestinations(prev => [...prev, destination]);
    return destination;
  }

  async function handleCountrySelect(point) {
    const country = countries.find(item => (item.name?.common || item.name) === point.labelName) || point;
    await ensureDestination(country, { wishlist: true });
    setSelectedCountry(country);
    globeRef.current?.focusCountry(country);
  }

  async function addCountryFromSearch(country) {
    await handleCountrySelect(country);
    setSearch("");
  }

  async function toggleWishlist(id, country) {
    if (!country && !id) return;
    const target = country ? findDestination(country) : destinations.find(item => item.id === id);
    if (!target && country) {
      const created = await ensureDestination(country, { wishlist: true });
      setDestinations(prev => prev.map(item => item.id === created.id ? { ...item, wishlist: true } : item));
      return;
    }
    if (!target) return;
    setDestinations(prev => prev.map(item => item.id === target.id ? { ...item, wishlist: !item.wishlist } : item));
  }

  async function toggleVisited(id, country) {
    const target = country ? findDestination(country) : destinations.find(item => item.id === id);
    if (!target && country) {
      await ensureDestination(country, { visited: true, wishlist: false });
      return;
    }
    if (!target) return;
    setDestinations(prev => prev.map(item => item.id === target.id ? { ...item, visited: !item.visited, wishlist: item.visited ? true : false } : item));
  }

  function saveNotes(id, notes) {
    setDestinations(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  }

  function addPhotos(id, photos) {
    setDestinations(prev => prev.map(item => item.id === id ? { ...item, photos: [...(item.photos || []), ...photos] } : item));
  }

  function removePhoto(id, photoId) {
    setDestinations(prev => prev.map(item => item.id === id ? { ...item, photos: (item.photos || []).filter(photo => photo.id !== photoId) } : item));
  }

  const searchSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return countries.filter(country => {
      const name = country.name?.common || country.name || "";
      return name.toLowerCase().includes(query) && !destinationMap.has(name.toLowerCase());
    }).slice(0, 5);
  }, [countries, search, destinationMap]);

  function setJourneyFilter(nextFilter) {
    setFilter(nextFilter);
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function openSavedCountry(destination) {
    const country = countries.find(item => (item.name?.common || item.name) === destination.name);
    if (!country) return;
    setSelectedCountry(country);
    document.getElementById("journey")?.scrollIntoView({ behavior: "smooth", block: "center" });
    requestAnimationFrame(() => globeRef.current?.focusCountry(country));
  }

  function surpriseMe() {
    const wishlist = destinations.filter(item => item.wishlist && !item.visited);
    const pool = wishlist.length ? wishlist : destinations;
    if (!pool.length) {
      document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const destination = pool[Math.floor(Math.random() * pool.length)];
    const country = countries.find(item => (item.name?.common || item.name) === destination.name);
    if (!country) return;

    setSelectedCountry(country);
    requestAnimationFrame(() => globeRef.current?.focusCountry(country));
  }

  const journeyDestinations = useMemo(() => {
    const filtered = destinations.filter(item => {
      if (journeyView === "visited") return item.visited;
      if (journeyView === "wishlist") return item.wishlist && !item.visited;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (journeySort === "az") return a.name.localeCompare(b.name);
      if (journeySort === "visited") return Number(b.visited) - Number(a.visited);
      return destinations.indexOf(b) - destinations.indexOf(a);
    });
  }, [destinations, journeyView, journeySort]);

  const visitedCount = destinations.filter(item => item.visited).length;
  const wishlistCount = destinations.filter(item => item.wishlist && !item.visited).length;

  return (
    <div className="app">
      <header className="header">
        <div className="brand"><div className="brand-mark"><Compass size={17} /></div><span>WanderList</span></div>
        <nav><a href="#explore">Explore</a><a href="#journey">My journey</a></nav>
        <div className="header-meta"><span><span className="status-dot visited-dot" /> {visitedCount} visited</span><span><span className="status-dot wish-dot" /> {wishlistCount} wishlist</span></div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-layout">
            <motion.div className="hero-content" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .65 }}>
              <p className="eyebrow hero-eyebrow">YOUR PERSONAL WORLD MAP</p>
              <h1>Every place has a <motion.button className="story-link" onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth", block: "center" })} whileHover={{ y: -6, scale: 1.03 }} whileTap={{ scale: 0.96 }} animate={{ y: [0, -7, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>story.</motion.button></h1>
              <p className="hero-copy">Explore the world, save where you want to go, and turn the places you've visited into memories.</p>
              <GlobeControls search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} suggestions={searchSuggestions} onSelectCountry={addCountryFromSearch} />
              <motion.button className="surprise-button hero-surprise" onClick={surpriseMe} disabled={!destinations.length} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: .97 }} animate={{ boxShadow: ["0 0 0 rgba(185,167,255,0)", "0 0 24px rgba(185,167,255,.2)", "0 0 0 rgba(185,167,255,0)"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                <Sparkles size={16}/> Surprise me <span>Pick my next destination</span>
              </motion.button>
            </motion.div>

            <div className="hero-globe">
              <div className="globe-stage" id="explore">
                {loadingCountries ? <div className="globe-loading"><div className="loading-orbit" /><p>Mapping the world...</p></div> : <GlobeView ref={globeRef} countries={visibleCountries} destinations={destinations} onCountrySelect={handleCountrySelect} />}
                <div className="globe-legend"><button onClick={() => setJourneyFilter("visited")}><i className="legend-dot visited-dot" /> Visited</button><button onClick={() => setJourneyFilter("wishlist")}><i className="legend-dot wish-dot" /> Wishlist</button><button onClick={() => setJourneyFilter("all")}><i className="legend-dot neutral-dot" /> All saved</button></div>
              </div>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
        </section>

        <section className="journey-section" id="journey">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR PROGRESS</p>
              <h2>Your journey so far</h2>
            </div>
            <div className="journey-note"><Sparkles size={15}/> Your saved world</div>
          </div>
          <div className="journey-stats">
            <Stat icon={<MapIcon size={18}/>} number={destinations.length} label="Countries saved" onClick={() => setJourneyFilter("all")} />
            <Stat icon={<Heart size={18}/>} number={wishlistCount} label="On your wishlist" onClick={() => setJourneyFilter("wishlist")} />
            <Stat icon={<Compass size={18}/>} number={visitedCount} label="Countries visited" onClick={() => setJourneyFilter("visited")} />
          </div>
          <div className="journey-toolbar">
            <div className="journey-filters">
              {[["all", "All"], ["wishlist", "Wishlist"], ["visited", "Visited"]].map(([key, label]) => (
                <button key={key} className={journeyView === key ? "active" : ""} onClick={() => setJourneyView(key)}>{label}</button>
              ))}
            </div>
            <select value={journeySort} onChange={event => setJourneySort(event.target.value)} aria-label="Sort destinations">
              <option value="recent">Recently added</option>
              <option value="az">A–Z</option>
              <option value="visited">Visited first</option>
            </select>
          </div>
          <div className="saved-preview">
            {destinations.length === 0 ? <div className="empty-journey"><Plus size={20}/><p>Click any country on the globe to start your list.</p></div> : journeyDestinations.length === 0 ? <div className="empty-journey"><p>No destinations match this view yet.</p></div> : journeyDestinations.map(destination => (
              <motion.button key={destination.id} className="saved-country" layout whileHover={{ y: -3 }} whileTap={{ scale: .985 }} onClick={() => openSavedCountry(destination)}>
                {destination.flag ? <img src={destination.flag} alt="" /> : <span className="flag-fallback">•</span>}
                <span><strong>{destination.name}</strong><small>{destination.visited ? "Visited" : "Wishlist"}</small></span>
                <span className="saved-arrow">→</span>
              </motion.button>
            ))}
          </div>
        </section>
      </main>

      <footer><span>WanderList</span><span>Explore. Remember. Go again.</span></footer>

      <AnimatePresence>
        {selectedCountry && <CountryPanel
          country={selectedCountry}
          destination={findDestination(selectedCountry)}
          onClose={() => setSelectedCountry(null)}
          onToggleWishlist={toggleWishlist}
          onToggleVisited={toggleVisited}
          onSaveNotes={saveNotes}
          onAddPhotos={addPhotos}
          onRemovePhoto={removePhoto}
        />}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon, number, label, onClick }) {
  return <button className="journey-stat" onClick={onClick}><div className="stat-icon">{icon}</div><strong>{number}</strong><span>{label}</span></button>;
}

export default App;
