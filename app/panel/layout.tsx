"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, UtensilsCrossed, Settings,
    Star, LogOut, Menu, X, QrCode, Paintbrush, BarChart3,
    UserCircle, CreditCard, CalendarDays, Inbox, Bell,
    MessageSquare, ChevronLeft, MoreVertical, HelpCircle,
    FileText, Mail, HeadphonesIcon, Search,
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
    { href: "/panel", label: "Dashboard", icon: LayoutDashboard },
    { href: "/panel/analytics", label: "İstatistikler", icon: BarChart3, badge: null },
    { href: "/panel/menu", label: "Menü Yönetimi", icon: UtensilsCrossed },
    { href: "/panel/qr-code", label: "QR Kod", icon: QrCode },
    { href: "/panel/design", label: "Tasarım", icon: Paintbrush },
];

const SECONDARY_NAV = [
    { href: "/panel/reviews", label: "Yorumlar", icon: Star },
    { href: "/panel/reservations", label: "Rezervasyonlar", icon: CalendarDays },
    { href: "/panel/payments", label: "Ödemeler", icon: CreditCard },
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
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

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

    const sidebarWidth = isSidebarCollapsed ? "w-[72px]" : "w-[260px]";
    const sidebarMargin = isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]";

    const allNavItems = [...PRIMARY_NAV, ...SECONDARY_NAV];

    // ─── Navigation Item ─────────────────────────────────────────
    const NavItem = ({ href, label, icon: Icon, showBadge }: { href: string; label: string; icon: React.ElementType; showBadge?: boolean }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group relative
                    ${isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                    }`}
                title={isSidebarCollapsed ? label : undefined}
            >
                <Icon size={20} className={`shrink-0 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`} />
                {!isSidebarCollapsed && (
                    <>
                        <span className="truncate">{label}</span>
                        {showBadge && unreadCount > 0 && (
                            <span className="ml-auto min-w-[20px] h-5 rounded-full bg-orange-400/20 text-orange-300 text-[10px] font-bold flex items-center justify-center px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </>
                )}
            </Link>
        );
    };

    // ─── Sidebar Content ─────────────────────────────────────────
    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
        const collapsed = mobile ? false : isSidebarCollapsed;
        return (
            <div className="flex flex-col h-full bg-black">
                {/* Header: Logo */}
                <div className="px-4 pt-5 pb-3 flex items-center justify-center">
                    {!collapsed ? (
                        <span className="text-xl font-extrabold text-white tracking-tight">QRLEX</span>
                    ) : (
                        <span className="text-lg font-extrabold text-white">Q</span>
                    )}
                </div>

                {/* Search Input */}
                <div className="px-3 mb-3">
                    {!collapsed ? (
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Ara..."
                                className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-700 transition-all"
                            />
                        </div>
                    ) : (
                        <button className="w-full flex items-center justify-center h-10 rounded-xl bg-gray-900 border border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600 transition-all">
                            <Search size={16} />
                        </button>
                    )}
                </div>

                {/* Primary Navigation */}
                <nav className="px-3 space-y-0.5">
                    {PRIMARY_NAV.map((item) => (
                        <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
                    ))}
                </nav>

                {/* Divider */}
                <div className="mx-4 my-3 border-t border-gray-800/80" />

                {/* Secondary Navigation */}
                <nav className="px-3 space-y-0.5">
                    {SECONDARY_NAV.map((item) => (
                        <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
                    ))}
                </nav>

                {/* Spacer */}
                <div className="flex-1" />
            </div>
        );
    };

    return (
        <div className="min-h-dvh bg-gray-950 flex">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex ${sidebarWidth} bg-black border-r border-gray-800/50 flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300`}>
                <SidebarContent />
                {/* Floating collapse/expand button on sidebar edge */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all z-40 shadow-md"
                >
                    <ChevronLeft size={12} className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
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
                <header className="h-16 bg-gray-950 border-b border-gray-800/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
                    {/* Left: Hamburger (mobile) + Logo + Page Title */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"><Menu size={20} /></button>
                        <span className="hidden lg:block text-lg font-extrabold text-white tracking-tight">QRLEX</span>
                        <span className="hidden lg:block w-px h-6 bg-gray-700" />
                        <h2 className="text-base font-bold text-white">{allNavItems.find((n) => n.href === pathname)?.label || "Panel"}</h2>
                    </div>

                    {/* Right: Notification + Messages + Inbox + Profile */}
                    <div className="flex items-center gap-2">
                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                className="relative w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifDropdown && (
                                <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                                        <h3 className="text-sm font-bold text-white">Bildirimler</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                                                Tümünü Okundu Yap
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center">
                                                <Bell size={24} className="mx-auto text-gray-600 mb-2" />
                                                <p className="text-sm text-gray-500">Bildirim yok</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => {
                                                        if (!n.isRead) markOneRead(n.id);
                                                        if (n.linkUrl) router.push(n.linkUrl);
                                                        setShowNotifDropdown(false);
                                                    }}
                                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-800/50 ${n.isRead ? 'opacity-60 hover:bg-gray-800/30' : 'bg-gray-800/20 hover:bg-gray-800/50'}`}
                                                >
                                                    <span className="text-lg mt-0.5">{NOTIF_ICONS[n.type] || '🔔'}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold text-white">{n.title}</span>
                                                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                                        <p className="text-[10px] text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <Link
                                        href="/panel/inbox"
                                        onClick={() => setShowNotifDropdown(false)}
                                        className="block text-center text-xs font-medium text-emerald-400 hover:text-emerald-300 py-3 border-t border-gray-800 transition-colors"
                                    >
                                        Tümünü Gör →
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <Link
                            href="/panel/inbox"
                            className="relative w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <MessageSquare size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-gray-950" />
                            )}
                        </Link>

                        {/* Inbox */}
                        <Link
                            href="/panel/inbox"
                            className="relative w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <Inbox size={20} />
                        </Link>

                        {/* Profile with Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
                            >
                                {userName.charAt(0).toUpperCase()}
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileDropdown && (
                                <div className="absolute right-0 top-12 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-800">
                                        <p className="text-sm font-bold text-white">{userName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{restaurantName}</p>
                                    </div>
                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <Link
                                            href="/panel/profile"
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors"
                                        >
                                            <UserCircle size={18} />
                                            <span>Profil</span>
                                        </Link>
                                        <Link
                                            href="/panel/settings"
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-colors"
                                        >
                                            <Settings size={18} />
                                            <span>Ayarlar</span>
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-800">
                                        <button
                                            onClick={() => { setShowProfileDropdown(false); handleLogout(); }}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
                                        >
                                            <LogOut size={18} />
                                            <span>Çıkış Yap</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
