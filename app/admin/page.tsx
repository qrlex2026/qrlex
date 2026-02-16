"use client";

import { UtensilsCrossed, LayoutGrid, Star, MessageCircle, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";

const STATS = [
    { label: "Toplam Ürün", value: "15", icon: UtensilsCrossed, color: "violet", change: "+2 bu hafta" },
    { label: "Kategoriler", value: "7", icon: LayoutGrid, color: "blue", change: "Aktif" },
    { label: "Ortalama Puan", value: "4.6", icon: Star, color: "amber", change: "128 değerlendirme" },
    { label: "Yorumlar", value: "6", icon: MessageCircle, color: "emerald", change: "+3 bu ay" },
];

const QUICK_ACTIONS = [
    { label: "Menüyü Düzenle", href: "/admin/menu", icon: UtensilsCrossed },
    { label: "Kategorileri Yönet", href: "/admin/categories", icon: LayoutGrid },
    { label: "Yorumları Gör", href: "/admin/reviews", icon: Star },
    { label: "Ayarları Düzenle", href: "/admin/settings", icon: Eye },
];

const RECENT_ACTIVITY = [
    { text: "Truffle Mushroom burger güncellendi", time: "2 saat önce", type: "edit" },
    { text: "Yeni yorum eklendi (5 ★)", time: "4 saat önce", type: "review" },
    { text: "Pepperoni pizza fiyatı güncellendi", time: "1 gün önce", type: "edit" },
    { text: "Yeni kategori eklendi: Tatlılar", time: "2 gün önce", type: "add" },
    { text: "Çalışma saatleri güncellendi", time: "3 gün önce", type: "settings" },
];

const colorClasses: Record<string, { bg: string; text: string; shadow: string }> = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", shadow: "shadow-violet-500/5" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", shadow: "shadow-blue-500/5" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", shadow: "shadow-amber-500/5" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", shadow: "shadow-emerald-500/5" },
};

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Hoş Geldiniz 👋</h1>
                <p className="text-gray-400 text-sm">Resital Lounge yönetim paneline hoş geldiniz.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {STATS.map((stat) => {
                    const colors = colorClasses[stat.color];
                    return (
                        <div
                            key={stat.label}
                            className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 lg:p-5 shadow-lg ${colors.shadow}`}
                        >
                            <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-3`}>
                                <stat.icon size={20} className={colors.text} />
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                            <p className={`text-[11px] ${colors.text} mt-1`}>{stat.change}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Hızlı İşlemler</h3>
                    <div className="space-y-2">
                        {QUICK_ACTIONS.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 hover:bg-gray-800/80 hover:border-gray-700 transition-all group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                                    <action.icon size={18} className="text-violet-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Son Aktiviteler</h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        {RECENT_ACTIVITY.map((activity, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-3 px-4 py-3.5 ${i < RECENT_ACTIVITY.length - 1 ? "border-b border-gray-800/60" : ""
                                    }`}
                            >
                                <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-300 truncate">{activity.text}</p>
                                </div>
                                <span className="text-xs text-gray-600 whitespace-nowrap">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* QR Code Preview Banner */}
            <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 rounded-2xl p-5 lg:p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <TrendingUp size={20} className="text-violet-400" />
                        QR Menünüz Hazır
                    </h3>
                    <p className="text-sm text-gray-400">Müşterileriniz QR kodu okutarak menünüze ulaşabilir.</p>
                </div>
                <Link
                    href="/demo-restaurant"
                    target="_blank"
                    className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-violet-500/20 whitespace-nowrap"
                >
                    Menüyü Gör
                </Link>
            </div>
        </div>
    );
}
