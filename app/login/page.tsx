"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, QrCode, Phone, Lock, ArrowLeft, KeyRound } from "lucide-react";

type Step = "login" | "forgot-phone" | "forgot-otp" | "forgot-newpass";

export default function OwnerLoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("login");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const cleanPhone = (p: string) => p.replace(/[\s\-\(\)]/g, "").replace(/^0/, "").replace(/^\+90/, "");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setIsLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: cleanPhone(phone), password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Giriş başarısız"); setIsLoading(false); return; }
            if (data.role !== "owner") { setError("Bu hesap restoran hesabı değil"); setIsLoading(false); return; }
            router.push("/panel"); router.refresh();
        } catch { setError("Bağlantı hatası"); setIsLoading(false); }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setIsLoading(true);
        try {
            const res = await fetch("/api/auth/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: cleanPhone(phone) }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setIsLoading(false); return; }
            setStep("forgot-otp"); setIsLoading(false);
        } catch { setError("Bağlantı hatası"); setIsLoading(false); }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) { setError("6 haneli kodu giriniz"); return; }
        setStep("forgot-newpass"); setError("");
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setIsLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: cleanPhone(phone), otp, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setIsLoading(false); return; }
            setSuccess("Şifre değiştirildi! Giriş yapabilirsiniz.");
            setStep("login"); setPassword(""); setOtp(""); setNewPassword(""); setIsLoading(false);
        } catch { setError("Bağlantı hatası"); setIsLoading(false); }
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
                    <p className="text-gray-400 text-sm">Restoran Yönetim Paneli</p>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-7 shadow-2xl">
                    {step === "login" && (
                        <>
                            <h2 className="text-xl font-bold text-white mb-1">Restoran Girişi</h2>
                            <p className="text-gray-400 text-sm mb-6">Telefon numaranız ve şifrenizle giriş yapın</p>
                            {success && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400 mb-4">✅ {success}</div>}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Telefon</label>
                                    <div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0555 123 45 67" required className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" /></div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Şifre</label>
                                    <div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                                </div>
                                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2"><span>⚠️</span>{error}</div>}
                                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2">
                                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={18} /> Giriş Yap</>}
                                </button>
                            </form>
                            <button onClick={() => { setStep("forgot-phone"); setError(""); setSuccess(""); }} className="w-full text-center text-sm text-gray-500 hover:text-emerald-400 transition-colors mt-4">Şifremi Unuttum</button>
                        </>
                    )}
                    {step === "forgot-phone" && (
                        <>
                            <button onClick={() => { setStep("login"); setError(""); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors mb-4"><ArrowLeft size={16} /> Giriş ekranına dön</button>
                            <h2 className="text-xl font-bold text-white mb-1">Şifremi Unuttum</h2>
                            <p className="text-gray-400 text-sm mb-6">Kayıtlı telefon numaranızı girin</p>
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div><label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Telefon</label><div className="relative"><Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0555 123 45 67" required className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" /></div></div>
                                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">⚠️ {error}</div>}
                                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Doğrulama Kodu Gönder"}
                                </button>
                            </form>
                        </>
                    )}
                    {step === "forgot-otp" && (
                        <>
                            <button onClick={() => { setStep("forgot-phone"); setError(""); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors mb-4"><ArrowLeft size={16} /> Geri</button>
                            <h2 className="text-xl font-bold text-white mb-1">Doğrulama Kodu</h2>
                            <p className="text-gray-400 text-sm mb-6">{phone} numarasına gönderilen 6 haneli kodu girin</p>
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div><input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="w-full bg-gray-800/70 border border-gray-700 rounded-xl px-4 py-4 text-2xl text-center text-white font-mono tracking-[0.5em] placeholder:text-gray-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" /></div>
                                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">⚠️ {error}</div>}
                                <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">Doğrula</button>
                            </form>
                        </>
                    )}
                    {step === "forgot-newpass" && (
                        <>
                            <button onClick={() => { setStep("forgot-otp"); setError(""); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors mb-4"><ArrowLeft size={16} /> Geri</button>
                            <div className="flex items-center gap-2 mb-4"><KeyRound className="text-emerald-400" size={24} /><h2 className="text-xl font-bold text-white">Yeni Şifre Belirle</h2></div>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div><label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Yeni Şifre</label><div className="relative"><Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="En az 6 karakter" required minLength={6} className="w-full bg-gray-800/70 border border-gray-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">⚠️ {error}</div>}
                                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Şifreyi Değiştir"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
                <div className="text-center mt-5">
                    <p className="text-sm text-gray-500">
                        Hesabınız yok mu?{" "}
                        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Kayıt Ol</Link>
                    </p>
                </div>
                <p className="text-center text-gray-600 text-xs mt-4">© 2026 QRlex — Tüm hakları saklıdır.</p>
            </div>
        </div>
    );
}
