import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PUT /api/admin/products/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    const product = await prisma.product.update({
        where: { id },
        data: {
            ...body,
            price: body.price !== undefined ? parseFloat(body.price) : undefined,
            discountPrice: body.discountPrice !== undefined
                ? body.discountPrice ? parseFloat(body.discountPrice) : null
                : undefined,
        },
    });
    return NextResponse.json(product);
}

// DELETE /api/admin/products/[id]
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
