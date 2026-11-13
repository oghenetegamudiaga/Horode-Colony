import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleAnalyzeSlide, handleAnalyzeCrossSlide } from './src/lib/analysisService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
function resolvePort(): number {
  const portFlagIndex = process.argv.indexOf('--port');
  if (portFlagIndex !== -1 && process.argv[portFlagIndex + 1]) {
    const parsed = Number(process.argv[portFlagIndex + 1]);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  const envPort = Number(process.env.PORT);
  const nginxPort = Number(process.env.NGINX_PORT);
  if (envPort && envPort !== nginxPort) {
    return envPort;
  }
  return 3000;
}

const PORT = resolvePort();

// Generous body limit for image payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health / Status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    keyPreview: hasKey ? `${process.env.GEMINI_API_KEY!.slice(0, 4)}...${process.env.GEMINI_API_KEY!.slice(-4)}` : null,
  });
});

// POST /api/analyze-slide
app.post('/api/analyze-slide', async (req: Request, res: Response) => {
  try {
    const result = await handleAnalyzeSlide(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/analyze-slide:', err);
    res.status(500).json({
      error: 'Slide analysis encountered an issue.',
      details: err?.message || 'Unknown error occurred while contacting AI model.',
    });
  }
});

// POST /api/analyze-cross-slide
app.post('/api/analyze-cross-slide', async (req: Request, res: Response) => {
  try {
    const result = await handleAnalyzeCrossSlide(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/analyze-cross-slide:', err);
    res.status(500).json({
      error: 'Cross-slide analysis encountered an issue.',
      details: err?.message || 'Unknown error',
    });
  }
});

// Dev vs Prod Vite mounting
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Horode Proof server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
