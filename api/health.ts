export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-code');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({ status: 'ok' });
}
