"use client";
import { useState, useEffect } from "react";
import { ShoppingBag, LayoutGrid, Star, QrCode, TrendingUp, Palette, BarChart3, Plus, Percent, ChevronRight, Users, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/useSession";

export default function PanelDashboard() {
    const { restaurantId, loading: sessionLoading } = useSession();
    const [stats, setStats] = useState({ products: 0, categories: 0, reviews: 0, avgRating: 0 });
    const [restaurant, setRestaurant] = useState<{ name: string; slug: string; logo: string | null; phone: string | null } | null>(null);
    const [analytics, setAnalytics] = useState({ totalScans: 0, avgDuration: 0, topProducts: [] as { name: string; count: number }[] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionLoading) return;
        if (!restaurantId) { setLoading(false); return; }
        Promise.all([
            fetch(`/api/admin/stats?restaurantId=${restaurantId}`).then(r => r.json()),
            fetch(`/api/admin/restaurants/${restaurantId}`).then(r => r.json()).catch(() => null),
            fetch(`/api/admin/analytics?restaurantId=${restaurantId}&period=month`).then(r => r.json()).catch(() => null),
        ]).then(([statsData, restData, analyticsData]) => {
            setStats({ products: statsData.productCount || 0, categories: statsData.categoryCount || 0, reviews: statsData.reviewCount || 0, avgRating: Number(statsData.avgRating) || 0 });
            if (restData) setRestaurant(restData);
            if (analyticsData) setAnalytics({ totalScans: analyticsData.totalScans || 0, avgDuration: analyticsData.avgDuration || 0, topProducts: analyticsData.topProducts?.slice(0, 3) || [] });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [restaurantId, sessionLoading]);

    if (sessionLoading || loading) return (
        <div className="space-y-6 animate-pulse">
            {/* Shimmer keyframes via inline style */}
            <style>{`
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .skeleton { background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
            `}</style>
            {/* Header skeleton */}
            <div>
                <div className="skeleton h-7 w-40 mb-2" />
                <div className="skeleton h-4 w-56" />
            </div>
            {/* Quick Actions skeleton */}
            <div>
                <div className="skeleton h-4 w-28 mb-3" />
                <div className="flex gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="min-w-[140px] bg-gray-900 border border-gray-800 rounded-2xl p-4 flex-shrink-0">
                            <div className="skeleton w-10 h-10 rounded-xl mb-3" />
                            <div className="skeleton h-4 w-20 mb-1.5" />
                            <div className="skeleton h-3 w-24" />
                        </div>
                    ))}
                </div>
            </div>
            {/* Restaurant Card skeleton */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <div className="skeleton h-6 w-48 mb-2" />
                        <div className="skeleton h-4 w-36 mb-4" />
                        <div className="flex gap-6 mt-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i}>
                                    <div className="skeleton h-7 w-10 mb-1" />
                                    <div className="skeleton h-3 w-14" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="skeleton w-[120px] h-[120px] rounded-2xl flex-shrink-0" />
                </div>
            </div>
            {/* Stat Cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                        <div className="skeleton w-10 h-10 rounded-xl mb-3" />
                        <div className="skeleton h-7 w-16 mb-2" />
                        <div className="skeleton h-3 w-20" />
                    </div>
                ))}
            </div>
            {/* Bottom cards skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <div className="skeleton h-4 w-36 mb-4" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <div className="skeleton w-6 h-6 rounded-lg" />
                                    <div className="skeleton h-4 flex-1" />
                                    <div className="skeleton h-3 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const QUICK_ACTIONS = [
        { label: "Kategori Ekle", desc: "Yeni kategori oluştur", href: "/panel/menu", icon: Plus, gradient: "from-violet-500 to-purple-600" },
        { label: "Ürün Ekle", desc: "Menüye ürün ekle", href: "/panel/menu", icon: ShoppingBag, gradient: "from-blue-500 to-cyan-600" },
        { label: "Toplu Fiyat", desc: "Fiyatları güncelle", href: "/panel/menu", icon: Percent, gradient: "from-amber-500 to-orange-600" },
        { label: "Tasarım", desc: "Tema özelleştir", href: "/panel/design", icon: Palette, gradient: "from-pink-500 to-rose-600" },
        { label: "QR Kod", desc: "QR kod oluştur", href: "/panel/qr-code", icon: QrCode, gradient: "from-emerald-500 to-teal-600" },
        { label: "Analitik", desc: "İstatistikleri gör", href: "/panel/analytics", icon: BarChart3, gradient: "from-indigo-500 to-blue-600" },
    ];

    const STAT_CARDS = [
        { label: "Toplam Ürün", value: stats.products, icon: ShoppingBag, gradient: "from-violet-500 to-purple-600" },
        { label: "Kategori", value: stats.categories, icon: LayoutGrid, gradient: "from-blue-500 to-cyan-600" },
        { label: "QR Tarama", value: analytics.totalScans, icon: Eye, gradient: "from-emerald-500 to-teal-600" },
        { label: "Ort. Puan", value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—", icon: Star, gradient: "from-amber-500 to-orange-600" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="text-sm text-gray-400 mt-1">Restoran yönetim paneli</p></div>

            {/* Quick Actions — horizontal scroll */}
            <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Hızlı İşlemler</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {QUICK_ACTIONS.map(action => (
                        <Link key={action.label} href={action.href} className="min-w-[140px] bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-all group flex-shrink-0">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                <action.icon size={20} className="text-white" />
                            </div>
                            <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">{action.label}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{action.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Restaurant Card + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4">
                {/* Restaurant Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">{restaurant?.name || "Restoranınız"}</h3>
                            {restaurant?.slug && (
                                <a href={`/${restaurant.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1">
                                    qrlex.com/{restaurant.slug} <ChevronRight size={14} />
                                </a>
                            )}
                            {restaurant?.phone && <p className="text-xs text-gray-500 mt-2">📞 {restaurant.phone}</p>}
                            <div className="mt-4 flex gap-6">
                                <div><p className="text-xl font-bold text-white">{stats.products}</p><p className="text-[11px] text-gray-500">Ürün</p></div>
                                <div><p className="text-xl font-bold text-white">{stats.categories}</p><p className="text-[11px] text-gray-500">Kategori</p></div>
                                <div><p className="text-xl font-bold text-white">{analytics.totalScans}</p><p className="text-[11px] text-gray-500">QR Tarama</p></div>
                                <div><p className="text-xl font-bold text-white">{analytics.avgDuration > 0 ? `${Math.round(analytics.avgDuration)}s` : "—"}</p><p className="text-[11px] text-gray-500">Ort. Süre</p></div>
                            </div>
                        </div>
                        {/* QR Code */}
                        {restaurant?.slug && (
                            <div className="flex-shrink-0 bg-white rounded-2xl p-3">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://qrlex.com/${restaurant.slug}`)}&format=svg`} alt="QR" className="w-[120px] h-[120px]" />
                                <p className="text-[9px] text-center text-gray-500 mt-1 font-medium">QR Menü</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STAT_CARDS.map(card => (
                    <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3`}>
                            <card.icon size={20} className="text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Top Products + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Products */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-400" /> En Çok Görüntülenen</h3>
                        <Link href="/panel/analytics" className="text-xs text-emerald-400 hover:text-emerald-300">Tümü →</Link>
                    </div>
                    {analytics.topProducts.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.topProducts.map((p, i) => (
                                <div key={p.name} className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-500/10 text-amber-400" : i === 1 ? "bg-gray-700 text-gray-300" : "bg-gray-800 text-gray-400"}`}>{i + 1}</span>
                                    <span className="text-sm text-gray-300 flex-1 truncate">{p.name}</span>
                                    <span className="text-xs text-gray-500 font-medium">{p.count} görüntülenme</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6"><p className="text-sm text-gray-500">Henüz veri yok</p><p className="text-xs text-gray-600 mt-1">QR kodunuzu paylaşmaya başlayın</p></div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"><Users size={16} className="text-emerald-400" /> Yönetim</h3>
                    <div className="space-y-2">
                        {[
                            { label: "Menü Yönetimi", desc: "Ürün ekle, düzenle, sıra değiştir", href: "/panel/menu", icon: ShoppingBag },
                            { label: "Tasarım", desc: "Tema ve renk ayarları", href: "/panel/design", icon: Palette },
                            { label: "Yorumlar", desc: "Müşteri yorumlarını yönet", href: "/panel/reviews", icon: Star },
                            { label: "Ayarlar", desc: "Restoran bilgileri", href: "/panel/settings", icon: LayoutGrid },
                        ].map(item => (
                            <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors group">
                                <item.icon size={18} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.label}</p>
                                    <p className="text-[11px] text-gray-600">{item.desc}</p>
                                </div>
                                <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
