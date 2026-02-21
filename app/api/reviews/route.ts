import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/reviews — public endpoint for submitting reviews from QR menu
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, authorName, rating, comment } = body;

        if (!restaurantId || !authorName || !rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify the restaurant exists
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
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

        // Auto-create notification
        await prisma.notification.create({
            data: {
                restaurantId,
                type: "review",
                title: "Yeni Yorum",
                message: `${authorName} ★${rating} yorum bıraktı${comment ? ': "' + comment.substring(0, 50) + '"' : ''}`,
                linkUrl: "/panel/reviews",
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Review create error:", error);
        return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }
}
