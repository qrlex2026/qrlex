import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { role } = await req.json().catch(() => ({ role: "all" }));

    const res = NextResponse.json({ success: true });

    if (role === "admin" || role === "all") {
        res.cookies.set("qrlex-admin", "", { httpOnly: true, path: "/", maxAge: 0 });
    }
    if (role === "owner" || role === "all") {
        res.cookies.set("qrlex-owner", "", { httpOnly: true, path: "/", maxAge: 0 });
    }

    // Also clear legacy cookie
    res.cookies.set("qrlex-session", "", { httpOnly: true, path: "/", maxAge: 0 });

    return res;
}
