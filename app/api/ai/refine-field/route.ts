import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const FIELD_PROMPTS: Record<string, (name: string, current: string, cat: string) => string> = {
    name: (_, current, cat) =>
        `Bir Türk restoranında "${cat}" kategorisinde şu anda "${current}" adında bir ürün var. Daha çekici, iştah açıcı ve profesyonel bir ürün adı öner. Sadece adı yaz, başka hiçbir şey yazma. Maksimum 5 kelime.`,
    description: (name, current, cat) =>
        `Türk restoranında "${cat}" kategorisinde "${name}" adlı ürün için şu an şu açıklama var: "${current}". Daha profesyonel, iştah açıcı ve kısa (maksimum 80 karakter) bir açıklama yaz. Sadece açıklamayı yaz, tırnak işareti veya başka metin ekleme.`,
    price: (name, _, cat) =>
        `Türk restoranında "${cat}" kategorisinde "${name}" adlı ürün için Türkiye piyasasına uygun bir fiyat öner. Sadece sayıyı yaz (örn: 85), başka hiçbir şey yazma.`,
};

export async function POST(req: NextRequest) {
    try {
        const { field, productName, currentValue, categoryName } = await req.json();
        if (!field || !productName || !FIELD_PROMPTS[field]) {
            return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) return NextResponse.json({ error: "API key yok" }, { status: 500 });

        const prompt = FIELD_PROMPTS[field](productName, currentValue ?? "", categoryName ?? "");

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
                }),
            }
        );

        if (!res.ok) return NextResponse.json({ error: "AI hatası" }, { status: 500 });
        const data = await res.json();
        let value = (data?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();

        // For price, parse to number
        if (field === "price") {
            const num = parseFloat(value.replace(/[^\d.]/g, ""));
            return NextResponse.json({ success: true, value: isNaN(num) ? null : num });
        }

        return NextResponse.json({ success: true, value });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Hata";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
