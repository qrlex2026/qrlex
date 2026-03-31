import { NextRequest, NextResponse } from "next/server";

// iOS Safari-compatible video proxy with HTTP Range request support
// Next.js rewrites don't reliably handle Range requests for video streaming.
// This dedicated endpoint ensures 206 Partial Content responses work on iPhone.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const R2_PUBLIC = process.env.R2_PUBLIC_URL || "https://pub-5b35497dfb5b4103971895d42f4b4222.r2.dev";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const key = path.join("/");
    const r2Url = `${R2_PUBLIC}/${key}`;

    // Forward Range header from iOS Safari (critical for video seeking & streaming)
    const rangeHeader = req.headers.get("range");

    const fetchHeaders: Record<string, string> = {
        "User-Agent": "QRlex-VideoProxy/1.0",
    };
    if (rangeHeader) {
        fetchHeaders["Range"] = rangeHeader;
    }

    let r2Res: Response;
    try {
        r2Res = await fetch(r2Url, { headers: fetchHeaders });
    } catch {
        return new NextResponse("Video yüklenemedi", { status: 502 });
    }

    if (!r2Res.ok && r2Res.status !== 206) {
        return new NextResponse("Video bulunamadı", { status: r2Res.status });
    }

    // Build response headers — pass through key streaming headers
    const responseHeaders = new Headers();

    const passThrough = [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges",
        "etag",
        "last-modified",
    ];
    passThrough.forEach((h) => {
        const v = r2Res.headers.get(h);
        if (v) responseHeaders.set(h, v);
    });

    // Ensure Accept-Ranges is set (required for iOS seek)
    if (!responseHeaders.has("accept-ranges")) {
        responseHeaders.set("accept-ranges", "bytes");
    }

    // Content-Type fallback
    if (!responseHeaders.has("content-type")) {
        responseHeaders.set("content-type", "video/mp4");
    }

    // Long-lived cache for immutable media
    responseHeaders.set("cache-control", "public, max-age=31536000, immutable");

    // CORS for cross-origin video elements
    responseHeaders.set("access-control-allow-origin", "*");

    const status = r2Res.status; // 200 or 206

    return new NextResponse(r2Res.body, {
        status,
        headers: responseHeaders,
    });
}

// Handle preflight / OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, OPTIONS",
            "access-control-allow-headers": "Range, Content-Type",
        },
    });
}
