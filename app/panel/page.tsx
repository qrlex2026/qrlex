"use client";
import { useState, useEffect } from "react";
import { ShoppingBag, LayoutGrid, Star, QrCode, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/useSession";

export default function PanelDashboard() {
    const { restaurantId, loading: sessionLoading } = useSession();
    const [stats, setStats] = useState({ products: 0, categories: 0, reviews: 0, avgRating: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionLoading) return;
        if (!restaurantId) { setLoading(false); return; }
        fetch(`/api/admin/stats?restaurantId=${restaurantId}`)
            .then((r) => r.json())
            .then((data) => {
                setStats({
                    products: data.productCount || 0,
                    categories: data.categoryCount || 0,
                    reviews: data.reviewCount || 0,
                    avgRating: Number(data.avgRating) || 0,
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [restaurantId, sessionLoading]);

    if (sessionLoading || loading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    const STAT_CARDS = [
        { label: "Ürünler", value: stats.products, icon: ShoppingBag, color: "from-violet-500 to-purple-600" },
        { label: "Kategoriler", value: stats.categories, icon: LayoutGrid, color: "from-blue-500 to-cyan-600" },
        { label: "Yorumlar", value: stats.reviews, icon: Star, color: "from-amber-500 to-orange-600" },
        { label: "Ort. Puan", value: stats.avgRating, icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
    ];

    const QUICK_ACTIONS = [
        { label: "Menü Yönetimi", href: "/panel/menu", icon: ShoppingBag },
        { label: "Kategoriler", href: "/panel/categories", icon: LayoutGrid },
        { label: "QR Kod Oluştur", href: "/panel/qr-code", icon: QrCode },
        { label: "Yorumlar", href: "/panel/reviews", icon: Star },
    ];

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="text-sm text-gray-400 mt-1">Restoran özeti</p></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STAT_CARDS.map((card) => (
                    <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}><card.icon size={20} className="text-white" /></div>
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                    </div>
                ))}
            </div>
            <div><h3 className="text-sm font-semibold text-gray-300 mb-3">Hızlı İşlemler</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {QUICK_ACTIONS.map((action) => (
                        <Link key={action.href} href={action.href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:bg-gray-800/80 transition-colors group flex items-center gap-3">
                            <action.icon size={18} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
