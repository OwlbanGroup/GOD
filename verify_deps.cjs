const fs = require('fs');
const path = require('path');
const results = {};

function check(pkg) {
  try {
    require.resolve(pkg);
    results[pkg] = 'OK';
  } catch (e) {
    results[pkg] = 'MISSING';
  }
}

['cors', 'base64id', 'express', 'socket.io', 'ethers', 'web3'].forEach(check);

// Check package.json type:module
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
results['package.type'] = pkg.type || '(not set)';

console.log(JSON.stringify(results, null, 2));
