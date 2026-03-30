"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

export interface CompressResult {
    video: File;
    thumbnail: File | null;
}

async function ensureFFmpeg() {
    if (!ffmpeg || !ffmpegLoaded) {
        ffmpeg = new FFmpeg();
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        ffmpegLoaded = true;
    }
    return ffmpeg;
}

export async function compressVideo(
    file: File,
    onProgress?: (progress: number) => void
): Promise<CompressResult> {
    try {
        const ff = await ensureFFmpeg();

        ff.on("progress", ({ progress }) => {
            onProgress?.(Math.min(Math.round(progress * 100), 100));
        });

        const inputName = "input" + getExtension(file.name);
        const outputName = "output.mp4";
        const thumbName = "thumb.webp";

        await ff.writeFile(inputName, await fetchFile(file));

        // Compress: 640p max, H.264, CRF 28 — good quality/size balance for food videos
        // -pix_fmt yuv420p ensures iPhone HEVC/MOV files are properly converted
        let compressed = false;
        try {
            await ff.exec([
                "-i", inputName,
                "-vf", "scale='min(640,iw)':-2",
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "28",
                "-pix_fmt", "yuv420p",
                "-c:a", "aac",
                "-b:a", "64k",
                "-movflags", "+faststart",
                "-y",
                outputName,
            ]);
            compressed = true;
        } catch {
            // Retry with more compatible settings for iPhone MOV/HEVC
            try {
                await ff.exec([
                    "-i", inputName,
                    "-vf", "scale='min(480,iw)':-2",
                    "-vcodec", "libx264",
                    "-pix_fmt", "yuv420p",
                    "-crf", "32",
                    "-acodec", "aac",
                    "-b:a", "48k",
                    "-movflags", "+faststart",
                    "-y",
                    outputName,
                ]);
                compressed = true;
            } catch (e2) {
                console.error("Both compression attempts failed:", e2);
            }
        }

        if (!compressed) {
            throw new Error("Video compression failed after retry");
        }

        // Extract first frame as thumbnail
        let thumbnail: File | null = null;
        try {
            await ff.exec([
                "-i", outputName,
                "-vframes", "1",
                "-vf", "scale='min(480,iw)':-2",
                "-q:v", "80",
                "-y",
                thumbName,
            ]);
            const thumbData = await ff.readFile(thumbName) as Uint8Array;
            const thumbBlob = new Blob([new Uint8Array(thumbData)], { type: "image/webp" });
            thumbnail = new File([thumbBlob], "thumbnail.webp", { type: "image/webp" });
            try { await ff.deleteFile(thumbName); } catch { }
        } catch (e) {
            console.warn("Thumbnail extraction failed:", e);
        }

        // Read compressed video
        const data = await ff.readFile(outputName) as Uint8Array;
        const blob = new Blob([new Uint8Array(data)], { type: "video/mp4" });

        // Cleanup
        try {
            await ff.deleteFile(inputName);
            await ff.deleteFile(outputName);
        } catch { }

        // Only use compressed if it's actually smaller
        let videoFile: File;
        if (blob.size >= file.size) {
            console.log("Compressed file is not smaller, using original");
            videoFile = file;
        } else {
            videoFile = new File([blob], file.name.replace(/\.[^.]+$/, ".mp4"), {
                type: "video/mp4",
            });
        }

        return { video: videoFile, thumbnail };
    } catch (error) {
        console.error("Video compression failed, using original file:", error);
        return { video: file, thumbnail: null };
    }
}

function getExtension(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext ? `.${ext}` : ".mp4";
}
