import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "@/lib/r2";

const prisma = new PrismaClient();
const IMAGE_COST = 5; // 5 kredi per görsel

// Imagen 4 Fast — 2x cheaper than gemini-2.5-flash-image, better quality, same API key
// $0.02/image vs $0.039/image previously
const IMAGEN_MODEL = "imagen-4.0-fast-generate-preview-06-06";

// Extended timeout — Imagen 4 can take up to 30-40s per image
export const maxDuration = 120;

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
                data: { restaurantId, balance: 500 },
            });
        }
        if (credit.balance < IMAGE_COST) {
            return NextResponse.json({ error: "Yetersiz kredi", balance: credit.balance }, { status: 403 });
        }

        // 2. Build detailed food photography prompt
        const fullPrompt = [
            "Professional food photography.",
            productName ? `Dish: ${productName}.` : "",
            productDescription ? `Description: ${productDescription}.` : "",
            `Style: ${prompt}.`,
            "High resolution, appetizing presentation, perfect studio lighting, photorealistic. No text, no watermarks, no people.",
        ].filter(Boolean).join(" ");

        // 3. Call Imagen 4 Fast via Gemini API predict endpoint
        const imagenRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:predict?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    instances: [{ prompt: fullPrompt }],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "1:1",
                        personGeneration: "dont_allow",
                        safetySetting: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                }),
            }
        );

        if (!imagenRes.ok) {
            const errText = await imagenRes.text();
            console.error("Imagen 4 API error:", errText);

            // Fallback to gemini-2.5-flash-image if Imagen 4 fails
            const fallbackRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fullPrompt }] }],
                        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
                    }),
                }
            );

            if (!fallbackRes.ok) {
                return NextResponse.json({ error: "Görsel üretimi başarısız. Lütfen tekrar deneyin." }, { status: 500 });
            }

            const fallbackData = await fallbackRes.json();
            const fbParts = fallbackData?.candidates?.[0]?.content?.parts ?? [];
            for (const part of fbParts) {
                if (part?.inlineData?.data) {
                    const mimeType = part.inlineData.mimeType ?? "image/png";
                    const ext = mimeType.includes("jpeg") ? "jpg" : "png";
                    const imageBuffer = Buffer.from(part.inlineData.data, "base64");
                    const key = `ai-generated/${restaurantId}/${Date.now()}.${ext}`;
                    const imageUrl = await uploadToR2(imageBuffer, key, mimeType);
                    await deductCredit(prisma, restaurantId, credit, IMAGE_COST, fullPrompt);
                    const updatedCredit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
                    return NextResponse.json({ success: true, imageUrl, balance: updatedCredit?.balance ?? credit.balance - IMAGE_COST });
                }
            }
            return NextResponse.json({ error: "Görsel üretilemedi." }, { status: 500 });
        }

        const imagenData = await imagenRes.json();

        // Extract base64 image from Imagen 4 response format
        // Format: { predictions: [{ bytesBase64Encoded: "...", mimeType: "image/png" }] }
        const prediction = imagenData?.predictions?.[0];
        if (!prediction?.bytesBase64Encoded) {
            console.error("No image in Imagen 4 response:", JSON.stringify(imagenData).substring(0, 600));
            return NextResponse.json({ error: "Görsel üretilemedi. Farklı bir prompt deneyin." }, { status: 500 });
        }

        const base64Image = prediction.bytesBase64Encoded;
        const mimeType = prediction.mimeType ?? "image/png";

        // 4. Upload to R2
        const ext = mimeType.includes("jpeg") ? "jpg" : "png";
        const imageBuffer = Buffer.from(base64Image, "base64");
        const timestamp = Date.now();
        const key = `ai-generated/${restaurantId}/${timestamp}.${ext}`;
        const imageUrl = await uploadToR2(imageBuffer, key, mimeType);

        // 5. Kredi düş + log
        await deductCredit(prisma, restaurantId, credit, IMAGE_COST, fullPrompt);

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

async function deductCredit(
    prisma: PrismaClient,
    restaurantId: string,
    credit: { id: string },
    cost: number,
    prompt: string
) {
    await (prisma as any).$transaction([
        (prisma as any).aiCredit.update({
            where: { restaurantId },
            data: { balance: { decrement: cost } },
        }),
        (prisma as any).aiUsageLog.create({
            data: {
                creditId: credit.id,
                type: "image_generate",
                cost,
                prompt: prompt.substring(0, 500),
            },
        }),
    ]);
}
