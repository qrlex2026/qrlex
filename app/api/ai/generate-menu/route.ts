import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const maxDuration = 60;

const MENU_COST_PROMPT = 3;
const MENU_COST_IMAGE = 5;

const SYSTEM_PROMPT = `Sen bir restoran menüsü analiz uzmanısın. Görevi menüdeki HER ÜRÜNÜ eksiksiz çıkartmak.

SADECE aşağıdaki JSON formatında çıktı ver, başka hiçbir şey yazma:
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
1. HİÇBİR ürünü atlama — menüdeki TÜM ürünleri ekle
2. Açıklama ASLA boş bırakma — eğer menüde açıklama yoksa sen bir tane üret (malzeme, pişirme yöntemi, lezzet)
3. Fiyat görünmüyorsa veya okunamıyorsa makul bir rakam tahmin et (Türk Lirası)
4. Kategori isimlerini menüdeki gibi kullan, yoksa mantıklı isim belirle
5. JSON dışında HİÇBİR şey yazma — markdown, açıklama, yorum yok`;

type Product = { name: string; description: string; price: number };
type Category = { name: string; products: Product[] };
type MenuData = { categories: Category[] };

async function processWithGemini(apiKey: string, parts: object[]): Promise<MenuData | null> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
            }),
        }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
    const jsonStr = (jsonMatch[1] || rawText).trim();
    try {
        return JSON.parse(jsonStr);
    } catch {
        // Try to extract JSON object directly
        const objMatch = rawText.match(/\{[\s\S]*\}/);
        if (objMatch) {
            try { return JSON.parse(objMatch[0]); } catch { return null; }
        }
        return null;
    }
}

function mergeMenus(menus: MenuData[]): MenuData {
    const catMap = new Map<string, Product[]>();
    for (const menu of menus) {
        for (const cat of (menu.categories || [])) {
            const key = cat.name.trim().toLowerCase();
            const existing = catMap.get(key);
            if (existing) {
                // Merge products, avoid duplicates by name
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
    // Rebuild categories preserving original casing from first occurrence
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
            for (const file of files) {
                const parts = [
                    { text: SYSTEM_PROMPT + (promptText ? `\n\nEk not: ${promptText}` : "") },
                    { inlineData: { mimeType: file.mimeType, data: file.base64 } },
                ];
                const result = await processWithGemini(apiKey, parts);
                if (result) results.push(result);
            }
            if (results.length === 0) return NextResponse.json({ error: "Hiçbir dosyadan menü çıkarılamadı" }, { status: 500 });
            finalMenu = results.length === 1 ? results[0] : mergeMenus(results);
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
