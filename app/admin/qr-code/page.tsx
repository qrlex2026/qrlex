"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Download, Copy, Check, ExternalLink, Palette, Monitor, Smartphone, Printer } from "lucide-react";

export default function QRCodePage() {
    const [slug, setSlug] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [qrSize, setQrSize] = useState(280);
    const [qrColor, setQrColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#FFFFFF");
    const [activeTab, setActiveTab] = useState<"preview" | "customize">("preview");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Fetch restaurant slug from settings
    useEffect(() => {
        fetch("/api/admin/settings")
            .then((r) => r.json())
            .then((data) => {
                setSlug(data.slug || "demo-restaurant");
                setLoading(false);
            })
            .catch(() => {
                setSlug("demo-restaurant");
                setLoading(false);
            });
    }, []);

    const menuUrl = `https://qrlex.com/${slug}`;

    // Generate QR Code using Canvas
    useEffect(() => {
        if (!slug || loading) return;
        generateQR();
    }, [slug, loading, qrSize, qrColor, bgColor]);

    const generateQR = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Use the QR code generation via an image from a public API
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(menuUrl)}&color=${qrColor.replace("#", "")}&bgcolor=${bgColor.replace("#", "")}&format=png&margin=10`;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            canvas.width = qrSize;
            canvas.height = qrSize;
            ctx.drawImage(img, 0, 0, qrSize, qrSize);
        };
        img.src = qrApiUrl;
    };

    const handleDownloadPNG = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `qrlex-menu-qr-${slug}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const handleDownloadSVG = () => {
        // Download as SVG via the API
        const svgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(menuUrl)}&color=${qrColor.replace("#", "")}&bgcolor=${bgColor.replace("#", "")}&format=svg&margin=10`;
        const link = document.createElement("a");
        link.download = `qrlex-menu-qr-${slug}.svg`;
        link.href = svgUrl;
        link.target = "_blank";
        link.click();
    };

    const handlePrint = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL("image/png");
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head><title>QR Kod - ${slug}</title>
                <style>
                    body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
                    img { max-width: 400px; }
                    p { margin-top: 16px; color: #666; font-size: 14px; }
                    h2 { margin-bottom: 8px; }
                </style>
                </head>
                <body>
                    <h2>QR Menü Kodu</h2>
                    <img src="${dataUrl}" />
                    <p>${menuUrl}</p>
                    <script>setTimeout(() => { window.print(); }, 500);</script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(menuUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const input = document.createElement("input");
            input.value = menuUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const COLOR_PRESETS = [
        { name: "Klasik", qr: "#000000", bg: "#FFFFFF" },
        { name: "Gece", qr: "#FFFFFF", bg: "#1a1a2e" },
        { name: "Okyanus", qr: "#0077b6", bg: "#caf0f8" },
        { name: "Orman", qr: "#2d6a4f", bg: "#d8f3dc" },
        { name: "Mor", qr: "#7209b7", bg: "#f3e8ff" },
        { name: "Şarap", qr: "#800020", bg: "#fef2f2" },
    ];

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">QR Kod Oluştur</h1>
                <p className="text-sm text-gray-400">
                    Müşterilerinizin QR kodu okutarak menünüze erişmesini sağlayın
                </p>
            </div>

            {/* Menu URL Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <ExternalLink size={20} className="text-violet-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Menü Linki</p>
                        <p className="text-sm font-semibold text-white">{menuUrl}</p>
                    </div>
                </div>
                <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    {copied ? "Kopyalandı!" : "Linki Kopyala"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "preview"
                        ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                        : "bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800"
                        }`}
                >
                    <Monitor size={16} />
                    Önizleme
                </button>
                <button
                    onClick={() => setActiveTab("customize")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "customize"
                        ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                        : "bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800"
                        }`}
                >
                    <Palette size={16} />
                    Özelleştir
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* QR Preview */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                        <QrCode size={20} className="text-violet-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">QR Kod Önizleme</h3>

                    {/* QR Canvas */}
                    <div
                        className="rounded-2xl p-6 mb-4 border-2 border-dashed border-gray-700"
                        style={{ backgroundColor: bgColor }}
                    >
                        <canvas
                            ref={canvasRef}
                            width={qrSize}
                            height={qrSize}
                            className="max-w-full h-auto"
                            style={{ maxWidth: "220px" }}
                        />
                    </div>

                    <p className="text-xs text-gray-500 text-center mb-4">
                        Bu QR kodu masalara, menü kartlarına veya<br />broşürlere yerleştirebilirsiniz
                    </p>

                    {/* Download Buttons */}
                    <div className="flex flex-col gap-2 w-full">
                        <button
                            onClick={handleDownloadPNG}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            <Download size={16} />
                            PNG İndir
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownloadSVG}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                            >
                                <Download size={14} />
                                SVG
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                            >
                                <Printer size={14} />
                                Yazdır
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customize Panel or Info Panel */}
                {activeTab === "customize" ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Renk & Boyut Ayarları</h3>

                        {/* Size Slider */}
                        <div>
                            <label className="text-xs text-gray-400 mb-2 block">
                                Boyut: {qrSize}x{qrSize}px
                            </label>
                            <input
                                type="range"
                                min={150}
                                max={500}
                                value={qrSize}
                                onChange={(e) => setQrSize(Number(e.target.value))}
                                className="w-full accent-violet-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                <span>150px</span>
                                <span>500px</span>
                            </div>
                        </div>

                        {/* Color Pickers */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">QR Rengi</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={qrColor}
                                        onChange={(e) => setQrColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={qrColor}
                                        onChange={(e) => setQrColor(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Arka Plan</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-700 cursor-pointer bg-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Color Presets */}
                        <div>
                            <label className="text-xs text-gray-400 mb-2 block">Hazır Temalar</label>
                            <div className="grid grid-cols-3 gap-2">
                                {COLOR_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => {
                                            setQrColor(preset.qr);
                                            setBgColor(preset.bg);
                                        }}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-medium ${qrColor === preset.qr && bgColor === preset.bg
                                            ? "border-violet-500/50 bg-violet-500/5 text-violet-400"
                                            : "border-gray-700 bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                                            }`}
                                    >
                                        <div className="flex gap-0.5">
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-600"
                                                style={{ backgroundColor: preset.qr }}
                                            />
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-600"
                                                style={{ backgroundColor: preset.bg }}
                                            />
                                        </div>
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Usage Tips */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                <Smartphone size={16} className="text-violet-400" />
                                Nasıl Kullanılır?
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { step: "1", title: "QR Kodu İndirin", desc: "PNG veya SVG formatında indirin" },
                                    { step: "2", title: "Yazdırın", desc: "Masa kartlarına, menülere veya broşürlere basın" },
                                    { step: "3", title: "Yerleştirin", desc: "Müşterilerin görebileceği yerlere koyun" },
                                    { step: "4", title: "Müşteriler Okutun", desc: "Telefon kamerasıyla QR kodu okutarak menüye erişsinler" },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-violet-400">{item.step}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Best Practices */}
                        <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-white mb-3">💡 İpuçları</h3>
                            <ul className="space-y-2 text-xs text-gray-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-violet-400 mt-0.5">•</span>
                                    QR kodu en az 3x3 cm boyutunda yazdırın
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-violet-400 mt-0.5">•</span>
                                    Koyu renk QR + açık arka plan en iyi okunurluğu sağlar
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-violet-400 mt-0.5">•</span>
                                    Baskı için SVG formatını tercih edin (vektörel, sonsuz büyütülebilir)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-violet-400 mt-0.5">•</span>
                                    Her masaya bir QR kod yerleştirerek sipariş sürecini hızlandırın
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
