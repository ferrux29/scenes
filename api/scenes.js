export default async function handler(req, res) {
  const tz = (req.query.tz || 'America/La_Paz').toString();
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', { hour12:false, hour:'2-digit', minute:'2-digit', timeZone: tz });
  const [hh, mm] = fmt.format(now).split(':');
  const mins = parseInt(hh, 10) * 60 + parseInt(mm, 10);

  let scene = '8.jpg';
  if (mins >= 295 && mins < 380) scene = '1.jpg';          // 04:55–06:20
  else if (mins >= 380 && mins < 650) scene = '2.jpg'; // 06:20–10:50
  else if (mins >= 650 && mins < 1005) scene = '3.jpg';    // 10:50–16:45
  else if (mins >= 1005 && mins < 1070) scene = '4.jpg';  // 16:45–17:50
  else if (mins >= 1070 && mins < 1185) scene = '5.jpg';// 17:50–19:45
  else if (mins >= 1185 && mins < 1400) scene = '6.jpg';      // 19:45–23:20
  else if ((mins >= 1430 && mins <= 1440) || (mins >= 0 && mins < 10)) scene = '7.png'; // 23:50–00:10

  const host = req.headers.host;
  const url = `https://${host}/scenes/${scene}`; // sirve desde /public/scenes
  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());

  res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.status(200).send(buf);
}
