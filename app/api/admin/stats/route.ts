import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_RESTAURANT_ID = async () => {
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/stats — Dashboard stats
export async function GET() {
    const restaurantId = await DEMO_RESTAURANT_ID();

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

    return NextResponse.json({
        productCount,
        categoryCount,
        reviewCount,
        avgRating,
    });
}
