import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { tools } from './tools.js';

const app = express();
app.use(cors());
app.use(express.json());
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-3.1-flash-lite';
const pending = new Map();

function toTurn(interaction) {
  const actions = interaction.steps
    .filter(step => step.type === 'function_call')
    .map(({ id, name, arguments: args }) => ({ id, name, arguments: args }));
  if (actions.length) pending.set(interaction.id, actions);
  return { message: interaction.output_text ?? '', actions, interactionId: interaction.id };
}

app.post('/api/chat', async (req, res) => {
  const { prompt, interactionId } = req.body ?? {};
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000 ||
      (interactionId !== undefined && typeof interactionId !== 'string')) {
    return res.status(400).json({ error: 'Message invalide.' });
  }
  try {
    const interaction = await ai.interactions.create({
      model, input: prompt, tools,
      ...(interactionId ? { previous_interaction_id: interactionId } : {})
    });
    return res.json({ response: toTurn(interaction) });
  } catch (error) {
    console.error('Gemini:', error);
    return res.status(500).json({ error: 'Impossible de joindre Gemini.' });
  }
});

app.post('/api/chat/result', async (req, res) => {
  const { interactionId, results } = req.body ?? {};
  const expected = pending.get(interactionId);
  if (!expected || !Array.isArray(results) || results.length !== expected.length ||
      !expected.every(call => results.some(result => result?.callId === call.id && result?.name === call.name && typeof result?.output?.success === 'boolean'))) {
    return res.status(400).json({ error: 'Résultats d’outils invalides.' });
  }
  pending.delete(interactionId);
  try {
    const interaction = await ai.interactions.create({
      model, previous_interaction_id: interactionId, tools,
      input: expected.map(call => {
        const result = results.find(item => item.callId === call.id);
        return { type: 'function_result', name: call.name, call_id: call.id,
          result: [{ type: 'text', text: JSON.stringify(result.output) }] };
      })
    });
    return res.json({ response: toTurn(interaction) });
  } catch (error) {
    console.error('Gemini:', error);
    return res.status(500).json({ error: 'Impossible de transmettre les résultats.' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log(`Backend sur le port ${process.env.PORT || 3000}`));
