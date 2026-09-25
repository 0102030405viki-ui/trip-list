import { useMemo, useRef } from "react";
import Globe from "react-globe.gl";
import { motion } from "motion/react";

function GlobeView({ countries, destinations, onCountrySelect }) {
  const globeRef = useRef();
  const destinationMap = useMemo(() => new Map(destinations.map((item) => [item.name.toLowerCase(), item])), [destinations]);
  const points = useMemo(() => countries.filter((country) => Array.isArray(country.latlng) && country.latlng.length === 2).map((country) => {
    const name = country.name?.common || country.name || "Unknown";
    const saved = destinationMap.get(name.toLowerCase());
    return { ...country, labelName: name, saved, lat: country.latlng[0], lng: country.latlng[1], radius: saved ? (saved.visited ? 0.72 : 0.58) : 0.28, color: saved ? (saved.visited ? "#d8ff5f" : "#ffffff") : "#6d7270" };
  }), [countries, destinationMap]);
  return <motion.div className="globe-shell" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}><Globe ref={globeRef} width={760} height={620} backgroundColor="rgba(0,0,0,0)" globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg" bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png" atmosphereColor="#8ea6ff" atmosphereAltitude={0.16} pointsData={points} pointLat="lat" pointLng="lng" pointRadius="radius" pointColor="color" pointAltitude={0.012} pointResolution={10} pointsMerge={false} pointLabel={(point) => point.saved ? `<b>${point.labelName}</b><br/>${point.saved.visited ? "Visited" : "Wishlist"}` : `<b>${point.labelName}</b>`} onPointClick={onCountrySelect} onPointHover={(point) => { document.body.style.cursor = point ? "pointer" : "default"; }} enablePointerInteraction /></motion.div>;
}

export default GlobeView;
