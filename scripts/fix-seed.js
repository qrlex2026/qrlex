const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const cafeButorId = 'f9c2e101-fd84-499c-9790-264acd7f4b54';

    // 1. Delete products & categories from Latte (wrong restaurant)
    const latteId = '1a08daa8-5ed6-4869-99fe-b68bc78a2e98';
    await p.product.deleteMany({ where: { restaurantId: latteId } });
    await p.category.deleteMany({ where: { restaurantId: latteId } });
    console.log('Cleaned Latte');

    // 2. Delete other restaurants (keep only cafe-butor)
    const othersToDelete = [
        '1a08daa8-5ed6-4869-99fe-b68bc78a2e98', // Latte
        '96da13b6-4879-4d09-95ba-5fb35dd688e9', // Resital
        'c001e7f8-06c9-41a2-b8ab-48af4dff3dc1', // Lezzette
        '2df8f71c-e9ad-4fdd-89d6-e6f89960b8b0', // Test
    ];
    for (const id of othersToDelete) {
        try {
            await p.restaurant.delete({ where: { id } });
            console.log('Deleted restaurant:', id);
        } catch (e) {
            console.log('Skip:', id, e.message?.substring(0, 50));
        }
    }

    // 3. Delete existing cafe-butor products & categories
    await p.product.deleteMany({ where: { restaurantId: cafeButorId } });
    await p.category.deleteMany({ where: { restaurantId: cafeButorId } });
    console.log('Cleaned cafe-butor');

    // 4. Create categories and products for cafe-butor
    const categories = [
        {
            name: "Kahvaltı", products: [
                { name: "Serpme Kahvaltı", description: "Zengin kahvaltı tabağı: peynir çeşitleri, zeytin, bal, kaymak, tereyağı, yumurta, sucuk ve taze ekmek", price: 320, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop" },
                { name: "Menemen", description: "Geleneksel Türk menemen: domates, biber ve yumurta ile hazırlanır, yanında taze ekmek", price: 120, image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&h=400&fit=crop" },
                { name: "Simit & Peynir Tabağı", description: "Çıtır simit, beyaz peynir, kaşar peyniri, domates ve salatalık", price: 95, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop" },
                { name: "Sucuklu Yumurta", description: "Pastırmalı veya sucuklu sahanda yumurta, yanında taze ekmek", price: 110, image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=400&fit=crop" },
                { name: "Pişi & Bal Kaymak", description: "Ev yapımı pişi, süzme bal ve Afyon kaymağı ile servis edilir", price: 85, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop" },
                { name: "Açma & Poğaça", description: "Taze fırından çıkmış açma ve peynirli poğaça, tereyağı ile", price: 75, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
            ]
        },
        {
            name: "Çorbalar", products: [
                { name: "Mercimek Çorbası", description: "Kırmızı mercimek, havuç ve baharatlarla hazırlanan geleneksel Türk çorbası", price: 65, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop" },
                { name: "Ezogelin Çorbası", description: "Bulgur, mercimek ve nane ile tatlandırılan klasik Türk çorbası", price: 65, image: "https://images.unsplash.com/photo-1603105037880-880cd4f76b6e?w=600&h=400&fit=crop" },
                { name: "İşkembe Çorbası", description: "Sarımsaklı, sirkeli ve limonlu geleneksel işkembe çorbası", price: 85, image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=600&h=400&fit=crop" },
                { name: "Tarhana Çorbası", description: "Ev yapımı tarhana ile hazırlanan besleyici ve lezzetli çorba", price: 60, image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&h=400&fit=crop" },
                { name: "Yayla Çorbası", description: "Yoğurt, pirinç ve nane ile yapılan hafif ve ferahlatıcı çorba", price: 60, image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=600&h=400&fit=crop" },
                { name: "Tavuk Suyu Çorbası", description: "Şehriyeli, sıcacık tavuk suyu çorba, limon ile servis edilir", price: 70, image: "https://images.unsplash.com/photo-1607301405390-d831c242f59b?w=600&h=400&fit=crop" },
            ]
        },
        {
            name: "Salatalar", products: [
                { name: "Çoban Salata", description: "Domates, salatalık, biber, soğan ve maydanoz ile hazırlanan taze salata", price: 75, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop" },
                { name: "Gavurdağı Salatası", description: "Cevizli, narlı ve nar ekşili geleneksel Gaziantep salatası", price: 85, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop" },
                { name: "Mevsim Salata", description: "Taze mevsim yeşillikleri, havuç, mısır ve zeytinyağlı sos", price: 70, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop" },
                { name: "Sezar Salata", description: "Marul, kruton, parmesan peyniri ve özel sezar sos ile", price: 110, image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=400&fit=crop" },
                { name: "Akdeniz Salata", description: "Roka, cherry domates, beyaz peynir ve zeytinyağı sos", price: 90, image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&h=400&fit=crop" },
                { name: "Yeşillik Tabağı", description: "Taze nane, roka, dereotu, maydanoz ve taze soğan", price: 45, image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop" },
            ]
        },
        {
            name: "Başlangıçlar", products: [
                { name: "Humus", description: "Nohut püresi, tahin, zeytinyağı ve kimyon ile servis edilir", price: 75, image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&h=400&fit=crop" },
                { name: "Babaganuş", description: "Közlenmiş patlıcan, tahin ve nar ekşisi ile hazırlanır", price: 80, image: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=600&h=400&fit=crop" },
                { name: "Sigara Böreği", description: "Çıtır yufka içinde beyaz peynir ve maydanoz, 6 adet", price: 90, image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=600&h=400&fit=crop" },
                { name: "İçli Köfte", description: "Bulgur hamuru içinde kıymalı, cevizli iç harç, 4 adet", price: 110, image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&h=400&fit=crop" },
                { name: "Patlıcan Kızartma", description: "Dilimlenmiş patlıcan, yoğurt ve sarımsaklı sos ile", price: 85, image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=600&h=400&fit=crop" },
                { name: "Acılı Ezme", description: "Biber, domates, soğan ve nar ekşisi ile hazırlanan acılı sos", price: 55, image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&h=400&fit=crop" },
            ]
        },
        {
            name: "Kebaplar", products: [
                { name: "Adana Kebap", description: "Acılı kuzu kıyma, meşe mangalda pişirilir. Lavaş, soğan ve közbiber ile", price: 220, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop", isPopular: true },
                { name: "Urfa Kebap", description: "Acısız kuzu kıyma kebabı, yanında pilav ve ızgara domates", price: 210, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
                { name: "İskender Kebap", description: "İnce döner dilimler, özel domates sosu, tereyağı ve yoğurt ile", price: 250, image: "https://images.unsplash.com/photo-1561651188-d207bbec4ec3?w=600&h=400&fit=crop", isPopular: true },
                { name: "Beyti Kebap", description: "Kıyma kebabı lavaşa sarılır, domates sosu ve yoğurt ile servis", price: 240, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop" },
                { name: "Tavuk Şiş", description: "Marine edilmiş tavuk göğsü parçaları, ızgara sebze ile", price: 180, image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop" },
                { name: "Kuzu Pirzola", description: "Meşe mangalda pişirilmiş kuzu pirzola, taze kekik ve tereyağı ile", price: 350, image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&h=400&fit=crop" },
            ]
        },
        {
            name: "Ana Yemekler", products: [
                { name: "Karnıyarık", description: "Patlıcan, kıyma, domates ve biberle yapılan geleneksel Türk yemeği", price: 160, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop" },
                { name: "Hünkâr Beğendi", description: "Kuzu kuşbaşı, patlıcan beşamel sos yatağı üzerinde servis edilir", price: 195, image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=400&fit=crop" },
                { name: "Mantı", description: "El açması mantı, sarımsaklı yoğurt ve tereyağlı sos ile", price: 145, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop" },
                { name: "İmam Bayıldı", description: "Zeytinyağlı patlıcan dolması, soğan ve domates ile", price: 130, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop" },
                { name: "Etli Güveç", description: "Kuzu eti, patates, biber ve domates ile toprak güveçte pişirilir", price: 190, image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop" },
                { name: "Yaprak Sarma", description: "Asma yaprağında pirinçli ve baharatlı iç, zeytinyağlı", price: 120, image: "https://images.unsplash.com/photo-1541518763169-27a8c3c89b65?w=600&h=400&fit=crop" },
            ]
        },
        {
            name: "Pideler", products: [
                { name: "Kuşbaşılı Pide", description: "Kuzu kuşbaşı, domates ve biber ile kapalı pide", price: 175, image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&h=400&fit=crop" },
                { name: "Karışık Pide", description: "Kuşbaşı, kaşar peyniri, domates ve biber karışık", price: 185, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" },
                { name: "Kaşarlı Pide", description: "Bol kaşar peynirli açık pide, tereyağı ile", price: 130, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop" },
                { name: "Sucuklu Pide", description: "Sucuk ve kaşar peyniri ile hazırlanan lezzetli pide", price: 150, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&h=400&fit=crop" },
                { name: "Kıymalı Pide", description: "Kıyma, soğan, domates ve biber ile açık pide", price: 145, image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop" },
                { name: "Yumurtalı Pide", description: "Kaşar peyniri ve yumurta ile açık pide", price: 125, image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop" },
            ]
        },
        {
            name: "Izgara", products: [
                { name: "Köfte Izgara", description: "El yapımı dana köfte, ızgara sebze ve pilav ile servis", price: 165, image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop" },
                { name: "Tavuk Kanat", description: "Baharatlı marine tavuk kanatları, özel sos eşliğinde", price: 140, image: "https://images.unsplash.com/photo-1527477396000-e27163b4bcd1?w=600&h=400&fit=crop" },
                { name: "Karışık Izgara", description: "Köfte, tavuk şiş, kuzu pirzola ve Adana kebap bir arada", price: 310, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop", isPopular: true },
                { name: "Ciğer Şiş", description: "Marine edilmiş kuzu ciğer, soğan ve maydanoz ile", price: 130, image: "https://images.unsplash.com/photo-1432139509613-5c4255a1d197?w=600&h=400&fit=crop" },
                { name: "Kaburga", description: "Uzun süre marine edilmiş ve yavaş pişirilmiş dana kaburga", price: 290, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
                { name: "Biftek", description: "250gr dana bonfile, tereyağı ve taze biberiye ile ızgara", price: 380, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop" },
            ]
        },
        {
            name: "Tatlılar", products: [
                { name: "Künefe", description: "Hatay usulü tel kadayıf, peynir ve şerbet ile sıcak servis", price: 130, image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&h=400&fit=crop", isPopular: true },
                { name: "Baklava", description: "Antep fıstıklı el açması baklava, 4 dilim", price: 150, image: "https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=600&h=400&fit=crop" },
                { name: "Sütlaç", description: "Fırında kızarmış geleneksel sütlaç, tarçın ile", price: 75, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop" },
                { name: "Kazandibi", description: "Altı karamelize edilmiş muhallebi tatlısı", price: 80, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop" },
                { name: "Revani", description: "İrmik tatlısı, şerbet ve kaymak ile servis edilir", price: 85, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop" },
                { name: "Aşure", description: "Buğday, nohut, kuru meyve ve ceviz ile hazırlanan geleneksel tatlı", price: 70, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop" },
            ]
        },
        {
            name: "İçecekler", products: [
                { name: "Türk Çayı", description: "İnce belli bardakta demlenmiş geleneksel Türk çayı", price: 25, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&h=400&fit=crop" },
                { name: "Türk Kahvesi", description: "Geleneksel usulde cezvede pişirilen köpüklü Türk kahvesi", price: 50, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=600&h=400&fit=crop" },
                { name: "Ayran", description: "Ev yapımı köpüklü ayran, soğuk servis", price: 30, image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=400&fit=crop" },
                { name: "Taze Sıkılmış Portakal", description: "Günlük taze sıkılmış portakal suyu", price: 55, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=400&fit=crop" },
                { name: "Limonata", description: "Ev yapımı naneli limonata, buz gibi soğuk servis", price: 45, image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&h=400&fit=crop" },
                { name: "Salep", description: "Sıcak salep, tarçın ve hindistan cevizi ile süslenir", price: 55, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=400&fit=crop" },
            ]
        },
    ];

    let catOrder = 0;
    for (const cat of categories) {
        catOrder++;
        const category = await p.category.create({
            data: { name: cat.name, restaurantId: cafeButorId, sortOrder: catOrder }
        });
        console.log('Created:', cat.name);

        let prodOrder = 0;
        for (const prod of cat.products) {
            prodOrder++;
            await p.product.create({
                data: {
                    name: prod.name,
                    description: prod.description,
                    price: prod.price,
                    image: prod.image,
                    categoryId: category.id,
                    restaurantId: cafeButorId,
                    sortOrder: prodOrder,
                    isPopular: prod.isPopular || false,
                }
            });
        }
    }

    console.log('\nDone! 10 categories, 60 products for cafe-butor');
    await p.$disconnect();
}

main().catch(console.error);
