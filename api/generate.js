import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

let GoogleGenAI;
try {
  GoogleGenAI = (await import('@google/genai')).GoogleGenAI;
} catch (e) {
  console.warn('Optional server dependency @google/genai not installed. Install it to enable generation.');
}

const API_KEY = process.env.GENAI_API_KEY;

app.post('/api/generate', async (req, res) => {
  if (!GoogleGenAI) return res.status(500).json({ error: '@google/genai not installed on server' });
  if (!API_KEY) return res.status(500).json({ error: 'Server missing GENAI_API_KEY in environment' });

  const { prompt = '', framework = 'html-css' } = req.body || {};
  if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an experienced programmer with expertise in web development and UI/UX design. You create modern, animated, and fully responsive UI components.\n\nNow, generate a UI component for: ${prompt}\nFramework to use: ${framework}\n\nRequirements:\n- Return ONLY the code in a single HTML file wrapped in Markdown fenced code block.\n- Do NOT include explanation or extra text.\n`,
    });

    return res.json({ code: response.text || '' });
  } catch (err) {
    console.error('Generation failed', err);
    return res.status(500).json({ error: 'Generation failed on provider', details: String(err) });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Generation server listening on http://localhost:${port}`));