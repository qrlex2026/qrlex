const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
    const r = await p.restaurant.findFirst({ where: { slug: 'cafe-butor' }, select: { theme: true } });
    const t = r.theme;
    console.log('pageBg:', t.pageBg);
    console.log('globalThemeBg:', t.globalThemeBg);
    console.log('cardBg:', t.cardBg);
    console.log('productNameColor:', t.productNameColor);
    console.log('globalThemeText:', t.globalThemeText);
    await p.$disconnect();
}
main();
