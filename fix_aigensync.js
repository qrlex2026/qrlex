const fs = require('fs');
const f = 'app/panel/design/page.tsx';
let c = fs.readFileSync(f, 'utf8');

// Fix 1: In handleAiGenerate, after merge, force pageBg=globalThemeBg sync
const oldMerge = "const newTheme = { ...theme, ...data.theme };";
const newMerge = `const merged = { ...theme, ...data.theme };
            // Force pageBg ↔ globalThemeBg sync after AI generation
            if (merged.globalThemeBg && merged.globalThemeBg !== '#ffffff') {
                merged.pageBg = merged.globalThemeBg;
            } else if (merged.pageBg && merged.pageBg !== theme.pageBg) {
                merged.globalThemeBg = merged.pageBg;
            }
            const newTheme = merged;`;

if (c.includes(oldMerge)) {
    c = c.replace(oldMerge, newMerge);
    fs.writeFileSync(f, c, 'utf8');
    console.log('Done! handleAiGenerate sync added.');
} else {
    console.error('Target not found for handleAiGenerate!');
}
