const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const cats = await p.category.findMany({ where: { restaurantId: 'f9c2e101-fd84-499c-9790-264acd7f4b54' }, orderBy: { sortOrder: 'asc' } });

    const images = {
        'Kahvaltı': 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&h=400&fit=crop',
        'Çorbalar': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=400&fit=crop',
        'Salatalar': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop',
        'Başlangıçlar': 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&h=400&fit=crop',
        'Kebaplar': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=400&fit=crop',
        'Ana Yemekler': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
        'Pideler': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=400&fit=crop',
        'Izgara': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=400&fit=crop',
        'Tatlılar': 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&h=400&fit=crop',
        'İçecekler': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=800&h=400&fit=crop',
    };

    for (const cat of cats) {
        const img = images[cat.name];
        if (img) {
            await p.category.update({ where: { id: cat.id }, data: { image: img } });
            console.log('Updated:', cat.name);
        }
    }

    console.log('Done!');
    await p.$disconnect();
}

main().catch(console.error);
