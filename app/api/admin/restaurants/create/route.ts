import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/admin/restaurants/create — Create a restaurant for the logged-in user
export async function POST(req: NextRequest) {
    try {
        // Get session from cookie
        const cookie = req.cookies.get("qrlex-owner");
        if (!cookie?.value) {
            return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
        }

        const session = JSON.parse(Buffer.from(cookie.value, "base64").toString());
        const userId = session.userId;

        if (!userId) {
            return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 });
        }

        // Check if user already has a restaurant
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }
        if (user.restaurantId) {
            return NextResponse.json({ error: "Zaten bir restoranınız var" }, { status: 409 });
        }

        const { name, slug, phone, address, description } = await req.json();

        if (!name || !slug) {
            return NextResponse.json({ error: "Restoran adı ve URL gerekli" }, { status: 400 });
        }

        // Validate slug format
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
        if (cleanSlug.length < 3) {
            return NextResponse.json({ error: "URL en az 3 karakter olmalı" }, { status: 400 });
        }

        // Check if slug is taken
        const existingSlug = await prisma.restaurant.findUnique({ where: { slug: cleanSlug } });
        if (existingSlug) {
            return NextResponse.json({ error: "Bu URL zaten kullanılıyor" }, { status: 409 });
        }

        // Create restaurant
        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                slug: cleanSlug,
                phone: phone || null,
                address: address || null,
                description: description || null,
            },
        });

        // Link user to restaurant
        await prisma.user.update({
            where: { id: userId },
            data: { restaurantId: restaurant.id },
        });

        // Update session cookie with restaurantId
        const newSession = { ...session, restaurantId: restaurant.id, ts: Date.now() };
        const encoded = Buffer.from(JSON.stringify(newSession)).toString("base64");

        const res = NextResponse.json({
            success: true,
            restaurantId: restaurant.id,
            slug: cleanSlug,
        });

        res.cookies.set("qrlex-owner", encoded, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (error) {
        console.error("Create restaurant error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
