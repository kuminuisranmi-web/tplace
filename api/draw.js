export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = 'https://rponeyilawghkerjzmhd.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb25lemlsYXdnaGtlcmp6bWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI5NDMzNCwiZXhwIjoyMTA0ODcwMzM0fQ.fU53-D6lOHf7MqNf6oh7Da_eyNMzcsR343h9tULShi8';

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${supabaseUrl}/rest/v1/pixels?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(500).json({ error: "Supabase GET Hatası", details: data });
      }
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { x, y, color } = req.body || {};

      if (x === undefined || y === undefined || !color) {
        return res.status(400).json({ error: 'Eksik veri gönderildi.' });
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/pixels`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-conflict'
        },
        body: JSON.stringify({ x, y, color })
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(500).json({ error: "Supabase POST Hatası", details: errText });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: "Kritik Sunucu Hatası", details: err.message });
  }
}
