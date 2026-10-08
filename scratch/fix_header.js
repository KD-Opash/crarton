const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/layout/Header.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace white with cream so it flips in light mode
content = content.replace(/text-white/g, 'text-cream');
content = content.replace(/border-white\/([0-9]+)/g, 'border-cream/$1');
content = content.replace(/text-white\/([0-9]+)/g, 'text-cream/$1');
content = content.replace(/bg-white\/([0-9]+)/g, 'bg-cream/$1');

// Font sizes
content = content.replace(/text-\[9px\]/g, 'text-[10px]');
content = content.replace(/text-\[10px\]/g, 'text-[11px]');

fs.writeFileSync(filePath, content);
console.log('Fixed Header.tsx');
