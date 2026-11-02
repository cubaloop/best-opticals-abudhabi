const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${PORT}`;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  const cleanPath = req.url.split('?')[0];

  if (cleanPath === '/healthz' || cleanPath === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      site: 'best-opticals-abudhabi',
      timestamp: new Date().toISOString(),
      wakelock: 'active-24-7'
    }));
  }

  let filePath = path.join(__dirname, cleanPath === '/' ? 'index.html' : cleanPath);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Support Range requests for MP4 Hero Video streaming
    if (ext === '.mp4' && req.headers.range) {
      const fileSize = fs.statSync(filePath).size;
      const parts = req.headers.range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      return file.pipe(res);
    }

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[Best Opticals Br.3] Server listening on port ${PORT}`);
});

// Rule 2.2: Mandatory 24/7 Wake-Lock every 5 minutes (300,000 ms) to /healthz
setInterval(() => {
  const target = `${PUBLIC_URL}/healthz`;
  const client = target.startsWith('https') ? https : http;
  client.get(target, (res) => {
    res.resume();
  }).on('error', () => {});
}, 5 * 60 * 1000);
