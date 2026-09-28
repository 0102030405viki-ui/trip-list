import { useEffect, useState } from "react";
import { Check, FileText, Save, Sparkles } from "lucide-react";
import { motion } from "motion/react";

function TravelJournal({ notes, onSave }) {
  const [value, setValue] = useState(notes);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(notes);
    setSaved(false);
    setSummary("");
  }, [notes]);

  function updateValue(next) {
    setValue(next);
    setSaved(false);
  }

  function save() {
    onSave(value);
    setSaved(true);
  }

  async function summarize() {
    if (!value.trim() || loading) return;
    setLoading(true);
    setSummary("");
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI request failed");
      setSummary(data.text);
    } catch (error) {
      setSummary(error.message || "I couldn't summarise your notes right now. Start the AI server and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div className="journal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="journal-heading">
        <div><p className="eyebrow">YOUR MEMORY</p><h3>Travel journal</h3></div>
        <FileText size={20} />
      </div>
      <textarea value={value} onChange={e => updateValue(e.target.value)} placeholder="Write about what you saw, ate, loved, or would do differently..." />
      <div className="journal-actions">
        <button className="secondary-button" onClick={save}><Save size={15} /> {saved ? "Saved" : "Save notes"}</button>
        <button className="ai-button" onClick={summarize} disabled={loading || !value.trim()}><Sparkles size={15} /> {loading ? "Summarising..." : "Summarise with AI"}</button>
      </div>
      {saved && <motion.p className="saved-feedback" initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}><Check size={13} /> Saved to this trip</motion.p>}
      {summary && <motion.div className="summary-card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}><p className="eyebrow">AI SUMMARY</p><p>{summary}</p></motion.div>}
    </motion.div>
  );
}
export default TravelJournal;