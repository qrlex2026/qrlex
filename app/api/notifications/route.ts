import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const getRestaurantId = async (req: NextRequest) => {
    const id = req.nextUrl.searchParams.get("restaurantId");
    if (id) return id;
    const r = await prisma.restaurant.findFirst();
    return r?.id || "";
};

// GET /api/notifications — list notifications
export async function GET(req: NextRequest) {
    const restaurantId = await getRestaurantId(req);
    if (!restaurantId) return NextResponse.json({ notifications: [], unreadCount: 0 });

    const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

    const notifications = await prisma.notification.findMany({
        where: {
            restaurantId,
            ...(unreadOnly ? { isRead: false } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    const unreadCount = await prisma.notification.count({
        where: { restaurantId, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — mark as read
export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { id, markAllRead, restaurantId: bodyRestaurantId } = body;

    if (markAllRead) {
        const restaurantId = bodyRestaurantId || (await prisma.restaurant.findFirst())?.id;
        if (restaurantId) {
            await prisma.notification.updateMany({
                where: { restaurantId, isRead: false },
                data: { isRead: true },
            });
        }
        return NextResponse.json({ success: true });
    }

    if (id) {
        await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "ID or markAllRead required" }, { status: 400 });
}

// DELETE /api/notifications
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
