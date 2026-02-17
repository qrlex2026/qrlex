import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Check for owner session
    const ownerSession = req.cookies.get("qrlex-owner");
    if (ownerSession) {
        try {
            const payload = JSON.parse(Buffer.from(ownerSession.value, "base64").toString());
            return NextResponse.json(payload);
        } catch {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }
    }

    // Check for admin session
    const adminSession = req.cookies.get("qrlex-admin");
    if (adminSession) {
        try {
            const payload = JSON.parse(Buffer.from(adminSession.value, "base64").toString());
            return NextResponse.json(payload);
        } catch {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 });
        }
    }

    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}
