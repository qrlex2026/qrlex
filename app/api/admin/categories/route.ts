import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const getRestaurantId = async (req: NextRequest) => {
    const id = req.nextUrl.searchParams.get("restaurantId");
    if (id) return id;
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/categories
export async function GET(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);
    const categories = await prisma.category.findMany({
        where: { restaurantId },
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId") || (await prisma.restaurant.findFirst())?.id || "";
    const body = await req.json();
    const maxOrder = await prisma.category.findFirst({
        where: { restaurantId },
        orderBy: { sortOrder: "desc" },
    });
    const category = await prisma.category.create({
        data: {
            ...body,
            restaurantId,
            sortOrder: (maxOrder?.sortOrder || 0) + 1,
        },
    });
    return NextResponse.json(category, { status: 201 });
}
