"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

export default function Home() {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  return (
    <>
      {/* Welcome Screen */}
      <div className="flex flex-col bg-black" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://github.com/qrlex2026/qrlexvideo/raw/refs/heads/main/2.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-5 px-6">
          {/* Logo */}
          <div className="w-[90px] h-[90px] rounded-2xl bg-black flex items-center justify-center mb-5 shadow-2xl">
            <span className="text-white text-4xl font-bold">R</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white text-center mb-2 drop-shadow-lg">Resital Lounge</h1>

          {/* Description */}
          <p className="text-white/70 text-sm text-center max-w-[280px] leading-relaxed">
            Eşsiz lezzetler ve unutulmaz anlar için sizi ağırlamaktan mutluluk duyuyoruz.
          </p>
        </div>

        {/* Bottom Navigation */}
        <div className="relative z-10 pb-20 px-6">
          <div className="flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <Link
              href="/menu/demo-restaurant"
              className="flex-1 py-4 text-white font-semibold text-sm text-center hover:bg-white/10 transition-colors rounded-l-2xl"
            >
              Menü
            </Link>
            <div className="w-px h-8 bg-white/20" />
            <button onClick={() => setIsLanguageOpen(true)} className="flex-1 py-4 text-white/60 font-medium text-sm text-center hover:bg-white/10 transition-colors">
              Dil
            </button>
            <div className="w-px h-8 bg-white/20" />
            <button className="flex-1 py-4 text-white/60 font-medium text-sm text-center hover:bg-white/10 transition-colors rounded-r-2xl">
              Kampanyalar
            </button>
          </div>
        </div>
      </div>

      {/* Language Selection Popup */}
      {isLanguageOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center" style={{ width: '100vw', height: '100vh' }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLanguageOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-t-3xl px-5 pt-6 pb-8">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Dil Seçin</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
                { code: 'en', label: 'English', flag: '🇬🇧' },
                { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                { code: 'ru', label: 'Русский', flag: '🇷🇺' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    const tryTranslate = () => {
                      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                      if (select) {
                        select.value = lang.code;
                        select.dispatchEvent(new Event('change'));
                        return true;
                      }
                      return false;
                    };
                    if (!tryTranslate()) {
                      document.cookie = `googtrans=/tr/${lang.code}; path=/`;
                      document.cookie = `googtrans=/tr/${lang.code}; path=/; domain=${window.location.hostname}`;
                      window.location.reload();
                    }
                    setIsLanguageOpen(false);
                  }}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5 transition-colors"
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-sm font-medium text-gray-800">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
