import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function PhotoAlbum({photos,onAddPhotos}) {
  const inputRef=useRef(); const [selected,setSelected]=useState(null);
  function handleFiles(e){const files=Array.from(e.target.files||[]);const next=files.map(file=>({id:crypto.randomUUID(),name:file.name,src:URL.createObjectURL(file)}));if(next.length)onAddPhotos(next);e.target.value="";}
  return <motion.div className="album" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}><div className="album-heading"><div><p className="eyebrow">YOUR PHOTOS</p><h3>Travel album</h3></div><button className="secondary-button" onClick={()=>inputRef.current?.click()}><ImagePlus size={15}/> Add photos</button><input ref={inputRef} hidden type="file" accept="image/*" multiple onChange={handleFiles}/></div>{photos.length?<div className="photo-grid">{photos.map(photo=><motion.button key={photo.id} className="photo-tile" whileHover={{scale:1.025}} onClick={()=>setSelected(photo)}><img src={photo.src} alt={photo.name||"Trip memory"}/></motion.button>)}</div>:<div className="album-empty"><Camera size={25}/><p>Your memories will live here.</p><span>Add your first photos from this trip.</span></div>}<AnimatePresence>{selected&&<motion.div className="photo-lightbox" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)}><button className="icon-button" onClick={()=>setSelected(null)}><X size={20}/></button><img src={selected.src} alt={selected.name||"Trip memory"} onClick={e=>e.stopPropagation()}/></motion.div>}</AnimatePresence></motion.div>;
}
export default PhotoAlbum;
