import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Heart, MapPinned, Sparkles, X } from "lucide-react";
import AiAssistant from "./AiAssistant";
import TravelJournal from "./TravelJournal";
import PhotoAlbum from "./PhotoAlbum";

function CountryPanel({ country, destination, onClose, onToggleWishlist, onToggleVisited, onSaveNotes, onAddPhotos }) {
  const [tab, setTab] = useState("overview");
  useEffect(() => setTab("overview"), [country]);
  if (!country) return null;
  const name = country.name?.common || country.name || "Unknown";
  const flag = country.flags?.svg || country.flags?.png;
  const visited = destination?.visited;
  const wishlist = destination?.wishlist;

  return <AnimatePresence><motion.aside className="country-panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 28 }}>
    <button className="icon-button panel-close" onClick={onClose} aria-label="Close"><X size={19} /></button>
    <div className="panel-cover">{destination?.image ? <img src={destination.image} alt={name} /> : <div className="panel-cover-placeholder"><MapPinned size={34} /></div>}<div className="panel-cover-overlay" /><div className="panel-title">{flag && <img src={flag} alt="" />}<div><p>{country.region || "Destination"}</p><h2>{name}</h2></div></div></div>
    <div className="panel-content">
      <div className="country-actions">
        <button className={`action-button ${wishlist ? "is-active" : ""}`} onClick={() => onToggleWishlist(destination?.id, country)}><Heart size={17} fill={wishlist ? "currentColor" : "none"} />{wishlist ? "Wishlisted" : "Wishlist"}</button>
        <button className={`action-button ${visited ? "is-active visited" : ""}`} onClick={() => onToggleVisited(destination?.id, country)}><MapPinned size={17} />{visited ? "Visited" : "Mark visited"}</button>
      </div>
      <div className="panel-tabs"><button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Overview</button><button className={tab === "journal" ? "active" : ""} onClick={() => setTab("journal")} disabled={!visited}>Journal</button><button className={tab === "album" ? "active" : ""} onClick={() => setTab("album")} disabled={!visited}><Camera size={14} /> Album</button></div>
      {tab === "overview" && <motion.div className="panel-tab-content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="fact-grid"><Fact label="Capital" value={country.capital?.[0] || destination?.capital || "—"} /><Fact label="Region" value={country.region || "—"} /><Fact label="Population" value={(country.population || 0).toLocaleString()} /><Fact label="Subregion" value={country.subregion || "—"} /></div>
        <div className="ai-section-heading"><div><p className="eyebrow">TRAVEL INTELLIGENCE</p><h3>Plan this trip with Gemini</h3></div><Sparkles size={20} /></div>
        <AiAssistant country={name} destination={destination} visited={visited} />
      </motion.div>}
      {tab === "journal" && visited && <TravelJournal notes={destination?.notes || ""} onSave={(notes) => onSaveNotes(destination.id, notes)} />}
      {tab === "album" && visited && <PhotoAlbum photos={destination?.photos || []} onAddPhotos={(files) => onAddPhotos(destination.id, files)} />}
    </div>
  </motion.aside></AnimatePresence>;
}
function Fact({ label, value }) { return <div className="fact"><span>{label}</span><strong>{value}</strong></div>; }
export default CountryPanel;
