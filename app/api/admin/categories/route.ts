import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_RESTAURANT_ID = async () => {
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/categories
export async function GET() {
    const restaurantId = await DEMO_RESTAURANT_ID();
    const categories = await prisma.category.findMany({
        where: { restaurantId },
        include: { _count: { select: { products: true } } },
        orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
    const restaurantId = await DEMO_RESTAURANT_ID();
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
