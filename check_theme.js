const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.restaurant.findFirst({ select: { id: true, name: true, theme: true } })
  .then(r => {
    const t = r.theme || {};
    const keys = Object.keys(t);
    console.log('Restaurant:', r.name, '| ID:', r.id);
    console.log('Theme key sayisi:', keys.length);
    console.log('Keys:', keys.join(', '));
    // Show potentially problematic values
    console.log('\n--- Kritik değerler ---');
    ['pageBg','globalThemeBg','cardBg','menuHeaderBg','detailBg','searchOverlayBg','sidebarBg'].forEach(k => {
      console.log(k + ':', t[k] || '(yok)');
    });
    p.$disconnect();
  })
  .catch(e => { console.error(e.message); p.$disconnect(); });
