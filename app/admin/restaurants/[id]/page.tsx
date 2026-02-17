"use client";

import { useState, useEffect, use } from "react";
import { UtensilsCrossed, LayoutGrid, Star, MessageCircle, Eye, QrCode } from "lucide-react";
import Link from "next/link";

interface Stats {
    productCount: number;
    categoryCount: number;
    reviewCount: number;
    avgRating: string;
}

export default function RestaurantDashboard({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const restaurantId = resolvedParams.id;
    const [stats, setStats] = useState<Stats | null>(null);
    const [restaurantSlug, setRestaurantSlug] = useState("");

    useEffect(() => {
        fetch(`/api/admin/stats?restaurantId=${restaurantId}`)
            .then((r) => r.json())
            .then(setStats);
        fetch(`/api/admin/restaurants/${restaurantId}`)
            .then((r) => r.json())
            .then((data) => setRestaurantSlug(data.slug || ""));
    }, [restaurantId]);

    const basePath = `/admin/restaurants/${restaurantId}`;

    const STATS = [
        { label: "Toplam Ürün", value: stats?.productCount ?? "...", icon: UtensilsCrossed, color: "violet" },
        { label: "Kategoriler", value: stats?.categoryCount ?? "...", icon: LayoutGrid, color: "blue" },
        { label: "Ortalama Puan", value: stats?.avgRating ?? "...", icon: Star, color: "amber" },
        { label: "Yorumlar", value: stats?.reviewCount ?? "...", icon: MessageCircle, color: "emerald" },
    ];

    const QUICK_ACTIONS = [
        { label: "Menüyü Düzenle", href: `${basePath}/menu`, icon: UtensilsCrossed },
        { label: "Kategorileri Yönet", href: `${basePath}/categories`, icon: LayoutGrid },
        { label: "Yorumları Gör", href: `${basePath}/reviews`, icon: Star },
        { label: "Ayarları Düzenle", href: `${basePath}/settings`, icon: Eye },
    ];

    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
        violet: { bg: "bg-violet-500/10", text: "text-violet-400", icon: "text-violet-400" },
        blue: { bg: "bg-blue-500/10", text: "text-blue-400", icon: "text-blue-400" },
        amber: { bg: "bg-amber-500/10", text: "text-amber-400", icon: "text-amber-400" },
        emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: "text-emerald-400" },
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {STATS.map((stat) => {
                    const c = colorMap[stat.color];
                    return (
                        <div key={stat.label} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                            <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                                <stat.icon size={20} className={c.icon} />
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Hızlı İşlemler</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {QUICK_ACTIONS.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:bg-gray-800/60 transition-all group"
                        >
                            <action.icon size={20} className="text-gray-500 group-hover:text-violet-400 transition-colors mb-2" />
                            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                {action.label}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* QR Banner */}
            <Link href={`${basePath}/qr-code`} className="block bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 rounded-2xl p-6 hover:from-violet-600/30 hover:to-indigo-600/30 transition-all group">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <QrCode size={28} className="text-violet-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">QR Menü Hazır!</h3>
                        <p className="text-sm text-gray-400">
                            Müşterileriniz QR kodu okutarak menünüze anlık erişebilir.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-violet-400 font-medium group-hover:text-violet-300 transition-colors">QR Kod Oluştur →</span>
                    </div>
                </div>
            </Link>

            {/* View Menu Link */}
            {restaurantSlug && (
                <Link
                    href={`/${restaurantSlug}`}
                    target="_blank"
                    className="block text-center text-xs text-gray-500 hover:text-violet-400 transition-colors bg-gray-900 border border-gray-800 px-4 py-3 rounded-xl"
                >
                    Müşteri Menüsünü Görüntüle → /{restaurantSlug}
                </Link>
            )}
        </div>
    );
}
