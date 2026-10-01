import { useEffect, useState } from "react";
import { Check, Save, Sparkles } from "lucide-react";
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
        <div>
          <p className="eyebrow">YOUR MEMORY</p>
          <h3>Travel journal</h3>
          <span>Keep a few thoughts from this trip.</span>
        </div>
      </div>
      <div className="journal-editor">
        <textarea value={value} onChange={e => updateValue(e.target.value)} placeholder="Write about what you saw, ate, loved, or would do differently..." />
        <div className="journal-meta">
          <span>{value.length} characters</span>
          {saved && <motion.span className="journal-saved"><Check size={12} /> Saved</motion.span>}
        </div>
      </div>
      <div className="journal-actions">
        <button className="secondary-button" onClick={save}><Save size={15} /> {saved ? "Saved" : "Save notes"}</button>
        <button className="ai-button" onClick={summarize} disabled={loading || !value.trim()}><Sparkles size={15} /> {loading ? "Summarising..." : "Summarise with AI"}</button>
      </div>
      {summary && <motion.div className="summary-card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <div className="summary-heading"><span><Sparkles size={13} /> AI summary</span></div>
        <p>{summary}</p>
      </motion.div>}
    </motion.div>
  );
}
export default TravelJournal;