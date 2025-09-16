async function getTZ(req) {
  // 1) Override manual para pruebas: ?tz=Europe/Madrid
  const tzParam = (req.query.tz || '').toString().trim();
  if (tzParam) return tzParam;

  // 2) Header que Vercel añade incluso con Private Relay
  const hdrTz = req.headers['x-vercel-ip-timezone'];
  if (hdrTz) return hdrTz;

  // 3) Fallback extremo (raro): usa UTC
  return 'UTC';
}

export default async function handler(req, res) {
  const tz = await getTZ(req);

  // Hora local en esa TZ
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', timeZone: tz
  });
  const [hh, mm] = fmt.format(now).split(':');
  const mins = parseInt(hh, 10) * 60 + parseInt(mm, 10);

  // Franjas → archivo (ajusta si querés)
  let scene = '8.jpg'; // Luna/madrugada por defecto
  if (mins >= 295 && mins < 380) scene = '1.jpg';       // 04:55–06:20  Amanecer
  else if (mins >= 380 && mins < 650) scene = '2.jpg';  // 06:20–10:50  Media mañana
  else if (mins >= 650 && mins < 1005) scene = '3.jpg'; // 10:50–16:45  Mediodía
  else if (mins >= 1005 && mins < 1070) scene = '4.jpg';// 16:45–17:50  Atardecer
  else if (mins >= 1070 && mins < 1185) scene = '5.jpg';// 17:50–19:45  Anocheciendo
  else if (mins >= 1185 && mins < 1400) scene = '6.jpg';// 19:45–23:20  Noche
  else if ((mins >= 1430 && mins <= 1440) || (mins >= 0 && mins < 10)) scene = '7.png'; // 23:50–00:10 Medianoche

  // Sirve desde tu repo (RAW de GitHub)
  const base = 'https://raw.githubusercontent.com/ferrux29/scenes/main/public/scenes';
  const url = `${base}/${scene}`;

  // Debug opcional
  if (req.query.debug === '1') {
    return res.status(200).json({
      tzUsed: tz,
      mins, scene, url,
      hdrTz: req.headers['x-vercel-ip-timezone'] || null
    });
  }

  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.status(200).send(buf);
}
