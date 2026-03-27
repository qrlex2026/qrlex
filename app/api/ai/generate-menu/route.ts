import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const maxDuration = 60;

const MENU_COST_PROMPT = 3;
const MENU_COST_IMAGE = 7; // increased: extraction + verification

const SYSTEM_PROMPT = `Sen bir restoran menüsü analiz uzmanısın. Görevin menüdeki HER TEK ÜRÜNü eksiksiz ve sıralı olarak çıkartmak.

KRİTİK OKUMA KURALLARI:
- Eğer menü ÇOKLU SÜTUN (sol/sağ) içeriyorsa, ÖNCELİKLE ilk sütunun tamamını oku, sonra ikinci sütuna geç.
- Sayfanın EN ALT kısmını KESİNLİKLE kontrol et — genelde "İçecekler", "Tatlılar" gibi küçük bölümler altta kalır.
- Eğer fotoğraf/taranmış görüntüde bulanık metin varsa, görünebildiğin kadarını oku — atla DEĞİL.
- Menü başlıkları, alt başlıklar, dekoratif yazılar ürün DEĞİLDİR — bunları dahil etme.
- Porsiyon/boyut varyantları (küçük/büyük) AYRI ürün olarak eklenmeli.

ÇIKARIM TÜRASIYLA:
1. Önce menüdeki tüm kategori başlıklarını tespit et
2. Sonra her kategori altındaki ürünleri sırasıyla listele
3. Eksik ürün olmadığından emin ol — menüde gördüğün her fiyatlı satır bir üründür

SADECE aşağıdaki JSON formatında çıktı ver:
{
  "categories": [
    {
      "name": "Kategori Adı",
      "products": [
        {
          "name": "Ürün Adı",
          "description": "Lezzetli ve iştah açıcı kısa açıklama (max 80 karakter, BOŞ BIRAKMA)",
          "price": 150
        }
      ]
    }
  ]
}

KESİN KURALLAR:
1. HİÇBİR ürünü atlama — menüdeki TÜM ürünleri ekle, hiçbir istisna yok
2. Açıklama ASLA boş bırakma — eğer menüde açıklama yoksa sen bir tane üret (malzeme, pişirme yöntemi, lezzet)
3. Fiyat görünmüyorsa veya okunamıyorsa makul bir TL fiyatı tahmin et
4. Kategori isimlerini menüdeki gibi kullan, yoksa mantıklı isim belirle
5. JSON dışında HİÇBİR şey yazma — markdown, açıklama, yorum yok
6. Ürünleri menüdeki SIRAYA göre ekle`;

type Product = { name: string; description: string; price: number };
type Category = { name: string; products: Product[] };
type MenuData = { categories: Category[] };

const RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        categories: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    products: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                name: { type: "STRING" },
                                description: { type: "STRING" },
                                price: { type: "NUMBER" },
                            },
                            required: ["name", "description", "price"],
                        },
                    },
                },
                required: ["name", "products"],
            },
        },
    },
    required: ["categories"],
};

async function processWithGemini(apiKey: string, parts: object[], useSchema = true): Promise<MenuData | null> {
    const genConfig: Record<string, unknown> = {
        temperature: 0.1,
        maxOutputTokens: 32768,
    };
    if (useSchema) {
        genConfig.responseMimeType = "application/json";
        genConfig.responseSchema = RESPONSE_SCHEMA;
    }

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: genConfig,
            }),
        }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // With schema mode, response is always JSON
    try {
        return JSON.parse(rawText);
    } catch {
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
        const jsonStr = (jsonMatch[1] || rawText).trim();
        try {
            return JSON.parse(jsonStr);
        } catch {
            const objMatch = rawText.match(/\{[\s\S]*\}/);
            if (objMatch) {
                try { return JSON.parse(objMatch[0]); } catch { return null; }
            }
            return null;
        }
    }
}

async function verifyExtraction(apiKey: string, original: MenuData, imageParts: object[]): Promise<MenuData> {
    const productCount = original.categories.reduce((a, c) => a + c.products.length, 0);
    const categoryNames = original.categories.map(c => `${c.name} (${c.products.length} ürün)`).join(", ");

    const verifyPrompt = `Önceki taramada bu menüden ${productCount} ürün ve ${original.categories.length} kategori çıkarıldı:
${categoryNames}

Menü görselini TEKRAR kontrol et. Atlanmış ürün var mı? Eksik kategori var mı?
Eğer her şey tamamsa AYNI veriyi döndür.
Eğer eksik varsa TÜM ürünleri (eski + yeni) dahil ederek KOMPLE listeyi döndür.

SADECE JSON formatında cevap ver, aynı schema:
{"categories": [{"name": "...", "products": [{"name": "...", "description": "...", "price": 0}]}]}`;

    const parts = [
        { text: verifyPrompt },
        ...imageParts,
    ];

    const verified = await processWithGemini(apiKey, parts, true);
    if (!verified || !verified.categories?.length) return original;

    // Use whichever has more products
    const verifiedCount = verified.categories.reduce((a, c) => a + c.products.length, 0);
    return verifiedCount >= productCount ? verified : original;
}

function mergeMenus(menus: MenuData[]): MenuData {
    const catMap = new Map<string, Product[]>();
    for (const menu of menus) {
        for (const cat of (menu.categories || [])) {
            const key = cat.name.trim().toLowerCase();
            const existing = catMap.get(key);
            if (existing) {
                const existingNames = new Set(existing.map(p => p.name.toLowerCase()));
                for (const p of cat.products || []) {
                    if (!existingNames.has(p.name.toLowerCase())) {
                        existing.push(p);
                        existingNames.add(p.name.toLowerCase());
                    }
                }
            } else {
                catMap.set(key, [...(cat.products || [])]);
            }
        }
    }
    const result: Category[] = [];
    const seenKeys = new Set<string>();
    for (const menu of menus) {
        for (const cat of (menu.categories || [])) {
            const key = cat.name.trim().toLowerCase();
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                result.push({ name: cat.name, products: catMap.get(key) || [] });
            }
        }
    }
    return { categories: result };
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";
        let restaurantId = "";
        let promptText = "";
        let files: Array<{ base64: string; mimeType: string }> = [];
        let mode: "prompt" | "image" = "prompt";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            restaurantId = formData.get("restaurantId") as string;
            promptText = (formData.get("prompt") as string) || "";
            mode = "image";

            const rawFiles = formData.getAll("files");
            for (const f of rawFiles) {
                if (f instanceof File) {
                    const bytes = await f.arrayBuffer();
                    files.push({
                        base64: Buffer.from(bytes).toString("base64"),
                        mimeType: f.type || "image/jpeg",
                    });
                }
            }
            if (files.length === 0) return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
        } else {
            const json = await req.json();
            restaurantId = json.restaurantId;
            promptText = json.prompt;
        }

        if (!restaurantId) return NextResponse.json({ error: "restaurantId gerekli" }, { status: 400 });

        const cost = mode === "image" ? Math.min(MENU_COST_IMAGE + (files.length - 1) * 2, 15) : MENU_COST_PROMPT;
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) return NextResponse.json({ error: "Gemini API key yapılandırılmamış" }, { status: 500 });

        let credit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
        if (!credit) credit = await (prisma as any).aiCredit.create({ data: { restaurantId, balance: 500 } });
        if (credit.balance < cost) return NextResponse.json({ error: "Yetersiz kredi", balance: credit.balance }, { status: 403 });

        let finalMenu: MenuData;

        if (mode === "image") {
            // Process each file separately
            const results: MenuData[] = [];
            const allImageParts: object[] = [];

            for (const file of files) {
                const imagePart = { inlineData: { mimeType: file.mimeType, data: file.base64 } };
                allImageParts.push(imagePart);
                const parts = [
                    { text: SYSTEM_PROMPT + (promptText ? `\n\nEk not: ${promptText}` : "") },
                    imagePart,
                ];
                const result = await processWithGemini(apiKey, parts);
                if (result) results.push(result);
            }

            if (results.length === 0) return NextResponse.json({ error: "Hiçbir dosyadan menü çıkarılamadı" }, { status: 500 });
            const merged = results.length === 1 ? results[0] : mergeMenus(results);

            // Verification pass — AI double-checks its own extraction
            finalMenu = await verifyExtraction(apiKey, merged, allImageParts);
        } else {
            const parts = [{
                text: SYSTEM_PROMPT + `\n\nKullanıcı isteği: "${promptText}"\n\nBu tarife göre eksiksiz bir restoran menüsü oluştur. Her kategoride en az 5 ürün olsun.`
            }];
            const result = await processWithGemini(apiKey, parts);
            if (!result) return NextResponse.json({ error: "Menü oluşturulamadı" }, { status: 500 });
            finalMenu = result;
        }

        if (!finalMenu.categories?.length) return NextResponse.json({ error: "Geçerli menü verisi bulunamadı" }, { status: 500 });

        // Deduct credits
        await prisma.$transaction([
            (prisma as any).aiCredit.update({
                where: { restaurantId },
                data: { balance: { decrement: cost } },
            }),
            (prisma as any).aiUsageLog.create({
                data: {
                    creditId: credit.id,
                    type: "menu_generate",
                    cost,
                    prompt: (promptText || `${files.length} dosya`).substring(0, 500),
                },
            }),
        ]);

        const updatedCredit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
        return NextResponse.json({
            success: true,
            menu: finalMenu,
            balance: updatedCredit?.balance ?? credit.balance - cost,
            cost,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
