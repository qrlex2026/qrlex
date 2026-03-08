const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const rs = await p.restaurant.findMany();
    rs.forEach(r => console.log(r.id, '|', r.slug, '|', r.name));
    console.log('Total:', rs.length);
    await p.$disconnect();
}
main();
