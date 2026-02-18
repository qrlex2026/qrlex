import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/analytics/product-view — Record a product view
export async function POST(req: NextRequest) {
    try {
        const { restaurantId, productId, sessionId } = await req.json();

        if (!restaurantId || !productId || !sessionId) {
            return NextResponse.json({ error: "restaurantId, productId, sessionId required" }, { status: 400 });
        }

        await prisma.productView.create({
            data: {
                restaurantId,
                productId,
                sessionId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("ProductView error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
