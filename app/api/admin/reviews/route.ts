import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const getRestaurantId = async (req: NextRequest) => {
    const id = req.nextUrl.searchParams.get("restaurantId");
    if (id) return id;
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/admin/reviews
export async function GET(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);
    const reviews = await prisma.review.findMany({
        where: { restaurantId },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
}

// POST /api/admin/reviews — create a new review from QR menu
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, authorName, rating, comment } = body;

        if (!restaurantId || !authorName || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const review = await prisma.review.create({
            data: {
                restaurantId,
                authorName,
                rating: Number(rating),
                comment: comment || "",
                helpfulCount: 0,
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Review create error:", error);
        return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }
}

// DELETE /api/admin/reviews
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
