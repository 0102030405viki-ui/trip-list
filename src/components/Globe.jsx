import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import Globe from "react-globe.gl";
import { motion } from "motion/react";

const GlobeView = forwardRef(function GlobeView({ countries, destinations, onCountrySelect }, ref) {
  const globeRef = useRef();
  const destinationMap = useMemo(() => new Map(destinations.map((item) => [item.name.toLowerCase(), item])), [destinations]);
  const points = useMemo(() => countries.filter((country) => { const name = country.name?.common || country.name || ""; return Array.isArray(country.latlng) && country.latlng.length === 2 && destinationMap.has(name.toLowerCase()); }).map((country) => {
    const name = country.name?.common || country.name || "Unknown";
    const saved = destinationMap.get(name.toLowerCase());
    return { ...country, labelName: name, saved, lat: country.latlng[0], lng: country.latlng[1], radius: saved?.visited ? 0.9 : 0.72, color: saved?.visited ? "#d8ff5f" : "#ffffff", altitude: saved?.visited ? 0.045 : 0.028 };
  }), [countries, destinationMap]);
  useImperativeHandle(ref, () => ({ focusCountry(country) { const latlng = country?.latlng; if (!globeRef.current || !Array.isArray(latlng) || latlng.length !== 2) return; globeRef.current.pointOfView({ lat: latlng[0], lng: latlng[1], altitude: 1.75 }, 1400); } }), []);
  return <motion.div className="globe-shell" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}><Globe ref={globeRef} width={820} height={680} backgroundColor="rgba(0,0,0,0)" globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg" bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png" atmosphereColor="#8ea6ff" atmosphereAltitude={0.16} pointsData={points} pointLat="lat" pointLng="lng" pointRadius="radius" pointColor="color" pointAltitude="altitude" pointResolution={18} pointsTransitionDuration={650} pointsMerge={false} pointLabel={(point) => `<b>${point.labelName}</b><br/>${point.saved?.visited ? "Visited" : "Wishlist"}`} onPointClick={onCountrySelect} onPointHover={(point) => { document.body.style.cursor = point ? "pointer" : "default"; }} enablePointerInteraction /></motion.div>;
});

export default GlobeView;
