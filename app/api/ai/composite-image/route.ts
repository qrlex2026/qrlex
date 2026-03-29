import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "@/lib/r2";
import sharp from "sharp";

const prisma = new PrismaClient();
const IMAGE_COST = 5;
export const maxDuration = 300;

export async function POST(req: NextRequest) {
    try {
        const {
            restaurantId,
            productImageBase64,
            productImageMimeType,
            backgroundImageBase64,
            backgroundImageMimeType,
            style,
        } = await req.json();

        if (!restaurantId || !productImageBase64 || !backgroundImageBase64) {
            return NextResponse.json(
                { error: "restaurantId, productImageBase64, backgroundImageBase64 gerekli" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            return NextResponse.json({ error: "API key yok" }, { status: 500 });
        }

        let credit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
        if (!credit) {
            credit = await (prisma as any).aiCredit.create({ data: { restaurantId, balance: 3000 } });
        }
        if (credit.balance < IMAGE_COST) {
            return NextResponse.json({ error: "Yetersiz kredi", balance: credit.balance }, { status: 403 });
        }

        const prodMime = productImageMimeType || "image/jpeg";
        const bgMime = backgroundImageMimeType || "image/jpeg";
        const styleNote = style?.trim()
            ? style.trim()
            : "Arka plan fotoğrafındaki tabaktaki mevcut yiyeceği kaldır ve birinci fotoğraftaki ürünü aynı tabağa, aynı konuma yerleştir. Tabağı, masayı ve diğer tüm eşyaları olduğu gibi bırak. Sadece tabaktaki yiyeceği değiştir. Lütfen sonuçta sadece görseli döndür.";

        const contents = [
            {
                role: "user",
                parts: [
                    { text: "Bu benim ürün fotoğrafım. Bu fotoğraftaki yiyeceği/ürünü dikkatlice incele ve hatırla:" },
                    { inlineData: { mimeType: prodMime, data: productImageBase64 } },
                ],
            },
            {
                role: "model",
                parts: [{ text: "Ürün fotoğrafını inceledim ve hatırladım. Ne yapmamı istiyorsunuz?" }],
            },
            {
                role: "user",
                parts: [
                    { text: `Bu da arka plan fotoğrafım. ${styleNote}` },
                    { inlineData: { mimeType: bgMime, data: backgroundImageBase64 } },
                ],
            },
        ];

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
                }),
            }
        );

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error(`Gemini composite error (${geminiRes.status}):`, errText.substring(0, 400));
            return NextResponse.json({ error: "Görsel oluşturulamadı. Lütfen tekrar deneyin." }, { status: geminiRes.status });
        }

        const geminiData = await geminiRes.json();
        const parts = geminiData?.candidates?.[0]?.content?.parts ?? [];

        for (const part of parts) {
            if (part?.inlineData?.data) {
                const mime = part.inlineData.mimeType ?? "image/png";
                const ext = mime.includes("jpeg") ? "jpg" : "png";
                const rawBuf = Buffer.from(part.inlineData.data, "base64");
                // Compress with Sharp → WebP (same as normal upload route)
                const buf = await sharp(rawBuf)
                    .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
                    .webp({ quality: 82 })
                    .toBuffer();
                const key = `ai-generated/${restaurantId}/${Date.now()}.webp`;
                const imageUrl = await uploadToR2(buf, key, "image/webp");

                await (prisma as any).$transaction([
                    (prisma as any).aiCredit.update({
                        where: { restaurantId },
                        data: { balance: { decrement: IMAGE_COST } },
                    }),
                    (prisma as any).aiUsageLog.create({
                        data: { creditId: credit.id, type: "composite_image", cost: IMAGE_COST, prompt: "composite" },
                    }),
                ]);

                const updatedCredit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
                return NextResponse.json({
                    success: true,
                    imageUrl,
                    balance: updatedCredit?.balance ?? credit.balance - IMAGE_COST,
                });
            }
        }

        console.error("Gemini composite: no image in response", JSON.stringify(geminiData).substring(0, 300));
        return NextResponse.json({ error: "Görsel üretilemedi. Farklı fotoğraflarla tekrar deneyin." }, { status: 500 });

    } catch (error: unknown) {
        console.error("Composite image error:", error);
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
