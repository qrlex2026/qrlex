"use client";
import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useSession } from "@/lib/useSession";

interface WorkingHour { day: string; open: string; close: string; isOpen: boolean; }
interface Settings { name: string; slug: string; description: string; address: string; phone: string; email: string; website: string; instagram: string; whatsapp: string; cuisines: string[]; features: string[]; workingHours: WorkingHour[]; }

const CUISINE_OPTIONS = ["Türk", "İtalyan", "Japon", "Çin", "Hint", "Meksika", "Fransız", "Kore", "Amerikan", "Akdeniz", "Ortadoğu", "Deniz Ürünleri", "Vejeteryan", "Vegan"];

const FEATURE_OPTIONS: { key: string; label: string; icon: string }[] = [
    { key: "no_smoking", label: "Sigara İçilmez", icon: "🚭" },
    { key: "kids_area", label: "Çocuk Alanı", icon: "🧒" },
    { key: "parking", label: "Park Alanı", icon: "🅿️" },
    { key: "wifi", label: "Ücretsiz Wi-Fi", icon: "📶" },
    { key: "live_music", label: "Canlı Müzik", icon: "🎵" },
    { key: "valet", label: "Vale Hizmeti", icon: "🚗" },
    { key: "wheelchair", label: "Engelli Erişimi", icon: "♿" },
    { key: "outdoor", label: "Açık Alan", icon: "🌿" },
    { key: "indoor", label: "Kapalı Alan", icon: "🏠" },
    { key: "pet_friendly", label: "Pet Friendly", icon: "🐾" },
    { key: "alcohol", label: "Alkol Servisi", icon: "🍷" },
    { key: "breakfast", label: "Kahvaltı", icon: "🥐" },
    { key: "delivery", label: "Paket Servis", icon: "🛵" },
    { key: "takeaway", label: "Gel-Al", icon: "📦" },
    { key: "reservation_available", label: "Rezervasyon", icon: "📋" },
];

export default function PanelSettings() {
    const { restaurantId, loading: sessionLoading } = useSession();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!restaurantId) return;
        fetch(`/api/admin/settings?restaurantId=${restaurantId}`)
            .then((r) => r.json())
            .then((data) => {
                const defaultHours = [
                    { day: "Pazartesi", open: "09:00", close: "22:00", isOpen: true },
                    { day: "Salı", open: "09:00", close: "22:00", isOpen: true },
                    { day: "Çarşamba", open: "09:00", close: "22:00", isOpen: true },
                    { day: "Perşembe", open: "09:00", close: "22:00", isOpen: true },
                    { day: "Cuma", open: "09:00", close: "22:00", isOpen: true },
                    { day: "Cumartesi", open: "09:00", close: "23:00", isOpen: true },
                    { day: "Pazar", open: "09:00", close: "22:00", isOpen: true },
                ];
                setSettings({
                    ...data,
                    cuisines: data.cuisines || [],
                    features: data.features || [],
                    workingHours: (data.workingHours && data.workingHours.length > 0) ? data.workingHours : defaultHours,
                });
                setLoading(false);
            });
    }, [restaurantId]);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        await fetch(`/api/admin/settings?restaurantId=${restaurantId}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: settings.name, description: settings.description, address: settings.address, phone: settings.phone, email: settings.email, website: settings.website, instagram: settings.instagram, whatsapp: settings.whatsapp, cuisines: settings.cuisines, features: settings.features, workingHours: settings.workingHours }),
        });
        setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    };
    const updateField = (field: string, value: string) => setSettings((prev) => prev ? { ...prev, [field]: value } : null);
    const updateWorkingHour = (index: number, field: keyof WorkingHour, value: string | boolean) => {
        if (!settings) return;
        const newHours = [...settings.workingHours];
        newHours[index] = { ...newHours[index], [field]: value };
        setSettings({ ...settings, workingHours: newHours });
    };
    const toggleCuisine = (c: string) => {
        if (!settings) return;
        const next = settings.cuisines.includes(c) ? settings.cuisines.filter((x) => x !== c) : [...settings.cuisines, c];
        setSettings({ ...settings, cuisines: next });
    };
    const toggleFeature = (f: string) => {
        if (!settings) return;
        const next = settings.features.includes(f) ? settings.features.filter((x) => x !== f) : [...settings.features, f];
        setSettings({ ...settings, features: next });
    };

    if (sessionLoading || loading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;
    if (!settings) return <div className="text-center py-20 text-gray-500">Veriler yüklenemedi</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-white">İşletme Ayarları</h1><p className="text-sm text-gray-400 mt-1">İşletme bilgilerinizi güncelleyin</p></div>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saved ? "Kaydedildi ✓" : saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">İşletme Bilgileri</h3>
                <div><label className="text-xs text-gray-400 mb-1 block">İşletme Adı</label><input value={settings.name} onChange={(e) => updateField("name", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Açıklama</label><textarea value={settings.description || ""} onChange={(e) => updateField("description", e.target.value)} rows={3} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 resize-none" /></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Adres</label><input value={settings.address || ""} onChange={(e) => updateField("address", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">İletişim</h3>
                <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-400 mb-1 block">Telefon</label><input value={settings.phone || ""} onChange={(e) => updateField("phone", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div><div><label className="text-xs text-gray-400 mb-1 block">E-posta</label><input value={settings.email || ""} onChange={(e) => updateField("email", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-400 mb-1 block">Website</label><input value={settings.website || ""} onChange={(e) => updateField("website", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div><div><label className="text-xs text-gray-400 mb-1 block">Instagram</label><input value={settings.instagram || ""} onChange={(e) => updateField("instagram", e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div></div>
                <div><label className="text-xs text-gray-400 mb-1 block">WhatsApp Numarası</label><input value={settings.whatsapp || ""} onChange={(e) => updateField("whatsapp", e.target.value)} placeholder="905XXXXXXXXX" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500" /></div>
            </div>
            {/* Mutfaklar */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Mutfaklar</h3>
                <p className="text-xs text-gray-500 -mt-2">İşletmenizin sunduğu mutfak türlerini seçin</p>
                <div className="flex flex-wrap gap-2">
                    {CUISINE_OPTIONS.map((c) => (
                        <button key={c} onClick={() => toggleCuisine(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${settings.cuisines.includes(c) ? "bg-emerald-600 border-emerald-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>
            {/* İşletme Özellikleri */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">İşletme Özellikleri</h3>
                <p className="text-xs text-gray-500 -mt-2">İşletmenizin özelliklerini seçin</p>
                <div className="grid grid-cols-2 gap-2">
                    {FEATURE_OPTIONS.map((f) => (
                        <button key={f.key} onClick={() => toggleFeature(f.key)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border text-left ${settings.features.includes(f.key) ? "bg-emerald-600/10 border-emerald-500/50 text-emerald-400" : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                            <span className="text-base">{f.icon}</span>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Çalışma Saatleri</h3>
                {settings.workingHours?.map((wh, i) => (
                    <div key={wh.day} className="flex items-center gap-3">
                        <label className="flex items-center gap-2 w-28 flex-shrink-0"><input type="checkbox" checked={wh.isOpen} onChange={(e) => updateWorkingHour(i, "isOpen", e.target.checked)} className="accent-emerald-500" /><span className={`text-sm ${wh.isOpen ? "text-white" : "text-gray-600"}`}>{wh.day}</span></label>
                        {wh.isOpen ? (<div className="flex items-center gap-2"><input type="time" value={wh.open} onChange={(e) => updateWorkingHour(i, "open", e.target.value)} className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" /><span className="text-gray-500">—</span><input type="time" value={wh.close} onChange={(e) => updateWorkingHour(i, "close", e.target.value)} className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500" /></div>) : (<span className="text-xs text-gray-600">Kapalı</span>)}
                    </div>
                ))}
            </div>
        </div>
    );
}
