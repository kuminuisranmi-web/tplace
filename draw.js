const { createClient } = require('@supabase/supabase-js');
const Pusher = require('pusher');

const SUPABASE_URL = "https://rponezilawghkerjzmhd.supabase.co";
// Görseldeki anon public anahtarınız koda eklendi
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb25lemlsYXdnaGtlcmp6bWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYyMzU3MzQsImV4cCI6MjA0MTgxMTczNH0.3w"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const pusher = new Pusher({
  appId: "2194013",
  key: "0a3dfb70efecb620ea79",
  secret: "9f1401714ae1ca640f89",
  cluster: "eu",
  useTLS: true
});

module.exports = async (req, res) => {
  // GET: Sayfa açıldığında veritabanındaki tüm pikselleri getirir
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('pixels').select('x, y, color');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST: Yeni eklenen pikseli veritabanına işler ve Pusher ile yayınlar
  if (req.method === 'POST') {
    const { x, y, color } = req.body;

    if (x === undefined || y === undefined || !color) {
      return res.status(400).json({ error: 'Eksik veri' });
    }

    const posX = parseInt(x);
    const posY = parseInt(y);

    const { error } = await supabase
      .from('pixels')
      .upsert({ x: posX, y: posY, color: color }, { onConflict: 'x,y' });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    await pusher.trigger("rplace-channel", "pixel-placed", {
      x: posX,
      y: posY,
      color: color
    });

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};