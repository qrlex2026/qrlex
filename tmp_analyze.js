const fs = require('fs');
const c = fs.readFileSync('app/panel/design/page.tsx', 'utf-8');
const lines = c.split('\n');
lines.forEach((l, i) => {
    const n = i + 1;
    const t = l.trim();
    if (
        t.startsWith('<Section title=') ||
        t.startsWith('<div className="bg-[#0c0c0c]') ||
        t.includes('Scrollable sections') ||
        t.includes('Phone frame') ||
        t.includes('</div>') && n > 1325
    ) {
        console.log(n + ': ' + t.substring(0, 100));
    }
});
