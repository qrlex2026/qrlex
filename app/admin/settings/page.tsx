"use client";

import { useState } from "react";
import { Save, MapPin, Phone, Mail, Globe, Instagram, Clock } from "lucide-react";

export default function SettingsPage() {
    const [form, setForm] = useState({
        name: "Resital Lounge",
        description: "Modern ve şık atmosferiyle Resital Lounge, taze malzemeler ve özenle hazırlanan tariflerle unutulmaz bir yemek deneyimi sunuyor.",
        address: "Atatürk Mah. Cumhuriyet Cad. No:42, Gebze / Kocaeli",
        phone: "+90 262 555 00 42",
        email: "info@resitallounge.com",
        website: "www.resitallounge.com",
        instagram: "@resitallounge",
    });

    const [hours, setHours] = useState([
        { day: "Pazartesi", open: "11:00", close: "23:00", isOpen: true },
        { day: "Salı", open: "11:00", close: "23:00", isOpen: true },
        { day: "Çarşamba", open: "11:00", close: "23:00", isOpen: true },
        { day: "Perşembe", open: "11:00", close: "23:00", isOpen: true },
        { day: "Cuma", open: "11:00", close: "00:00", isOpen: true },
        { day: "Cumartesi", open: "10:00", close: "00:00", isOpen: true },
        { day: "Pazar", open: "10:00", close: "23:00", isOpen: true },
    ]);

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const updateField = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const updateHours = (index: number, field: string, value: string | boolean) => {
        setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
    };

    const inputClass = "w-full bg-gray-800/70 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all";

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">İşletme Ayarları</h1>
                    <p className="text-sm text-gray-500">İşletme bilgilerinizi güncelleyin</p>
                </div>
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg ${saved
                            ? "bg-emerald-600 text-white shadow-emerald-500/20"
                            : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20"
                        }`}
                >
                    <Save size={18} />
                    {saved ? "Kaydedildi ✓" : "Kaydet"}
                </button>
            </div>

            {/* General Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-base font-bold text-white mb-1">Genel Bilgiler</h2>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                        İşletme Adı
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                        Açıklama
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        rows={3}
                        className={`${inputClass} resize-none`}
                    />
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-base font-bold text-white mb-1">İletişim Bilgileri</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                            <MapPin size={12} /> Adres
                        </label>
                        <input type="text" value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                            <Phone size={12} /> Telefon
                        </label>
                        <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                            <Mail size={12} /> E-posta
                        </label>
                        <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                            <Globe size={12} /> Website
                        </label>
                        <input type="text" value={form.website} onChange={(e) => updateField("website", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                            <Instagram size={12} /> Instagram
                        </label>
                        <input type="text" value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} className={inputClass} />
                    </div>
                </div>
            </div>

            {/* Working Hours */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <Clock size={18} className="text-gray-500" />
                    Çalışma Saatleri
                </h2>

                <div className="space-y-3">
                    {hours.map((h, i) => (
                        <div key={h.day} className="flex items-center gap-3 bg-gray-800/40 rounded-xl px-4 py-3">
                            <label className="flex items-center gap-2 min-w-[120px]">
                                <input
                                    type="checkbox"
                                    checked={h.isOpen}
                                    onChange={(e) => updateHours(i, "isOpen", e.target.checked)}
                                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-violet-500 focus:ring-violet-500/30"
                                />
                                <span className={`text-sm font-medium ${h.isOpen ? 'text-white' : 'text-gray-500'}`}>
                                    {h.day}
                                </span>
                            </label>
                            {h.isOpen ? (
                                <div className="flex items-center gap-2 ml-auto">
                                    <input
                                        type="time"
                                        value={h.open}
                                        onChange={(e) => updateHours(i, "open", e.target.value)}
                                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500"
                                    />
                                    <span className="text-gray-500 text-sm">-</span>
                                    <input
                                        type="time"
                                        value={h.close}
                                        onChange={(e) => updateHours(i, "close", e.target.value)}
                                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500"
                                    />
                                </div>
                            ) : (
                                <span className="ml-auto text-sm text-gray-600">Kapalı</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
