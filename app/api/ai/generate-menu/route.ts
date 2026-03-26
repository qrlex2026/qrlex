import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const maxDuration = 60;

const MENU_COST_PROMPT = 3;
const MENU_COST_IMAGE = 5;

const SYSTEM_PROMPT = `Sen bir restoran menüsü analiz uzmanısın. Verilen menü görselinden veya tarife göre JSON formatında menü oluşturuyorsun.

SADECE aşağıdaki JSON formatında çıktı ver, başka şey YAZMA:
{
  "categories": [
    {
      "name": "Kategori Adı",
      "products": [
        {
          "name": "Ürün Adı",
          "description": "Kısa iştah açıcı açıklama (max 80 karakter)",
          "price": 150
        }
      ]
    }
  ]
}

KURALLAR:
- Kategori sayısı: 3-8 arası
- Her kategoride: 3-10 ürün
- Fiyatlar: Türk Lirası, sadece sayı (₺ işareti olmadan)
- Açıklamalar: Türkçe, kısa ve iştah açıcı
- Eğer görsel varsa: fiyatları görseldeki gibi oku, yoksa mantıklı fiyat tahmin et
- Sadece JSON döndür, açıklama YAZMA`;

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";
        let mode: "prompt" | "image";
        let promptText = "";
        let imageBase64 = "";
        let imageMimeType = "image/jpeg";
        let restaurantId = "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            restaurantId = formData.get("restaurantId") as string;
            const file = formData.get("file") as File | null;
            const extraPrompt = (formData.get("prompt") as string) || "";
            mode = "image";

            if (!file) return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });

            const bytes = await file.arrayBuffer();
            imageBase64 = Buffer.from(bytes).toString("base64");
            imageMimeType = file.type || "image/jpeg";
            promptText = extraPrompt || "Bu menü görselindeki tüm kategori ve ürünleri çıkar.";
        } else {
            const json = await req.json();
            restaurantId = json.restaurantId;
            promptText = json.prompt;
            mode = "prompt";
        }

        if (!restaurantId) return NextResponse.json({ error: "restaurantId gerekli" }, { status: 400 });

        const cost = mode === "image" ? MENU_COST_IMAGE : MENU_COST_PROMPT;
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) return NextResponse.json({ error: "Gemini API key yapılandırılmamış" }, { status: 500 });

        // Kredi kontrolü
        let credit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
        if (!credit) credit = await (prisma as any).aiCredit.create({ data: { restaurantId, balance: 500 } });
        if (credit.balance < cost) return NextResponse.json({ error: "Yetersiz kredi", balance: credit.balance }, { status: 403 });

        // Build Gemini request
        let parts: object[];
        if (mode === "image") {
            parts = [
                { text: SYSTEM_PROMPT + "\n\nKullanıcı notu: " + promptText },
                { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
            ];
        } else {
            parts = [
                {
                    text: SYSTEM_PROMPT + `\n\nKullanıcı isteği: "${promptText}"\n\nBu tarife göre tam bir restoran menüsü oluştur.`
                }
            ];
        }

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: { temperature: 0.7 },
                }),
            }
        );

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            return NextResponse.json({ error: "Gemini API hatası: " + errText }, { status: 500 });
        }

        const geminiData = await geminiRes.json();
        const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Parse JSON from response
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
        const jsonStr = (jsonMatch[1] || rawText).trim();

        let menuData: { categories: Array<{ name: string; products: Array<{ name: string; description: string; price: number }> }> };
        try {
            menuData = JSON.parse(jsonStr);
        } catch {
            return NextResponse.json({ error: "AI yanıtı geçersiz JSON", raw: rawText }, { status: 500 });
        }

        if (!menuData.categories?.length) {
            return NextResponse.json({ error: "Menü oluşturulamadı", raw: rawText }, { status: 500 });
        }

        // Kredi düş
        await prisma.$transaction([
            (prisma as any).aiCredit.update({
                where: { restaurantId },
                data: { balance: { decrement: cost } },
            }),
            (prisma as any).aiUsageLog.create({
                data: { creditId: credit.id, type: "menu_generate", cost, prompt: promptText.substring(0, 500) },
            }),
        ]);

        const updatedCredit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });

        return NextResponse.json({
            success: true,
            menu: menuData,
            balance: updatedCredit?.balance ?? credit.balance - cost,
            cost,
        });
    } catch (error: unknown) {
        console.error("AI menü üretim hatası:", error);
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
