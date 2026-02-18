import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/admin/reorder — Bulk update sort orders
export async function POST(req: NextRequest) {
    try {
        const { type, items } = await req.json();
        // items = [{ id: "xxx", sortOrder: 0 }, { id: "yyy", sortOrder: 1 }, ...]

        if (!type || !items || !Array.isArray(items)) {
            return NextResponse.json({ error: "type and items required" }, { status: 400 });
        }

        if (type === "categories") {
            await Promise.all(
                items.map((item: { id: string; sortOrder: number }) =>
                    prisma.category.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
                )
            );
        } else if (type === "products") {
            await Promise.all(
                items.map((item: { id: string; sortOrder: number }) =>
                    prisma.product.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
                )
            );
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reorder error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
