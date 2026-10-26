import express from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

app.use(express.json());

async function demanderGemini(prompt) {
  console.log("envoie de la demande")
  const reponse = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: prompt
  })
  console.log(reponse.output_text);

  return reponse.output_text
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Le champ prompt est obligatoire." });
  }

  try {
    const reponse = await demanderGemini(prompt);
    return res.json({ response: reponse });
  } catch (error) {
    console.error("Erreur lors de l'appel à Gemini :", error);
    return res.status(500).json({ error: "Impossible d'obtenir une réponse de Gemini." });
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
