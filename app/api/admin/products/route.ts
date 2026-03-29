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
    try {
        const restaurantId = req.nextUrl.searchParams.get("restaurantId") || (await prisma.restaurant.findFirst())?.id || "";
        const body = await req.json();
        const maxOrder = await prisma.product.findFirst({
            where: { categoryId: body.categoryId },
            orderBy: { sortOrder: "desc" },
        });
        const product = await prisma.product.create({
            data: {
                restaurantId,
                categoryId: body.categoryId,
                name: body.name,
                description: body.description || null,
                price: parseFloat(body.price),
                discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
                image: body.image || null,
                video: body.video || null,
                prepTime: body.prepTime || null,
                calories: body.calories || null,
                isPopular: body.isPopular ?? false,
                isActive: body.isActive ?? true,
                sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
            },
        });
        return NextResponse.json(product, { status: 201 });
    } catch (err: unknown) {
        console.error("POST /api/admin/products error:", err);
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
