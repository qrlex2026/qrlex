const fs = require('fs');
const f = 'app/panel/design/page.tsx';
let c = fs.readFileSync(f, 'utf8');

// Fix: Change merge from { ...theme, ...data.theme } to { ...DEFAULT_THEME, ...data.theme }
// But preserve user-selected header settings
const oldMerge = `const merged = { ...theme, ...data.theme };
            // Force pageBg ↔ globalThemeBg sync after AI generation
            if (merged.globalThemeBg && merged.globalThemeBg !== '#ffffff') {
                merged.pageBg = merged.globalThemeBg;
            } else if (merged.pageBg && merged.pageBg !== theme.pageBg) {
                merged.globalThemeBg = merged.pageBg;
            }
            const newTheme = merged;`;

const newMerge = `// Start from DEFAULT_THEME so no stale DB values persist
            const merged = {
                ...DEFAULT_THEME,
                ...data.theme,
                // Preserve user's header layout choice & logo
                headerVariant: theme.headerVariant,
                headerLogo: theme.headerLogo,
                showMenuButton: theme.showMenuButton,
                showSearchIcon: theme.showSearchIcon,
                fontFamily: data.theme.fontFamily || theme.fontFamily || DEFAULT_THEME.fontFamily,
            };
            // Ensure pageBg ↔ globalThemeBg stay in sync
            if (merged.globalThemeBg && merged.globalThemeBg !== DEFAULT_THEME.globalThemeBg) {
                merged.pageBg = merged.globalThemeBg;
            } else if (merged.pageBg && merged.pageBg !== DEFAULT_THEME.pageBg) {
                merged.globalThemeBg = merged.pageBg;
            }
            const newTheme = merged;`;

if (c.includes(oldMerge)) {
    c = c.replace(oldMerge, newMerge);
    fs.writeFileSync(f, c, 'utf8');
    console.log('✓ Step 1: handleAiGenerate merge strategy fixed');
} else {
    console.error('✗ Step 1: Target not found!');
    // Debug: show surrounding context
    const idx = c.indexOf('DEFAULT_THEME, ...data.theme');
    console.log('Already contains DEFAULT_THEME merge?', idx > 0);
    const idx2 = c.indexOf('...theme, ...data.theme');
    console.log('Old merge at char:', idx2);
}
