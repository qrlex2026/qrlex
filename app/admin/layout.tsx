"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    UtensilsCrossed,
    LayoutGrid,
    Settings,
    Star,
    LogOut,
    Menu,
    X,
    QrCode,
    ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/menu", label: "Menü Yönetimi", icon: UtensilsCrossed },
    { href: "/admin/categories", label: "Kategoriler", icon: LayoutGrid },
    { href: "/admin/reviews", label: "Yorumlar", icon: Star },
    { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Don't show layout on login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-5 py-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <QrCode size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white">QRlex</h1>
                        <p className="text-[11px] text-gray-500">Yönetim Paneli</p>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                                    ? "bg-violet-500/10 text-violet-400"
                                    : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                                }`}
                        >
                            <item.icon size={20} className={isActive ? "text-violet-400" : "text-gray-500 group-hover:text-gray-300"} />
                            {item.label}
                            {isActive && <ChevronRight size={16} className="ml-auto text-violet-500/50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: Restaurant Info + Logout */}
            <div className="px-3 pb-4 border-t border-gray-800 pt-4 space-y-2">
                <div className="px-3 py-2">
                    <p className="text-xs text-gray-500 mb-0.5">Aktif İşletme</p>
                    <p className="text-sm font-semibold text-white">Resital Lounge</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={20} />
                    Çıkış Yap
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-dvh bg-gray-950 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-[260px] bg-gray-900 border-r border-gray-800 flex-col fixed inset-y-0 left-0 z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <aside className="relative w-[280px] h-full bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-[260px] flex flex-col min-h-dvh">
                {/* Top Bar */}
                <header className="h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-base font-bold text-white">
                                {NAV_ITEMS.find((n) => n.href === pathname)?.label || "Admin"}
                            </h2>
                        </div>
                    </div>

                    <Link
                        href="/demo-restaurant"
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-violet-400 transition-colors bg-gray-800 px-3 py-1.5 rounded-lg"
                    >
                        Menüyü Görüntüle →
                    </Link>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
