"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    Save, Loader2, Palette, Type, Square, Layers, Eye, RotateCcw,
    Sun, Moon, Sparkles, Paintbrush, SlidersHorizontal, Monitor,
    LayoutGrid, ChevronDown, ChevronUp, Check, Smartphone, RefreshCw
} from "lucide-react";
import { useSession } from "@/lib/useSession";

// ─── Default Theme ─────────────────────────────────────────
const DEFAULT_THEME = {
    // General
    pageBg: "#f9fafb",
    fontFamily: "Inter",

    // Header / Hero
    headerBg: "#ffffff",
    headerGradientFrom: "#f3e8ff",
    headerGradientTo: "#e0f2fe",

    // Category Buttons
    categoryActiveBg: "#000000",
    categoryActiveText: "#ffffff",
    categoryInactiveBg: "#e5e7eb",
    categoryInactiveText: "#374151",
    categoryRadius: "9999",

    // Search Bar
    searchBg: "#f3f4f6",
    searchBorder: "#e5e7eb",
    searchText: "#6b7280",

    // Product Cards
    cardBg: "#ffffff",
    cardBorder: "#f3f4f6",
    cardRadius: "12",
    cardShadow: "sm",
    cardImageRadius: "8",

    // Product Text
    productNameColor: "#111827",
    productNameSize: "16",
    productNameWeight: "700",
    productDescColor: "#6b7280",
    productDescSize: "12",

    // Price
    priceColor: "#000000",
    priceSize: "18",
    priceWeight: "700",
    discountColor: "#10b981",
    oldPriceColor: "#9ca3af",

    // Category Headers
    categoryTitleColor: "#111827",
    categoryTitleSize: "24",
    categoryTitleWeight: "700",

    // Popular badge
    popularBadgeBg: "#fef3c7",
    popularBadgeText: "#92400e",

    // Bottom nav
    bottomNavBg: "#ffffff",
    bottomNavActive: "#000000",
    bottomNavInactive: "#9ca3af",

    // Accent / Highlight
    accentColor: "#000000",
};

type ThemeType = typeof DEFAULT_THEME;

// ─── Font Options ──────────────────────────────────────────
const FONTS = [
    { name: "Inter", label: "Inter", category: "Modern" },
    { name: "Roboto", label: "Roboto", category: "Modern" },
    { name: "Poppins", label: "Poppins", category: "Modern" },
    { name: "Outfit", label: "Outfit", category: "Modern" },
    { name: "DM Sans", label: "DM Sans", category: "Modern" },
    { name: "Playfair Display", label: "Playfair Display", category: "Elegant" },
    { name: "Lora", label: "Lora", category: "Elegant" },
    { name: "Merriweather", label: "Merriweather", category: "Elegant" },
    { name: "Nunito", label: "Nunito", category: "Friendly" },
    { name: "Quicksand", label: "Quicksand", category: "Friendly" },
    { name: "Comfortaa", label: "Comfortaa", category: "Friendly" },
    { name: "Space Grotesk", label: "Space Grotesk", category: "Tech" },
    { name: "JetBrains Mono", label: "JetBrains Mono", category: "Tech" },
];

const SHADOW_OPTIONS = [
    { value: "none", label: "Yok" },
    { value: "sm", label: "Hafif" },
    { value: "md", label: "Orta" },
    { value: "lg", label: "Güçlü" },
    { value: "xl", label: "Dramatik" },
];

const RADIUS_PRESETS = [
    { value: "0", label: "Keskin" },
    { value: "8", label: "Yumuşak" },
    { value: "12", label: "Yuvarlak" },
    { value: "16", label: "Çok Yuvarlak" },
    { value: "24", label: "Pill" },
];

// ─── Preset Themes ─────────────────────────────────────────
const PRESET_THEMES: { name: string; icon: string; desc: string; theme: Partial<ThemeType> }[] = [
    {
        name: "Klasik Beyaz", icon: "☀️", desc: "Temiz, minimalist",
        theme: { pageBg: "#f9fafb", cardBg: "#ffffff", cardBorder: "#f3f4f6", categoryActiveBg: "#000000", categoryActiveText: "#ffffff", productNameColor: "#111827", priceColor: "#000000", accentColor: "#000000", categoryTitleColor: "#111827", bottomNavBg: "#ffffff", bottomNavActive: "#000000" },
    },
    {
        name: "Koyu Elegans", icon: "🌙", desc: "Karanlık, şık",
        theme: { pageBg: "#0f172a", cardBg: "#1e293b", cardBorder: "#334155", categoryActiveBg: "#f59e0b", categoryActiveText: "#000000", categoryInactiveBg: "#1e293b", categoryInactiveText: "#94a3b8", productNameColor: "#f1f5f9", productDescColor: "#94a3b8", priceColor: "#f59e0b", accentColor: "#f59e0b", categoryTitleColor: "#f1f5f9", searchBg: "#1e293b", searchBorder: "#334155", searchText: "#94a3b8", bottomNavBg: "#0f172a", bottomNavActive: "#f59e0b", bottomNavInactive: "#475569" },
    },
    {
        name: "Doğal Yeşil", icon: "🌿", desc: "Organik, doğal",
        theme: { pageBg: "#f0fdf4", cardBg: "#ffffff", cardBorder: "#dcfce7", categoryActiveBg: "#166534", categoryActiveText: "#ffffff", categoryInactiveBg: "#d1fae5", categoryInactiveText: "#166534", productNameColor: "#14532d", priceColor: "#166534", discountColor: "#16a34a", accentColor: "#166534", categoryTitleColor: "#14532d", headerGradientFrom: "#dcfce7", headerGradientTo: "#f0fdf4" },
    },
    {
        name: "Romantik Bordo", icon: "🍷", desc: "Lüks, sıcak",
        theme: { pageBg: "#fef2f2", cardBg: "#ffffff", cardBorder: "#fecaca", categoryActiveBg: "#7f1d1d", categoryActiveText: "#ffffff", categoryInactiveBg: "#fee2e2", categoryInactiveText: "#991b1b", productNameColor: "#450a0a", priceColor: "#991b1b", discountColor: "#dc2626", accentColor: "#991b1b", categoryTitleColor: "#450a0a", headerGradientFrom: "#fecaca", headerGradientTo: "#fef2f2" },
    },
    {
        name: "Okyanus Mavisi", icon: "🌊", desc: "Taze, ferah",
        theme: { pageBg: "#f0f9ff", cardBg: "#ffffff", cardBorder: "#bae6fd", categoryActiveBg: "#0c4a6e", categoryActiveText: "#ffffff", categoryInactiveBg: "#e0f2fe", categoryInactiveText: "#0369a1", productNameColor: "#0c4a6e", priceColor: "#0369a1", accentColor: "#0369a1", categoryTitleColor: "#0c4a6e", headerGradientFrom: "#bae6fd", headerGradientTo: "#f0f9ff" },
    },
    {
        name: "Altın Lüks", icon: "✨", desc: "Premium, altın",
        theme: { pageBg: "#fffbeb", cardBg: "#ffffff", cardBorder: "#fde68a", categoryActiveBg: "#78350f", categoryActiveText: "#fde68a", categoryInactiveBg: "#fef3c7", categoryInactiveText: "#92400e", productNameColor: "#451a03", priceColor: "#b45309", discountColor: "#d97706", accentColor: "#b45309", categoryTitleColor: "#451a03", headerGradientFrom: "#fde68a", headerGradientTo: "#fffbeb" },
    },
];

// ─── Color Input Component ─────────────────────────────────
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <label className="text-xs text-gray-400 flex-1">{label}</label>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-gray-600" />
                </div>
                <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-[76px] px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 font-mono focus:outline-none focus:border-emerald-500" />
            </div>
        </div>
    );
}

// ─── Collapsible Section ───────────────────────────────────
function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="text-emerald-400">{icon}</div>
                    <span className="text-sm font-semibold text-white">{title}</span>
                </div>
                {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>
            {open && <div className="px-5 pb-5 space-y-3 border-t border-gray-800 pt-4">{children}</div>}
        </div>
    );
}

// ─── SHADOW HELPER ─────────────────────────────────────────
function getShadowCSS(shadow: string) {
    switch (shadow) {
        case "none": return "none";
        case "sm": return "0 1px 2px 0 rgba(0,0,0,0.05)";
        case "md": return "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)";
        case "lg": return "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)";
        case "xl": return "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)";
        default: return "0 1px 2px 0 rgba(0,0,0,0.05)";
    }
}

// ─── Main Page ─────────────────────────────────────────────
export default function PanelDesign() {
    const { restaurantId, loading: sessionLoading } = useSession();
    const [theme, setTheme] = useState<ThemeType>(DEFAULT_THEME);
    const [savedTheme, setSavedTheme] = useState<ThemeType>(DEFAULT_THEME);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [slug, setSlug] = useState("");
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!restaurantId) return;
        fetch(`/api/admin/theme?restaurantId=${restaurantId}`)
            .then((r) => r.json())
            .then((data) => {
                const merged = { ...DEFAULT_THEME, ...data };
                setTheme(merged);
                setSavedTheme(merged);
                setLoading(false);
            });
    }, [restaurantId]);

    // Fetch slug
    useEffect(() => {
        if (!restaurantId) return;
        fetch(`/api/admin/restaurants/${restaurantId}`).then(r => r.json()).then(d => { if (d.slug) setSlug(d.slug); }).catch(() => { });
    }, [restaurantId]);

    // Send theme to iframe in real-time
    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'theme-update', theme }, '*');
        }
    }, [theme]);

    // Load Google Font
    useEffect(() => {
        if (theme.fontFamily && theme.fontFamily !== "Inter") {
            const link = document.createElement("link");
            link.href = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
    }, [theme.fontFamily]);

    const updateTheme = useCallback((key: keyof ThemeType, value: string) => {
        setTheme((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);

    const applyPreset = (preset: Partial<ThemeType>) => {
        setTheme((prev) => ({ ...prev, ...preset }));
        setSaved(false);
    };

    const resetTheme = () => {
        setTheme(DEFAULT_THEME);
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        await fetch(`/api/admin/theme?restaurantId=${restaurantId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(theme),
        });
        setSavedTheme(theme);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const hasChanges = JSON.stringify(theme) !== JSON.stringify(savedTheme);

    if (sessionLoading || loading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    return (
        <div className="flex gap-6 h-[calc(100dvh-112px)]">
            {/* LEFT: Editor */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Tasarım</h1>
                        <p className="text-sm text-gray-400 mt-1">QR menünüzün görünümünü özelleştirin</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={resetTheme} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors">
                            <RotateCcw size={16} /> Sıfırla
                        </button>
                        <button onClick={handleSave} disabled={saving || !hasChanges} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${hasChanges ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                            {saved ? "Kaydedildi ✓" : saving ? "..." : "Kaydet"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {/* Preset Themes */}
                    <Section title="Hazır Temalar" icon={<Sparkles size={18} />} defaultOpen={true}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {PRESET_THEMES.map((preset) => (
                                <button key={preset.name} onClick={() => applyPreset(preset.theme)} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-emerald-500/50 transition-all text-center group">
                                    <span className="text-2xl">{preset.icon}</span>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-200 group-hover:text-emerald-300 transition-colors">{preset.name}</p>
                                        <p className="text-[10px] text-gray-500">{preset.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Section>

                    {/* General */}
                    <Section title="Genel Ayarlar" icon={<Palette size={18} />}>
                        <ColorPicker label="Sayfa Arkaplanı" value={theme.pageBg} onChange={(v) => updateTheme("pageBg", v)} />
                        <ColorPicker label="Vurgu Rengi" value={theme.accentColor} onChange={(v) => updateTheme("accentColor", v)} />
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-xs text-gray-400">Yazı Tipi</label>
                            <select value={theme.fontFamily} onChange={(e) => updateTheme("fontFamily", e.target.value)} className="w-[200px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500" style={{ fontFamily: theme.fontFamily }}>
                                {FONTS.map((f) => <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.label} — {f.category}</option>)}
                            </select>
                        </div>
                    </Section>

                    {/* Header */}
                    <Section title="Başlık / Slider" icon={<Monitor size={18} />} defaultOpen={false}>
                        <ColorPicker label="Başlık Arkaplanı" value={theme.headerBg} onChange={(v) => updateTheme("headerBg", v)} />
                        <ColorPicker label="Gradient Başlangıç" value={theme.headerGradientFrom} onChange={(v) => updateTheme("headerGradientFrom", v)} />
                        <ColorPicker label="Gradient Bitiş" value={theme.headerGradientTo} onChange={(v) => updateTheme("headerGradientTo", v)} />
                    </Section>

                    {/* Category Buttons */}
                    <Section title="Kategori Butonları" icon={<LayoutGrid size={18} />} defaultOpen={false}>
                        <ColorPicker label="Aktif Arkaplan" value={theme.categoryActiveBg} onChange={(v) => updateTheme("categoryActiveBg", v)} />
                        <ColorPicker label="Aktif Yazı Rengi" value={theme.categoryActiveText} onChange={(v) => updateTheme("categoryActiveText", v)} />
                        <ColorPicker label="Pasif Arkaplan" value={theme.categoryInactiveBg} onChange={(v) => updateTheme("categoryInactiveBg", v)} />
                        <ColorPicker label="Pasif Yazı Rengi" value={theme.categoryInactiveText} onChange={(v) => updateTheme("categoryInactiveText", v)} />
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-xs text-gray-400">Köşe Yuvarlaklığı</label>
                            <div className="flex gap-1.5">{RADIUS_PRESETS.map((r) => (
                                <button key={r.value} onClick={() => updateTheme("categoryRadius", r.value)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${theme.categoryRadius === r.value ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"}`}>{r.label}</button>
                            ))}</div>
                        </div>
                    </Section>

                    {/* Search */}
                    <Section title="Arama Çubuğu" icon={<SlidersHorizontal size={18} />} defaultOpen={false}>
                        <ColorPicker label="Arkaplan" value={theme.searchBg} onChange={(v) => updateTheme("searchBg", v)} />
                        <ColorPicker label="Kenarlık" value={theme.searchBorder} onChange={(v) => updateTheme("searchBorder", v)} />
                        <ColorPicker label="Yazı Rengi" value={theme.searchText} onChange={(v) => updateTheme("searchText", v)} />
                    </Section>

                    {/* Cards */}
                    <Section title="Ürün Kartları" icon={<Square size={18} />}>
                        <ColorPicker label="Kart Arkaplanı" value={theme.cardBg} onChange={(v) => updateTheme("cardBg", v)} />
                        <ColorPicker label="Kart Kenarlık" value={theme.cardBorder} onChange={(v) => updateTheme("cardBorder", v)} />
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-xs text-gray-400">Kart Gölgesi</label>
                            <div className="flex gap-1.5">{SHADOW_OPTIONS.map((s) => (
                                <button key={s.value} onClick={() => updateTheme("cardShadow", s.value)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${theme.cardShadow === s.value ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"}`}>{s.label}</button>
                            ))}</div>
                        </div>
                        <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Kart Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={24} value={theme.cardRadius} onChange={(e) => updateTheme("cardRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.cardRadius}px</span></div></div>
                        <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Resim Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={20} value={theme.cardImageRadius} onChange={(e) => updateTheme("cardImageRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.cardImageRadius}px</span></div></div>
                    </Section>

                    {/* Text */}
                    <Section title="Yazı Stilleri" icon={<Type size={18} />}>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Ürün Adı</p>
                        <ColorPicker label="Renk" value={theme.productNameColor} onChange={(v) => updateTheme("productNameColor", v)} />
                        <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Boyut</label><div className="flex items-center gap-2"><input type="range" min={12} max={22} value={theme.productNameSize} onChange={(e) => updateTheme("productNameSize", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.productNameSize}px</span></div></div>
                        <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Kalınlık</label><div className="flex gap-1.5">{["400", "500", "600", "700", "800"].map((w) => (<button key={w} onClick={() => updateTheme("productNameWeight", w)} className={`px-2 py-1 rounded-md text-[10px] transition-all border ${theme.productNameWeight === w ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400"}`} style={{ fontWeight: parseInt(w) }}>{w}</button>))}</div></div>
                        <div className="border-t border-gray-800 my-2" />
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Ürün Açıklaması</p>
                        <ColorPicker label="Renk" value={theme.productDescColor} onChange={(v) => updateTheme("productDescColor", v)} />
                        <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Boyut</label><div className="flex items-center gap-2"><input type="range" min={10} max={16} value={theme.productDescSize} onChange={(e) => updateTheme("productDescSize", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.productDescSize}px</span></div></div>
                        <div className="border-t border-gray-800 my-2" />
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Kategori Başlığı</p>
                        <ColorPicker label="Renk" value={theme.categoryTitleColor} onChange={(v) => updateTheme("categoryTitleColor", v)} />
                        <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Boyut</label><div className="flex items-center gap-2"><input type="range" min={16} max={32} value={theme.categoryTitleSize} onChange={(e) => updateTheme("categoryTitleSize", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.categoryTitleSize}px</span></div></div>
                    </Section>

                    {/* Pricing */}
                    <Section title="Fiyat Stilleri" icon={<Layers size={18} />} defaultOpen={false}>
                        <ColorPicker label="Fiyat Rengi" value={theme.priceColor} onChange={(v) => updateTheme("priceColor", v)} />
                        <ColorPicker label="İndirimli Fiyat" value={theme.discountColor} onChange={(v) => updateTheme("discountColor", v)} />
                        <ColorPicker label="Eski Fiyat" value={theme.oldPriceColor} onChange={(v) => updateTheme("oldPriceColor", v)} />
                        <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Boyut</label><div className="flex items-center gap-2"><input type="range" min={14} max={26} value={theme.priceSize} onChange={(e) => updateTheme("priceSize", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.priceSize}px</span></div></div>
                    </Section>

                    {/* Popular Badge */}
                    <Section title="Popüler Etiketi" icon={<Sparkles size={18} />} defaultOpen={false}>
                        <ColorPicker label="Arkaplan" value={theme.popularBadgeBg} onChange={(v) => updateTheme("popularBadgeBg", v)} />
                        <ColorPicker label="Yazı Rengi" value={theme.popularBadgeText} onChange={(v) => updateTheme("popularBadgeText", v)} />
                    </Section>

                    {/* Bottom Nav */}
                    <Section title="Alt Navigasyon" icon={<Monitor size={18} />} defaultOpen={false}>
                        <ColorPicker label="Arkaplan" value={theme.bottomNavBg} onChange={(v) => updateTheme("bottomNavBg", v)} />
                        <ColorPicker label="Aktif İkon" value={theme.bottomNavActive} onChange={(v) => updateTheme("bottomNavActive", v)} />
                        <ColorPicker label="Pasif İkon" value={theme.bottomNavInactive} onChange={(v) => updateTheme("bottomNavInactive", v)} />
                    </Section>
                </div>
            </div>

            {/* RIGHT: Live iframe preview */}
            {slug && (
                <div className="hidden lg:flex flex-col items-center w-[400px] flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        <Smartphone size={16} className="text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">Canlı Önizleme</span>
                        <button onClick={() => { if (iframeRef.current) iframeRef.current.src = `/${slug}`; }} className="ml-2 p-1 rounded-lg hover:bg-gray-800 text-gray-600 hover:text-emerald-400 transition-colors" title="Yenile">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    <div className="w-[380px] bg-gray-950 rounded-[2.5rem] p-3 shadow-2xl border-[3px] border-gray-800 overflow-hidden flex-1 max-h-[700px] relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-950 rounded-b-2xl z-20" />
                        <iframe
                            ref={iframeRef}
                            src={`/${slug}`}
                            className="w-full h-full rounded-[1.8rem] border-0"
                            onLoad={() => {
                                // Send current theme after iframe loads
                                setTimeout(() => {
                                    if (iframeRef.current?.contentWindow) {
                                        iframeRef.current.contentWindow.postMessage({ type: 'theme-update', theme }, '*');
                                    }
                                }, 500);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

