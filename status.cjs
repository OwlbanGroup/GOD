const fs = require('fs');
const path = require('path');
const http = require('http');
const lines = [];
const np = 'C:/Users/bsean/Desktop/GOD/node_modules';

lines.push('--- object-assign dir listing ---');
const oaDir = path.join(np, 'object-assign');
if (fs.existsSync(oaDir)) {
  lines.push('object-assign PRESENT');
  try { lines.push('package.json main: ' + JSON.parse(fs.readFileSync(path.join(oaDir,'package.json'),'utf-8')).main); } catch(e){ lines.push('no pkg: '+e.message); }
  try { require.resolve('object-assign'); lines.push('require.resolve object-assign: OK'); } catch(e){ lines.push('require.resolve object-assign: FAIL '+e.message); }
} else {
  lines.push('object-assign MISSING');
}

// Try to load the full server module chain
lines.push('--- test require socket.io ---');
try { require.resolve('socket.io'); lines.push('socket.io resolve OK'); } catch(e){ lines.push('socket.io resolve FAIL '+e.message); }
try { require('socket.io'); lines.push('socket.io require OK'); } catch(e){ lines.push('socket.io require FAIL '+e.message); }

// Try health endpoint
lines.push('--- health check ---');
const req = http.get('http://localhost:3000/health', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    lines.push('HTTP STATUS: ' + res.statusCode);
    lines.push('BODY: ' + body);
    fs.writeFileSync('C:/Users/bsean/Desktop/GOD/status_result.txt', lines.join('\n'));
    console.log('done');
  });
});
req.on('error', (e) => {
  lines.push('HEALTH ERROR: ' + e.message);
  fs.writeFileSync('C:/Users/bsean/Desktop/GOD/status_result.txt', lines.join('\n'));
  console.log('done');
});
req.setTimeout(4000, () => { req.destroy(); lines.push('HEALTH TIMEOUT'); fs.writeFileSync('C:/Users/bsean/Desktop/GOD/status_result.txt', lines.join('\n')); });
