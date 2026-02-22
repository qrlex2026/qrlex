import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Resital restoranını bul
    let restaurant = await prisma.restaurant.findFirst({ where: { name: { contains: "esital" } } });
    if (!restaurant) {
        const all = await prisma.restaurant.findMany({ select: { id: true, name: true } });
        console.log("Restoranlar:", all.map(r => r.name).join(", "));
        restaurant = all[0] ? await prisma.restaurant.findFirst({ where: { id: all[0].id } }) : null;
    }
    if (!restaurant) {
        console.error("Restoran bulunamadı!");
        return;
    }

    console.log(`Restoran: ${restaurant.name} (${restaurant.id})`);

    // Önce mevcut ürünleri ve kategorileri temizle
    await prisma.product.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.category.deleteMany({ where: { restaurantId: restaurant.id } });
    console.log("Mevcut kategoriler ve ürünler temizlendi.");

    // 6 Kategori oluştur
    const categories = await Promise.all([
        prisma.category.create({ data: { restaurantId: restaurant.id, name: "Başlangıçlar", sortOrder: 1 } }),
        prisma.category.create({ data: { restaurantId: restaurant.id, name: "Ana Yemekler", sortOrder: 2 } }),
        prisma.category.create({ data: { restaurantId: restaurant.id, name: "Pizzalar", sortOrder: 3 } }),
        prisma.category.create({ data: { restaurantId: restaurant.id, name: "Burgerler", sortOrder: 4 } }),
        prisma.category.create({ data: { restaurantId: restaurant.id, name: "Tatlılar", sortOrder: 5 } }),
        prisma.category.create({ data: { restaurantId: restaurant.id, name: "İçecekler", sortOrder: 6 } }),
    ]);

    console.log(`${categories.length} kategori oluşturuldu.`);

    const products = [
        // Başlangıçlar
        { cat: 0, name: "Mercimek Çorbası", desc: "Geleneksel Türk mercimek çorbası, limon ve ekmek ile", price: 85, prep: "10 dk", cal: "180 kcal", popular: true },
        { cat: 0, name: "Humus Tabağı", desc: "Nohut püresi, zeytinyağı, pul biber ve taze ekmek", price: 95, prep: "5 dk", cal: "220 kcal", popular: false },
        { cat: 0, name: "Sigara Böreği", desc: "Çıtır yufka içinde beyaz peynir, 4 adet", price: 110, prep: "12 dk", cal: "320 kcal", popular: true },
        { cat: 0, name: "Patlıcan Salatası", desc: "Közlenmiş patlıcan, domates, biber ve sarımsak", price: 90, prep: "8 dk", cal: "150 kcal", popular: false },
        { cat: 0, name: "Karışık Meze", desc: "Haydari, acılı ezme, atom, cacık - 4'lü tabak", price: 145, prep: "7 dk", cal: "280 kcal", popular: false },

        // Ana Yemekler
        { cat: 1, name: "Izgara Köfte", desc: "El yapımı dana köfte, pilav, közlenmiş biber ve domates ile", price: 220, prep: "20 dk", cal: "580 kcal", popular: true },
        { cat: 1, name: "Tavuk Şiş", desc: "Marine edilmiş tavuk göğsü, özel baharatlarla ızgara", price: 195, prep: "18 dk", cal: "420 kcal", popular: false },
        { cat: 1, name: "Kuzu Pirzola", desc: "Özel marine, fırın patates ve mevsim salata ile", price: 350, prep: "25 dk", cal: "650 kcal", popular: true },
        { cat: 1, name: "Levrek Izgara", desc: "Taze levrek fileto, roka salata ve limon sos", price: 280, prep: "22 dk", cal: "380 kcal", popular: false },
        { cat: 1, name: "Mantı", desc: "El açması mantı, yoğurt, sarımsaklı tereyağı ve pul biber", price: 175, prep: "15 dk", cal: "450 kcal", popular: true },

        // Pizzalar
        { cat: 2, name: "Margarita Pizza", desc: "Domates sos, mozzarella, fesleğen yaprakları", price: 165, prep: "15 dk", cal: "720 kcal", popular: false },
        { cat: 2, name: "Karışık Pizza", desc: "Sucuk, sosis, mantar, biber, mısır, zeytin", price: 210, prep: "18 dk", cal: "880 kcal", popular: true },
        { cat: 2, name: "Pepperoni Pizza", desc: "Bol pepperoni, mozzarella ve parmesan", price: 195, prep: "15 dk", cal: "820 kcal", popular: false },
        { cat: 2, name: "Ton Balıklı Pizza", desc: "Ton balığı, soğan, mısır ve özel sos", price: 200, prep: "15 dk", cal: "760 kcal", popular: false },
        { cat: 2, name: "Dörtlü Peynir Pizza", desc: "Mozzarella, cheddar, parmesan, rokfor", price: 220, prep: "15 dk", cal: "900 kcal", popular: true },

        // Burgerler
        { cat: 3, name: "Klasik Burger", desc: "200gr dana köfte, cheddar, marul, domates, turşu", price: 185, prep: "12 dk", cal: "680 kcal", popular: true },
        { cat: 3, name: "Tavuk Burger", desc: "Çıtır tavuk fileto, ranch sos, coleslaw", price: 165, prep: "12 dk", cal: "550 kcal", popular: false },
        { cat: 3, name: "Double Smash Burger", desc: "2x120gr smash köfte, amerikan peynir, karamelize soğan", price: 235, prep: "14 dk", cal: "850 kcal", popular: true },
        { cat: 3, name: "BBQ Burger", desc: "Dana köfte, BBQ sos, bacon, cheddar, soğan halkası", price: 215, prep: "14 dk", cal: "780 kcal", popular: false },
        { cat: 3, name: "Vegan Burger", desc: "Nohut-kinoa köfte, avokado, taze sebzeler", price: 175, prep: "12 dk", cal: "420 kcal", popular: false },

        // Tatlılar
        { cat: 4, name: "Künefe", desc: "Hatay usulü, fıstıklı, dondurma ile servis", price: 135, prep: "12 dk", cal: "480 kcal", popular: true },
        { cat: 4, name: "Cheesecake", desc: "New York usulü, çilek sos ile", price: 120, prep: "5 dk", cal: "350 kcal", popular: false },
        { cat: 4, name: "Sütlaç", desc: "Fırında pişmiş geleneksel sütlaç", price: 85, prep: "5 dk", cal: "280 kcal", popular: false },
        { cat: 4, name: "Tiramisu", desc: "İtalyan usulü, espresso ve mascarpone", price: 130, prep: "5 dk", cal: "420 kcal", popular: true },
        { cat: 4, name: "Brownie", desc: "Sıcak çikolatalı brownie, vanilyalı dondurma", price: 115, prep: "8 dk", cal: "520 kcal", popular: false },

        // İçecekler
        { cat: 5, name: "Türk Kahvesi", desc: "Geleneksel Türk kahvesi, lokum ile", price: 55, prep: "5 dk", cal: "20 kcal", popular: true },
        { cat: 5, name: "Taze Limonata", desc: "Ev yapımı nane limonata", price: 65, prep: "3 dk", cal: "90 kcal", popular: true },
        { cat: 5, name: "Americano", desc: "Çift shot espresso, sıcak su", price: 70, prep: "3 dk", cal: "10 kcal", popular: false },
        { cat: 5, name: "Ayran", desc: "Ev yapımı köpüklü ayran", price: 35, prep: "2 dk", cal: "60 kcal", popular: false },
        { cat: 5, name: "Smoothie Bowl", desc: "Muz, çilek, yaban mersini, granola ve bal", price: 95, prep: "5 dk", cal: "280 kcal", popular: false },
    ];

    let count = 0;
    for (const p of products) {
        await prisma.product.create({
            data: {
                restaurantId: restaurant.id,
                categoryId: categories[p.cat].id,
                name: p.name,
                description: p.desc,
                price: p.price,
                prepTime: p.prep,
                calories: p.cal,
                isPopular: p.popular,
                sortOrder: count % 5,
            },
        });
        count++;
    }

    console.log(`${count} ürün oluşturuldu.`);
    console.log("\n✅ Seed tamamlandı!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
