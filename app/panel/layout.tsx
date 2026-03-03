"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    UtensilsCrossed, Settings,
    Star, ArrowRight, Menu, X, QrCode, Paintbrush, ChartNoAxesColumn,
    UserCircle, CalendarDays, Inbox, Bell, Brain, Search, Gift, Sun, Moon,
    Rocket, Command, Info, LogOut, ChevronRight, Palette, Globe, Check,
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
    { href: "/panel/reviews", label: "Yorumlar", icon: Star },
    { href: "/panel/reservations", label: "Rezerve", icon: CalendarDays },
    { href: "/panel/settings", label: "Ayarlar", icon: Settings },
];



const NOTIF_ICONS: Record<string, string> = {
    review: '⭐',
    reservation: '📅',
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

    // Dark/Light mode toggle (visual only)
    const [isDarkMode, setIsDarkMode] = useState(true);

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
        { id: '1', icon: 'star', title: 'Yeni Yorum', desc: 'Mehmet B. restoranınıza 5 yıldız verdi', time: '2 dk önce', unread: true },
        { id: '2', icon: 'calendar', title: 'Rezervasyon', desc: 'Ayşe K. 4 kişilik rezervasyon yaptı', time: '15 dk önce', unread: true },
        { id: '3', icon: 'settings', title: 'Ödeme Alındı', desc: 'Pro plan ödemesi başarıyla alındı', time: '1 saat önce', unread: false },
        { id: '4', icon: 'bell', title: 'Sistem', desc: 'Menünüz başarıyla güncellendi', time: '3 saat önce', unread: false },
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
            <div className="flex flex-col h-full bg-[#080808]">

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
                                        : "bg-[#1a1a1a] group-hover:bg-[#252525]"
                                    }`}
                                >
                                    <item.icon size={20} className="text-white" />
                                </div>
                                <span className={`text-[11px] font-medium transition-colors
                                    ${isActive ? "text-orange-400" : "text-gray-300 group-hover:text-gray-100"
                                    }`}
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
                                        : "bg-[#1a1a1a] group-hover:bg-[#252525]"
                                    }`}
                                >
                                    <item.icon size={20} className="text-white" />
                                </div>
                                <span className={`text-[11px] font-medium transition-colors
                                    ${isActive ? "text-orange-400" : "text-gray-300 group-hover:text-gray-100"
                                    }`}
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
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1a1a1a] group-hover:bg-red-500/20 transition-all">
                            <ArrowRight size={20} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-300 group-hover:text-red-400 transition-colors">Çıkış</span>
                    </button>
                </nav>
            </div>
        );
    };

    return (
        <div className="min-h-dvh bg-gray-950 flex">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex ${sidebarWidth} bg-[#080808] border-r border-[#141414] flex-col fixed inset-y-0 left-0 z-30`}>
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <aside className="relative w-[280px] h-full bg-black border-r border-gray-800/50 flex flex-col shadow-2xl">
                        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors z-50"><X size={18} /></button>
                        <SidebarContent mobile />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 ${sidebarMargin} flex flex-col min-h-dvh transition-all duration-300`}>
                <header className="h-20 bg-[#050505] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 border-b border-[#141414]">
                    {/* Left: Hamburger (mobile) + Page Title */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-200 hover:bg-gray-700 transition-colors"><Menu size={18} /></button>
                        <h1 className="text-lg font-semibold text-white">
                            {[...PRIMARY_NAV, ...SECONDARY_NAV].find(item => pathname.startsWith(item.href))?.label || ''}
                        </h1>
                    </div>

                    {/* Center: Search Input */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
                        <div className="relative w-full">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Ara..."
                                className="w-full h-9 pl-9 pr-16 bg-[#1e1e1e] border border-gray-700 rounded-[10px] text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-medium bg-gray-800 px-1.5 py-0.5 rounded">⌘ F</span>
                        </div>
                    </div>

                    {/* Right: Gift + Theme Toggle + Bildirim + Inbox + Profile */}
                    <div className="flex items-center gap-2">
                        {/* Gift - Referral Dropdown */}
                        <div className="relative" ref={giftRef}>
                            <button
                                onClick={() => { setShowGiftDropdown(!showGiftDropdown); setShowNotifDropdown(false); setShowInboxDropdown(false); setShowProfileDropdown(false); }}
                                className="w-[52px] h-[52px] rounded-full bg-[#1e1e1e] text-white hover:bg-[#252525] transition-colors flex items-center justify-center"
                            >
                                <Gift size={20} />
                            </button>
                            {showGiftDropdown && (
                                <div className="absolute right-0 top-[60px] w-[280px] bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 z-50 p-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
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

                        {/* Dark/Light Toggle */}
                        <div className="flex items-center bg-[#1e1e1e] rounded-full p-1">
                            <button
                                onClick={() => setIsDarkMode(true)}
                                className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-[#050505] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Moon size={18} />
                            </button>
                            <button
                                onClick={() => setIsDarkMode(false)}
                                className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all ${!isDarkMode ? 'bg-[#050505] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Sun size={18} />
                            </button>
                        </div>

                        {/* Bildirim */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowInboxDropdown(false); setShowProfileDropdown(false); setShowGiftDropdown(false); }}
                                className="relative w-[52px] h-[52px] rounded-full bg-[#1e1e1e] text-white hover:bg-[#252525] transition-colors flex items-center justify-center"
                            >
                                <Bell size={20} />
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifDropdown && (
                                <div className="absolute right-0 top-[60px] w-[320px] bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 z-50" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <h3 className="text-[13px] font-semibold text-gray-100">Bildirimler</h3>
                                        <button className="text-[11px] text-orange-400 hover:text-orange-300 font-medium transition-colors">Tümünü Okundu Yap</button>
                                    </div>
                                    <div className="mx-3 h-px bg-white/[0.06]" />
                                    <div className="py-1 px-1.5 max-h-[320px] overflow-y-auto">
                                        {fakeNotifications.map((n) => (
                                            <div key={n.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer">
                                                <div className="w-7 h-7 rounded-full bg-[#1e1e1e] flex items-center justify-center shrink-0 mt-0.5">
                                                    {n.icon === 'star' && <Star size={14} strokeWidth={1.5} className="text-gray-400" />}
                                                    {n.icon === 'calendar' && <CalendarDays size={14} strokeWidth={1.5} className="text-gray-400" />}
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
                                className="relative w-[52px] h-[52px] rounded-full bg-[#1e1e1e] text-white hover:bg-[#252525] transition-colors flex items-center justify-center"
                            >
                                <Inbox size={20} />
                            </button>

                            {/* Inbox Dropdown */}
                            {showInboxDropdown && (
                                <div className="absolute right-0 top-[60px] w-[320px] bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 z-50" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
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
                                className="flex items-center gap-2 h-[52px] pl-2 pr-3.5 rounded-full bg-[#1e1e1e] hover:bg-[#252525] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
                                    <span className="text-[15px] leading-none">{selectedLang.flag}</span>
                                </div>
                                <span className="text-[13px] font-medium text-gray-300 hidden sm:inline">{selectedLang.name}</span>
                            </button>
                            {showLangDropdown && (
                                <div className="absolute right-0 top-[60px] w-[240px] bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 z-50 py-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
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
                                className="flex items-center gap-2 h-[52px] pl-2 pr-3.5 rounded-full bg-[#1e1e1e] hover:bg-[#252525] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-600 shrink-0" />
                                <span className="text-sm font-medium text-gray-200 hidden sm:inline">Yavuz Türkoğlu</span>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileDropdown && (
                                <div className="absolute right-0 top-14 w-[220px] bg-[#0c0c0c] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 z-50 py-1.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
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
                                        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-200 hover:bg-white/[0.06] transition-colors w-full">
                                            <Palette size={18} strokeWidth={1.5} className="text-gray-400" />
                                            <span className="flex-1 text-left">Tema</span>
                                            <ChevronRight size={14} className="text-gray-500" />
                                        </button>
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
                <main className="flex-1 p-4 lg:p-6 bg-[#050505]">{children}</main>
            </div>
        </div>
    );
}
