import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_RESTAURANT_ID = async () => {
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/products
export async function GET() {
    const restaurantId = await DEMO_RESTAURANT_ID();
    const products = await prisma.product.findMany({
        where: { restaurantId },
        include: { category: true },
        orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(products);
}

// POST /api/admin/products
export async function POST(req: NextRequest) {
    const restaurantId = await DEMO_RESTAURANT_ID();
    const body = await req.json();
    const product = await prisma.product.create({
        data: {
            ...body,
            restaurantId,
            price: parseFloat(body.price),
            discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        },
    });
    return NextResponse.json(product, { status: 201 });
}
