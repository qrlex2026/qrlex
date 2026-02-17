"use client";

import { useState, useEffect, use } from "react";
import { Download, Copy, Printer, Check, Palette, Maximize } from "lucide-react";

const THEMES = [
    { name: "Klasik", fg: "000000", bg: "FFFFFF" },
    { name: "Gece", fg: "FFFFFF", bg: "1a1a2e" },
    { name: "Okyanus", fg: "0077b6", bg: "caf0f8" },
    { name: "Orman", fg: "2d6a4f", bg: "d8f3dc" },
    { name: "Mor", fg: "7b2cbf", bg: "e0aaff" },
    { name: "Şarap", fg: "800020", bg: "f8edeb" },
];

export default function QRCodePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const restaurantId = resolvedParams.id;
    const [slug, setSlug] = useState("");
    const [size, setSize] = useState(300);
    const [fgColor, setFgColor] = useState("000000");
    const [bgColor, setBgColor] = useState("FFFFFF");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/admin/restaurants/${restaurantId}`)
            .then((r) => r.json())
            .then((data) => setSlug(data.slug || ""));
    }, [restaurantId]);

    const menuUrl = slug ? `https://qrlex.com/${slug}` : "";
    const qrUrl = menuUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(menuUrl)}&color=${fgColor}&bgcolor=${bgColor}&format=png` : "";

    const handleDownload = async (format: "png" | "svg") => {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(menuUrl)}&color=${fgColor}&bgcolor=${bgColor}&format=${format}`;
        const res = await fetch(url);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `qr-menu-${slug}.${format}`;
        a.click();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(menuUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        const w = window.open("", "_blank");
        if (w) {
            w.document.write(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0"><img src="${qrUrl}" /><script>setTimeout(()=>{window.print();window.close()},500)</script></body></html>`);
        }
    };

    if (!slug) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    return (
        <div className="space-y-6 max-w-3xl">
            <div><h1 className="text-2xl font-bold text-white">QR Kod Oluşturucu</h1><p className="text-sm text-gray-400 mt-1">Menünüz için QR kod oluşturun ve özelleştirin</p></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-4">
                    <h3 className="text-sm font-semibold text-gray-300">Önizleme</h3>
                    <div className="bg-white rounded-2xl p-4 shadow-xl">
                        {qrUrl && <img src={qrUrl} alt="QR Menü" width={size > 300 ? 300 : size} height={size > 300 ? 300 : size} />}
                    </div>
                    <p className="text-xs text-gray-500 text-center break-all">{menuUrl}</p>
                    <div className="flex gap-2 w-full">
                        <button onClick={() => handleDownload("png")} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"><Download size={16} /> PNG</button>
                        <button onClick={() => handleDownload("svg")} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"><Download size={16} /> SVG</button>
                    </div>
                    <div className="flex gap-2 w-full">
                        <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs transition-colors">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Kopyalandı!" : "URL Kopyala"}</button>
                        <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs transition-colors"><Printer size={14} /> Yazdır</button>
                    </div>
                </div>

                {/* Customization */}
                <div className="space-y-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2"><Palette size={16} className="text-violet-400" /> Renk Teması</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {THEMES.map((theme) => (
                                <button key={theme.name} onClick={() => { setFgColor(theme.fg); setBgColor(theme.bg); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${fgColor === theme.fg && bgColor === theme.bg ? "border-violet-500 bg-violet-500/10 text-violet-300" : "border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                                    <div className="w-4 h-4 rounded-full border border-gray-600" style={{ background: `linear-gradient(135deg, #${theme.fg} 50%, #${theme.bg} 50%)` }} />
                                    {theme.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2"><Maximize size={16} className="text-violet-400" /> Boyut</h3>
                        <input type="range" min={150} max={500} step={10} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-violet-500" />
                        <p className="text-xs text-gray-500 text-center">{size} × {size} px</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-300">Özel Renkler</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs text-gray-400 mb-1 block">QR Rengi</label><div className="flex items-center gap-2"><input type="color" value={`#${fgColor}`} onChange={(e) => setFgColor(e.target.value.slice(1))} className="w-8 h-8 rounded cursor-pointer" /><span className="text-xs text-gray-500 font-mono">#{fgColor}</span></div></div>
                            <div><label className="text-xs text-gray-400 mb-1 block">Arkaplan</label><div className="flex items-center gap-2"><input type="color" value={`#${bgColor}`} onChange={(e) => setBgColor(e.target.value.slice(1))} className="w-8 h-8 rounded cursor-pointer" /><span className="text-xs text-gray-500 font-mono">#{bgColor}</span></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
