import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const getRestaurantId = async (req: NextRequest) => {
    const id = req.nextUrl.searchParams.get("restaurantId");
    if (id) return id;
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/settings
export async function GET(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
    });
    return NextResponse.json(restaurant);
}

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);
    const body = await req.json();
    const restaurant = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: body,
    });
    return NextResponse.json(restaurant);
}
