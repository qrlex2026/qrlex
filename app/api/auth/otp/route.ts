import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Send OTP (for now hardcoded as 111111)
export async function POST(req: NextRequest) {
    const { phone } = await req.json();

    if (!phone) {
        return NextResponse.json({ error: "Telefon numarası gerekli" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "").replace(/^0/, "").replace(/^\+90/, "");

    const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

    if (!user) {
        return NextResponse.json({ error: "Bu telefon numarası kayıtlı değil" }, { status: 404 });
    }

    // In production, send SMS via API (Twilio, Netgsm, etc.)
    // For now, OTP is always 111111
    console.log(`[OTP] ${cleanPhone} → 111111`);

    return NextResponse.json({ success: true, message: "Doğrulama kodu gönderildi" });
}
