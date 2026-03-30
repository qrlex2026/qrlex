import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToR2, deleteFromR2, getKeyFromUrl } from "@/lib/r2";

const R2_PUBLIC = process.env.R2_PUBLIC_URL || "https://pub-5b35497dfb5b4103971895d42f4b4222.r2.dev";

// Convert R2 direct URL to our /media proxy URL
// This ensures all uploaded files are served through our domain (avoids ISP blocks on r2.dev)
function toProxyUrl(r2Url: string): string {
    return r2Url.replace(R2_PUBLIC, "/media");
}

// Allow large file uploads (videos up to 100MB) on Vercel
export const maxDuration = 60;
export const dynamic = "force-dynamic";

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
                .resize(600, 600, { fit: "inside", withoutEnlargement: true })
                .webp({ quality: 78 })
                .toBuffer();
            contentType = "image/webp";
            ext = "webp";
        }

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const key = `${folder}/${timestamp}-${random}.${ext}`;

        const r2Url = await uploadToR2(buffer, key, contentType);
        // Always return proxy URL so previews work on all clients/ISPs
        const url = toProxyUrl(r2Url);

        return NextResponse.json({
            success: true,
            url,        // /media/... (proxy)
            r2Url,      // https://...r2.dev/... (direct, for reference)
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

        // Accept both /media/... proxy URLs and direct r2.dev URLs
        const normalizedUrl = url.startsWith("/media/")
            ? `${R2_PUBLIC}${url.replace("/media", "")}`
            : url;

        const key = getKeyFromUrl(normalizedUrl);
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
