"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, QrCode, Phone, Lock, User } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Kayıt başarısız");
                setIsLoading(false);
                return;
            }

            // Registration successful — go to create restaurant
            router.push("/panel/create-restaurant");
            router.refresh();
        } catch {
            setError("Bağlantı hatası");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
            <div className="fixed inset-0 opacity-5"><div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} /></div>
            <div className="relative w-full max-w-[420px]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-5">
                        <QrCode size={36} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">QRlex</h1>
                    <p className="text-gray-400 text-sm">Ücretsiz Hesap Oluştur</p>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-7 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-1">Kayıt Ol</h2>
                    <p className="text-gray-400 text-sm mb-6">Restoranınız için QR menü oluşturun</p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Ad Soyad</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmet Yılmaz" required className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Telefon</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0555 123 45 67" required className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Şifre</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 6 karakter" required minLength={6} className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                        </div>

                        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2"><span>⚠️</span>{error}</div>}

                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2">
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={18} /> Kayıt Ol</>}
                        </button>
                    </form>

                    <div className="mt-5 pt-5 border-t border-gray-800 text-center">
                        <p className="text-sm text-gray-500">
                            Zaten hesabınız var mı?{" "}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Giriş Yap</Link>
                        </p>
                    </div>
                </div>
                <p className="text-center text-gray-600 text-xs mt-6">© 2026 QRlex — Tüm hakları saklıdır.</p>
            </div>
        </div>
    );
}
