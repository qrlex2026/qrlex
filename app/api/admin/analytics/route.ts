import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const getRestaurantId = async (req: NextRequest) => {
    const id = req.nextUrl.searchParams.get("restaurantId");
    if (id) return id;
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/analytics — Summary stats for panel dashboard
export async function GET(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);
    const range = req.nextUrl.searchParams.get("range") || "today";

    // Calculate date filter
    const now = new Date();
    let startDate: Date;
    switch (range) {
        case "week":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            break;
        case "month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
        default: // today
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const dateFilter = { gte: startDate };

    const [
        totalViews,
        pageViews,
        topProducts,
        avgDuration,
        languageStats,
        dailyViews,
    ] = await Promise.all([
        // Total QR scans
        prisma.pageView.count({
            where: { restaurantId, createdAt: dateFilter },
        }),

        // All page views for duration calc
        prisma.pageView.findMany({
            where: { restaurantId, createdAt: dateFilter, duration: { not: null } },
            select: { duration: true },
        }),

        // Top 10 most viewed products
        prisma.productView.groupBy({
            by: ["productId"],
            where: { restaurantId, createdAt: dateFilter },
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 10,
        }),

        // Average duration
        prisma.pageView.aggregate({
            where: { restaurantId, createdAt: dateFilter, duration: { not: null } },
            _avg: { duration: true },
        }),

        // Language distribution
        prisma.pageView.groupBy({
            by: ["language"],
            where: { restaurantId, createdAt: dateFilter, language: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
        }),

        // Daily views (last 7 or 30 days)
        prisma.pageView.findMany({
            where: { restaurantId, createdAt: dateFilter },
            select: { createdAt: true },
        }),
    ]);

    // Get product names for top products
    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, image: true },
    });
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    const topProductsWithNames = topProducts.map(p => ({
        productId: p.productId,
        name: productMap[p.productId]?.name || "Bilinmeyen",
        image: productMap[p.productId]?.image || null,
        views: p._count.id,
    }));

    // Group daily views by date
    const dailyMap: Record<string, number> = {};
    dailyViews.forEach(v => {
        const day = v.createdAt.toISOString().split("T")[0];
        dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
    const dailyChart = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));

    return NextResponse.json({
        totalViews,
        avgDuration: Math.round(avgDuration._avg.duration || 0),
        topProducts: topProductsWithNames,
        languageStats: languageStats.map(l => ({
            language: l.language,
            count: l._count.id,
        })),
        dailyChart,
    });
}
