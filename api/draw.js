import { createClient } from '@supabase/supabase-js';
import Pusher from 'pusher';

// Supabase Bağlantısı (JWT Keyler İle Güncellendi)
const supabaseUrl = 'https://rponeyilawghkerjzmhd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb25lemlsYXdnaGtlcmp6bWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI5NDMzNCwiZXhwIjoyMTA0ODcwMzM0fQ.fU53-D6lOHf7MqNf6oh7Da_eyNMzcsR343h9tULShi8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Pusher Bağlantısı
const pusher = new Pusher({
  appId: "1868314",
  key: "0a3dfb70efecb620ea79",
  secret: "YOUR_PUSHER_SECRET", // Pusher dashboard'undan aldığın Secret Key'i buraya yaz
  cluster: "eu",
  useTLS: true
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('pixels').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { x, y, color } = req.body;

    const { data, error } = await supabase
      .from('pixels')
      .upsert({ x, y, color }, { onConflict: 'x,y' });

    if (error) return res.status(500).json({ error: error.message });

    try {
      await pusher.trigger('rplace-channel', 'pixel-placed', { x, y, color });
    } catch (pushErr) {
      console.error("Pusher hatası:", pushErr);
    }

    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
