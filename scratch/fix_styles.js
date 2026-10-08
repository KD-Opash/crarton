const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix gradients
// bg-[radial-gradient(ellipse_at_center,transparent_0%,#050605_100%)] -> bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-ink)_100%)]
content = content.replace(/#050605/g, 'var(--color-ink)');
content = content.replace(/#03050a/g, 'var(--color-ink)');

// The dotted grid: rgba(255,255,255,0.02) -> var(--color-line)
content = content.replace(/rgba\(255,255,255,0.02\)/g, 'var(--color-line)');
content = content.replace(/rgba\(255,255,255,0.03\)/g, 'var(--color-line)');

// The text-white/5 -> we replaced with text-cream/5. Let's make faint opacities more visible
content = content.replace(/text-cream\/30/g, 'text-cream/50');
content = content.replace(/text-cream\/40/g, 'text-cream/60');
content = content.replace(/text-cream\/50/g, 'text-cream/70');

// Small fonts: text-[9px] -> text-[10px], text-[10px] -> text-[11px]
// Actually, using tailwind classes text-xs is better, but let's just increase the hardcoded px values a bit
content = content.replace(/text-\[9px\]/g, 'text-[10px]');
content = content.replace(/text-\[10px\]/g, 'text-[11px]');

fs.writeFileSync(filePath, content);
console.log('Fixed page.tsx');
