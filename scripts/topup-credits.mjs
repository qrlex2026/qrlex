import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    // List all restaurants
    const restaurants = await prisma.restaurant.findMany({ select: { id: true, name: true } });
    console.log("Restaurants:", JSON.stringify(restaurants, null, 2));

    // Update all aiCredit records to 3000
    const updated = await prisma.aiCredit.updateMany({
        data: { balance: 3000 },
    });
    console.log(`Updated ${updated.count} credit record(s) to 3000.`);

    // Also make sure every restaurant has a credit record
    for (const r of restaurants) {
        await prisma.aiCredit.upsert({
            where: { restaurantId: r.id },
            update: { balance: 3000 },
            create: { restaurantId: r.id, balance: 3000 },
        });
        console.log(`  ✓ ${r.name} (${r.id}) → 3000 kredi`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
