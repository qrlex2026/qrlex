import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/reservations — create a new reservation from QR menu
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { restaurantId, name, phone, date, time, guestCount, note } = body;

        if (!restaurantId || !name || !phone || !date || !time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        const reservation = await prisma.reservation.create({
            data: {
                restaurantId,
                name,
                phone,
                date: new Date(date),
                time,
                guestCount: Number(guestCount) || 2,
                note: note || null,
                status: "pending",
            },
        });

        return NextResponse.json(reservation, { status: 201 });
    } catch (error) {
        console.error("Reservation create error:", error);
        return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
    }
}

// GET /api/reservations — list reservations for a restaurant
export async function GET(req: NextRequest) {
    const restaurantId = req.nextUrl.searchParams.get("restaurantId");
    if (!restaurantId) {
        const r = await prisma.restaurant.findFirst();
        if (!r) return NextResponse.json([]);
        const reservations = await prisma.reservation.findMany({
            where: { restaurantId: r.id },
            orderBy: { date: "asc" },
        });
        return NextResponse.json(reservations);
    }

    const reservations = await prisma.reservation.findMany({
        where: { restaurantId },
        orderBy: { date: "asc" },
    });
    return NextResponse.json(reservations);
}

// PATCH /api/reservations — update status
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status } = body;
        if (!id || !status) {
            return NextResponse.json({ error: "ID and status required" }, { status: 400 });
        }
        const reservation = await prisma.reservation.update({
            where: { id },
            data: { status },
        });
        return NextResponse.json(reservation);
    } catch (error) {
        console.error("Reservation update error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

// DELETE /api/reservations
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
    }
    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
