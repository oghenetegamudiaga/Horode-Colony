import { handleAnalyzeCrossSlide } from '../src/lib/analysisService';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
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
    const result = await handleAnalyzeCrossSlide(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Vercel API error (/api/analyze-cross-slide):', err);
    return res.status(500).json({
      error: 'Cross-slide analysis encountered an issue.',
      details: err?.message || 'Failed to process cross-slide consistency.',
    });
  }
}
