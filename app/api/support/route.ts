import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const getRestaurantId = async (req: NextRequest) => {
    const id = req.nextUrl.searchParams.get("restaurantId");
    if (id) return id;
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/support — list support tickets
export async function GET(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);
    if (!restaurantId) return NextResponse.json([]);

    const status = req.nextUrl.searchParams.get("status");

    const tickets = await prisma.supportTicket.findMany({
        where: {
            restaurantId,
            ...(status ? { status } : {}),
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickets);
}

// POST /api/support — create new ticket
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { subject, message, category, restaurantId: bodyRestaurantId } = body;

        const restaurantId = bodyRestaurantId || (await prisma.restaurant.findFirst())?.id;
        if (!restaurantId) return NextResponse.json({ error: "No restaurant found" }, { status: 400 });

        if (!subject || !message) {
            return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                restaurantId,
                subject,
                message,
                category: category || "general",
            },
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        console.error("Support ticket error:", error);
        return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }
}

// PATCH /api/support — update ticket
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status, reply } = body;

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: {
                ...(status ? { status } : {}),
                ...(reply !== undefined ? { reply } : {}),
            },
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Support update error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

// DELETE /api/support
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.supportTicket.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
