import { useState } from "react";
import { LoaderCircle, Send, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const actions = [
  ["itinerary", "5-day itinerary"],
  ["things", "Things to do"],
  ["food", "Local food"],
  ["tips", "Travel tips"],
];

function AiAssistant({ country, destination, visited }) {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(customPrompt = prompt) {
    if (!customPrompt.trim() || loading) return;
    setLoading(true);
    setAnswer("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          prompt: customPrompt,
          notes: visited ? destination?.notes || "" : "",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The AI server returned an error.");
      setAnswer(data.text || "Gemini returned an empty answer.");
    } catch (error) {
      setAnswer(error.message || "Gemini could not answer right now. Start the AI server and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-assistant">
      <div className="ai-actions">
        {actions.map(([key, label]) => (
          <button key={key} onClick={() => ask(`Give me practical ${label.toLowerCase()} for ${country}. Make it specific to this country, concise, and useful.`)}>{label}</button>
        ))}
      </div>
      <div className="ai-input">
        <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()} placeholder={visited ? "Ask Gemini about your trip..." : "Ask Gemini anything about this country..."} />
        <button onClick={() => ask()} disabled={loading || !prompt.trim()} aria-label="Ask Gemini">
          {loading ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
        </button>
      </div>
      {loading && <div className="ai-loading"><Sparkles size={16} /> Gemini is thinking...</div>}
      {answer && <motion.div className="ai-answer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className="ai-answer-label"><Sparkles size={14} /> Gemini</div><div className="ai-answer-text">{answer}</div></motion.div>}
    </div>
  );
}

export default AiAssistant;