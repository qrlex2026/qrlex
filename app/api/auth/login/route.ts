import { NextRequest, NextResponse } from "next/server";

// Demo credentials – replace with DB lookup later
const DEMO_USERS = [
    { email: "admin@resital.com", password: "123456", restaurant: "demo-restaurant" },
];

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    const user = DEMO_USERS.find(
        (u) => u.email === email && u.password === password
    );

    if (!user) {
        return NextResponse.json(
            { error: "Geçersiz e-posta veya şifre" },
            { status: 401 }
        );
    }

    const session = Buffer.from(
        JSON.stringify({ email: user.email, restaurant: user.restaurant, ts: Date.now() })
    ).toString("base64");

    const res = NextResponse.json({ success: true, restaurant: user.restaurant });

    res.cookies.set("qrlex-session", session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
}
