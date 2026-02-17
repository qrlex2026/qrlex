"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, UtensilsCrossed, LayoutGrid, Settings,
    Star, LogOut, Menu, X, QrCode, ChevronRight, Paintbrush,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/panel", label: "Dashboard", icon: LayoutDashboard },
    { href: "/panel/menu", label: "Menü Yönetimi", icon: UtensilsCrossed },
    { href: "/panel/categories", label: "Kategoriler", icon: LayoutGrid },
    { href: "/panel/qr-code", label: "QR Kod", icon: QrCode },
    { href: "/panel/design", label: "Tasarım", icon: Paintbrush },
    { href: "/panel/reviews", label: "Yorumlar", icon: Star },
    { href: "/panel/settings", label: "Ayarlar", icon: Settings },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [restaurantName, setRestaurantName] = useState("Restoran");
    const [restaurantId, setRestaurantId] = useState("");

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
                </header>
                <main className="flex-1 p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
