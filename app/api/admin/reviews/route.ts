import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_RESTAURANT_ID = async () => {
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/reviews
export async function GET() {
    const restaurantId = await DEMO_RESTAURANT_ID();
    const reviews = await prisma.review.findMany({
        where: { restaurantId },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
}

// DELETE /api/admin/reviews/[id]
// Note: For single review delete, a separate route would be needed
// For now, supporting bulk operations via query params
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
