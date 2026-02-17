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

    const [productCount, categoryCount, reviewCount, reviews] = await Promise.all([
        prisma.product.count({ where: { restaurantId } }),
        prisma.category.count({ where: { restaurantId } }),
        prisma.review.count({ where: { restaurantId } }),
        prisma.review.findMany({
            where: { restaurantId },
            select: { rating: true },
        }),
    ]);

    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : "0";

    return NextResponse.json({ productCount, categoryCount, reviewCount, avgRating });
}
