const fs = require('fs');
const f = 'app/panel/design/page.tsx';
let c = fs.readFileSync(f, 'utf8');

// Find the updateTheme globalThemeBg block and insert pageBg sync before it
const target = "if (key === 'globalThemeBg') {";
const insert = "if (key === 'pageBg') { next.globalThemeBg = value; }\n            ";

if (c.includes(target)) {
    c = c.replace(target, insert + target);
    fs.writeFileSync(f, c, 'utf8');
    console.log('Done! pageBg sync added.');
} else {
    console.error('Target not found!');
    // Show nearby code
    const idx = c.indexOf('globalThemeBg');
    console.log('globalThemeBg at:', idx, c.substring(idx-5, idx+50));
}
