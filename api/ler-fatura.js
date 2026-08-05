export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } },
  maxDuration: 60
};

export default async function handler(req, res) {
  const raw = process.env.ANTHROPIC_API_KEY;

  if (req.method === 'GET') {
    return res.status(200).json({
      existe: !!raw,
      tamanho: raw ? raw.length : 0,
      comeca: raw ? raw.slice(0, 12) : null,
      termina: raw ? raw.slice(-4) : null,
      temEspaco: raw ? /\s/.test(raw) : null
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const key = (raw || '').trim().replace(/^["']|["']$/g, '');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const text = await r.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(r.status).send(text);
  }
