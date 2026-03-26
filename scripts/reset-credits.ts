import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Tüm sıfır veya düşük kredit bakiyelerini 500'e yükselt
    const result = await (prisma as any).aiCredit.updateMany({
        data: { balance: 500 },
    });
    console.log(`✅ ${result.count} kayıt güncellendi — bakiye 500 yapıldı.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
