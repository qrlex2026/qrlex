import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "@/lib/r2";

const prisma = new PrismaClient();
const IMAGE_COST = 5; // 5 kredi per görsel

export async function POST(req: NextRequest) {
    try {
        const { restaurantId, productName, productDescription, prompt } = await req.json();

        if (!restaurantId || !prompt) {
            return NextResponse.json({ error: "restaurantId ve prompt gerekli" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API key yapılandırılmamış" }, { status: 500 });
        }

        // 1. Kredi kontrolü
        let credit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
        if (!credit) {
            credit = await (prisma as any).aiCredit.create({
                data: { restaurantId, balance: 100 },
            });
        }
        if (credit.balance < IMAGE_COST) {
            return NextResponse.json({ error: "Yetersiz kredi", balance: credit.balance }, { status: 403 });
        }

        // 2. Build detailed food photography prompt
        const fullPrompt = [
            "Create a stunning professional food photography image.",
            productName ? `The dish is: ${productName}.` : "",
            productDescription ? `Description: ${productDescription}.` : "",
            `Visual style: ${prompt}.`,
            "Requirements: high resolution, appetizing presentation, perfect studio lighting, photorealistic, no text, no watermarks, no people.",
        ].filter(Boolean).join(" ");

        // 3. Call Nano Banana (gemini-2.5-flash-image) — confirmed available in API key
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        responseModalities: ["IMAGE", "TEXT"],
                    },
                }),
            }
        );

        if (!geminiRes.ok) {
            const errText = await geminiRes.text();
            console.error("Nano Banana API error:", errText);
            return NextResponse.json({ error: "Görsel üretimi başarısız: " + errText }, { status: 500 });
        }

        const geminiData = await geminiRes.json();

        // Extract base64 image from response
        let base64Image: string | null = null;
        let mimeType = "image/png";

        const parts = geminiData?.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
            if (part?.inlineData?.data) {
                base64Image = part.inlineData.data;
                mimeType = part.inlineData.mimeType ?? "image/png";
                break;
            }
        }

        if (!base64Image) {
            console.error("No image in response:", JSON.stringify(geminiData).substring(0, 600));
            return NextResponse.json({ error: "Görsel üretilemedi. Farklı bir prompt deneyin." }, { status: 500 });
        }

        // 4. Upload to R2
        const ext = mimeType.includes("jpeg") ? "jpg" : "png";
        const imageBuffer = Buffer.from(base64Image, "base64");
        const timestamp = Date.now();
        const key = `ai-generated/${restaurantId}/${timestamp}.${ext}`;
        const imageUrl = await uploadToR2(imageBuffer, key, mimeType);

        // 5. Kredi düş + log
        await prisma.$transaction([
            (prisma as any).aiCredit.update({
                where: { restaurantId },
                data: { balance: { decrement: IMAGE_COST } },
            }),
            (prisma as any).aiUsageLog.create({
                data: {
                    creditId: credit.id,
                    type: "image_generate",
                    cost: IMAGE_COST,
                    prompt: fullPrompt.substring(0, 500),
                },
            }),
        ]);

        const updatedCredit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });

        return NextResponse.json({
            success: true,
            imageUrl,
            balance: updatedCredit?.balance ?? credit.balance - IMAGE_COST,
        });
    } catch (error: unknown) {
        console.error("AI görsel üretim hatası:", error);
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
