import { useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file) {
  if (!file.type.startsWith("image/")) return null;
  const source = await fileToDataUrl(file);
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = source;
  });
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function PhotoAlbum({ photos, onAddPhotos, onRemovePhoto }) {
  const inputRef = useRef();
  const [selected, setSelected] = useState(null);

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith("image/"));
    const next = [];
    for (const file of files) {
      const src = await compressImage(file);
      if (src) next.push({ id: crypto.randomUUID(), name: file.name, src });
    }
    if (next.length) onAddPhotos(next);
    event.target.value = "";
  }

  function removeSelected() {
    if (!selected) return;
    onRemovePhoto(selected.id);
    setSelected(null);
  }

  return (
    <motion.div className="album" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="album-heading">
        <div><p className="eyebrow">YOUR PHOTOS</p><h3>Travel album</h3></div>
        <button className="secondary-button" onClick={() => inputRef.current?.click()}><ImagePlus size={15} /> Add photos</button>
        <input ref={inputRef} hidden type="file" accept="image/*" multiple onChange={handleFiles} />
      </div>
      {photos.length ? (
        <div className="photo-grid">
          {photos.map(photo => (
            <motion.button key={photo.id} className="photo-tile" whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.98 }} onClick={() => setSelected(photo)}>
              <img src={photo.src} alt={photo.name || "Trip memory"} />
            </motion.button>
          ))}
        </div>
      ) : (
        <button className="album-empty" onClick={() => inputRef.current?.click()}>
          <Camera size={25} /><p>Your memories will live here.</p><span>Add your first photos from this trip.</span>
        </button>
      )}
      <AnimatePresence>
        {selected && (
          <motion.div className="photo-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <button className="icon-button lightbox-close" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button>
            <button className="icon-button lightbox-delete" onClick={removeSelected} aria-label="Delete photo"><Trash2 size={18} /></button>
            <img src={selected.src} alt={selected.name || "Trip memory"} onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
export default PhotoAlbum;