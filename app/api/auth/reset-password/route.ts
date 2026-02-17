import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
    const { phone, otp, newPassword } = await req.json();

    if (!phone || !otp || !newPassword) {
        return NextResponse.json({ error: "Tüm alanlar zorunludur" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "").replace(/^0/, "").replace(/^\+90/, "");

    // Verify OTP (hardcoded as 111111 for now)
    if (otp !== "111111") {
        return NextResponse.json({ error: "Geçersiz doğrulama kodu" }, { status: 400 });
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ error: "Şifre en az 6 karakter olmalıdır" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

    if (!user) {
        return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Update password
    await prisma.user.update({
        where: { phone: cleanPhone },
        data: { password: newPassword },
    });

    return NextResponse.json({ success: true, message: "Şifre başarıyla değiştirildi" });
}
