import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const getRestaurantId = async (req: NextRequest) => {
    const id = req.nextUrl.searchParams.get("restaurantId");
    if (id) return id;
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/products
export async function GET(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);
    const products = await prisma.product.findMany({
        where: { restaurantId },
        include: { category: true },
        orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(products);
}

// POST /api/admin/products
export async function POST(req: NextRequest) {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId") || (await prisma.restaurant.findFirst())?.id || "";
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
