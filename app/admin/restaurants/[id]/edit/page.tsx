"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Store } from "lucide-react";
import Link from "next/link";

export default function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const restaurantId = resolvedParams.id;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        name: "", slug: "", description: "", address: "", phone: "", email: "", website: "", instagram: "",
    });

    useEffect(() => {
        fetch(`/api/admin/restaurants/${restaurantId}`)
            .then((r) => r.json())
            .then((data) => {
                setForm({
                    name: data.name || "", slug: data.slug || "", description: data.description || "",
                    address: data.address || "", phone: data.phone || "", email: data.email || "",
                    website: data.website || "", instagram: data.instagram || "",
                });
                setLoading(false);
            });
    }, [restaurantId]);

    const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!form.name.trim() || !form.slug.trim()) { setError("İşletme adı ve slug zorunludur"); return; }
        setError(""); setSaving(true);
        try {
            const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Bir hata oluştu"); setSaving(false); return; }
            setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
        } catch { setError("Bağlantı hatası"); setSaving(false); }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href={`/admin/restaurants/${restaurantId}`} className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
                <div className="flex-1"><h1 className="text-2xl font-bold text-white">Restoranı Düzenle</h1><p className="text-sm text-gray-400 mt-0.5">İşletme bilgilerini güncelleyin</p></div>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-violet-500/20">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saved ? "Kaydedildi ✓" : saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">⚠️ {error}</div>}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2"><Store size={16} className="text-violet-400" /> İşletme Bilgileri</h3>
                <div><label className="text-xs text-gray-400 mb-1 block">İşletme Adı *</label><input value={form.name} onChange={(e) => updateField("name", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" /></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Slug (URL) *</label><div className="flex items-center gap-2"><span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5">qrlex.com/</span><input value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-violet-500" /></div></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Açıklama</label><textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 resize-none" /></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Adres</label><input value={form.address} onChange={(e) => updateField("address", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" /></div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">İletişim</h3>
                <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-400 mb-1 block">Telefon</label><input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" /></div><div><label className="text-xs text-gray-400 mb-1 block">E-posta</label><input value={form.email} onChange={(e) => updateField("email", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" /></div></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-400 mb-1 block">Website</label><input value={form.website} onChange={(e) => updateField("website", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" /></div><div><label className="text-xs text-gray-400 mb-1 block">Instagram</label><input value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" /></div></div>
            </div>
        </div>
    );
}
