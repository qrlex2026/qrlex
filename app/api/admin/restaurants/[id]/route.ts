import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/restaurants/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true, categories: true, reviews: true },
            },
        },
    });
    if (!restaurant) {
        return NextResponse.json({ error: "Restoran bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(restaurant);
}

// PUT /api/admin/restaurants/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    // If slug is changing, check uniqueness
    if (body.slug) {
        const existing = await prisma.restaurant.findFirst({
            where: { slug: body.slug, NOT: { id } },
        });
        if (existing) {
            return NextResponse.json(
                { error: "Bu slug zaten kullanılıyor" },
                { status: 400 }
            );
        }
    }

    const restaurant = await prisma.restaurant.update({
        where: { id },
        data: body,
    });
    return NextResponse.json(restaurant);
}

// DELETE /api/admin/restaurants/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await prisma.restaurant.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
