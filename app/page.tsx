"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  Smartphone,
  Palette,
  BarChart3,
  Globe,
  Shield,
  ArrowRight,
  Star,
  Zap,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: QrCode,
    title: "QR Menü",
    desc: "Müşterileriniz QR kod okutarak anında dijital menünüze ulaşsın.",
    color: "from-violet-500 to-indigo-600",
  },
  {
    icon: Palette,
    title: "Tema Özelleştirme",
    desc: "Renk, font, kart stili — menünüzü markanıza göre tamamen özelleştirin.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Smartphone,
    title: "Mobil Uyumlu",
    desc: "Her cihazda mükemmel görünen, hızlı yüklenen mobil-first tasarım.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: BarChart3,
    title: "Yönetim Paneli",
    desc: "Ürün, kategori, yorum ve ayarları tek panelden kolayca yönetin.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Globe,
    title: "Çoklu Dil",
    desc: "Google Translate entegrasyonu ile menünüz otomatik çevrilsin.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Güvenli Altyapı",
    desc: "Supabase & Vercel altyapısı ile %99.9 uptime garantisi.",
    color: "from-gray-600 to-gray-800",
  },
];

const STEPS = [
  { num: "01", title: "Kayıt Olun", desc: "Hızlıca restoran hesabınızı oluşturun" },
  { num: "02", title: "Menünüzü Ekleyin", desc: "Kategori ve ürünlerinizi panelden girin" },
  { num: "03", title: "QR Kod Alın", desc: "Özelleştirilmiş QR kodunuzu indirip masalara yerleştirin" },
];

const STATS = [
  { value: "500+", label: "Restoran" },
  { value: "50K+", label: "Menü Görüntülenme" },
  { value: "%99.9", label: "Uptime" },
  { value: "7/24", label: "Destek" },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-gray-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <QrCode size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              QR<span className="text-violet-400">lex</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Özellikler
            </a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
              Nasıl Çalışır
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Fiyatlar
            </a>
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
            >
              Giriş Yap
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              Hemen Başla
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-950/95 backdrop-blur-xl border-t border-white/5 px-5 py-5 space-y-3">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white transition-colors">Özellikler</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white transition-colors">Nasıl Çalışır</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white transition-colors">Fiyatlar</a>
            <div className="pt-3 space-y-2">
              <Link href="/login" className="block w-full text-center py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium">Giriş Yap</Link>
              <Link href="/login" className="block w-full text-center py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-sm font-semibold">Hemen Başla</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source
            src="https://github.com/qrlex2026/qrlexvideo/raw/refs/heads/main/2.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/80 to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center pt-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-8">
            <Zap size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-300">
              Dijital Menü Çözümü
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
            Restoranınızın
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Dijital Menüsü
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            QR kod ile müşterilerinize modern, hızlı ve şık bir menü deneyimi sunun.
            Kurulumu 5 dakika, kullanımı sınırsız.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-2xl text-base font-semibold transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 flex items-center justify-center gap-2"
            >
              Ücretsiz Başla
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/demo-restaurant"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-base font-medium transition-all flex items-center justify-center gap-2"
            >
              Demo Menüyü Gör
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-4">
              <Star size={12} /> Özellikler
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Her Şey Tek Platformda
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Restoranınız için ihtiyacınız olan tüm dijital menü araçları
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-5 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-4">
              <Zap size={12} /> 3 Adımda
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-gray-400">5 dakikada dijital menünüzü oluşturun</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                  <span className="text-5xl font-black text-white/5 absolute top-4 right-6">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center mb-4">
                    <span className="text-sm font-bold text-violet-400">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-gray-700">
                    <ChevronRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-4">
              <Star size={12} /> Fiyatlandırma
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Basit & Şeffaf Fiyatlar
            </h2>
            <p className="text-gray-400">Gizli ücret yok, sürpriz yok</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="p-7 bg-white/[0.02] border border-white/5 rounded-2xl">
              <h3 className="text-lg font-semibold mb-1">Başlangıç</h3>
              <p className="text-sm text-gray-500 mb-5">Küçük işletmeler için</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">₺0</span>
                <span className="text-gray-500 text-sm mb-1">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["1 Restoran", "50 Ürün", "QR Kod Oluşturucu", "Mobil Menü", "Temel Tema"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full text-center py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all"
              >
                Ücretsiz Başla
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-7 bg-gradient-to-b from-violet-500/10 to-indigo-500/5 border border-violet-500/20 rounded-2xl relative">
              <div className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-xs font-semibold">
                Popüler
              </div>
              <h3 className="text-lg font-semibold mb-1">Profesyonel</h3>
              <p className="text-sm text-gray-500 mb-5">Büyüyen işletmeler için</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">₺299</span>
                <span className="text-gray-500 text-sm mb-1">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Sınırsız Restoran",
                  "Sınırsız Ürün",
                  "Gelişmiş Tema Editörü",
                  "Analitik & Raporlama",
                  "Öncelikli Destek",
                  "Özel Domain",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-violet-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full text-center py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
              >
                Pro&apos;ya Geç
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 sm:p-14 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-purple-600/20 border border-violet-500/10 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Dijital Menüye Geçin
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Binlerce restoran QRlex ile müşterilerine modern bir deneyim sunuyor.
                Siz de hemen başlayın.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-2xl text-base font-semibold transition-all shadow-2xl shadow-violet-500/30 flex items-center justify-center gap-2"
                >
                  Hemen Başla
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/demo-restaurant"
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-base font-medium transition-all flex items-center justify-center gap-2"
                >
                  Demo İncele
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <QrCode size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold">
              QR<span className="text-violet-400">lex</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/login" className="hover:text-white transition-colors">
              Giriş
            </Link>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Admin
            </Link>
            <Link href="/demo-restaurant" className="hover:text-white transition-colors">
              Demo
            </Link>
          </div>
          <p className="text-xs text-gray-600">
            © 2026 QRlex — Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
