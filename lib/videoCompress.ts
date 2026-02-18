"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;

export async function compressVideo(
    file: File,
    onProgress?: (progress: number) => void
): Promise<File> {
    try {
        // Load FFmpeg WASM if not loaded
        if (!ffmpeg || !ffmpegLoaded) {
            ffmpeg = new FFmpeg();
            const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
            });
            ffmpegLoaded = true;
        }

        // Track progress
        ffmpeg.on("progress", ({ progress }) => {
            onProgress?.(Math.min(Math.round(progress * 100), 100));
        });

        const inputName = "input" + getExtension(file.name);
        const outputName = "output.mp4";

        // Write input file
        await ffmpeg.writeFile(inputName, await fetchFile(file));

        // Compress: 480p max, H.264, CRF 32 (aggressive for QR menu)
        await ffmpeg.exec([
            "-i", inputName,
            "-vf", "scale='min(480,iw)':-2",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "32",
            "-c:a", "aac",
            "-b:a", "64k",
            "-movflags", "+faststart",
            "-y",
            outputName,
        ]);

        // Read output
        const data = await ffmpeg.readFile(outputName) as Uint8Array;
        const blob = new Blob([new Uint8Array(data)], { type: "video/mp4" });

        // Cleanup
        try {
            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);
        } catch { /* ignore cleanup errors */ }

        // Only use compressed if it's actually smaller
        if (blob.size >= file.size) {
            console.log("Compressed file is not smaller, using original");
            return file;
        }

        return new File([blob], file.name.replace(/\.[^.]+$/, ".mp4"), {
            type: "video/mp4",
        });
    } catch (error) {
        console.error("Video compression failed, using original file:", error);
        // Return original on any error
        return file;
    }
}

function getExtension(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext ? `.${ext}` : ".mp4";
}
