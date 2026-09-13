import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rponeyilawghkerjzmhd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb25lemlsYXdnaGtlcmp6bWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI5NDMzNCwiZXhwIjoyMTA0ODcwMzM0fQ.fU53-D6lOHf7MqNf6oh7Da_eyNMzcsR343h9tULShi8';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('pixels').select('*');
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { x, y, color } = req.body || {};

      if (x === undefined || y === undefined || !color) {
        return res.status(400).json({ error: 'Eksik veri.' });
      }

      const { error } = await supabase
        .from('pixels')
        .upsert({ x, y, color }, { onConflict: 'x,y' });

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
