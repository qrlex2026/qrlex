import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Get the first restaurant
    const restaurant = await prisma.restaurant.findFirst();

    // Create Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { phone: "5551234567" },
        update: {},
        create: {
            phone: "5551234567",
            password: "admin123",
            name: "Super Admin",
            role: "superadmin",
            restaurantId: null,
        },
    });
    console.log("Super Admin created:", superAdmin.phone);

    // Create Demo Restaurant Owner
    if (restaurant) {
        const owner = await prisma.user.upsert({
            where: { phone: "5559876543" },
            update: {},
            create: {
                phone: "5559876543",
                password: "owner123",
                name: "Resital Lounge Yöneticisi",
                role: "owner",
                restaurantId: restaurant.id,
            },
        });
        console.log("Owner created:", owner.phone, "→", restaurant.name);
    }

    console.log("\n--- Login Bilgileri ---");
    console.log("Super Admin:  0555 123 45 67  /  admin123");
    console.log("Restoran:     0555 987 65 43  /  owner123");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
