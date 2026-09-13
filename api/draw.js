import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Tüm pikselleri getir (GET)
    if (req.method === 'GET') {
      const keys = await kv.keys('pixel:*');
      let pixels = [];
      
      if (keys.length > 0) {
        const values = await kv.mget(...keys);
        pixels = values.map((val, index) => {
          const [x, y] = keys[index].replace('pixel:', '').split(',');
          return { x: parseInt(x), y: parseInt(y), color: val };
        });
      }

      return res.status(200).json(pixels);
    }

    // 2. Piksel kaydet (POST)
    if (req.method === 'POST') {
      const { x, y, color } = req.body || {};

      if (x === undefined || y === undefined || !color) {
        return res.status(400).json({ error: 'Eksik veri.' });
      }

      await kv.set(`pixel:${x},${y}`, color);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error("KV Hatası:", err);
    return res.status(500).json({ error: err.message });
  }
}
