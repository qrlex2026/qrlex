import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET theme for a restaurant
export async function GET(req: NextRequest) {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId");
    if (!restaurantId) return NextResponse.json({ error: "restaurantId required" }, { status: 400 });

    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { theme: true },
    });
    if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

    return NextResponse.json(restaurant.theme || {});
}

// PUT (save) theme
export async function PUT(req: NextRequest) {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId");
    if (!restaurantId) return NextResponse.json({ error: "restaurantId required" }, { status: 400 });

    const theme = await req.json();

    await prisma.restaurant.update({
        where: { id: restaurantId },
        data: { theme },
    });

    return NextResponse.json({ success: true });
}
