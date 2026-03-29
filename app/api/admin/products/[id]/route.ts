import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromR2, getKeyFromUrl } from "@/lib/r2";

// PUT /api/admin/products/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // If image is changing, delete old R2 file
        if (body.image !== undefined) {
            const old = await prisma.product.findUnique({ where: { id }, select: { image: true } });
            if (old?.image && old.image !== body.image) {
                const key = getKeyFromUrl(old.image);
                if (key) deleteFromR2(key).catch(() => {});
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description ?? undefined,
                price: body.price !== undefined ? parseFloat(body.price) : undefined,
                discountPrice: body.discountPrice !== undefined
                    ? body.discountPrice ? parseFloat(body.discountPrice) : null
                    : undefined,
                image: body.image ?? undefined,
                video: body.video ?? undefined,
                prepTime: body.prepTime ?? undefined,
                calories: body.calories ?? undefined,
                isPopular: body.isPopular ?? undefined,
                isActive: body.isActive ?? undefined,
                categoryId: body.categoryId ?? undefined,
            },
        });
        return NextResponse.json(product);
    } catch (err: unknown) {
        console.error("PUT /api/admin/products/[id] error:", err);
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// DELETE /api/admin/products/[id]
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    // Delete R2 files before removing from DB
    const product = await prisma.product.findUnique({ where: { id }, select: { image: true, video: true } });
    if (product?.image) { const k = getKeyFromUrl(product.image); if (k) deleteFromR2(k).catch(() => {}); }
    if (product?.video) { const k = getKeyFromUrl(product.video); if (k) deleteFromR2(k).catch(() => {}); }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
