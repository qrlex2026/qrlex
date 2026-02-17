import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/restaurants — List all restaurants with counts
export async function GET() {
    const restaurants = await prisma.restaurant.findMany({
        include: {
            _count: {
                select: {
                    products: true,
                    categories: true,
                    reviews: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(restaurants);
}

// POST /api/admin/restaurants — Create new restaurant
export async function POST(req: NextRequest) {
    const body = await req.json();

    // Check slug uniqueness
    const existing = await prisma.restaurant.findUnique({
        where: { slug: body.slug },
    });
    if (existing) {
        return NextResponse.json(
            { error: "Bu slug zaten kullanılıyor" },
            { status: 400 }
        );
    }

    const restaurant = await prisma.restaurant.create({
        data: {
            name: body.name,
            slug: body.slug,
            description: body.description || null,
            address: body.address || null,
            phone: body.phone || null,
            email: body.email || null,
            website: body.website || null,
            instagram: body.instagram || null,
            workingHours: body.workingHours || [
                { day: "Pazartesi", open: "09:00", close: "22:00", isOpen: true },
                { day: "Salı", open: "09:00", close: "22:00", isOpen: true },
                { day: "Çarşamba", open: "09:00", close: "22:00", isOpen: true },
                { day: "Perşembe", open: "09:00", close: "22:00", isOpen: true },
                { day: "Cuma", open: "09:00", close: "23:00", isOpen: true },
                { day: "Cumartesi", open: "09:00", close: "23:00", isOpen: true },
                { day: "Pazar", open: "10:00", close: "22:00", isOpen: true },
            ],
        },
    });
    return NextResponse.json(restaurant, { status: 201 });
}
