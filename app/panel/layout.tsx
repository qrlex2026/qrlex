"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, UtensilsCrossed, Settings,
    Star, LogOut, Menu, X, QrCode, ChevronRight, Paintbrush, BarChart3,
    UserCircle, CreditCard, CalendarDays, Inbox, Bell,
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

const NAV_ITEMS = [
    { href: "/panel", label: "Dashboard", icon: LayoutDashboard },
    { href: "/panel/analytics", label: "İstatistikler", icon: BarChart3 },
    { href: "/panel/menu", label: "Menü Yönetimi", icon: UtensilsCrossed },
    { href: "/panel/qr-code", label: "QR Kod", icon: QrCode },
    { href: "/panel/design", label: "Tasarım", icon: Paintbrush },
    { href: "/panel/reviews", label: "Yorumlar", icon: Star },
    { href: "/panel/reservations", label: "Rezervasyonlar", icon: CalendarDays },
    { href: "/panel/inbox", label: "Gelen Kutusu", icon: Inbox },
    { href: "/panel/profile", label: "Profil", icon: UserCircle },
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
    const [restaurantName, setRestaurantName] = useState("Restoran");
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
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
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

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="px-5 py-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <QrCode size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white truncate max-w-[160px]">{restaurantName}</h1>
                        <p className="text-[11px] text-gray-500">Yönetim Paneli</p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive ? "bg-emerald-500/10 text-emerald-400" : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"}`}>
                            <item.icon size={20} className={isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300"} />
                            {item.label}
                            {/* Show unread badge on Gelen Kutusu */}
                            {item.href === "/panel/inbox" && unreadCount > 0 && (
                                <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                            {isActive && <ChevronRight size={16} className="ml-auto text-emerald-500/50" />}
                        </Link>
                    );
                })}
            </nav>
            <div className="px-3 pb-4 border-t border-gray-800 pt-4 space-y-2">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut size={20} /> Çıkış Yap
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-dvh bg-gray-950 flex">
            <aside className="hidden lg:flex w-[260px] bg-gray-900 border-r border-gray-800 flex-col fixed inset-y-0 left-0 z-30"><SidebarContent /></aside>
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <aside className="relative w-[280px] h-full bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl">
                        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"><X size={18} /></button>
                        <SidebarContent />
                    </aside>
                </div>
            )}
            <div className="flex-1 lg:ml-[260px] flex flex-col min-h-dvh">
                <header className="h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"><Menu size={20} /></button>
                        <h2 className="text-base font-bold text-white">{NAV_ITEMS.find((n) => n.href === pathname)?.label || "Panel"}</h2>
                    </div>

                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                            className="relative w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown */}
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
                </header>
                <main className="flex-1 p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
