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
    res.status(503).json({ error: "GEMINI_API_KEY is not configured on the server." });
    return false;
  }
  return true;
}

app.post("/api/ai", async (req, res) => {
  if (!requireAI(res)) return;
  const { country, prompt, notes = "" } = req.body || {};
  if (!country || !prompt) return res.status(400).json({ error: "Country and prompt are required." });

  try {
    const context = notes
      ? `The user has visited ${country}. Their personal notes are:\n${notes}`
      : `The user is considering visiting ${country} and has not necessarily been there yet.`;

    const result = await ai.models.generateContent({
      model,
      contents: `You are a practical travel assistant inside a personal travel app. Give concise, useful, realistic advice. Do not invent exact current prices, opening hours, visa rules, or other time-sensitive facts. If something may change, tell the user to verify it.

Country: ${country}
${context}

User request: ${prompt}`,
    });

    res.json({ text: result.text || "No answer was generated." });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Gemini request failed." });
  }
});

app.post("/api/ai/summarize", async (req, res) => {
  if (!requireAI(res)) return;
  const { notes } = req.body || {};
  if (!notes?.trim()) return res.status(400).json({ error: "Notes are required." });

  try {
    const result = await ai.models.generateContent({
      model,
      contents: `Summarise the following personal travel notes into a warm, natural short trip summary. Keep the user's facts and tone. Do not add details that are not present.

Notes:
${notes}`,
    });
    res.json({ text: result.text || "No summary was generated." });
  } catch (error) {
    console.error("Gemini summary error:", error);
    res.status(500).json({ error: "Gemini request failed." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(ai), model });
});

app.listen(port, () => {
  console.log(`TripList AI server running on http://localhost:${port}`);
});
