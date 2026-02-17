"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export async function compressVideo(
    file: File,
    onProgress?: (progress: number) => void
): Promise<File> {
    // Load FFmpeg WASM if not loaded
    if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
    }

    // Track progress
    ffmpeg.on("progress", ({ progress }) => {
        onProgress?.(Math.round(progress * 100));
    });

    const inputName = "input" + getExtension(file.name);
    const outputName = "output.mp4";

    // Write input file
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Compress: 720p max, 1Mbps, H.264, fast preset
    await ffmpeg.exec([
        "-i", inputName,
        "-vf", "scale='min(720,iw)':-2",      // Max 720p width, keep aspect
        "-c:v", "libx264",                       // H.264 codec
        "-preset", "fast",                        // Fast encoding
        "-crf", "28",                             // Quality (23=default, 28=smaller)
        "-c:a", "aac",                            // AAC audio
        "-b:a", "96k",                            // Audio bitrate
        "-movflags", "+faststart",                // Web optimized
        "-y",                                      // Overwrite
        outputName,
    ]);

    // Read output
    const data = await ffmpeg.readFile(outputName) as Uint8Array;
    const blob = new Blob([new Uint8Array(data)], { type: "video/mp4" });

    // Cleanup
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".mp4"), {
        type: "video/mp4",
    });

    return compressedFile;
}

function getExtension(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext ? `.${ext}` : ".mp4";
}
