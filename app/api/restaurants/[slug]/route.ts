import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/restaurants/[slug] — Public menu data
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        include: {
            categories: {
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
            },
            products: {
                where: { isActive: true },
                orderBy: { sortOrder: "asc" },
                include: { category: true },
            },
            reviews: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!restaurant) {
        return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json(restaurant);
}
