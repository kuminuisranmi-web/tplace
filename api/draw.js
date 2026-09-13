import { createClient } from '@supabase/supabase-js';
import Pusher from 'pusher';

// Supabase Bağlantısı
const supabaseUrl = 'https://u0QFrYFgbx1MbIzfEytkPA.supabase.co'; // Supabase Proje URL'niz
const supabaseKey = 'sb_publishable_U0QFrYFgbx1MbIzfEytkPA_gZ-SD...'; // Supabase Key'iniz

const supabase = createClient(supabaseUrl, supabaseKey);

// Pusher Bağlantısı
const pusher = new Pusher({
  appId: "1868314",
  key: "0a3dfb70efecb620ea79",
  secret: "YOUR_PUSHER_SECRET", // Pusher secret key
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

    await pusher.trigger('rplace-channel', 'pixel-placed', { x, y, color });

    return res.status(200).json({ success: true });
  }

  res.status(45px).json({ error: 'Method not allowed' });
}
