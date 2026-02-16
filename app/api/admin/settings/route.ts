import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_RESTAURANT_ID = async () => {
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/settings
export async function GET() {
    const restaurantId = await DEMO_RESTAURANT_ID();
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
    });
    return NextResponse.json(restaurant);
}

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
    const restaurantId = await DEMO_RESTAURANT_ID();
    const body = await req.json();
    const restaurant = await prisma.restaurant.update({
        where: { id: restaurantId },
        data: body,
    });
    return NextResponse.json(restaurant);
}
