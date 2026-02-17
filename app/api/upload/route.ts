import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToR2, deleteFromR2, getKeyFromUrl } from "@/lib/r2";

// POST /api/upload — Upload image/video to R2
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "products";

        if (!file) {
            return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        let buffer: Buffer | Uint8Array = Buffer.from(bytes);
        let contentType = file.type;
        let ext = file.name.split(".").pop()?.toLowerCase() || "bin";

        // Image compression with Sharp
        if (contentType.startsWith("image/")) {
            buffer = await sharp(Buffer.from(bytes))
                .resize(800, 800, { fit: "inside", withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
            contentType = "image/webp";
            ext = "webp";
        }

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const key = `${folder}/${timestamp}-${random}.${ext}`;

        const url = await uploadToR2(buffer, key, contentType);

        return NextResponse.json({
            success: true,
            url,
            key,
            size: buffer.length,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Yükleme başarısız" },
            { status: 500 }
        );
    }
}

// DELETE /api/upload — Delete file from R2
export async function DELETE(req: NextRequest) {
    try {
        const { url } = await req.json();
        if (!url) {
            return NextResponse.json({ error: "URL gerekli" }, { status: 400 });
        }

        const key = getKeyFromUrl(url);
        if (!key) {
            return NextResponse.json({ error: "Geçersiz URL" }, { status: 400 });
        }

        await deleteFromR2(key);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Silme başarısız" },
            { status: 500 }
        );
    }
}
