"use client";
import { useState, useEffect } from "react";
import { BarChart3, Eye, Clock, Globe, TrendingUp } from "lucide-react";
import { useSession } from "@/lib/useSession";

type AnalyticsData = {
    totalViews: number;
    avgDuration: number;
    topProducts: { productId: string; name: string; image: string | null; views: number }[];
    languageStats: { language: string; count: number }[];
    dailyChart: { date: string; count: number }[];
};

const langNames: Record<string, string> = {
    tr: "Türkçe", en: "English", de: "Deutsch", fr: "Français", it: "Italiano",
    es: "Español", pt: "Português", ro: "Română", sq: "Shqip", el: "Ελληνικά",
    ka: "ქართული", ru: "Русский", uk: "Українська", az: "Azərbaycan",
    hi: "हिन्दी", ar: "العربية", fa: "فارسی", zh: "中文", ko: "한국어", ja: "日本語", id: "Indonesia",
};

export default function AnalyticsPage() {
    const { restaurantId, loading: sessionLoading } = useSession();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [range, setRange] = useState("today");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!restaurantId) return;
        setLoading(true);
        fetch(`/api/admin/analytics?restaurantId=${restaurantId}&range=${range}`)
            .then((r) => r.json())
            .then((d) => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [restaurantId, range]);

    if (sessionLoading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}dk ${s}s`;
    };

    const maxDaily = data ? Math.max(...data.dailyChart.map(d => d.count), 1) : 1;
    const maxProduct = data?.topProducts?.[0]?.views || 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">İstatistikler</h1>
                    <p className="text-sm text-gray-400 mt-1">QR menü analitikleri</p>
                </div>
                <div className="flex gap-2">
                    {[
                        { key: "today", label: "Bugün" },
                        { key: "week", label: "Bu Hafta" },
                        { key: "month", label: "Bu Ay" },
                    ].map((r) => (
                        <button
                            key={r.key}
                            onClick={() => setRange(r.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${range === r.key
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-800 text-gray-400 hover:text-white"
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading || !data ? (
                <div className="text-center py-20 text-gray-500">Yükleniyor...</div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Eye size={20} className="text-blue-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white">{data.totalViews}</p>
                            <p className="text-xs text-gray-500 mt-1">QR Okuma</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Clock size={20} className="text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white">{formatDuration(data.avgDuration)}</p>
                            <p className="text-xs text-gray-500 mt-1">Ort. Oturum Süresi</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                    <BarChart3 size={20} className="text-purple-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white">{data.topProducts.reduce((s, p) => s + p.views, 0)}</p>
                            <p className="text-xs text-gray-500 mt-1">Ürün Görüntüleme</p>
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Globe size={20} className="text-amber-400" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white">{data.languageStats.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Farklı Dil</p>
                        </div>
                    </div>

                    {/* Daily Chart */}
                    {data.dailyChart.length > 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-5">
                                <TrendingUp size={18} className="text-emerald-400" />
                                <h2 className="text-lg font-semibold text-white">Günlük Trend</h2>
                            </div>
                            <div className="flex items-end gap-1.5 h-32">
                                {data.dailyChart.map((d) => (
                                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-[10px] text-gray-500">{d.count}</span>
                                        <div
                                            className="w-full bg-emerald-500/80 rounded-t-md min-h-[4px] transition-all"
                                            style={{ height: `${(d.count / maxDaily) * 100}%` }}
                                        />
                                        <span className="text-[9px] text-gray-600 whitespace-nowrap">
                                            {d.date.slice(5)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Top Products */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">🏆 En Çok Görüntülenen</h2>
                            {data.topProducts.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-6">Henüz veri yok</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.topProducts.map((p, i) => (
                                        <div key={p.productId} className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-500 w-5">{i + 1}</span>
                                            {p.image ? (
                                                <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-gray-600">🍽️</div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">{p.name}</p>
                                                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className="bg-emerald-500 h-1.5 rounded-full"
                                                        style={{ width: `${(p.views / maxProduct) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-emerald-400">{p.views}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Language Stats */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">🌍 Dil Dağılımı</h2>
                            {data.languageStats.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-6">Henüz veri yok</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.languageStats.map((l) => {
                                        const total = data.languageStats.reduce((s, x) => s + x.count, 0);
                                        const pct = Math.round((l.count / total) * 100);
                                        return (
                                            <div key={l.language} className="flex items-center gap-3">
                                                <span className="text-sm text-white w-24 truncate">{langNames[l.language || ''] || l.language}</span>
                                                <div className="flex-1 bg-gray-800 rounded-full h-2">
                                                    <div
                                                        className="bg-amber-500 h-2 rounded-full"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 w-12 text-right">{pct}%</span>
                                                <span className="text-xs text-gray-500 w-8 text-right">{l.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
