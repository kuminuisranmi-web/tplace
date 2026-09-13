import { createClient } from '@supabase/supabase-js';
import Pusher from 'pusher';

const supabaseUrl = 'https://rponeyilawghkerjzmhd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb25lemlsYXdnaGtlcmp6bWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI5NDMzNCwiZXhwIjoyMTA0ODcwMzM0fQ.fU53-D6lOHf7MqNf6oh7Da_eyNMzcsR343h9tULShi8';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('pixels').select('*');
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { x, y, color } = req.body || {};

      if (x === undefined || y === undefined || !color) {
        return res.status(400).json({ error: 'Eksik veri gönderildi.' });
      }

      // Veritabanına Ekle / Güncelle
      const { error: dbError } = await supabase
        .from('pixels')
        .upsert({ x, y, color }, { onConflict: 'x,y' });

      if (dbError) throw dbError;

      // Pusher secret key girilmemişse bile veritabanı çökmesin
      if (process.env.PUSHER_SECRET) {
        try {
          const pusher = new Pusher({
            appId: "1868314",
            key: "0a3dfb70efecb620ea79",
            secret: process.env.PUSHER_SECRET,
            cluster: "eu",
            useTLS: true
          });
          await pusher.trigger('rplace-channel', 'pixel-placed', { x, y, color });
        } catch (pErr) {
          console.error("Pusher Hatası (Önemsiz):", pErr);
        }
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error("Backend Hatası:", err);
    return res.status(500).json({ error: err.message || 'Sunucu hatası' });
  }
}
