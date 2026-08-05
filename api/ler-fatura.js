export default async function handler(req, res) {
  const raw = process.env.ANTHROPIC_API_KEY || '';

  if (req.method === 'GET') {
    return res.status(200).json({
      existe: raw.length > 0,
      tamanho: raw.length,
      comeca: raw.slice(0, 12),
      termina: raw.slice(-4),
      temEspaco: /\s/.test(raw)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': raw.trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const text = await r.text();
    res.setHeader('content-type', 'application/json');
    return res.status(r.status).send(text);
  } catch (e) {
    return res.status(500).json({ error: { message: String(e && e.message || e) } });
  }
}
