export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;
  const key = process.env.GEMINI_API_KEY || '';

  return res.status(200).json({
    status: 'ok',
    hasGeminiKey: hasKey,
    keyPreview: hasKey ? `${key.slice(0, 4)}...${key.slice(-4)}` : null,
    environment: process.env.VERCEL ? 'vercel' : 'node',
  });
}
