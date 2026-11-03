import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

const FALLBACK_HYPE: Record<string, { title: string; text: string }> = {
  documentary: {
    title: 'DOCUMENTARY VOICE',
    text: 'The clock hits 5:11 PM. While the rest of the world debates whether tomorrow is a better day to start, Bhaskar is already in the chalk, turning silent discipline into unshakeable iron.',
  },
  preworkout: {
    title: 'PRE-WORKOUT ADRENALINE',
    text: 'Listen to the iron, Bhaskar! Every plate loaded onto that bar is a promise you kept to yourself. Strap in, breathe deep, and destroy this set!',
  },
  roast_toast: {
    title: 'BROTHERHOOD TOAST',
    text: 'Bro spends 10 minutes finding the exact phonk drop before a warm-up set, but the moment he touches the bar, the whole gym takes notes. Respect to the 5:11 PM legend!',
  },
  oracle: {
    title: 'BHASKAR’S DISCIPLINE ORACLE',
    text: '“Skip? We don’t skip. Put your sneakers on, show up, and get under the bar. Motivation is a myth; discipline is forever.”',
  },
};

// API endpoint for AI-generated sports documentary hype, narration & brotherhood oracle
app.post('/api/hype', async (req, res) => {
  const { mode = 'documentary', question = '' } = req.body;
  const fallback = FALLBACK_HYPE[mode] || FALLBACK_HYPE.documentary;

  if (!ai || !apiKey) {
    return res.json(fallback);
  }

  try {
    let prompt = '';
    const systemInstruction = `You are the legendary sports documentary narrator for a tribute to Bhaskar Vivek, an inspiring gym athlete known for his relentless consistency, 5:11 PM pump check rituals, daily attendance, and brotherly dedication. Keep responses punchy, cinematic (Netflix/Nike sports documentary style), deeply respectful, with sharp athletic grit and 20% warm brotherhood humor. Never invent fake weight loss numbers or exact kg metrics.`;

    if (mode === 'documentary') {
      prompt = `Write a gripping, cinematic 2-3 sentence documentary voiceover describing Bhaskar Vivek walking onto the gym floor, refusing to skip, and proving that real transformation happens when nobody is watching.`;
    } else if (mode === 'preworkout') {
      prompt = `Write an intense, humorous, and fiery pre-workout hype speech for Bhaskar Vivek before he takes on heavy trap bar deadlifts and squats today. Fuel him with pure adrenaline and respect.`;
    } else if (mode === 'roast_toast') {
      prompt = `Write an affectionate, witty "Toast & Roast" for Bhaskar: celebrate his insane daily gym attendance and his famous 5:11 PM mirror check ritual, while playfully teasing how he takes 10 minutes to pick the right Spotify track. Keep it full of love and brotherhood.`;
    } else if (mode === 'oracle') {
      prompt = `A friend asks Bhaskar Vivek: "${question || 'Should I skip gym today because I feel lazy?'}". Respond in Bhaskar's authentic, uncompromising, disciplined voice. Remind them why showing up is non-negotiable.`;
    } else {
      prompt = `Write an inspiring sports documentary quote celebrating Bhaskar Vivek's discipline and gym consistency.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const text = response.text || fallback.text;
    res.json({ title: fallback.title, text });
  } catch (err: unknown) {
    console.warn('Gemini hype API returned fallback:', err);
    res.json(fallback);
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
