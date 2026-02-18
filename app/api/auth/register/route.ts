import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { phone, password, name } = await req.json();

        if (!phone || !password || !name) {
            return NextResponse.json({ error: "Tüm alanlar gereklidir" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
        }

        // Clean phone number
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, "").replace(/^0/, "").replace(/^\+90/, "");

        if (cleanPhone.length < 10) {
            return NextResponse.json({ error: "Geçerli bir telefon numarası giriniz" }, { status: 400 });
        }

        // Check if phone already exists
        const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
        if (existing) {
            return NextResponse.json({ error: "Bu telefon numarası zaten kayıtlı" }, { status: 409 });
        }

        // Create user (no restaurant yet — they'll create one after login)
        const user = await prisma.user.create({
            data: {
                phone: cleanPhone,
                password,
                name,
                role: "owner",
            },
        });

        // Auto-login: set session cookie
        const sessionPayload = {
            userId: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role,
            restaurantId: null,
            ts: Date.now(),
        };

        const session = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

        const res = NextResponse.json({
            success: true,
            userId: user.id,
            name: user.name,
        });

        res.cookies.set("qrlex-owner", session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (error) {
        console.error("Register API error:", error);
        return NextResponse.json({ error: "Sunucu hatası. Lütfen tekrar deneyin." }, { status: 500 });
    }
}
