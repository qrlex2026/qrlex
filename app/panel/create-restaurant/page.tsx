"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, QrCode, Link2, MapPin, Phone, FileText, ArrowRight, Sparkles } from "lucide-react";

export default function CreateRestaurantPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [slugManual, setSlugManual] = useState(false);

    // Auto-generate slug from name
    useEffect(() => {
        if (!slugManual && name) {
            const auto = name
                .toLowerCase()
                .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
                .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
                .replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
            setSlug(auto);
        }
    }, [name, slugManual]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setIsLoading(true);

        try {
            const res = await fetch("/api/admin/restaurants/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug, phone, address, description }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Oluşturulamadı");
                setIsLoading(false);
                return;
            }

            // Success — go to panel
            router.push("/panel");
            router.refresh();
        } catch {
            setError("Bağlantı hatası");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
            <div className="fixed inset-0 opacity-5"><div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} /></div>
            <div className="relative w-full max-w-[480px]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-5">
                        <Sparkles size={36} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">Restoranınızı Oluşturun</h1>
                    <p className="text-gray-400 text-sm">Birkaç adımda QR menünüz hazır</p>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-7 shadow-2xl">
                    <form onSubmit={handleCreate} className="space-y-4">
                        {/* Restaurant Name */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Restoran Adı *</label>
                            <div className="relative">
                                <Store size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Lezzet Café" required className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                            </div>
                        </div>

                        {/* Slug (URL) */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Menü URL&apos;si *</label>
                            <div className="relative">
                                <Link2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text" value={slug}
                                    onChange={(e) => { setSlugManual(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); }}
                                    placeholder="lezzet-cafe" required minLength={3}
                                    className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                                />
                            </div>
                            {slug && (
                                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                    <QrCode size={12} /> qrlex.com/<span className="text-emerald-400 font-medium">{slug}</span>
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Telefon <span className="text-gray-600">(Opsiyonel)</span></label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0212 123 45 67" className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Adres <span className="text-gray-600">(Opsiyonel)</span></label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="İstanbul, Kadıköy" className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Açıklama <span className="text-gray-600">(Opsiyonel)</span></label>
                            <div className="relative">
                                <FileText size={18} className="absolute left-3 top-3 text-gray-500" />
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Restoranınız hakkında kısa bir açıklama..." rows={3} className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none" />
                            </div>
                        </div>

                        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2"><span>⚠️</span>{error}</div>}

                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight size={18} /> Restoranı Oluştur</>}
                        </button>
                    </form>
                </div>
                <p className="text-center text-gray-600 text-xs mt-6">© 2026 QRlex — Tüm hakları saklıdır.</p>
            </div>
        </div>
    );
}
