import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    const { phone, password } = await req.json();

    if (!phone || !password) {
        return NextResponse.json({ error: "Telefon ve şifre gerekli" }, { status: 400 });
    }

    // Clean phone number (remove spaces, dashes, leading 0)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "").replace(/^0/, "").replace(/^\+90/, "");

    const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

    if (!user || user.password !== password) {
        return NextResponse.json({ error: "Geçersiz telefon veya şifre" }, { status: 401 });
    }

    // Build session payload
    const sessionPayload = {
        userId: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
        ts: Date.now(),
    };

    const session = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    const res = NextResponse.json({
        success: true,
        role: user.role,
        name: user.name,
        restaurantId: user.restaurantId,
    });

    // Set different cookie based on role
    const cookieName = user.role === "superadmin" ? "qrlex-admin" : "qrlex-owner";

    res.cookies.set(cookieName, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
}
