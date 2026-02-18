"use client";
import { useState } from "react";
import { CreditCard, Crown, Check, Clock, ArrowUpRight } from "lucide-react";

interface Payment { id: string; date: string; amount: string; plan: string; status: "paid" | "pending" | "failed"; }

const plans = [
    { id: "free", name: "Ücretsiz", price: "₺0", period: "/ay", features: ["1 Restoran", "Sınırsız ürün", "QR kod", "Temel analitik"], current: true },
    { id: "pro", name: "Pro", price: "₺149", period: "/ay", features: ["1 Restoran", "Sınırsız ürün", "Video desteği", "Gelişmiş analitik", "Özel tema", "Öncelikli destek"], popular: true },
    { id: "business", name: "Business", price: "₺349", period: "/ay", features: ["5 Restoran", "Sınırsız ürün", "Video desteği", "Gelişmiş analitik", "Özel tema", "API erişimi", "7/24 destek"] },
];

// Mock payment history
const mockPayments: Payment[] = [];

export default function PaymentsPage() {
    const [activePlan] = useState("free");

    const statusBadge = (status: Payment["status"]) => {
        const styles = { paid: "bg-emerald-500/10 text-emerald-400", pending: "bg-amber-500/10 text-amber-400", failed: "bg-red-500/10 text-red-400" };
        const labels = { paid: "Ödendi", pending: "Bekliyor", failed: "Başarısız" };
        return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>{labels[status]}</span>;
    };

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-white">Ödemeler</h1><p className="text-sm text-gray-400 mt-1">Plan ve ödeme geçmişinizi yönetin</p></div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map(plan => (
                    <div key={plan.id} className={`relative bg-gray-900 border rounded-2xl p-5 ${plan.popular ? "border-emerald-500/50 shadow-lg shadow-emerald-500/5" : "border-gray-800"} ${activePlan === plan.id ? "ring-2 ring-emerald-500/30" : ""}`}>
                        {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">EN POPÜLER</span></div>}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown size={18} className={plan.popular ? "text-emerald-400" : "text-gray-500"} />
                                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-white">{plan.price}</span>
                                <span className="text-sm text-gray-500">{plan.period}</span>
                            </div>
                        </div>
                        <ul className="space-y-2 mb-5">
                            {plan.features.map(f => (
                                <li key={f} className="text-sm text-gray-400 flex items-center gap-2"><Check size={14} className="text-emerald-400 flex-shrink-0" /> {f}</li>
                            ))}
                        </ul>
                        {activePlan === plan.id ? (
                            <div className="w-full py-2.5 bg-gray-800 text-gray-400 rounded-xl text-sm font-medium text-center">Mevcut Plan</div>
                        ) : (
                            <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1">
                                Yükselt <ArrowUpRight size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Payment History */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4"><CreditCard size={16} /> Ödeme Geçmişi</h3>
                {mockPayments.length === 0 ? (
                    <div className="text-center py-10">
                        <Clock size={32} className="mx-auto mb-3 text-gray-700" />
                        <p className="text-sm text-gray-500">Henüz ödeme geçmişi yok</p>
                        <p className="text-xs text-gray-600 mt-1">Plan yükselttiğinizde ödemeleriniz burada görünecek</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="text-xs text-gray-500 border-b border-gray-800"><th className="text-left pb-3 font-medium">Tarih</th><th className="text-left pb-3 font-medium">Plan</th><th className="text-left pb-3 font-medium">Tutar</th><th className="text-left pb-3 font-medium">Durum</th></tr></thead>
                            <tbody>
                                {mockPayments.map(p => (
                                    <tr key={p.id} className="border-b border-gray-800/50 last:border-b-0">
                                        <td className="py-3 text-gray-300">{p.date}</td>
                                        <td className="py-3 text-gray-300">{p.plan}</td>
                                        <td className="py-3 text-white font-medium">{p.amount}</td>
                                        <td className="py-3">{statusBadge(p.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
