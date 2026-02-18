import { NextRequest, NextResponse } from "next/server";
import translate from "google-translate-api-x";

export async function POST(req: NextRequest) {
    try {
        const { texts, target } = await req.json();

        if (!texts || !Array.isArray(texts) || !target) {
            return NextResponse.json({ error: "texts (array) and target (string) required" }, { status: 400 });
        }

        if (target === "tr") {
            return NextResponse.json({ translations: texts });
        }

        // Filter out empty strings, translate non-empty ones
        const nonEmpty = texts.map((t: string, i: number) => ({ text: t, index: i })).filter((item: { text: string; index: number }) => item.text.trim() !== "");

        if (nonEmpty.length === 0) {
            return NextResponse.json({ translations: texts });
        }

        // Batch translate all non-empty texts
        const results = await translate(
            nonEmpty.map((item: { text: string; index: number }) => item.text),
            { from: "tr", to: target }
        );

        // Build result array with original indices
        const translations = [...texts];
        const resultArray = Array.isArray(results) ? results : [results];

        nonEmpty.forEach((item: { text: string; index: number }, idx: number) => {
            translations[item.index] = resultArray[idx]?.text || item.text;
        });

        return NextResponse.json({ translations });
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json({ error: "Translation failed" }, { status: 500 });
    }
}
