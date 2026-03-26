import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        select: { name: true, image: true },
        take: 10,
    });
    console.log('=== ÜRÜN RESİMLERİ ===');
    products.forEach(p => console.log(`${p.name}: ${p.image || '(boş)'}`));

    const restaurants = await prisma.restaurant.findMany({
        select: { name: true, image: true },
        take: 5,
    });
    console.log('\n=== RESTORAN RESİMLERİ ===');
    restaurants.forEach(r => console.log(`${r.name}: ${r.image || '(boş)'}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
