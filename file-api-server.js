// ── File API Server v2 ──
// Provides read/write/ls for Neuro-OS apps (works without a model)
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 18795;

// Restrict file access to these directories
const ALLOWED_ROOTS = [
  '/var/www/html/neuro-os',
  '/tmp'
];

function isAllowed(absPath) {
  const resolved = path.resolve(absPath);
  return ALLOWED_ROOTS.some(root => resolved.startsWith(root));
}

function lsDir(dirPath, res) {
  const absPath = path.resolve(dirPath);
  if (!isAllowed(absPath)) {
    res.writeHead(403, {'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'Forbidden'}));
    return;
  }
  fs.readdir(absPath, {withFileTypes:true}, (err, entries) => {
    if (err) {
      res.writeHead(404, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'Not Found'}));
      return;
    }
    const list = entries.filter(e => !e.name.startsWith('.')).map(e => {
      let size = 0, mtime = 0;
      try {
        const stat = fs.statSync(path.join(absPath, e.name));
        size = stat.size;
        mtime = stat.mtimeMs;
      } catch(ex) {}
      return {
        name: e.name,
        type: e.isDirectory() ? 'dir' : 'file',
        size,
        mtime: Math.floor(mtime / 1000)
      };
    });
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify(list));
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── List directory ──
  if (p === '/api/ls') {
    const dirPath = url.searchParams.get('path') || ALLOWED_ROOTS[0];
    return lsDir(dirPath, res);
  }

  // ── Read file ──
  if (p === '/api/read') {
    const filePath = url.searchParams.get('path');
    if (!filePath) {
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'path required'}));
      return;
    }
    const absPath = path.resolve(filePath);
    if (!isAllowed(absPath)) {
      res.writeHead(403, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'Forbidden'}));
      return;
    }
    fs.readFile(absPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'Not Found'}));
        return;
      }
      res.writeHead(200, {'Content-Type':'text/plain;charset=utf-8'});
      res.end(data);
    });
    return;
  }

  // ── Write file ──
  if (p === '/api/write') {
    const filePath = url.searchParams.get('path');
    if (!filePath) {
      res.writeHead(400, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error:'path required'}));
      return;
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const absPath = path.resolve(filePath);
      if (!isAllowed(absPath)) {
        res.writeHead(403, {'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'Forbidden'}));
        return;
      }
      // Ensure parent directory exists
      const dir = path.dirname(absPath);
      fs.mkdir(dir, { recursive: true }, () => {
        fs.writeFile(absPath, body, 'utf8', err => {
          if (err) {
            res.writeHead(500, {'Content-Type':'application/json'});
            res.end(JSON.stringify({error:'Write failed'}));
            return;
          }
          res.writeHead(200, {'Content-Type':'application/json'});
          res.end(JSON.stringify({ok: true, path: absPath}));
        });
      });
    });
    return;
  }

  // ── Unknown endpoint ──
  res.writeHead(404, {'Content-Type':'application/json'});
  res.end(JSON.stringify({error:'Not Found'}));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('File API server running on http://127.0.0.1:' + PORT);
  console.log('Allowed roots:', ALLOWED_ROOTS.join(', '));
});

// Graceful shutdown
process.on('SIGTERM', () => { server.close(); process.exit(0); });
process.on('SIGINT', () => { server.close(); process.exit(0); });
