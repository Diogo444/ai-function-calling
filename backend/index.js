import express, { response } from "express";
import cors from "cors";
import "dotenv/config";
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

app.use(express.json());

const changerFond = {
  type: "function",
  name: "changerFond",
  description: "Change la couleur de fond de la zone de prévisualisation de l'application.",
  parameters: {
    type: "object",
    properties: {
      couleur: {
        type: "string",
        description: "Couleur CSS au format hexadécimal, par exemple #FF0000 pour rouge."
      }
    },
    required: ["couleur"]
  }
};

async function demanderGemini(prompt) {
  console.log("envoie de la demande")
  const reponse = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: prompt,
    tools: [changerFond]
  })
  console.log(reponse.steps);
  console.log(reponse.output_text);

  const appelFonction = reponse.steps.find(
    element => element.type === "function_call"
  );

  return {
    message: reponse.output_text ?? "",
    action: appelFonction ?? null,
    interactionId: reponse.id
  };
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

app.post("/api/chat/result", async (req, res) => {
  const { interactionId, callId, name, success, couleur } = req.body;

  console.log("Résultat reçu depuis Angular :", {
    interactionId,
    callId,
    name,
    success,
    couleur
  });

  res.json({ message: "Résultat reçu par Express" });
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
