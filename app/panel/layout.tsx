"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, UtensilsCrossed, Settings,
    Star, LogOut, Menu, X, QrCode, Paintbrush, BarChart3,
    UserCircle, CreditCard, CalendarDays, Inbox, Bell,
    MessageSquare, ChevronLeft, MoreVertical, HelpCircle,
    FileText, Mail, HeadphonesIcon,
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

const BOTTOM_NAV = [
    { href: "/panel/profile", label: "Profil", icon: UserCircle },
    { href: "/panel/inbox", label: "Gelen Kutusu", icon: Mail },
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

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifDropdown(false);
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

    const allNavItems = [...PRIMARY_NAV, ...SECONDARY_NAV, ...BOTTOM_NAV];

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
                {/* Header: Logo + Collapse */}
                <div className="px-4 pt-5 pb-3 flex items-center justify-between">
                    {!collapsed && (
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <QrCode size={18} className="text-white" />
                            </div>
                            <span className="text-lg font-bold text-white tracking-tight">QRlex</span>
                        </div>
                    )}
                    {collapsed && (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                            <QrCode size={18} className="text-white" />
                        </div>
                    )}
                    {!mobile && (
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className={`w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-500 transition-all ${collapsed ? 'mx-auto mt-3 rotate-180' : ''}`}
                        >
                            <ChevronLeft size={14} />
                        </button>
                    )}
                </div>

                {/* User Profile Card */}
                <div className="px-3 mb-3">
                    <div className={`rounded-2xl bg-gray-900 p-3 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-md">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                                    <p className="text-[11px] text-gray-500">{userRole === 'superadmin' ? 'Süper Admin' : 'Restoran Yöneticisi'}</p>
                                </div>
                                <button className="text-gray-600 hover:text-gray-400 transition-colors" onClick={handleLogout} title="Çıkış Yap">
                                    <MoreVertical size={16} />
                                </button>
                            </>
                        )}
                    </div>
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

                {/* Bottom Links */}
                <nav className="px-3 space-y-0.5">
                    {BOTTOM_NAV.map((item) => (
                        <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} showBadge={item.href === '/panel/inbox'} />
                    ))}
                </nav>

                {/* Divider */}
                <div className="mx-4 my-3 border-t border-gray-800/80" />

                {/* Logout */}
                {!collapsed && (
                    <div className="px-3 mb-2">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all">
                            <LogOut size={20} />
                            Çıkış Yap
                        </button>
                    </div>
                )}
                {collapsed && (
                    <div className="px-3 mb-2 flex justify-center">
                        <button onClick={handleLogout} className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all" title="Çıkış Yap">
                            <LogOut size={20} />
                        </button>
                    </div>
                )}

                {/* Support Widget */}
                {!collapsed && (
                    <div className="px-3 pb-4">
                        <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(160deg, #e8c4a0 0%, #d4a07a 30%, #b8869c 60%, #8b7db8 100%)' }}>
                            <div className="flex flex-col items-center py-5 px-4 relative z-10">
                                {/* Icon circles */}
                                <div className="relative mb-3">
                                    <div className="w-14 h-14 rounded-full border-2 border-black/10 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                                            <HeadphonesIcon size={20} className="text-gray-900" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-900">Yardım mı lazım?</p>
                                <p className="text-xs text-gray-800/70 mt-0.5">Destek ekibimiz 7/24 online</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-dvh bg-gray-950 flex">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex ${sidebarWidth} bg-black border-r border-gray-800/50 flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300`}>
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
                <header className="h-16 bg-gray-950 border-b border-gray-800/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white transition-colors"><Menu size={20} /></button>
                        <h2 className="text-base font-bold text-white">{allNavItems.find((n) => n.href === pathname)?.label || "Panel"}</h2>
                    </div>

                    {/* Right: Notification + Messages + Profile */}
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

                        {/* Profile */}
                        <Link
                            href="/panel/profile"
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
                        >
                            {userName.charAt(0).toUpperCase()}
                        </Link>
                    </div>
                </header>
                <main className="flex-1 p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
