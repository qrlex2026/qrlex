"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    UtensilsCrossed, Settings,
    ArrowRight, Menu, X, QrCode, Paintbrush, ChartNoAxesColumn,
    UserCircle, Inbox, Bell, Brain, Search, Gift, Sun, Moon,
    Rocket, Command, Info, LogOut, Globe, Check,
} from "lucide-react";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    linkUrl: string | null;
    createdAt: string;
}

// ─── Navigation Groups ─────────────────────────────────────
const PRIMARY_NAV = [
    { href: "/panel/analytics", label: "İstatistik", icon: ChartNoAxesColumn, badge: null },
    { href: "/panel/menu", label: "Menü", icon: UtensilsCrossed },
    { href: "/panel/design", label: "Stil", icon: Paintbrush },
    { href: "/panel/qr-code", label: "QR Kod", icon: QrCode },
    { href: "/panel/ai", label: "Yapay Zeka", icon: Brain },
];

const SECONDARY_NAV = [
    { href: "/panel/settings", label: "Ayarlar", icon: Settings },
];



const NOTIF_ICONS: Record<string, string> = {
    payment: '💳',
    system: '🔔',
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const [restaurantName, setRestaurantName] = useState("Restoran");
    const [userName, setUserName] = useState("Kullanıcı");
    const [userRole, setUserRole] = useState("owner");
    const [restaurantId, setRestaurantId] = useState("");

    // Notifications state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Inbox state
    const [showInboxDropdown, setShowInboxDropdown] = useState(false);
    const inboxRef = useRef<HTMLDivElement>(null);

    // Gift state
    const [showGiftDropdown, setShowGiftDropdown] = useState(false);
    const giftRef = useRef<HTMLDivElement>(null);

    // Dark/Light mode toggle — persisted in localStorage
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [themeLoaded, setThemeLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('panelTheme');
        if (saved === 'light') setIsDarkMode(false);
        setThemeLoaded(true);
    }, []);

    useEffect(() => {
        if (themeLoaded) {
            localStorage.setItem('panelTheme', isDarkMode ? 'dark' : 'light');
        }
    }, [isDarkMode, themeLoaded]);

    // Theme CSS variables
    const themeVars: Record<string, string> = isDarkMode ? {
        '--p-bg': '#050505',
        '--p-surface': '#0c0c0c',
        '--p-surface2': '#1e1e1e',
        '--p-surface3': '#1a1a1a',
        '--p-sidebar': '#080808',
        '--p-border': '#141414',
        '--p-border2': 'rgba(255,255,255,0.08)',
        '--p-text': '#ffffff',
        '--p-text2': '#e0e0e0',
        '--p-text3': '#9ca3af',
        '--p-text4': '#6b7280',
        '--p-hover': '#252525',
        '--p-shadow': 'rgba(0,0,0,0.6)',
        '--p-icon': '#ffffff',
        '--p-icon-inactive': '#9ca3af',
        '--p-toggle-active': '#050505',
        '--p-nav-inactive-bg': '#1a1a1a',
        '--p-nav-inactive-text': '#9ca3af',
        '--p-nav-hover-bg': '#252525',
        '--p-nav-hover-text': '#e5e5e5',
        '--p-overlay-bg': 'rgba(0,0,0,0.6)',
        '--p-mobile-sidebar': '#000000',
    } : {
        '--p-bg': '#f5f5f5',
        '--p-surface': '#ffffff',
        '--p-surface2': '#f0f0f0',
        '--p-surface3': '#e8e8e8',
        '--p-sidebar': '#ffffff',
        '--p-border': '#e5e5e5',
        '--p-border2': 'rgba(0,0,0,0.08)',
        '--p-text': '#111111',
        '--p-text2': '#333333',
        '--p-text3': '#6b7280',
        '--p-text4': '#9ca3af',
        '--p-hover': '#e0e0e0',
        '--p-shadow': 'rgba(0,0,0,0.12)',
        '--p-icon': '#374151',
        '--p-icon-inactive': '#6b7280',
        '--p-toggle-active': '#e0e0e0',
        '--p-nav-inactive-bg': '#f0f0f0',
        '--p-nav-inactive-text': '#6b7280',
        '--p-nav-hover-bg': '#e0e0e0',
        '--p-nav-hover-text': '#111111',
        '--p-overlay-bg': 'rgba(0,0,0,0.3)',
        '--p-mobile-sidebar': '#ffffff',
    };

    // Language selector state
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [selectedLang, setSelectedLang] = useState({ code: 'tr', flag: '🇹🇷', name: 'Türkçe' });
    const langRef = useRef<HTMLDivElement>(null);

    const LANGUAGES = [
        { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
        { code: 'en', flag: '🇬🇧', name: 'English' },
        { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
        { code: 'fr', flag: '🇫🇷', name: 'Français' },
        { code: 'it', flag: '🇮🇹', name: 'Italiano' },
        { code: 'es', flag: '🇪🇸', name: 'Español' },
        { code: 'pt', flag: '🇵🇹', name: 'Português' },
        { code: 'ro', flag: '🇷🇴', name: 'Română' },
        { code: 'sq', flag: '🇦🇱', name: 'Shqip' },
        { code: 'el', flag: '🇬🇷', name: 'Ελληνικά' },
        { code: 'ka', flag: '🇬🇪', name: 'ქართული' },
        { code: 'ru', flag: '🇷🇺', name: 'Русский' },
        { code: 'uk', flag: '🇺🇦', name: 'Українська' },
        { code: 'az', flag: '🇦🇿', name: 'Azərbaycan' },
        { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
        { code: 'ar', flag: '🇸🇦', name: 'العربية' },
        { code: 'fa', flag: '🇮🇷', name: 'فارسی' },
        { code: 'zh', flag: '🇨🇳', name: '中文' },
        { code: 'ko', flag: '🇰🇷', name: '한국어' },
        { code: 'ja', flag: '🇯🇵', name: '日本語' },
        { code: 'id', flag: '🇮🇩', name: 'Bahasa' },
    ];

    useEffect(() => {
        fetch("/api/auth/me")
            .then((r) => r.json())
            .then((session) => {
                if (session.name) setUserName(session.name);
                if (session.role) setUserRole(session.role);
                if (session.restaurantId) {
                    setRestaurantId(session.restaurantId);
                    fetch(`/api/admin/restaurants/${session.restaurantId}`)
                        .then((r) => r.json())
                        .then((data) => setRestaurantName(data.name || "Restoran"));
                }
            });
    }, []);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?limit=10');
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error('Notification fetch error:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifDropdown(false);
            }
            if (inboxRef.current && !inboxRef.current.contains(e.target as Node)) {
                setShowInboxDropdown(false);
            }
            if (giftRef.current && !giftRef.current.contains(e.target as Node)) {
                setShowGiftDropdown(false);
            }
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setShowLangDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Fake notification data
    const fakeNotifications = [
        { id: '1', icon: 'settings', title: 'Ödeme Alındı', desc: 'Pro plan ödemesi başarıyla alındı', time: '1 saat önce', unread: true },
        { id: '2', icon: 'bell', title: 'Sistem', desc: 'Menünüz başarıyla güncellendi', time: '3 saat önce', unread: false },
    ];

    // Fake inbox data
    const fakeInboxMessages = [
        { id: '1', icon: 'info', sender: 'Destek Ekibi', message: 'Hoş geldiniz! Size nasıl yardımcı olabiliriz?', time: '5 dk önce', unread: true },
        { id: '2', icon: 'rocket', sender: 'QRLEX', message: 'Pro plana yükselterek tüm özelliklerin kilidini açın', time: '1 saat önce', unread: true },
        { id: '3', icon: 'settings', sender: 'Sistem', message: 'Haftalık raporunuz hazır, incelemek ister misiniz?', time: '2 saat önce', unread: false },
    ];

    const markAllRead = async () => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAllRead: true }),
        });
        fetchNotifications();
    };

    const markOneRead = async (id: string) => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        fetchNotifications();
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "owner" }) });
        router.push("/login");
        router.refresh();
    };

    const sidebarWidth = "w-[82px]";
    const sidebarMargin = "lg:ml-[82px]";

    const allNavItems = [...PRIMARY_NAV, ...SECONDARY_NAV];

    // ─── Sidebar Content ─────────────────────────────────────────
    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
        return (
            <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--p-sidebar)' }}>

                {/* Brand Logo */}
                <div className="flex items-center justify-center py-3 px-2">
                    <div
                        className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center"
                        style={{
                            backgroundColor: '#000000',
                        }}
                    >
                        <span
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: '#ffffff' }}
                        >
                            Q
                        </span>
                    </div>
                </div>

                {/* Primary Navigation - Icon + Label below */}
                <nav className="flex flex-col items-center gap-3 px-2 mt-2">
                    {PRIMARY_NAV.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex flex-col items-center gap-1 group"
                                title={item.label}
                            >
                                <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all
                                    ${isActive
                                        ? "bg-orange-500"
                                        : ""
                                    }`}
                                    style={!isActive ? { backgroundColor: 'var(--p-nav-inactive-bg)' } : {}}
                                >
                                    <item.icon size={20} style={{ color: isActive ? '#ffffff' : 'var(--p-icon)' }} />
                                </div>
                                <span className={`text-[11px] font-medium transition-colors
                                    ${isActive ? "text-orange-400" : ""
                                    }`}
                                    style={!isActive ? { color: 'var(--p-nav-inactive-text)' } : {}}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Secondary Navigation - Icon + Label below */}
                <nav className="flex flex-col items-center gap-3 px-2 pb-3">
                    {SECONDARY_NAV.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex flex-col items-center gap-1 group"
                                title={item.label}
                            >
                                <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all
                                    ${isActive
                                        ? "bg-orange-500"
                                        : ""
                                    }`}
                                    style={!isActive ? { backgroundColor: 'var(--p-nav-inactive-bg)' } : {}}
                                >
                                    <item.icon size={20} style={{ color: isActive ? '#ffffff' : 'var(--p-icon)' }} />
                                </div>
                                <span className={`text-[11px] font-medium transition-colors
                                    ${isActive ? "text-orange-400" : ""
                                    }`}
                                    style={!isActive ? { color: 'var(--p-nav-inactive-text)' } : {}}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                    {/* Logout */}
                    <button
                        onClick={() => { handleLogout(); }}
                        className="flex flex-col items-center gap-1 group"
                        title="Çıkış Yap"
                    >
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl group-hover:bg-red-500/20 transition-all" style={{ backgroundColor: 'var(--p-nav-inactive-bg)' }}>
                            <ArrowRight size={20} className="group-hover:text-red-400 transition-colors" style={{ color: 'var(--p-icon-inactive)' }} />
                        </div>
                        <span className="text-[11px] font-medium group-hover:text-red-400 transition-colors" style={{ color: 'var(--p-nav-inactive-text)' }}>Çıkış</span>
                    </button>
                </nav>
            </div>
        );
    };

    // Light theme CSS overrides — using dangerouslySetInnerHTML to avoid JS escaping issues
    const S = '[data-panel-theme="light"]';
    const lightThemeCSS = !isDarkMode ? [
        `${S} .bg-gray-900{background-color:#fff!important}`,
        `${S} .bg-gray-950{background-color:#f5f5f5!important}`,
        `${S} .bg-gray-800{background-color:#f0f0f0!important}`,
        `${S} .bg-gray-700{background-color:#e5e5e5!important}`,
        `${S} .bg-gray-800\\/60{background-color:rgba(0,0,0,.04)!important}`,
        `${S} .bg-gray-800\\/40{background-color:rgba(0,0,0,.03)!important}`,
        `${S} .bg-gray-900\\/80{background-color:rgba(255,255,255,.9)!important}`,
        `${S} .border-gray-800{border-color:#e5e5e5!important}`,
        `${S} .border-gray-700{border-color:#d1d5db!important}`,
        `${S} .border-gray-900{border-color:#e5e5e5!important}`,
        `${S} .border-gray-800\\/50{border-color:rgba(0,0,0,.08)!important}`,
        `${S} .border-gray-800\\/30{border-color:rgba(0,0,0,.06)!important}`,
        `${S} .text-white{color:#111!important}`,
        `${S} .text-gray-100{color:#1f2937!important}`,
        `${S} .text-gray-200{color:#374151!important}`,
        `${S} .text-gray-300{color:#4b5563!important}`,
        `${S} .text-gray-400{color:#6b7280!important}`,
        `${S} .text-gray-500{color:#9ca3af!important}`,
        `${S} .text-gray-600{color:#9ca3af!important}`,
        `${S} .text-emerald-400{color:#059669!important}`,
        `${S} .text-emerald-500{color:#059669!important}`,
        `${S} .divide-gray-800>:not(:first-child){border-color:#e5e5e5!important}`,
        `${S} .ring-gray-800{--tw-ring-color:#e5e5e5!important}`,
        `${S} .shadow-2xl{box-shadow:0 25px 50px -12px rgba(0,0,0,.1)!important}`,
        `${S} .from-gray-900{--tw-gradient-from:#fff!important}`,
        `${S} .to-gray-800{--tw-gradient-to:#f0f0f0!important}`,
    ].join('\n') : '';

    // Hex-based class overrides need proper CSS escaping — built programmatically
    const hexOverrides = !isDarkMode ? [
        ['bg', '1e1e1e', 'background-color', '#f0f0f0'],
        ['bg', '0c0c0c', 'background-color', '#fff'],
        ['bg', '050505', 'background-color', '#f5f5f5'],
        ['bg', '141414', 'background-color', '#f9f9f9'],
        ['bg', '161616', 'background-color', '#f5f5f5'],
        ['bg', '1a1a1a', 'background-color', '#f0f0f0'],
        ['bg', '111', 'background-color', '#f5f5f5'],
        ['bg', '2a2a2a', 'background-color', '#e8e8e8'],
        ['bg', '0f0f0f', 'background-color', '#fafafa'],
        ['border', '2a2a2a', 'border-color', '#e0e0e0'],
        ['border', '333', 'border-color', '#d1d5db'],
        ['border', '141414', 'border-color', '#e5e5e5'],
    ].map(([prop, hex, cssProp, val]) =>
        `${S} .${prop}-\\[\\#${hex}\\]{${cssProp}:${val}!important}`
    ).join('\n') : '';

    const pseudoOverrides = !isDarkMode ? [
        `${S} .placeholder-gray-500::placeholder{color:#9ca3af!important}`,
        `${S} .hover\\:bg-gray-700:hover{background-color:#e5e5e5!important}`,
        `${S} .hover\\:bg-gray-800:hover{background-color:#e5e5e5!important}`,
        `${S} .hover\\:bg-gray-800\\/60:hover{background-color:rgba(0,0,0,.04)!important}`,
        `${S} .hover\\:bg-\\[\\#1a1a1a\\]:hover{background-color:#eaeaea!important}`,
        `${S} .hover\\:bg-\\[\\#252525\\]:hover{background-color:#e0e0e0!important}`,
        `${S} .hover\\:bg-white\\/\\[0\\.06\\]:hover{background-color:rgba(0,0,0,.06)!important}`,
        `${S} .hover\\:text-white:hover{color:#111!important}`,
        `${S} .hover\\:text-gray-200:hover{color:#1f2937!important}`,
        `${S} .focus\\:border-gray-500:focus{border-color:#9ca3af!important}`,
        `${S} .bg-white\\/\\[0\\.06\\]{background-color:rgba(0,0,0,.04)!important}`,
        `${S} .bg-white\\/\\[0\\.08\\]{background-color:rgba(0,0,0,.06)!important}`,
        `${S} .border-white\\/\\[0\\.08\\]{border-color:rgba(0,0,0,.08)!important}`,
        `${S} .border-white\\/\\[0\\.06\\]{border-color:rgba(0,0,0,.06)!important}`,
        `${S} .bg-emerald-500\\/10{background-color:rgba(16,185,129,.08)!important}`,
        `${S} .bg-orange-500\\/10{background-color:rgba(249,115,22,.08)!important}`,
    ].join('\n') : '';

    const fullLightCSS = [lightThemeCSS, hexOverrides, pseudoOverrides].filter(Boolean).join('\n');

    return (
        <div className="min-h-dvh flex transition-colors duration-300" style={{ ...themeVars, backgroundColor: 'var(--p-bg)' } as React.CSSProperties}>
            {/* Theme overrides for child pages using Tailwind classes */}
            {!isDarkMode && (
                <style dangerouslySetInnerHTML={{ __html: fullLightCSS }} />
            )}

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex ${sidebarWidth} flex-col fixed inset-y-0 left-0 z-30 transition-colors duration-300`} style={{ backgroundColor: 'var(--p-sidebar)', borderRight: '1px solid var(--p-border)' }}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--p-overlay-bg)' }} onClick={() => setIsSidebarOpen(false)} />
                    <aside className="relative w-[280px] h-full flex flex-col shadow-2xl transition-colors duration-300" style={{ backgroundColor: 'var(--p-mobile-sidebar)', borderRight: '1px solid var(--p-border)' }}>
                        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors z-50" style={{ backgroundColor: 'var(--p-surface2)', color: 'var(--p-text3)' }}><X size={18} /></button>
                        <SidebarContent mobile />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 ${sidebarMargin} flex flex-col min-h-dvh transition-all duration-300`} data-panel-theme={isDarkMode ? 'dark' : 'light'}>
                <header className="h-20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 transition-colors duration-300" style={{ backgroundColor: 'var(--p-bg)', borderBottom: '1px solid var(--p-border)' }}>
                    {/* Left: Hamburger (mobile) + Page Title */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--p-surface2)', color: 'var(--p-text2)' }}><Menu size={18} /></button>
                        <h1 className="text-lg font-semibold" style={{ color: 'var(--p-text)' }}>
                            {[...PRIMARY_NAV, ...SECONDARY_NAV].find(item => pathname.startsWith(item.href))?.label || ''}
                        </h1>
                    </div>

                    {/* Right: Gift + Theme Toggle + Bildirim + Inbox + Profile */}
                    <div className="flex items-center gap-2">
                        {/* Gift - Referral Dropdown */}
                        <div className="relative" ref={giftRef}>
                            <button
                                onClick={() => { setShowGiftDropdown(!showGiftDropdown); setShowNotifDropdown(false); setShowInboxDropdown(false); setShowProfileDropdown(false); }}
                                className="w-[52px] h-[52px] rounded-full transition-colors flex items-center justify-center"
                                style={{ backgroundColor: 'var(--p-surface2)', color: 'var(--p-text)' }}
                            >
                                <Gift size={20} />
                            </button>
                            {showGiftDropdown && (
                                <div className="absolute right-0 top-[60px] w-[280px] rounded-2xl shadow-2xl z-50 p-4 transition-colors duration-300" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', backgroundColor: 'var(--p-surface)', border: '1px solid var(--p-border2)', boxShadow: `0 25px 50px -12px var(--p-shadow)` }}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                                            <Gift size={16} className="text-orange-400" />
                                        </div>
                                        <h3 className="text-[13px] font-semibold text-gray-100">Referans Programı</h3>
                                    </div>
                                    <p className="text-[12px] text-gray-400 leading-relaxed mb-3">Arkadaşlarınızı davet edin, her kayıt olan kişi için <span className="text-orange-400 font-medium">50 puan</span> kazanın! Puanlarınızı premium özelliklere dönüştürebilirsiniz.</p>
                                    <div className="bg-[#1e1e1e] rounded-xl p-3 mb-3">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Referans Linkiniz</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-[12px] text-orange-400 bg-[#0c0c0c] rounded-lg px-2 py-1.5 font-mono truncate">qrlex.com/ref/yavuz</code>
                                            <button className="text-[11px] text-gray-400 hover:text-white bg-[#0c0c0c] rounded-lg px-2 py-1.5 transition-colors">Kopyala</button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-gray-500">Toplam davet: <span className="text-gray-300">3</span></span>
                                        <span className="text-gray-500">Kazanılan puan: <span className="text-orange-400">150</span></span>
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Bildirim */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowInboxDropdown(false); setShowProfileDropdown(false); setShowGiftDropdown(false); }}
                                className="relative w-[52px] h-[52px] rounded-full transition-colors flex items-center justify-center"
                                style={{ backgroundColor: 'var(--p-surface2)', color: 'var(--p-text)' }}
                            >
                                <Bell size={20} />
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifDropdown && (
                                <div className="absolute right-0 top-[60px] w-[320px] rounded-2xl shadow-2xl z-50 transition-colors duration-300" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', backgroundColor: 'var(--p-surface)', border: '1px solid var(--p-border2)', boxShadow: `0 25px 50px -12px var(--p-shadow)` }}>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <h3 className="text-[13px] font-semibold text-gray-100">Bildirimler</h3>
                                        <button className="text-[11px] text-orange-400 hover:text-orange-300 font-medium transition-colors">Tümünü Okundu Yap</button>
                                    </div>
                                    <div className="mx-3 h-px bg-white/[0.06]" />
                                    <div className="py-1 px-1.5 max-h-[320px] overflow-y-auto">
                                        {fakeNotifications.map((n) => (
                                            <div key={n.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer">
                                                <div className="w-7 h-7 rounded-full bg-[#1e1e1e] flex items-center justify-center shrink-0 mt-0.5">
                                                    {n.icon === 'settings' && <Settings size={14} strokeWidth={1.5} className="text-gray-400" />}
                                                    {n.icon === 'bell' && <Bell size={14} strokeWidth={1.5} className="text-gray-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-medium text-gray-200">{n.title}</span>
                                                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                                                    </div>
                                                    <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">{n.desc}</p>
                                                </div>
                                                <span className="text-[10px] text-gray-600 mt-1 shrink-0">{n.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mx-3 h-px bg-white/[0.06]" />
                                    <Link
                                        href="/panel/inbox"
                                        onClick={() => setShowNotifDropdown(false)}
                                        className="block text-center text-[12px] font-medium text-orange-400 hover:text-orange-300 py-2.5 transition-colors"
                                    >
                                        Tümünü Gör →
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Gelen Kutusu */}
                        <div className="relative" ref={inboxRef}>
                            <button
                                onClick={() => { setShowInboxDropdown(!showInboxDropdown); setShowNotifDropdown(false); setShowProfileDropdown(false); setShowGiftDropdown(false); }}
                                className="relative w-[52px] h-[52px] rounded-full transition-colors flex items-center justify-center"
                                style={{ backgroundColor: 'var(--p-surface2)', color: 'var(--p-text)' }}
                            >
                                <Inbox size={20} />
                            </button>

                            {/* Inbox Dropdown */}
                            {showInboxDropdown && (
                                <div className="absolute right-0 top-[60px] w-[320px] rounded-2xl shadow-2xl z-50 transition-colors duration-300" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', backgroundColor: 'var(--p-surface)', border: '1px solid var(--p-border2)', boxShadow: `0 25px 50px -12px var(--p-shadow)` }}>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <h3 className="text-[13px] font-semibold text-gray-100">Gelen Kutusu</h3>
                                        <span className="text-[11px] text-gray-500">2 okunmamış</span>
                                    </div>
                                    <div className="mx-3 h-px bg-white/[0.06]" />
                                    <div className="py-1 px-1.5 max-h-[320px] overflow-y-auto">
                                        {fakeInboxMessages.map((m) => (
                                            <div key={m.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer">
                                                <div className="w-7 h-7 rounded-full bg-[#1e1e1e] flex items-center justify-center shrink-0 mt-0.5">
                                                    {m.icon === 'info' && <Info size={14} strokeWidth={1.5} className="text-gray-400" />}
                                                    {m.icon === 'rocket' && <Rocket size={14} strokeWidth={1.5} className="text-gray-400" />}
                                                    {m.icon === 'settings' && <Settings size={14} strokeWidth={1.5} className="text-gray-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-medium text-gray-200">{m.sender}</span>
                                                        {m.unread && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                                                    </div>
                                                    <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">{m.message}</p>
                                                </div>
                                                <span className="text-[10px] text-gray-600 mt-1 shrink-0">{m.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mx-3 h-px bg-white/[0.06]" />
                                    <Link
                                        href="/panel/inbox"
                                        onClick={() => setShowInboxDropdown(false)}
                                        className="block text-center text-[12px] font-medium text-orange-400 hover:text-orange-300 py-2.5 transition-colors"
                                    >
                                        Tümünü Gör →
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Language Selector */}
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => { setShowLangDropdown(!showLangDropdown); setShowNotifDropdown(false); setShowInboxDropdown(false); setShowProfileDropdown(false); setShowGiftDropdown(false); }}
                                className="flex items-center gap-2 h-[52px] pl-2 pr-3.5 rounded-full transition-colors"
                                style={{ backgroundColor: 'var(--p-surface2)' }}
                            >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--p-surface3)' }}>
                                    <span className="text-[15px] leading-none">{selectedLang.flag}</span>
                                </div>
                                <span className="text-[13px] font-medium hidden sm:inline" style={{ color: 'var(--p-text2)' }}>{selectedLang.name}</span>
                            </button>
                            {showLangDropdown && (
                                <div className="absolute right-0 top-[60px] w-[240px] rounded-2xl shadow-2xl z-50 py-2 transition-colors duration-300" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', backgroundColor: 'var(--p-surface)', border: '1px solid var(--p-border2)', boxShadow: `0 25px 50px -12px var(--p-shadow)` }}>
                                    <div className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <Globe size={14} className="text-gray-500" />
                                            <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Panel Dili</h3>
                                        </div>
                                    </div>
                                    <div className="mx-3 h-px bg-white/[0.06] mb-1" />
                                    <div className="max-h-[340px] overflow-y-auto px-1.5">
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => { setSelectedLang(lang); setShowLangDropdown(false); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${selectedLang.code === lang.code
                                                    ? 'bg-orange-500/10'
                                                    : 'hover:bg-white/[0.06]'
                                                    }`}
                                            >
                                                <span className="text-lg leading-none">{lang.flag}</span>
                                                <span className={`text-[13px] font-medium ${selectedLang.code === lang.code ? 'text-orange-400' : 'text-gray-300'
                                                    }`}>{lang.name}</span>
                                                {selectedLang.code === lang.code && (
                                                    <Check size={14} className="ml-auto text-orange-400" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile with Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); setShowInboxDropdown(false); setShowGiftDropdown(false); setShowLangDropdown(false); }}
                                className="flex items-center gap-2 h-[52px] pl-2 pr-3.5 rounded-full transition-colors"
                                style={{ backgroundColor: 'var(--p-surface2)' }}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-600 shrink-0" />
                                <span className="text-sm font-medium hidden sm:inline" style={{ color: 'var(--p-text2)' }}>Yavuz Türkoğlu</span>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileDropdown && (
                                <div className="absolute right-0 top-14 w-[220px] rounded-2xl shadow-2xl z-50 py-1.5 transition-colors duration-300" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', backgroundColor: 'var(--p-surface)', border: '1px solid var(--p-border2)', boxShadow: `0 25px 50px -12px var(--p-shadow)` }}>
                                    {/* Üst grup */}
                                    <div className="px-1.5 py-1">
                                        <Link
                                            href="/panel/profile"
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-200 hover:bg-white/[0.06] transition-colors"
                                        >
                                            <UserCircle size={18} strokeWidth={1.5} className="text-gray-400" />
                                            <span>Profil</span>
                                        </Link>
                                        <Link
                                            href="/panel/settings"
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-200 hover:bg-white/[0.06] transition-colors"
                                        >
                                            <Settings size={18} strokeWidth={1.5} className="text-gray-400" />
                                            <span>Ayarlar</span>
                                        </Link>
                                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-200 w-full">
                                            {isDarkMode ? <Moon size={18} strokeWidth={1.5} className="text-gray-400" /> : <Sun size={18} strokeWidth={1.5} className="text-gray-400" />}
                                            <span className="flex-1 text-left">Tema</span>
                                            <div className="flex items-center rounded-full p-0.5 transition-colors duration-300" style={{ backgroundColor: 'var(--p-surface3)' }}>
                                                <button
                                                    onClick={() => setIsDarkMode(true)}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                                                    style={isDarkMode ? { backgroundColor: 'var(--p-toggle-active)', color: 'var(--p-text)' } : { color: 'var(--p-text4)' }}
                                                >
                                                    <Moon size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setIsDarkMode(false)}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                                                    style={!isDarkMode ? { backgroundColor: 'var(--p-toggle-active)', color: 'var(--p-text)' } : { color: 'var(--p-text4)' }}
                                                >
                                                    <Sun size={13} />
                                                </button>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-200 hover:bg-white/[0.06] transition-colors w-full">
                                            <Rocket size={18} strokeWidth={1.5} className="text-gray-400" />
                                            <span>Yükselt</span>
                                        </button>
                                    </div>
                                    {/* Ayırıcı */}
                                    <div className="mx-3 my-1 h-px bg-white/[0.06]" />
                                    {/* Alt grup */}
                                    <div className="px-1.5 py-1">
                                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-200 hover:bg-white/[0.06] transition-colors w-full">
                                            <Command size={18} strokeWidth={1.5} className="text-gray-400" />
                                            <span>Klavye kısayolları</span>
                                        </button>
                                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-200 hover:bg-white/[0.06] transition-colors w-full">
                                            <Info size={18} strokeWidth={1.5} className="text-gray-400" />
                                            <span>Yardım merkezi</span>
                                        </button>
                                        <button
                                            onClick={() => { setShowProfileDropdown(false); handleLogout(); }}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-200 hover:bg-white/[0.06] transition-colors w-full"
                                        >
                                            <LogOut size={18} strokeWidth={1.5} className="text-gray-400" />
                                            <span>Çıkış yap</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 lg:p-6 transition-colors duration-300" style={{ backgroundColor: 'var(--p-bg)' }}>{children}</main>
            </div>
        </div>
    );
}
