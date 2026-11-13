import { handleAnalyzeSlide } from '../src/lib/analysisService';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  // Enable CORS if accessed across domains
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const result = await handleAnalyzeSlide(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Vercel API error (/api/analyze-slide):', err);
    return res.status(500).json({
      error: 'Slide analysis encountered an issue.',
      details: err?.message || 'Failed to process slide image.',
    });
  }
}
