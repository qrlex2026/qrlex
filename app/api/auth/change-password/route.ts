import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const cookie = req.cookies.get("qrlex-owner") || req.cookies.get("qrlex-admin");
        if (!cookie?.value) {
            return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
        }
        const session = JSON.parse(Buffer.from(cookie.value, "base64").toString());
        const userId = session.userId;

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Mevcut ve yeni şifre gerekli" }, { status: 400 });
        }
        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalı" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }
        if (user.password !== currentPassword) {
            return NextResponse.json({ error: "Mevcut şifre yanlış" }, { status: 401 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { password: newPassword },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
