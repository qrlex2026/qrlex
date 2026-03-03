"use client";
import { useState, useMemo } from "react";
import {
    CreditCard, Check, ArrowLeft, ArrowRight, Copy,
    Building2, User, Banknote, CheckCircle2, Clock,
    Package, Shield, Zap, Star, Crown, Percent,
    CalendarDays, Receipt, AlertCircle, X, Sparkles,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
type CustomerType = "individual" | "corporate";
type PaymentMethod = "card" | "transfer";
type Step = "history" | "packages" | "billing" | "payment" | "success";
type Period = "monthly" | "quarterly" | "biannual" | "annual";

interface PaymentRecord {
    id: string; date: string; plan: string; period: string; amount: string; status: "paid" | "pending" | "failed";
}
interface PlanInfo {
    id: string; name: string; icon: React.ElementType; color: string; gradient: string; border: string; prices: Record<Period, number>; features: string[]; popular?: boolean;
}

// ─── Constants ───────────────────────────────────────────────
const PERIOD_LABELS: Record<Period, string> = { monthly: "Aylık", quarterly: "3 Aylık", biannual: "6 Aylık", annual: "Yıllık" };
const PERIOD_MONTHS: Record<Period, number> = { monthly: 1, quarterly: 3, biannual: 6, annual: 12 };

const PLANS: PlanInfo[] = [
    {
        id: "starter", name: "Başlangıç", icon: Package, color: "text-blue-400", gradient: "from-blue-600 to-blue-400", border: "border-blue-500/40",
        prices: { monthly: 699, quarterly: 1899, biannual: 3499, annual: 6499 },
        features: ["1 Restoran", "Sınırsız ürün", "QR kod oluşturma", "Temel analitik", "E-posta desteği"],
    },
    {
        id: "pro", name: "Pro", icon: Zap, color: "text-emerald-400", gradient: "from-emerald-600 to-emerald-400", border: "border-emerald-500/40", popular: true,
        prices: { monthly: 1299, quarterly: 3499, biannual: 6499, annual: 11999 },
        features: ["1 Restoran", "Sınırsız ürün", "Video desteği", "Gelişmiş analitik", "Özel tema tasarımı", "Öncelikli destek", "Çoklu dil desteği"],
    },
    {
        id: "business", name: "Business", icon: Crown, color: "text-amber-400", gradient: "from-amber-600 to-amber-400", border: "border-amber-500/40",
        prices: { monthly: 2499, quarterly: 6749, biannual: 12499, annual: 22999 },
        features: ["5 Restoran", "Sınırsız ürün", "Video desteği", "Gelişmiş analitik", "Özel tema tasarımı", "API erişimi", "7/24 canlı destek", "Beyaz etiket"],
    },
];

const MOCK_PAYMENTS: PaymentRecord[] = [
    { id: "1", date: "24.02.2026", plan: "Pro", period: "Aylık", amount: "₺1.533,82", status: "paid" },
    { id: "2", date: "24.01.2026", plan: "Pro", period: "Aylık", amount: "₺1.533,82", status: "paid" },
    { id: "3", date: "24.12.2025", plan: "Pro", period: "Aylık", amount: "₺1.533,82", status: "paid" },
    { id: "4", date: "24.11.2025", plan: "Başlangıç", period: "Aylık", amount: "₺825,82", status: "paid" },
    { id: "5", date: "24.10.2025", plan: "Başlangıç", period: "Aylık", amount: "₺825,82", status: "failed" },
];

const KDV_RATE = 0.20;
const STEP_LIST: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: "packages", label: "Paket Seçimi", icon: Package },
    { key: "billing", label: "Fatura Bilgileri", icon: Receipt },
    { key: "payment", label: "Ödeme", icon: CreditCard },
];

// ─── Helpers ─────────────────────────────────────────────────
function generateRefCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return `QRL-2026-${code}`;
}
function formatCardNumber(v: string) {
    return v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
}
function formatExpiry(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}
function detectCardBrand(num: string): string {
    const n = num.replace(/\s/g, "");
    if (n.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "MASTERCARD";
    if (/^3[47]/.test(n)) return "AMEX";
    if (/^(36|38|30)/.test(n)) return "DINERS";
    return "";
}

// ─── Component ───────────────────────────────────────────────
export default function PaymentsPage() {
    const [step, setStep] = useState<Step>("history");
    const [selectedPlan, setSelectedPlan] = useState<string>("pro");
    const [period, setPeriod] = useState<Period>("monthly");
    const [customerType, setCustomerType] = useState<CustomerType>("individual");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
    const [discountCode, setDiscountCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);
    const [copied, setCopied] = useState(false);
    const [refCode] = useState(generateRefCode);
    const [showSuccess, setShowSuccess] = useState(false);

    const [billing, setBilling] = useState({
        name: "", tc: "", phone: "", email: "", address: "",
        companyName: "", taxOffice: "", taxNo: "",
    });
    const [card, setCard] = useState({ number: "", expiry: "", cvv: "", holder: "" });

    const plan = PLANS.find(p => p.id === selectedPlan)!;
    const basePrice = plan.prices[period];
    const discount = discountApplied ? Math.round(basePrice * 0.10) : 0;
    const subtotal = basePrice - discount;
    const kdv = Math.round(subtotal * KDV_RATE);
    const total = subtotal + kdv;

    const annualDiscount = useMemo(() => {
        const monthly = plan.prices.monthly * 12;
        const annual = plan.prices.annual;
        return Math.round(((monthly - annual) / monthly) * 100);
    }, [plan]);

    const billingValid = customerType === "individual"
        ? billing.name && billing.tc && billing.phone && billing.email
        : billing.companyName && billing.taxOffice && billing.taxNo && billing.phone && billing.email;

    const cardValid = card.number.replace(/\s/g, "").length === 16 && card.expiry.length === 5 && card.cvv.length === 3 && card.holder;
    const currentStepIndex = STEP_LIST.findIndex(s => s.key === step);
    const cardBrand = detectCardBrand(card.number);

    function handleApplyDiscount() { if (discountCode.toUpperCase() === "QRLEX10") setDiscountApplied(true); }
    function handlePay() { setShowSuccess(true); setTimeout(() => { setStep("success"); setShowSuccess(false); }, 1500); }
    function copyRef() { navigator.clipboard.writeText(refCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    function resetCheckout() { setStep("history"); setDiscountCode(""); setDiscountApplied(false); setCard({ number: "", expiry: "", cvv: "", holder: "" }); }

    // ── Status Badge ────────────────────────────────────────
    const StatusBadge = ({ status }: { status: PaymentRecord["status"] }) => {
        const map = {
            paid: { bg: "bg-emerald-500/10 text-emerald-400", icon: <Check size={12} />, label: "Ödendi" },
            pending: { bg: "bg-amber-500/10 text-amber-400", icon: <Clock size={12} />, label: "Bekliyor" },
            failed: { bg: "bg-red-500/10 text-red-400", icon: <AlertCircle size={12} />, label: "Başarısız" },
        };
        const s = map[status];
        return <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.bg}`}>{s.icon} {s.label}</span>;
    };

    // ── Premium Stepper ─────────────────────────────────────
    const Stepper = () => (
        <div className="relative mb-10">
            {/* Background Card */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800/80 to-gray-900 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between relative">
                    {/* Connecting Line */}
                    <div className="absolute top-6 left-[60px] right-[60px] h-[2px] bg-gray-700/50" />
                    <div className="absolute top-6 left-[60px] h-[2px] bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
                        style={{ width: currentStepIndex <= 0 ? "0%" : currentStepIndex === 1 ? "45%" : "calc(100% - 120px)" }} />

                    {STEP_LIST.map((s, i) => {
                        const active = i === currentStepIndex;
                        const done = i < currentStepIndex;
                        const Icon = s.icon;
                        return (
                            <div key={s.key} className="relative z-10 flex flex-col items-center gap-2.5">
                                {/* Circle */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${done ? "bg-emerald-500 shadow-lg shadow-emerald-500/30 rotate-0"
                                        : active ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-500/10 scale-110"
                                            : "bg-gray-800 border border-gray-700"
                                    }`}>
                                    {done ? <Check size={18} className="text-white" /> : <Icon size={18} className={active ? "text-white" : "text-gray-500"} />}
                                </div>
                                {/* Label */}
                                <div className="text-center">
                                    <p className={`text-xs font-bold transition-colors ${active ? "text-emerald-400" : done ? "text-emerald-500/70" : "text-gray-500"}`}>
                                        Adım {i + 1}
                                    </p>
                                    <p className={`text-[11px] mt-0.5 transition-colors ${active ? "text-gray-300" : done ? "text-gray-500" : "text-gray-600"}`}>
                                        {s.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // ── Visual Credit Card ──────────────────────────────────
    const CreditCardVisual = () => {
        const displayNum = card.number || "•••• •••• •••• ••••";
        const displayHolder = card.holder || "AD SOYAD";
        const displayExpiry = card.expiry || "••/••";
        return (
            <div className="relative mb-6 perspective-1000">
                <div className="relative w-full max-w-[380px] mx-auto aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                    {/* Card Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 via-transparent to-blue-600/10" />
                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
                    {/* Chip */}
                    <div className="absolute top-6 left-6">
                        <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0.5 rounded-sm border border-amber-400/50" />
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-500/40" />
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-amber-500/30" />
                        </div>
                    </div>
                    {/* Contactless Icon */}
                    <div className="absolute top-7 left-20 text-gray-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 13.5a5 5 0 0 1 0-7" /><path d="M10 11.5a2 2 0 0 1 0-3" /><path d="M3 15.5a8.5 8.5 0 0 1 0-11" /></svg>
                    </div>
                    {/* Card Brand */}
                    <div className="absolute top-5 right-6">
                        {cardBrand === "VISA" && <span className="text-2xl font-black italic text-white/90 tracking-tight">VISA</span>}
                        {cardBrand === "MASTERCARD" && (
                            <div className="flex -space-x-2"><div className="w-7 h-7 rounded-full bg-red-500/90" /><div className="w-7 h-7 rounded-full bg-amber-400/80" /></div>
                        )}
                        {!cardBrand && <CreditCard size={28} className="text-gray-600" />}
                    </div>
                    {/* Card Number */}
                    <div className="absolute bottom-16 left-6 right-6">
                        <p className="text-[22px] font-mono text-white tracking-[3px] drop-shadow-sm">{displayNum}</p>
                    </div>
                    {/* Bottom Row */}
                    <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                        <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-0.5">Kart Sahibi</p>
                            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{displayHolder}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-0.5">Son Kullanma</p>
                            <p className="text-xs font-semibold text-gray-300 tracking-wider">{displayExpiry}</p>
                        </div>
                    </div>
                    {/* Subtle Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                </div>
            </div>
        );
    };

    // ── Summary Panel ───────────────────────────────────────
    const SummaryPanel = () => (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden h-fit sticky top-4">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${plan.gradient} p-4`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <plan.icon size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white/70 text-xs font-medium">Seçilen Paket</p>
                        <p className="text-white font-bold">{plan.name} — {PERIOD_LABELS[period]}</p>
                    </div>
                </div>
            </div>
            <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between text-gray-400"><span>Paket Ücreti</span><span className="text-white">₺{basePrice.toLocaleString("tr-TR")}</span></div>
                {discountApplied && <div className="flex justify-between text-emerald-400"><span>İndirim (%10)</span><span>-₺{discount.toLocaleString("tr-TR")}</span></div>}
                <div className="border-t border-gray-800 pt-3 flex justify-between text-gray-400"><span>Ara Toplam</span><span className="text-white">₺{subtotal.toLocaleString("tr-TR")}</span></div>
                <div className="flex justify-between text-gray-400"><span>KDV (%20)</span><span className="text-white">₺{kdv.toLocaleString("tr-TR")}</span></div>
                <div className="border-t border-gray-800 pt-3 flex justify-between font-bold text-white text-base"><span>Toplam</span><span className="text-emerald-400">₺{total.toLocaleString("tr-TR")}</span></div>
            </div>
            {/* Discount Code */}
            <div className="px-5 pb-5">
                <div className="flex gap-2">
                    <input value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="İndirim kodu" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50" />
                    <button onClick={handleApplyDiscount} disabled={discountApplied} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        {discountApplied ? <Check size={16} /> : "Uygula"}
                    </button>
                </div>
                {discountApplied && <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1"><Sparkles size={10} /> QRLEX10 kodu uygulandı</p>}
            </div>
        </div>
    );

    // ─── STEP: History ──────────────────────────────────────
    if (step === "history") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Ödemeler</h1>
                        <p className="text-sm text-gray-400 mt-1">Ödeme geçmişi ve paket yönetimi</p>
                    </div>
                    <button onClick={() => setStep("packages")} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30">
                        <Package size={16} /> Paket Satın Al
                    </button>
                </div>

                {/* Current plan info */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Zap size={24} className="text-emerald-400" /></div>
                        <div>
                            <p className="text-sm text-gray-400">Aktif Paketiniz</p>
                            <p className="text-lg font-bold text-white">Pro — Aylık</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Sonraki ödeme</p>
                        <p className="text-sm font-semibold text-white">24.03.2026</p>
                    </div>
                </div>

                {/* Payment History Table */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4"><CreditCard size={16} /> Ödeme Geçmişi</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-500 border-b border-gray-800">
                                    <th className="text-left pb-3 font-medium">Tarih</th>
                                    <th className="text-left pb-3 font-medium">Paket</th>
                                    <th className="text-left pb-3 font-medium">Dönem</th>
                                    <th className="text-left pb-3 font-medium">Tutar</th>
                                    <th className="text-left pb-3 font-medium">Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_PAYMENTS.map(p => (
                                    <tr key={p.id} className="border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors">
                                        <td className="py-3.5 text-gray-300">{p.date}</td>
                                        <td className="py-3.5 text-gray-300 font-medium">{p.plan}</td>
                                        <td className="py-3.5 text-gray-400">{p.period}</td>
                                        <td className="py-3.5 text-white font-semibold">{p.amount}</td>
                                        <td className="py-3.5"><StatusBadge status={p.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // ─── STEP: Success ──────────────────────────────────────
    if (step === "success") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-6 max-w-md">
                    {/* Animated check with rings */}
                    <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: "2s" }} />
                        <div className="absolute inset-2 rounded-full bg-emerald-500/20 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                                <CheckCircle2 size={40} className="text-white" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Ödemeniz Başarıyla Alındı!</h2>
                        <p className="text-gray-400">
                            {paymentMethod === "card"
                                ? "Kredi kartınızdan ödeme başarıyla tahsil edildi."
                                : "EFT/Havale bildiriminiz alındı. Onaylandıktan sonra paketiniz aktifleşecektir."
                            }
                        </p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-sm space-y-3">
                        <div className="flex justify-between text-gray-400"><span>Paket</span><span className="text-white font-medium">{plan.name} — {PERIOD_LABELS[period]}</span></div>
                        <div className="flex justify-between text-gray-400"><span>Toplam</span><span className="text-emerald-400 font-bold text-lg">₺{total.toLocaleString("tr-TR")}</span></div>
                        {paymentMethod === "transfer" && <div className="flex justify-between text-gray-400"><span>Referans Kodu</span><span className="text-emerald-400 font-mono font-bold">{refCode}</span></div>}
                    </div>
                    <button onClick={resetCheckout} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20">
                        Ödemelere Dön
                    </button>
                </div>
            </div>
        );
    }

    // ─── CHECKOUT STEPS ─────────────────────────────────────
    return (
        <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button onClick={() => {
                    if (step === "packages") resetCheckout();
                    else if (step === "billing") setStep("packages");
                    else if (step === "payment") setStep("billing");
                }} className="w-10 h-10 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-gray-700/50 flex items-center justify-center text-gray-400 transition-all hover:text-white hover:scale-105">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Paket Satın Al</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{STEP_LIST[currentStepIndex]?.label}</p>
                </div>
            </div>

            <Stepper />

            {/* ─── STEP: Packages ─────────────────────────── */}
            {step === "packages" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        {/* Plan Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {PLANS.map(p => {
                                const active = selectedPlan === p.id;
                                const Icon = p.icon;
                                return (
                                    <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                                        className={`relative text-left bg-gray-900 border rounded-2xl p-5 transition-all duration-300 ${active ? `${p.border} shadow-lg scale-[1.02]` : "border-gray-800 hover:border-gray-700 hover:scale-[1.01]"
                                            }`}>
                                        {p.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2"><span className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap shadow-lg shadow-emerald-500/25">EN POPÜLER</span></div>}
                                        {/* Glow */}
                                        {active && <div className={`absolute -inset-px rounded-2xl bg-gradient-to-b ${p.gradient} opacity-10 blur-sm`} />}
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
                                                    <Icon size={14} className="text-white" />
                                                </div>
                                                <span className="text-base font-bold text-white">{p.name}</span>
                                            </div>
                                            <div className="flex items-baseline gap-1 mb-4">
                                                <span className="text-2xl font-bold text-white">₺{p.prices[period].toLocaleString("tr-TR")}</span>
                                                <span className="text-xs text-gray-500">+ KDV</span>
                                            </div>
                                            <ul className="space-y-1.5">
                                                {p.features.map(f => (
                                                    <li key={f} className="text-xs text-gray-400 flex items-center gap-1.5"><Check size={12} className="text-emerald-500 flex-shrink-0" /> {f}</li>
                                                ))}
                                            </ul>
                                            {active && <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"><Check size={12} className="text-white" /></div>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Period Selection */}
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"><CalendarDays size={16} /> Ödeme Dönemi</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {(Object.keys(PERIOD_LABELS) as Period[]).map(k => (
                                    <button key={k} onClick={() => setPeriod(k)}
                                        className={`relative text-center py-3 px-3 rounded-xl border text-sm font-medium transition-all duration-300 ${period === k ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/10" : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                                            }`}>
                                        {k === "annual" && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg shadow-red-500/25">%{annualDiscount} İNDİRİM</span>}
                                        <span className="block">{PERIOD_LABELS[k]}</span>
                                        <span className="block text-xs text-gray-500 mt-0.5">₺{plan.prices[k].toLocaleString("tr-TR")} + KDV</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <SummaryPanel />
                        <button onClick={() => setStep("billing")} className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                            Devam Et <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── STEP: Billing ──────────────────────────── */}
            {step === "billing" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Receipt size={16} className="text-emerald-400" /> Fatura Bilgileri</h3>
                                {/* Customer Type Toggle */}
                                <div className="flex bg-gray-900 rounded-lg p-0.5 border border-gray-700/50">
                                    <button onClick={() => setCustomerType("individual")}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${customerType === "individual" ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-gray-400 hover:text-gray-300"}`}>
                                        <User size={12} /> Bireysel
                                    </button>
                                    <button onClick={() => setCustomerType("corporate")}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${customerType === "corporate" ? "bg-emerald-500/20 text-emerald-400 shadow-sm" : "text-gray-400 hover:text-gray-300"}`}>
                                        <Building2 size={12} /> Kurumsal
                                    </button>
                                </div>
                            </div>

                            {/* Form Body */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {customerType === "individual" ? (
                                        <>
                                            <InputField icon={<User size={14} />} label="Ad Soyad" value={billing.name} onChange={v => setBilling(b => ({ ...b, name: v }))} placeholder="Adınız Soyadınız" required />
                                            <InputField icon={<Shield size={14} />} label="TC Kimlik No" value={billing.tc} onChange={v => setBilling(b => ({ ...b, tc: v.replace(/\D/g, "").slice(0, 11) }))} placeholder="12345678901" required maxLength={11} />
                                        </>
                                    ) : (
                                        <>
                                            <InputField icon={<Building2 size={14} />} label="Şirket Adı" value={billing.companyName} onChange={v => setBilling(b => ({ ...b, companyName: v }))} placeholder="Şirket Unvanı" required />
                                            <InputField icon={<Receipt size={14} />} label="Vergi Dairesi" value={billing.taxOffice} onChange={v => setBilling(b => ({ ...b, taxOffice: v }))} placeholder="Vergi dairesi adı" required />
                                            <InputField icon={<Shield size={14} />} label="Vergi No" value={billing.taxNo} onChange={v => setBilling(b => ({ ...b, taxNo: v.replace(/\D/g, "").slice(0, 10) }))} placeholder="1234567890" required maxLength={10} />
                                        </>
                                    )}
                                    <InputField label="Telefon" value={billing.phone} onChange={v => setBilling(b => ({ ...b, phone: v }))} placeholder="05XX XXX XX XX" required />
                                    <InputField label="E-posta" value={billing.email} onChange={v => setBilling(b => ({ ...b, email: v }))} placeholder="ornek@email.com" type="email" required />
                                    <div className="md:col-span-2">
                                        <InputField label="Adres" value={billing.address} onChange={v => setBilling(b => ({ ...b, address: v }))} placeholder="Fatura adresi (opsiyonel)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <SummaryPanel />
                        <button onClick={() => setStep("payment")} disabled={!billingValid}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                            Devam Et <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── STEP: Payment ──────────────────────────── */}
            {step === "payment" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: "card" as PaymentMethod, icon: CreditCard, label: "Kredi Kartı", desc: "Anında aktivasyon", color: "emerald" },
                                { key: "transfer" as PaymentMethod, icon: Banknote, label: "EFT / Havale", desc: "1-2 iş günü", color: "blue" },
                            ].map(m => (
                                <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                                    className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${paymentMethod === m.key ? "bg-emerald-500/10 border-emerald-500/40 text-white shadow-md shadow-emerald-500/10" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
                                        }`}>
                                    {paymentMethod === m.key && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent" />}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === m.key ? "bg-emerald-500/20" : "bg-gray-800"}`}>
                                        <m.icon size={18} className={paymentMethod === m.key ? "text-emerald-400" : "text-gray-500"} />
                                    </div>
                                    <div className="relative text-left">
                                        <p className="text-sm font-semibold">{m.label}</p>
                                        <p className="text-xs text-gray-500">{m.desc}</p>
                                    </div>
                                    {paymentMethod === m.key && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                                </button>
                            ))}
                        </div>

                        {/* Credit Card Form */}
                        {paymentMethod === "card" && (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                                {/* Visual Card */}
                                <div className="bg-gradient-to-b from-gray-800/50 to-gray-900 px-6 pt-6">
                                    <CreditCardVisual />
                                </div>
                                {/* Form */}
                                <div className="p-6 space-y-4 border-t border-gray-800">
                                    <InputField icon={<User size={14} />} label="Kart Üzerindeki İsim" value={card.holder} onChange={v => setCard(c => ({ ...c, holder: v.toUpperCase() }))} placeholder="AD SOYAD" required />
                                    <InputField icon={<CreditCard size={14} />} label="Kart Numarası" value={card.number} onChange={v => setCard(c => ({ ...c, number: formatCardNumber(v) }))} placeholder="0000 0000 0000 0000" required maxLength={19} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField icon={<CalendarDays size={14} />} label="Son Kullanma" value={card.expiry} onChange={v => setCard(c => ({ ...c, expiry: formatExpiry(v) }))} placeholder="AA/YY" required maxLength={5} />
                                        <InputField icon={<Shield size={14} />} label="CVV" value={card.cvv} onChange={v => setCard(c => ({ ...c, cvv: v.replace(/\D/g, "").slice(0, 3) }))} placeholder="•••" required maxLength={3} type="password" />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 bg-gray-800/50 rounded-lg px-3 py-2"><Shield size={12} className="text-emerald-500" /> 256-bit SSL şifreleme ile güvenli ödeme altyapısı</div>
                                </div>
                            </div>
                        )}

                        {/* Bank Transfer */}
                        {paymentMethod === "transfer" && (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 px-6 py-4 border-b border-gray-800">
                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Banknote size={16} className="text-emerald-400" /> EFT / Havale Bilgileri</h3>
                                </div>
                                <div className="p-6 space-y-5">
                                    {/* Bank Info */}
                                    <div className="bg-gray-800/50 rounded-xl p-4 space-y-3 text-sm border border-gray-700/30">
                                        <div className="flex justify-between"><span className="text-gray-400">Banka</span><span className="text-white font-medium">Ziraat Bankası</span></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Hesap Adı</span><span className="text-white font-medium">QRLex Yazılım A.Ş.</span></div>
                                        <div className="flex justify-between items-center"><span className="text-gray-400">IBAN</span><span className="text-white font-mono text-xs bg-gray-900 px-2 py-1 rounded">TR12 0001 0012 3456 7890 1234 56</span></div>
                                    </div>

                                    {/* Reference Code - Premium */}
                                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                                        <p className="text-xs text-emerald-400/70 font-medium mb-2 uppercase tracking-wider">Referans Kodunuz</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl font-bold font-mono text-emerald-400 tracking-[4px]">{refCode}</span>
                                            <button onClick={copyRef} className="p-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-all hover:scale-105">
                                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                        <div className="mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                            <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-300/80">Havale/EFT yaparken açıklama kısmına <strong className="text-amber-300">bu referans kodunu</strong> yazmayı unutmayınız.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div>
                        <SummaryPanel />
                        <button onClick={handlePay}
                            disabled={paymentMethod === "card" && !cardValid}
                            className="w-full mt-4 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            {showSuccess ? (
                                <span className="flex items-center gap-2"><Check size={16} /> İşleniyor...</span>
                            ) : paymentMethod === "card" ? (
                                <span className="flex items-center gap-2"><Shield size={16} /> Ödemeyi Tamamla — ₺{total.toLocaleString("tr-TR")}</span>
                            ) : (
                                <span className="flex items-center gap-2"><Check size={16} /> Ödemeyi Onayladım</span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Reusable Input ──────────────────────────────────────────
function InputField({ label, value, onChange, placeholder, required, type = "text", maxLength, icon }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string; maxLength?: number; icon?: React.ReactNode;
}) {
    return (
        <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">{label} {required && <span className="text-red-400">*</span>}</label>
            <div className="relative">
                {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
                <input type={type} value={value} maxLength={maxLength} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    className={`w-full bg-gray-800 border border-gray-700 rounded-xl ${icon ? "pl-9" : "px-4"} pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all`} />
            </div>
        </div>
    );
}
