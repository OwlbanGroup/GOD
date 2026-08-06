const fs = require('fs');
const path = require('path');
const np = 'C:/Users/bsean/Desktop/GOD/node_modules';
const out = [];
function exists(p){ return fs.existsSync(path.join(np, p)); }
out.push('object-assign: ' + (exists('object-assign') ? 'PRESENT' : 'MISSING'));
out.push('cors: ' + (exists('cors') ? 'PRESENT' : 'MISSING'));
['cors/lib/index.js','socket.io/dist/index.js'].forEach(f=>out.push(f+': '+(fs.existsSync(path.join(np,f))?'PRESENT':'MISSING')));
fs.writeFileSync('C:/Users/bsean/Desktop/GOD/check_missing_result.txt', out.join('\n'));
console.log('done');
