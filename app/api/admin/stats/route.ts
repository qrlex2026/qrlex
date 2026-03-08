import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const getRestaurantId = async (req: NextRequest) => {
    const id = req.nextUrl.searchParams.get("restaurantId");
    if (id) return id;
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/stats
export async function GET(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);

    const [productCount, categoryCount] = await Promise.all([
        prisma.product.count({ where: { restaurantId } }),
        prisma.category.count({ where: { restaurantId } }),
    ]);

    return NextResponse.json({ productCount, categoryCount, avgRating: "0" });
}
