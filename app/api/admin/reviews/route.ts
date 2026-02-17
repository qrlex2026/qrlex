import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const getRestaurantId = async (req: NextRequest) => {
    const id = req.nextUrl.searchParams.get("restaurantId");
    if (id) return id;
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/reviews
export async function GET(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);
    const reviews = await prisma.review.findMany({
        where: { restaurantId },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
}

// DELETE /api/admin/reviews
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
