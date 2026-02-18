import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/analytics/pageview — Record a QR scan / page view
export async function POST(req: NextRequest) {
    try {
        const { restaurantId, sessionId, language, userAgent } = await req.json();

        if (!restaurantId || !sessionId) {
            return NextResponse.json({ error: "restaurantId and sessionId required" }, { status: 400 });
        }

        const pageView = await prisma.pageView.create({
            data: {
                restaurantId,
                sessionId,
                language: language || null,
                userAgent: userAgent || null,
            },
        });

        return NextResponse.json({ success: true, id: pageView.id });
    } catch (error) {
        console.error("PageView error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

// PATCH /api/analytics/pageview — Update session duration or language
export async function PATCH(req: NextRequest) {
    try {
        const { id, duration, language } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "id required" }, { status: 400 });
        }

        const data: Record<string, unknown> = {};
        if (duration != null) data.duration = duration;
        if (language != null) data.language = language;

        await prisma.pageView.update({
            where: { id },
            data,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PageView update error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
