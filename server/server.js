import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
const port = process.env.PORT || 3001;
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function requireAI(res) {
  if (!ai) {
    res.status(503).json({ error: "GEMINI_API_KEY is not configured. Add it to the root .env file and restart npm run server." });
    return false;
  }
  return true;
}

async function generateTravelAnswer({ country, prompt, notes = "" }) {
  const context = notes
    ? `The user has visited ${country}. Their personal notes are:
${notes}`
    : `The user is considering visiting ${country} and has not necessarily been there yet.`;

  return ai.models.generateContent({
    model,
    contents: `Country: ${country}

${context}

User request: ${prompt}`,
    config: {
      systemInstruction: `You are the travel intelligence assistant inside WanderList.
Give practical, specific, easy-to-scan answers for someone planning or remembering a trip.
Prefer useful details such as areas to visit, realistic day structure, local food, transport considerations, cultural tips, and what to prioritise.
Use short headings and bullets when they improve readability.
Do not invent personal facts, exact prices, opening hours, visa rules, safety alerts, or other time-sensitive details.
For current or changeable travel information, use Google Search when useful and clearly tell the user when they should verify official information.
If the user asks for an itinerary, make it geographically sensible and avoid cramming too many places into one day.
If the user has personal notes, use them as context but never add facts to their memories that were not provided.`,
      thinkingConfig: { thinkingLevel: "medium" },
      tools: [{ googleSearch: {} }],
    },
  });
}

app.post("/api/ai", async (req, res) => {
  if (!requireAI(res)) return;
  const { country, prompt, notes = "" } = req.body || {};
  if (!country || !prompt) return res.status(400).json({ error: "Country and prompt are required." });

  try {
    const result = await generateTravelAnswer({ country, prompt, notes });
    res.json({ text: result.text || "No answer was generated." });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: `Gemini request failed: ${error.message || "unknown server error"}` });
  }
});

app.post("/api/ai/summarize", async (req, res) => {
  if (!requireAI(res)) return;
  const { notes } = req.body || {};
  if (!notes?.trim()) return res.status(400).json({ error: "Notes are required." });

  try {
    const result = await ai.models.generateContent({
      model,
      contents: notes,
      config: {
        systemInstruction: "Summarise these personal travel notes into a warm, natural short trip memory. Keep only the user's facts. Do not invent places, people, events, feelings, or details.",
        thinkingConfig: { thinkingLevel: "low" },
      },
    });
    res.json({ text: result.text || "No summary was generated." });
  } catch (error) {
    console.error("Gemini summary error:", error);
    res.status(500).json({ error: `Gemini request failed: ${error.message || "unknown server error"}` });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(ai), model });
});

app.listen(port, () => {
  console.log(`TripList AI server running on http://localhost:${port} using ${model}`);
});