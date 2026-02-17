"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Store } from "lucide-react";
import Link from "next/link";

export default function NewRestaurantPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        instagram: "",
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
            .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    };

    const handleNameChange = (name: string) => {
        setForm((prev) => ({
            ...prev,
            name,
            slug: generateSlug(name),
        }));
    };

    const updateField = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.slug.trim()) {
            setError("İşletme adı ve slug zorunludur");
            return;
        }
        setError("");
        setSaving(true);

        try {
            const res = await fetch("/api/admin/restaurants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Bir hata oluştu");
                setSaving(false);
                return;
            }

            router.push(`/admin/restaurants/${data.id}`);
        } catch {
            setError("Bağlantı hatası");
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin"
                    className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">Yeni Restoran</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Yeni bir işletme oluşturun</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? "Kaydediliyor..." : "Oluştur"}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                    ⚠️ {error}
                </div>
            )}

            {/* Business Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Store size={16} className="text-violet-400" />
                    İşletme Bilgileri
                </h3>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">İşletme Adı *</label>
                    <input
                        value={form.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Örn: Resital Lounge"
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Slug (URL) *</label>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5">
                            qrlex.com/
                        </span>
                        <input
                            value={form.slug}
                            onChange={(e) => updateField("slug", e.target.value)}
                            placeholder="restoran-adi"
                            className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 font-mono"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Açıklama</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        rows={3}
                        placeholder="İşletme hakkında kısa açıklama..."
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Adres</label>
                    <input
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Tam adres..."
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                    />
                </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">İletişim</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Telefon</label>
                        <input
                            value={form.phone}
                            onChange={(e) => updateField("phone", e.target.value)}
                            placeholder="0 (5__) ___ __ __"
                            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">E-posta</label>
                        <input
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            placeholder="info@restoran.com"
                            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Website</label>
                        <input
                            value={form.website}
                            onChange={(e) => updateField("website", e.target.value)}
                            placeholder="www.restoran.com"
                            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Instagram</label>
                        <input
                            value={form.instagram}
                            onChange={(e) => updateField("instagram", e.target.value)}
                            placeholder="@restoran"
                            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
