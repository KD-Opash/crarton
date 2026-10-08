const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace WebkitTextStroke white color with var(--color-line-dark)
content = content.replace(/rgba\(255,255,255,0.15\)/g, 'var(--color-line-dark)');

fs.writeFileSync(filePath, content);
console.log('Fixed WebkitTextStroke');
