import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

let GoogleGenAI;
try {
  // Dynamic import so the app can still start if the package is missing
  ({ GoogleGenAI } = await import('@google/genai'));
} catch (e) {
  console.warn(
    'Optional server dependency @google/genai not installed. Install it to enable generation.'
  );
}

// Try a few common env var names so you don't get bitten by naming
const API_KEY =
  process.env.GENAI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY;

app.post('/api/generate', async (req, res) => {
  if (!GoogleGenAI) {
    return res
      .status(500)
      .json({ error: '@google/genai not installed on server' });
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: 'Server missing API key. Set GENAI_API_KEY / GEMINI_API_KEY / GOOGLE_API_KEY in environment',
    });
  }

  const { prompt = '', framework = 'html-css' } = req.body || {};
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Explicitly use the Gemini Developer API (not Vertex AI)
    const ai = new GoogleGenAI({
      vertexai: false,
      apiKey: API_KEY,
    });

    const systemPrompt = `
You are an experienced programmer with expertise in web development and UI/UX design. 
You create modern, animated, and fully responsive UI components.

Now, generate a UI component for: ${prompt}
Framework to use: ${framework}

Requirements:
- Return ONLY the code in a single HTML file wrapped in a Markdown fenced code block.
- Do NOT include explanation or extra text.
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // With this SDK, passing a plain string as contents is valid
      contents: systemPrompt,
    });

    // In @google/genai, text is a property (not a function)
    const code = response?.text || '';

    return res.json({ code });
  } catch (err) {
    console.error('Generation failed', err);
    console.error('Cause:', err.cause); // This shows ENOTFOUND / ECONNRESET / CERT_*, etc.

    return res.status(500).json({
      error: 'Generation failed on provider',
      details: String(err),
      cause: String(err.cause || ''),
    });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Generation server listening on http://localhost:${port}`)
);
