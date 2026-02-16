import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create restaurant
    const restaurant = await prisma.restaurant.upsert({
        where: { slug: "demo-restaurant" },
        update: {},
        create: {
            name: "Resital Lounge",
            slug: "demo-restaurant",
            description: "Modern ve şık atmosferiyle Resital Lounge, taze malzemeler ve özenle hazırlanan tariflerle unutulmaz bir yemek deneyimi sunuyor.",
            address: "Atatürk Mah. Cumhuriyet Cad. No:42, Gebze / Kocaeli",
            phone: "+90 262 555 00 42",
            email: "info@resitallounge.com",
            website: "www.resitallounge.com",
            instagram: "@resitallounge",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
            workingHours: [
                { day: "Pazartesi", open: "11:00", close: "23:00", isOpen: true },
                { day: "Salı", open: "11:00", close: "23:00", isOpen: true },
                { day: "Çarşamba", open: "11:00", close: "23:00", isOpen: true },
                { day: "Perşembe", open: "11:00", close: "23:00", isOpen: true },
                { day: "Cuma", open: "11:00", close: "00:00", isOpen: true },
                { day: "Cumartesi", open: "10:00", close: "00:00", isOpen: true },
                { day: "Pazar", open: "10:00", close: "23:00", isOpen: true },
            ],
        },
    });
    console.log(`✅ Restaurant created: ${restaurant.name}`);

    // Create categories
    const categoryData = [
        { name: "Burgerler", sortOrder: 1 },
        { name: "Pizzalar", sortOrder: 2 },
        { name: "Salatalar", sortOrder: 3 },
        { name: "Başlangıçlar", sortOrder: 4 },
        { name: "İçecekler", sortOrder: 5 },
        { name: "Tatlılar", sortOrder: 6 },
    ];

    const categories: Record<string, string> = {};
    for (const cat of categoryData) {
        const created = await prisma.category.create({
            data: { ...cat, restaurantId: restaurant.id },
        });
        categories[cat.name] = created.id;
        console.log(`  ✅ Category: ${cat.name}`);
    }

    // Create products
    const products = [
        // Burgerler
        { categoryName: "Burgerler", name: "Classic Cheese", description: "120g dana köfte, cheddar peyniri, özel sos, turşu, karamelize soğan, domates.", price: 320, discountPrice: 280, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600", prepTime: "15-20 dk", calories: "650 kcal", isPopular: true },
        { categoryName: "Burgerler", name: "Truffle Mushroom", description: "Trüf mantarlı mayonez, karamelize soğan, swiss peyniri, roka.", price: 380, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600", prepTime: "20-25 dk", calories: "720 kcal", isPopular: true },
        { categoryName: "Burgerler", name: "BBQ Bacon", description: "Dana bacon, BBQ sos, çıtır soğan halkaları, cheddar.", price: 360, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600", prepTime: "18-22 dk", calories: "780 kcal", isPopular: false },
        // Pizzalar
        { categoryName: "Pizzalar", name: "Margherita", description: "San Marzano domates sosu, mozzarella, taze fesleğen.", price: 290, discountPrice: 250, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600", prepTime: "12-15 dk", calories: "520 kcal", isPopular: true },
        { categoryName: "Pizzalar", name: "Pepperoni", description: "Baharatlı sucuk dilimleri, mozzarella, domates sosu.", price: 330, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600", prepTime: "12-15 dk", calories: "580 kcal", isPopular: true },
        { categoryName: "Pizzalar", name: "Dört Peynirli", description: "Mozzarella, gorgonzola, parmesan, ricotta.", price: 350, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600", prepTime: "12-15 dk", calories: "620 kcal", isPopular: false },
        // Salatalar
        { categoryName: "Salatalar", name: "Sezar Salata", description: "Marul, parmesan, kruton, sezar sos.", price: 180, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600", prepTime: "8-10 dk", calories: "320 kcal", isPopular: false },
        { categoryName: "Salatalar", name: "Akdeniz Salatası", description: "Domates, salatalık, zeytin, beyaz peynir, zeytinyağı.", price: 160, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600", prepTime: "5-8 dk", calories: "220 kcal", isPopular: true },
        // Başlangıçlar
        { categoryName: "Başlangıçlar", name: "Çıtır Soğan Halkaları", description: "Özel baharatlı, ranch sos ile.", price: 120, image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600", prepTime: "8-10 dk", calories: "380 kcal", isPopular: false },
        { categoryName: "Başlangıçlar", name: "Kanat Tabağı", description: "8 adet acı soslu tavuk kanat.", price: 200, image: "https://images.unsplash.com/photo-1608039829572-9c8ee7b7f2ae?w=600", prepTime: "15-20 dk", calories: "520 kcal", isPopular: true },
        // İçecekler
        { categoryName: "İçecekler", name: "Coca-Cola Zero", description: "330ml kutu.", price: 60, image: null, prepTime: "1 dk", calories: "0 kcal", isPopular: false },
        { categoryName: "İçecekler", name: "Ev Yapımı Limonata", description: "Taze sıkılmış limon, nane ile.", price: 80, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600", prepTime: "3-5 dk", calories: "120 kcal", isPopular: true },
        { categoryName: "İçecekler", name: "Ayran", description: "300ml şişe, bol köpüklü.", price: 40, image: null, prepTime: "1 dk", calories: "75 kcal", isPopular: false },
        // Tatlılar
        { categoryName: "Tatlılar", name: "San Sebastian Cheesecake", description: "Belçika çikolatalı sos ile.", price: 240, discountPrice: 200, image: "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=600", prepTime: "5 dk", calories: "450 kcal", isPopular: true },
        { categoryName: "Tatlılar", name: "Çikolatalı Sufle", description: "İçi akışkan, yanında dondurma ile.", price: 250, image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600", prepTime: "15-18 dk", calories: "480 kcal", isPopular: false },
    ];

    for (let i = 0; i < products.length; i++) {
        const { categoryName, ...productData } = products[i];
        await prisma.product.create({
            data: {
                ...productData,
                price: productData.price,
                discountPrice: productData.discountPrice || null,
                image: productData.image || null,
                restaurantId: restaurant.id,
                categoryId: categories[categoryName],
                sortOrder: i,
            },
        });
        console.log(`  ✅ Product: ${productData.name}`);
    }

    // Create reviews
    const reviews = [
        { authorName: "Ahmet Y.", rating: 5, comment: "Truffle Mushroom burger gerçekten müthişti! Trüf sosunun yoğunluğu kusursuzdu.", helpfulCount: 12 },
        { authorName: "Elif K.", rating: 5, comment: "Ambiyans çok başarılı, personel çok ilgili. San Sebastian cheesecake hayatımda yediğim en iyisiydi!", helpfulCount: 8 },
        { authorName: "Mehmet A.", rating: 4, comment: "Yemekler lezzetli, fiyatlar biraz yüksek ama kalite göz önüne alındığında makul.", helpfulCount: 5 },
        { authorName: "Zeynep D.", rating: 5, comment: "Arkadaşlarla mükemmel bir akşam geçirdik. Ev yapımı limonata şiddetle tavsiye ederim!", helpfulCount: 15 },
        { authorName: "Can B.", rating: 4, comment: "Burgerler çok iyi, özellikle BBQ Bacon. Servis biraz yavaştı ama yoğun saatlerdeydi.", helpfulCount: 3 },
        { authorName: "Seda T.", rating: 3, comment: "Yemekler güzeldi fakat bekleme süresi uzundu. Mekan olarak çok şık.", helpfulCount: 2 },
    ];

    for (const review of reviews) {
        await prisma.review.create({
            data: { ...review, restaurantId: restaurant.id },
        });
        console.log(`  ✅ Review: ${review.authorName}`);
    }

    console.log("\n🎉 Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
