"use client";
import { useState, useEffect } from "react";
import { User, Phone, Lock, Eye, EyeOff, Save, Loader2, Crown, AlertTriangle } from "lucide-react";

interface UserInfo { id: string; name: string; phone: string; role: string; }

export default function ProfilePage() {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwError, setPwError] = useState("");
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);

    useEffect(() => {
        fetch("/api/auth/me")
            .then(r => r.json())
            .then(d => {
                if (d.userId) {
                    setUser({ id: d.userId, name: d.name || "", phone: d.phone || "", role: d.role || "owner" });
                    setName(d.name || "");
                }
                setLoading(false);
            });
    }, []);

    const handleSaveName = async () => {
        if (!user) return;
        setSaving(true);
        await fetch("/api/auth/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
        setSaving(false); setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError(""); setPwSuccess(false); setPwSaving(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) { setPwError(data.error); setPwSaving(false); return; }
            setPwSuccess(true); setCurrentPassword(""); setNewPassword("");
            setPwSaving(false);
            setTimeout(() => setPwSuccess(false), 3000);
        } catch { setPwError("Bağlantı hatası"); setPwSaving(false); }
    };

    if (loading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    const plan = { name: "Ücretsiz Plan", color: "gray", features: ["1 Restoran", "Sınırsız ürün", "QR kod oluşturma", "Temel analitik"] };

    return (
        <div className="space-y-6 max-w-2xl">
            <div><h1 className="text-2xl font-bold text-white">Profil</h1><p className="text-sm text-gray-400 mt-1">Hesap bilgilerinizi yönetin</p></div>

            {/* Personal Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2"><User size={16} /> Kişisel Bilgiler</h3>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Ad Soyad</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Telefon</label>
                    <div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={user?.phone || ""} readOnly className="w-full pl-9 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-sm text-gray-400 cursor-not-allowed" /></div>
                    <p className="text-[11px] text-gray-600 mt-1">Telefon numarası değiştirilemez</p>
                </div>
                <button onClick={handleSaveName} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saved ? "Kaydedildi ✓" : saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>

            {/* Password Change */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4"><Lock size={16} /> Şifre Değiştir</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Mevcut Şifre</label>
                        <div className="relative">
                            <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full px-3 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Yeni Şifre</label>
                        <div className="relative">
                            <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} placeholder="En az 6 karakter" className="w-full px-3 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                    </div>
                    {pwError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">⚠️ {pwError}</div>}
                    {pwSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400">✅ Şifre başarıyla değiştirildi</div>}
                    <button type="submit" disabled={pwSaving} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">
                        {pwSaving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                        {pwSaving ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                    </button>
                </form>
            </div>

            {/* Current Plan */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4"><Crown size={16} className="text-amber-400" /> Mevcut Plan</h3>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-white">{plan.name}</span>
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-medium">Aktif</span>
                    </div>
                    <ul className="space-y-1.5">
                        {plan.features.map(f => (<li key={f} className="text-sm text-gray-400 flex items-center gap-2"><span className="text-emerald-400">✓</span> {f}</li>))}
                    </ul>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-gray-900 border border-red-900/30 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-3"><AlertTriangle size={16} /> Tehlikeli Alan</h3>
                <p className="text-xs text-gray-500 mb-3">Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir.</p>
                <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition-colors">Hesabı Sil</button>
            </div>
        </div>
    );
}
