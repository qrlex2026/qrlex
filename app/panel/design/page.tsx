"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    Save, Loader2, Palette, Type, Square, Layers, Eye, RotateCcw,
    Sun, Moon, Sparkles, Paintbrush, SlidersHorizontal, Monitor, Menu, Upload, X, Globe,
    LayoutGrid, ChevronDown, ChevronUp, Check, Smartphone, RefreshCw, Search, Image as ImageIcon,
    LayoutList, Grid2X2, Grid3X3, GalleryHorizontal, Newspaper, AlignJustify, RectangleHorizontal, Rows3, LayoutDashboard, FileText
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
    productNameWeight: "700",
    productDescColor: "#6b7280",

    // Price
    priceColor: "#000000",
    priceWeight: "700",
    discountColor: "#10b981",
    oldPriceColor: "#9ca3af",

    // Category Headers
    categoryTitleColor: "#111827",
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

    // Welcome Screen
    welcomeBg: "#000000",
    welcomeGradientFrom: "#000000",
    welcomeGradientTo: "transparent",
    welcomeGradientOpacity: "85",
    welcomeOverlayOpacity: "60",
    welcomeTextColor: "#ffffff",
    welcomeSubtextColor: "#ffffff80",
    welcomeBtnBg: "#ffffff",
    welcomeBtnText: "#000000",
    welcomeBtnRadius: "12",
    welcomeBtnShadow: "lg",
    welcomeSecondaryBtnBg: "#ffffff1a",
    welcomeSecondaryBtnText: "#ffffff",
    welcomeSecondaryBtnBorder: "#ffffff33",
    welcomeLogoBorder: "#ffffff33",
    welcomeLogoRadius: "16",
    welcomeLogoSize: "96",
    welcomeSeparatorColor: "#ffffff33",
    welcomeVariant: "classic",
    welcomeBtnStyle: "classic",
    welcomeVideo: "",
    welcomeImage: "",

    // Layout
    layoutVariant: "list",
    categorySectionBg: "transparent",

    // Menu Header
    menuHeaderBg: "#ffffff",
    menuHeaderTextColor: "#111827",
    menuHeaderIconColor: "#374151",
    menuHeaderShadow: "sm",
    menuHeaderSearchBtnBg: "#f3f4f6",
    headerVariant: "classic",
    headerLogo: "",

    // Category Nav Bar
    categoryNavBg: "#ffffff",

    // Category Button Shadow
    categoryBtnShadow: "none",
    categoryBtnCustomShadow: "",

    // Slider
    showHeroSlider: "true",

    // Product Detail Overlay
    detailBg: "#ffffff",
    detailNameColor: "#111827",
    detailPriceColor: "#000000",
    detailDescColor: "#6b7280",
    detailLabelColor: "#111827",
    detailInfoBg: "#f9fafb",
    detailInfoBorder: "#f3f4f6",
    detailIngredientBg: "#ffffff",
    detailIngredientText: "#374151",
    detailIngredientBorder: "#e5e7eb",
    detailBackBtnBg: "#00000066",
    detailBackBtnColor: "#ffffff",

    // Search Overlay
    searchOverlayBg: "#ffffff",
    searchOverlayInputColor: "#000000",
    searchOverlayPlaceholderColor: "#9ca3af",
    searchOverlayBorderColor: "#f3f4f6",
    searchOverlayIconColor: "#9ca3af",
    searchOverlayCloseColor: "#1f2937",
    searchOverlayResultBg: "#f9fafb",
    searchOverlayResultNameColor: "#111827",
    searchOverlayResultDescColor: "#6b7280",
    searchOverlayResultPriceColor: "#000000",
    searchOverlayEmptyColor: "#9ca3af",

    // Sidebar Drawer
    sidebarBg: "#ffffff",
    sidebarNameColor: "#111827",
    sidebarDescColor: "#9ca3af",
    sidebarBorder: "#f3f4f6",
    sidebarLabelColor: "#9ca3af",
    sidebarItemColor: "#374151",
    sidebarItemHover: "#f3f4f6",
    sidebarItemIconColor: "#9ca3af",
    sidebarActiveItemBg: "#111827",
    sidebarActiveItemColor: "#ffffff",
    sidebarCloseBtnBorder: "#e5e7eb",
    sidebarCloseBtnColor: "#9ca3af",
};

type ThemeType = typeof DEFAULT_THEME;

const FONTS = [
    { name: "Plus Jakarta Sans", label: "Plus Jakarta" },
    { name: "Inter", label: "Inter" },
    { name: "Roboto", label: "Roboto" },
    { name: "Poppins", label: "Poppins" },
    { name: "Outfit", label: "Outfit" },
    { name: "DM Sans", label: "DM Sans" },
    { name: "Nunito", label: "Nunito" },
    { name: "Quicksand", label: "Quicksand" },
    { name: "Lora", label: "Lora" },
    { name: "Playfair Display", label: "Playfair" },
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


// ─── Color Input Component ─────────────────────────────────
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <label className="text-[14px] text-gray-400 flex-1">{label}</label>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-[#333]" />
                </div>
                <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-[76px] px-2 py-1.5 bg-[#1e1e1e] border border-[#333] rounded-lg text-[12px] text-gray-300 font-mono focus:outline-none focus:border-emerald-500" />
            </div>
        </div>
    );
}

// ─── Collapsible Section ───────────────────────────────────
function Section({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1a1a1a] transition-colors">
                <div className="flex items-center gap-3">
                    <div className="text-emerald-500">{icon}</div>
                    <span className="text-sm font-semibold text-gray-100">{title}</span>
                </div>
                {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>
            {open && <div className="px-5 pb-5 space-y-3 border-t border-[#2a2a2a] pt-4">{children}</div>}
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
    const [fontSearch, setFontSearch] = useState("");
    const [searchedFonts, setSearchedFonts] = useState<{ name: string; label: string }[]>([]);
    const [headerLogoUploading, setHeaderLogoUploading] = useState(false);
    const headerLogoRef = useRef<HTMLInputElement>(null);
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [activeTab, setActiveTab] = useState('menu');

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

    const doSave = useCallback(async (themeData: ThemeType) => {
        setSaving(true);
        await fetch(`/api/admin/theme?restaurantId=${restaurantId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(themeData),
        });
        setSavedTheme(themeData);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, [restaurantId]);

    const updateTheme = useCallback((key: keyof ThemeType, value: string) => {
        setTheme((prev) => {
            const next = { ...prev, [key]: value };
            setSaved(false);
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
            autoSaveTimer.current = setTimeout(() => doSave(next), 800);
            return next;
        });
    }, [doSave]);

    if (sessionLoading || loading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    return (
        <div className="flex flex-col h-[calc(100dvh-64px)] -m-4 lg:-m-6 bg-[#050505]">
            {/* CONTENT ROW */}
            <div className="flex gap-6 flex-1 min-h-0 bg-[#050505] px-4 lg:px-6 py-4">
                {/* LEFT: Scrollable sections */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-w-0">
                    {/* Auto-save status */}
                    <div className="flex items-center justify-end gap-2 h-8">
                        {saving && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Loader2 size={12} className="animate-spin" /> Kaydediliyor...</div>}
                        {saved && <div className="flex items-center gap-1.5 text-xs text-emerald-400"><Check size={12} /> Kaydedildi</div>}
                    </div>

                    {/* === TEMPORARILY HIDDEN SECTIONS === */}
                    {false && (<>
                        {/* Layout Position */}
                        <Section title="Pozisyon (Ürün Düzeni)" icon={<LayoutGrid size={18} />} defaultOpen={false}>
                            <p className="text-[10px] text-gray-500 mb-2">Ürünlerin menüde nasıl gösterileceğini seçin</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {([
                                    { id: 'list', name: 'Klasik Liste', desc: 'Resim sol, bilgi sağ', icon: <LayoutList size={14} /> },
                                    { id: 'grid-2', name: '2\'li Grid', desc: '2 sütun, resim üstte', icon: <Grid2X2 size={14} /> },
                                    { id: 'grid-3', name: '3\'lü Grid', desc: 'Kompakt 3 sütun', icon: <Grid3X3 size={14} /> },
                                    { id: 'horizontal', name: 'Yatay Kaydırma', desc: 'Sola-sağa scroll', icon: <GalleryHorizontal size={14} /> },
                                    { id: 'magazine', name: 'Dergi', desc: 'İlk büyük, kalanlar grid', icon: <Newspaper size={14} /> },
                                    { id: 'compact', name: 'Kompakt Liste', desc: 'Dar satırlar', icon: <AlignJustify size={14} /> },
                                    { id: 'full-card', name: 'Tam Kart', desc: 'Büyük resim üstte', icon: <RectangleHorizontal size={14} /> },

                                    { id: 'text-only', name: 'Sadece Metin', desc: 'Resim yok, minimalist', icon: <FileText size={14} /> },
                                ] as { id: string; name: string; desc: string; icon: React.ReactNode }[]).map((v) => {
                                    const isActive = theme.layoutVariant === v.id;
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => updateTheme('layoutVariant', v.id)}
                                            className={`group rounded-2xl border overflow-hidden transition-all ${isActive
                                                ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                                                : 'border-gray-700 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800'
                                                }`}
                                        >
                                            {/* Mini wireframe */}
                                            <div className="mx-2 mt-2 rounded-xl overflow-hidden border border-gray-700/50 bg-gray-900 p-2 h-[72px] flex flex-col">
                                                {v.id === 'list' && (
                                                    <div className="space-y-1.5 flex-1">
                                                        {[0, 1].map(i => (
                                                            <div key={i} className="flex gap-1.5 items-center">
                                                                <div className="w-5 h-5 rounded bg-gray-700 shrink-0" />
                                                                <div className="flex-1 space-y-0.5">
                                                                    <div className="h-1 w-8 rounded-full bg-gray-600" />
                                                                    <div className="h-1 w-12 rounded-full bg-gray-700" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {v.id === 'grid-2' && (
                                                    <div className="grid grid-cols-2 gap-1 flex-1">
                                                        {[0, 1, 2, 3].map(i => (
                                                            <div key={i} className="rounded bg-gray-800 border border-gray-700 p-0.5">
                                                                <div className="h-4 rounded bg-gray-700 mb-0.5" />
                                                                <div className="h-1 w-6 rounded-full bg-gray-600" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {v.id === 'grid-3' && (
                                                    <div className="grid grid-cols-3 gap-0.5 flex-1">
                                                        {[0, 1, 2, 3, 4, 5].map(i => (
                                                            <div key={i} className="rounded bg-gray-800 border border-gray-700 p-0.5">
                                                                <div className="h-3 rounded bg-gray-700 mb-0.5" />
                                                                <div className="h-0.5 rounded-full bg-gray-600" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {v.id === 'horizontal' && (
                                                    <div className="flex gap-1 overflow-hidden flex-1 items-center">
                                                        {[0, 1, 2, 3].map(i => (
                                                            <div key={i} className="min-w-[22px] rounded bg-gray-800 border border-gray-700 p-0.5">
                                                                <div className="h-6 rounded bg-gray-700 mb-0.5" />
                                                                <div className="h-1 w-4 rounded-full bg-gray-600" />
                                                            </div>
                                                        ))}
                                                        <div className="text-[7px] text-gray-600">→</div>
                                                    </div>
                                                )}
                                                {v.id === 'magazine' && (
                                                    <div className="flex flex-col gap-1 flex-1">
                                                        <div className="h-6 rounded bg-gray-700 border border-gray-700" />
                                                        <div className="grid grid-cols-2 gap-0.5 flex-1">
                                                            {[0, 1].map(i => (
                                                                <div key={i} className="rounded bg-gray-800 border border-gray-700 p-0.5">
                                                                    <div className="h-3 rounded bg-gray-700" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {v.id === 'compact' && (
                                                    <div className="space-y-1 flex-1">
                                                        {[0, 1, 2, 3].map(i => (
                                                            <div key={i} className="flex items-center gap-1">
                                                                <div className="w-3 h-3 rounded bg-gray-700 shrink-0" />
                                                                <div className="h-1 flex-1 rounded-full bg-gray-600" />
                                                                <div className="h-1 w-4 rounded-full bg-gray-600" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {v.id === 'full-card' && (
                                                    <div className="space-y-1 flex-1">
                                                        <div className="h-8 rounded bg-gray-700 border border-gray-700" />
                                                        <div className="flex items-center justify-between">
                                                            <div className="h-1 w-10 rounded-full bg-gray-600" />
                                                            <div className="h-1 w-4 rounded-full bg-gray-500" />
                                                        </div>
                                                    </div>
                                                )}

                                                {v.id === 'text-only' && (
                                                    <div className="space-y-1.5 flex-1">
                                                        {[0, 1, 2, 3].map(i => (
                                                            <div key={i} className="flex items-center justify-between border-b border-gray-800 pb-1">
                                                                <div className="h-1 w-14 rounded-full bg-gray-600" />
                                                                <div className="h-1 w-5 rounded-full bg-gray-500" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Label */}
                                            <div className="px-2 py-2 text-center">
                                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                                    <span className={isActive ? 'text-emerald-400' : 'text-gray-500'}>{v.icon}</span>
                                                    <p className={`text-[11px] font-semibold ${isActive ? 'text-emerald-300' : 'text-gray-200 group-hover:text-emerald-300'} transition-colors`}>{v.name}</p>
                                                </div>
                                                <p className="text-[9px] text-gray-500">{v.desc}</p>
                                                {isActive && <div className="mx-auto mt-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center"><Check size={8} className="text-white" /></div>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </Section>
                    </>)}
                    {/* === END HIDDEN === */}

                    {/* Section Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[
                            { key: 'menu', label: 'Men\u00fc', active: true },
                            { key: 'position', label: 'Pozisyon' },
                            { key: 'general', label: 'Genel' },
                            { key: 'font', label: 'Yaz\u0131 Tipi' },
                            { key: 'welcome', label: 'Ho\u015fgeldiniz', active: true },
                            { key: 'bottomnav', label: 'Alt Navigasyon' },
                            { key: 'detail', label: '\u00dcr\u00fcn Detay' },
                            { key: 'search', label: 'Arama' },
                            { key: 'drawer', label: 'Sol Men\u00fc' },
                        ].map((btn) => (
                            <button
                                key={btn.key}
                                onClick={() => btn.active && setActiveTab(btn.key)}
                                className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${activeTab === btn.key
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                    : btn.active
                                        ? 'bg-[#111] text-gray-400 border border-white/[0.06] hover:bg-[#1a1a1a] hover:text-gray-200'
                                        : 'bg-[#111] text-gray-600 border border-white/[0.04] cursor-not-allowed'
                                    }`}
                                disabled={!btn.active}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* ─── MENU TAB CONTENT ─── */}
                    {activeTab === 'menu' && (<>
                        {/* Full Theme Previews */}
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-5 mb-3">
                            <span className="text-[11px] text-gray-600 uppercase tracking-widest mb-3 block">Temalar</span>
                            <div className="max-h-[420px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                                <div className="grid grid-cols-4 gap-2.5">
                                    {([
                                        { id: 't1', name: 'Minimalist', headerBg: '#ffffff', headerText: '#111', pageBg: '#f5f5f5', cardBg: '#fff', cardText: '#333', accent: '#000', catBg: '#eee', catText: '#555' },
                                        { id: 't2', name: 'Koyu Elegan', headerBg: '#0a0a0a', headerText: '#fff', pageBg: '#111', cardBg: '#1a1a1a', cardText: '#eee', accent: '#d4a853', catBg: '#222', catText: '#ccc' },
                                        { id: 't3', name: 'Okyanus', headerBg: '#0f1b33', headerText: '#c8d6e5', pageBg: '#0a1628', cardBg: '#1a2d4d', cardText: '#c8d6e5', accent: '#54a0ff', catBg: '#162040', catText: '#7eb8ff' },
                                        { id: 't4', name: 'Krem', headerBg: '#faf7f2', headerText: '#5c4a3a', pageBg: '#f5f0e8', cardBg: '#fff', cardText: '#5c4a3a', accent: '#8b7355', catBg: '#ece5d8', catText: '#8b7355' },
                                        { id: 't5', name: 'Orman', headerBg: '#1a2e1a', headerText: '#c8e6c8', pageBg: '#0f1f0f', cardBg: '#1a2e1a', cardText: '#b8d8b8', accent: '#4caf50', catBg: '#152815', catText: '#6abf6a' },
                                        { id: 't6', name: 'G\u00fcl Kurusu', headerBg: '#2d1a1a', headerText: '#f0c8c8', pageBg: '#1a0f0f', cardBg: '#2d1a1a', cardText: '#e8b4b4', accent: '#e57373', catBg: '#281515', catText: '#d49a9a' },
                                        { id: 't7', name: 'Lavanta', headerBg: '#1e1a2e', headerText: '#d0c8e6', pageBg: '#13101f', cardBg: '#231e35', cardText: '#c4bae0', accent: '#b39ddb', catBg: '#1d1830', catText: '#a08fd0' },
                                        { id: 't8', name: 'Sunset', headerBg: '#1f1005', headerText: '#ffd9a0', pageBg: '#140d03', cardBg: '#2a1a08', cardText: '#f0c070', accent: '#ff9800', catBg: '#231507', catText: '#e0a050' },
                                        { id: 't9', name: 'Arctic', headerBg: '#f0f8ff', headerText: '#2c4a6e', pageBg: '#e8f2fc', cardBg: '#fff', cardText: '#3a5a7e', accent: '#2196f3', catBg: '#daeaf8', catText: '#4a7ab0' },
                                        { id: 't10', name: 'Neon', headerBg: '#0a0a0a', headerText: '#0ff', pageBg: '#050505', cardBg: '#111', cardText: '#0ff', accent: '#0ff', catBg: '#0a1515', catText: '#0cc' },
                                        { id: 't11', name: 'Retro', headerBg: '#f5e6c8', headerText: '#5a3e28', pageBg: '#eddcc0', cardBg: '#f8f0e0', cardText: '#5a3e28', accent: '#c68642', catBg: '#e8d4b0', catText: '#7a5a3a' },
                                        { id: 't12', name: 'Cherry', headerBg: '#1a0000', headerText: '#ff6b6b', pageBg: '#100000', cardBg: '#200808', cardText: '#ff8080', accent: '#ff4444', catBg: '#180505', catText: '#ff5555' },
                                        { id: 't13', name: 'Mint', headerBg: '#f0faf5', headerText: '#2d6b4e', pageBg: '#e5f5ed', cardBg: '#fff', cardText: '#2d6b4e', accent: '#26a69a', catBg: '#d8f0e5', catText: '#3d8b6e' },
                                        { id: 't14', name: 'Slate', headerBg: '#1e2530', headerText: '#94a3b8', pageBg: '#151b25', cardBg: '#1e2530', cardText: '#94a3b8', accent: '#64748b', catBg: '#1a2030', catText: '#7a8a9b' },
                                        { id: 't15', name: 'Royal', headerBg: '#1a0a30', headerText: '#d4a0ff', pageBg: '#0f0520', cardBg: '#1f0f35', cardText: '#c090f0', accent: '#9c27b0', catBg: '#180a2a', catText: '#b080d0' },
                                        { id: 't16', name: 'Sand', headerBg: '#f5efe6', headerText: '#6b5b4a', pageBg: '#ede5d8', cardBg: '#faf5ee', cardText: '#6b5b4a', accent: '#a08060', catBg: '#e8dfd0', catText: '#8a7560' },
                                    ] as { id: string; name: string; headerBg: string; headerText: string; pageBg: string; cardBg: string; cardText: string; accent: string; catBg: string; catText: string }[]).map((t) => {
                                        const isSelected = false; // no functionality yet
                                        return (
                                            <button
                                                key={t.id}
                                                className={`group rounded-xl border overflow-hidden transition-all ${isSelected
                                                    ? 'border-orange-500/50 ring-2 ring-orange-500/20'
                                                    : 'border-white/[0.04] hover:border-white/[0.1]'
                                                    }`}
                                            >
                                                {/* Mini phone preview */}
                                                <div className="w-full aspect-[9/16] rounded-lg overflow-hidden relative" style={{ backgroundColor: t.pageBg }}>
                                                    {/* Header */}
                                                    <div className="h-[14%] flex items-center justify-between px-2" style={{ backgroundColor: t.headerBg }}>
                                                        <div className="flex flex-col gap-[1px]">
                                                            <div className="w-2.5 h-[1px] rounded-full" style={{ backgroundColor: t.headerText, opacity: 0.7 }} />
                                                            <div className="w-1.5 h-[1px] rounded-full" style={{ backgroundColor: t.headerText, opacity: 0.7 }} />
                                                        </div>
                                                        <div className="h-1 w-5 rounded-full" style={{ backgroundColor: t.headerText, opacity: 0.5 }} />
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.headerText, opacity: 0.4 }} />
                                                    </div>
                                                    {/* Category nav */}
                                                    <div className="flex gap-1 px-1.5 py-1">
                                                        <div className="h-2 w-5 rounded-full" style={{ backgroundColor: t.accent, opacity: 0.9 }} />
                                                        <div className="h-2 w-4 rounded-full" style={{ backgroundColor: t.catBg }} />
                                                        <div className="h-2 w-6 rounded-full" style={{ backgroundColor: t.catBg }} />
                                                    </div>
                                                    {/* Product cards */}
                                                    <div className="px-1.5 space-y-1">
                                                        {[1, 2, 3].map((i) => (
                                                            <div key={i} className="rounded-md p-1 flex gap-1" style={{ backgroundColor: t.cardBg }}>
                                                                <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: t.catBg }} />
                                                                <div className="flex-1 space-y-0.5">
                                                                    <div className="h-[2px] w-3/4 rounded-full" style={{ backgroundColor: t.cardText, opacity: 0.7 }} />
                                                                    <div className="h-[1.5px] w-1/2 rounded-full" style={{ backgroundColor: t.cardText, opacity: 0.3 }} />
                                                                    <div className="h-[2px] w-4 rounded-full" style={{ backgroundColor: t.accent, opacity: 0.8 }} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Bottom nav */}
                                                    <div className="absolute bottom-0 left-0 right-0 h-[8%] flex items-center justify-around px-2" style={{ backgroundColor: t.cardBg }}>
                                                        {[1, 2, 3, 4].map((i) => (
                                                            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i === 1 ? t.accent : t.cardText, opacity: i === 1 ? 0.9 : 0.2 }} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Theme name */}
                                                <div className="py-1.5 px-1">
                                                    <p className={`text-[9px] font-medium ${isSelected ? 'text-orange-300' : 'text-gray-500 group-hover:text-gray-300'} transition-colors text-center truncate`}>{t.name}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Temalar & Renkler Card — unified */}
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-5 mb-3">
                            {/* Tema presets */}
                            <span className="text-[11px] text-gray-600 uppercase tracking-widest mb-3 block">Temalar</span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {([
                                    { name: 'Klasik Beyaz', bg: '#ffffff', text: '#111827', icon: '#374151', shadow: 'sm', searchBg: '#f3f4f6' },
                                    { name: 'Koyu Zarif', bg: '#1a1a2e', text: '#e0e0e0', icon: '#a0a0b8', shadow: 'none', searchBg: '#2a2a3e' },
                                    { name: 'Krem Naturel', bg: '#faf7f2', text: '#5c4a3a', icon: '#8b7355', shadow: 'sm', searchBg: '#f0ebe3' },
                                    { name: 'Cam Efekti', bg: '#ffffffcc', text: '#1f2937', icon: '#4b5563', shadow: 'md', searchBg: '#f9fafb80' },
                                    { name: 'Lacivert', bg: '#0f1b33', text: '#c8d6e5', icon: '#54a0ff', shadow: 'md', searchBg: '#1a2d4d' },
                                    { name: 'Ye\u015fil Do\u011fa', bg: '#f0f9f4', text: '#1a4731', icon: '#2d8659', shadow: 'sm', searchBg: '#e0f2e9' },
                                    { name: 'Alt\u0131n Premium', bg: '#1c1917', text: '#f5e6cc', icon: '#d4a853', shadow: 'lg', searchBg: '#2c2520' },
                                ] as { name: string; bg: string; text: string; icon: string; shadow: string; searchBg: string }[]).map((preset) => {
                                    const isActive = theme.menuHeaderBg === preset.bg && theme.menuHeaderTextColor === preset.text;
                                    return (
                                        <button
                                            key={preset.name}
                                            onClick={() => {
                                                updateTheme('menuHeaderBg', preset.bg);
                                                updateTheme('menuHeaderTextColor', preset.text);
                                                updateTheme('menuHeaderIconColor', preset.icon);
                                                updateTheme('menuHeaderShadow', preset.shadow);
                                                updateTheme('menuHeaderSearchBtnBg', preset.searchBg);
                                            }}
                                            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive
                                                ? 'border-orange-500/40 bg-orange-500/5 ring-1 ring-orange-500/20'
                                                : 'border-white/[0.04] bg-[#111] hover:border-white/[0.08] hover:bg-[#161616]'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.bg, border: '1px solid rgba(255,255,255,0.1)' }} />
                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.text }} />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-[12px] font-medium ${isActive ? 'text-orange-300' : 'text-gray-300'} transition-colors`}>{preset.name}</p>
                                            </div>
                                            {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-orange-500" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Divider */}
                            <div className="my-4 h-px bg-white/[0.06]" />

                            {/* Renk ayarları */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full ring-2 ring-white/10" style={{ backgroundColor: theme.menuHeaderBg }} />
                                    <div className="w-4 h-4 rounded-full ring-2 ring-white/10" style={{ backgroundColor: theme.menuHeaderTextColor }} />
                                    <div className="w-4 h-4 rounded-full ring-2 ring-white/10" style={{ backgroundColor: theme.menuHeaderIconColor }} />
                                </div>
                                <span className="text-[11px] text-gray-600 uppercase tracking-widest">Renkler</span>
                            </div>
                            <div className="space-y-3">
                                <ColorPicker label="Arkaplan" value={theme.menuHeaderBg} onChange={(v) => updateTheme("menuHeaderBg", v)} />
                                <ColorPicker label="Yaz&#x131;" value={theme.menuHeaderTextColor} onChange={(v) => updateTheme("menuHeaderTextColor", v)} />
                                <ColorPicker label="&#x130;kon" value={theme.menuHeaderIconColor} onChange={(v) => updateTheme("menuHeaderIconColor", v)} />
                            </div>
                        </div>

                        {/* G\u00f6lge Card */}
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-5 mb-3">
                            <span className="text-[11px] text-gray-600 uppercase tracking-widest mb-3 block">G\u00f6lge</span>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { value: "none", label: "Yok" },
                                    { value: "sm", label: "Hafif" },
                                    { value: "md", label: "Orta" },
                                    { value: "lg", label: "G\u00fc\u00e7l\u00fc" },
                                ].map((s) => (
                                    <button key={s.value} onClick={() => updateTheme("menuHeaderShadow", s.value)} className={`py-2.5 rounded-xl text-[12px] font-medium transition-all ${theme.menuHeaderShadow === s.value ? "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30" : "bg-[#161616] text-gray-500 hover:bg-[#1e1e1e] hover:text-gray-300"}`}>{s.label}</button>
                                ))}
                            </div>
                        </div>


                        {/* Varyasyonlar Card */}
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-5">
                            <span className="text-[11px] text-gray-600 uppercase tracking-widest mb-3 block">Header Varyasyonlar\u0131</span>
                            <div className="grid grid-cols-4 gap-2">
                                {([
                                    { id: 'classic', name: 'Klasik' },
                                    { id: 'tall', name: 'Y\u00fcksek' },
                                    { id: 'center-logo', name: 'Logo' },
                                    { id: 'left-logo', name: 'Sol Logo' },
                                    { id: 'lang', name: 'Dil' },
                                    { id: 'banner', name: 'Banner' },
                                    { id: 'minimal', name: 'Minimal' },
                                    { id: 'rounded', name: 'Yuvarlak' },
                                    { id: 'split', name: 'Split' },
                                    { id: 'accent-bar', name: '\u00c7izgi' },
                                    { id: 'glass', name: 'Cam' },
                                ] as { id: string; name: string }[]).map((v) => {
                                    const isActive = theme.headerVariant === v.id;
                                    const hBg = theme.menuHeaderBg;
                                    const hText = theme.menuHeaderTextColor;
                                    const hIcon = theme.menuHeaderIconColor;
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => updateTheme('headerVariant', v.id)}
                                            className={`group rounded-xl border overflow-hidden transition-all ${isActive
                                                ? 'border-orange-500/40 bg-orange-500/5 ring-1 ring-orange-500/20'
                                                : 'border-white/[0.04] bg-[#111] hover:border-white/[0.08] hover:bg-[#161616]'
                                                }`}
                                        >
                                            <div className="px-2 pt-2">
                                                <div className="h-7 rounded-lg flex items-center justify-between px-2" style={{ backgroundColor: hBg }}>
                                                    <div className="flex flex-col gap-[1.5px]"><div className="w-3 h-[1.5px] rounded-full" style={{ backgroundColor: hIcon }} /><div className="w-2 h-[1.5px] rounded-full" style={{ backgroundColor: hIcon }} /></div>
                                                    <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: hText, opacity: 0.5 }} />
                                                    <Search size={5} style={{ color: hIcon }} />
                                                </div>
                                            </div>
                                            <div className="py-1.5">
                                                <p className={`text-[10px] font-medium ${isActive ? 'text-orange-300' : 'text-gray-500'} transition-colors`}>{v.name}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>


                        {/* === TEMPORARILY HIDDEN SECTIONS === */}
                        {false && (<>
                            {/* General */}
                            <Section title="Genel Ayarlar" icon={<Palette size={18} />}>
                                <ColorPicker label="Sayfa Arkaplanı" value={theme.pageBg} onChange={(v) => updateTheme("pageBg", v)} />
                                <ColorPicker label="Vurgu Rengi" value={theme.accentColor} onChange={(v) => updateTheme("accentColor", v)} />
                            </Section>

                            {/* Font */}
                            <Section title="Yazı Tipi" icon={<Type size={18} />} defaultOpen={false}>
                                {/* Font search */}
                                <div className="relative mb-3">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        value={fontSearch}
                                        onChange={(e) => {
                                            const q = e.target.value;
                                            setFontSearch(q);
                                            if (q.length >= 2) {
                                                const fontName = q.replace(/ /g, '+');
                                                if (!document.querySelector(`link[href*="${fontName}"]`)) {
                                                    const link = document.createElement('link');
                                                    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;600&display=swap`;
                                                    link.rel = 'stylesheet';
                                                    document.head.appendChild(link);
                                                }
                                                setSearchedFonts([{ name: q, label: q }]);
                                            } else {
                                                setSearchedFonts([]);
                                            }
                                        }}
                                        placeholder="Google Fonts'ta ara..."
                                        className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                {/* Font grid */}
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                                    {[...searchedFonts, ...FONTS.filter(f => !searchedFonts.some(sf => sf.name === f.name))].map((f) => {
                                        const fontName = f.name.replace(/ /g, '+');
                                        if (typeof window !== 'undefined' && !document.querySelector(`link[href*="${fontName}"]`)) {
                                            const link = document.createElement('link');
                                            link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;600&display=swap`;
                                            link.rel = 'stylesheet';
                                            document.head.appendChild(link);
                                        }
                                        const isActive = theme.fontFamily === f.name;
                                        return (
                                            <button
                                                key={f.name}
                                                onClick={() => updateTheme("fontFamily", f.name)}
                                                className={`relative px-2 py-2.5 rounded-xl border text-center transition-all ${isActive ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'}`}
                                            >
                                                <span className="block text-sm font-semibold text-white truncate" style={{ fontFamily: f.name }}>
                                                    Aa
                                                </span>
                                                <span className="block text-[9px] text-gray-500 mt-0.5 truncate">{f.label}</span>
                                                {isActive && <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center"><Check size={8} className="text-white" /></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Section>

                            {/* Header */}
                            <Section title="Başlık / Slider" icon={<Monitor size={18} />} defaultOpen={false}>
                                {/* Hero Slider Toggle */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-white">Hero Slider</p>
                                        <p className="text-[11px] text-gray-500">Menü üstündeki kayan banner alanı</p>
                                    </div>
                                    <button
                                        onClick={() => updateTheme("showHeroSlider", theme.showHeroSlider !== "false" ? "false" : "true")}
                                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${theme.showHeroSlider !== "false" ? 'bg-emerald-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${theme.showHeroSlider !== "false" ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                                <ColorPicker label="Başlık Arkaplanı" value={theme.headerBg} onChange={(v) => updateTheme("headerBg", v)} />
                                <ColorPicker label="Gradient Başlangıç" value={theme.headerGradientFrom} onChange={(v) => updateTheme("headerGradientFrom", v)} />
                                <ColorPicker label="Gradient Bitiş" value={theme.headerGradientTo} onChange={(v) => updateTheme("headerGradientTo", v)} />
                            </Section>

                            {/* Category Buttons */}
                            <Section title="Kategori Butonları" icon={<LayoutGrid size={18} />} defaultOpen={false}>
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Buton Bar Arkaplanı</p>
                                <ColorPicker label="Arkaplan Rengi" value={theme.categoryNavBg} onChange={(v) => updateTheme("categoryNavBg", v)} />
                                <div className="border-t border-gray-800 my-2" />
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Buton Renkleri</p>
                                <ColorPicker label="Aktif Arkaplan" value={theme.categoryActiveBg} onChange={(v) => updateTheme("categoryActiveBg", v)} />
                                <ColorPicker label="Aktif Yazı Rengi" value={theme.categoryActiveText} onChange={(v) => updateTheme("categoryActiveText", v)} />
                                <ColorPicker label="Pasif Arkaplan" value={theme.categoryInactiveBg} onChange={(v) => updateTheme("categoryInactiveBg", v)} />
                                <ColorPicker label="Pasif Yazı Rengi" value={theme.categoryInactiveText} onChange={(v) => updateTheme("categoryInactiveText", v)} />
                                <div className="border-t border-gray-800 my-2" />
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Köşe Yuvarlaklığı</p>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex gap-1.5">{RADIUS_PRESETS.map((r) => (
                                        <button key={r.value} onClick={() => updateTheme("categoryRadius", r.value)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${theme.categoryRadius === r.value ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"}`}>{r.label}</button>
                                    ))}</div>
                                </div>
                                <div className="flex items-center justify-between gap-3 mt-2">
                                    <label className="text-xs text-gray-400">Değer</label>
                                    <div className="flex items-center gap-2">
                                        <input type="range" min={0} max={9999} value={theme.categoryRadius} onChange={(e) => updateTheme("categoryRadius", e.target.value)} className="w-20 accent-emerald-500" />
                                        <input type="number" min={0} max={9999} value={theme.categoryRadius} onChange={(e) => updateTheme("categoryRadius", e.target.value)} className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-300 text-right" />
                                        <span className="text-xs text-gray-500">px</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-800 my-2" />
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Gölge</p>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {[
                                        { value: "none", label: "Yok" },
                                        { value: "sm", label: "Hafif" },
                                        { value: "md", label: "Orta" },
                                        { value: "lg", label: "Güçlü" },
                                    ].map((s) => (
                                        <button key={s.value} onClick={() => { updateTheme("categoryBtnShadow", s.value); updateTheme("categoryBtnCustomShadow", ""); }} className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${theme.categoryBtnShadow === s.value && !theme.categoryBtnCustomShadow ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"}`}>{s.label}</button>
                                    ))}
                                </div>
                                <div className="mt-2">
                                    <label className="text-xs text-gray-400 block mb-1">Özel Gölge (CSS)</label>
                                    <input type="text" value={theme.categoryBtnCustomShadow || ""} onChange={(e) => { updateTheme("categoryBtnCustomShadow", e.target.value); if (e.target.value) updateTheme("categoryBtnShadow", "custom"); }} placeholder="0 2px 8px rgba(0,0,0,0.15)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
                                    <p className="text-[9px] text-gray-600 mt-1">Örn: 0 2px 8px rgba(0,0,0,0.15)</p>
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
                                <ColorPicker label="Kategori Bölüm Arkaplanı" value={theme.categorySectionBg} onChange={(v) => updateTheme("categorySectionBg", v)} />
                                <div className="border-t border-gray-800 my-2" />
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
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Kalınlık</label><div className="flex gap-1.5">{["400", "500", "600", "700", "800"].map((w) => (<button key={w} onClick={() => updateTheme("productNameWeight", w)} className={`px-2 py-1 rounded-md text-[10px] transition-all border ${theme.productNameWeight === w ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400"}`} style={{ fontWeight: parseInt(w) }}>{w}</button>))}</div></div>
                                <div className="border-t border-gray-800 my-2" />
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Ürün Açıklaması</p>
                                <ColorPicker label="Renk" value={theme.productDescColor} onChange={(v) => updateTheme("productDescColor", v)} />
                                <div className="border-t border-gray-800 my-2" />
                                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Kategori Başlığı</p>
                                <ColorPicker label="Renk" value={theme.categoryTitleColor} onChange={(v) => updateTheme("categoryTitleColor", v)} />
                            </Section>

                            {/* Pricing */}
                            <Section title="Fiyat Stilleri" icon={<Layers size={18} />} defaultOpen={false}>
                                <ColorPicker label="Fiyat Rengi" value={theme.priceColor} onChange={(v) => updateTheme("priceColor", v)} />
                                <ColorPicker label="İndirimli Fiyat" value={theme.discountColor} onChange={(v) => updateTheme("discountColor", v)} />
                                <ColorPicker label="Eski Fiyat" value={theme.oldPriceColor} onChange={(v) => updateTheme("oldPriceColor", v)} />
                            </Section>

                            {/* Popular Badge */}
                            <Section title="Popüler Etiketi" icon={<Sparkles size={18} />} defaultOpen={false}>
                                <ColorPicker label="Arkaplan" value={theme.popularBadgeBg} onChange={(v) => updateTheme("popularBadgeBg", v)} />
                                <ColorPicker label="Yazı Rengi" value={theme.popularBadgeText} onChange={(v) => updateTheme("popularBadgeText", v)} />
                            </Section>
                        </>)}
                        {/* === END HIDDEN SECTION 1 === */}
                    </>)}
                    {/* ─── END MENU TAB ─── */}

                    {/* ─── WELCOME TAB CONTENT ─── */}
                    {activeTab === 'welcome' && (<>
                        {/* Welcome Screen — ACTIVE */}
                        <Section title="Hoşgeldiniz Ekranı" icon={<ImageIcon size={18} />} defaultOpen={true}>
                            {/* Welcome Variant Selector */}
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Giriş Ekranı Varyasyonları</p>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {([
                                    { id: 'classic', name: 'Klasik', desc: 'Ortada logo + 3 buton' },
                                    { id: 'left-text', name: 'Sol Yazı', desc: 'Yazılar solda, butonlar alta' },
                                    { id: 'fullscreen', name: 'Tam Ekran', desc: 'Dev logo + tek buton' },
                                    { id: 'split-btn', name: 'Ayrık Buton', desc: 'Dikey butonlar altta' },
                                    { id: 'minimal', name: 'Minimal', desc: 'Temiz ve sade giriş' },
                                    { id: 'editorial', name: 'Editöryal', desc: 'Büyük yazı + ince stil' },
                                    { id: 'neon', name: 'Neon', desc: 'Işıklı glow efekti' },
                                    { id: 'glass-card', name: 'Cam Kart', desc: 'Blur daireli, cam efektli kart' },
                                    { id: 'wave', name: 'Dalga', desc: 'Çift dalga kesim, logo üstte' },
                                    { id: 'cinema', name: 'Sinema', desc: 'Film şeridi, altın ışık konisi' },
                                    { id: 'mosaic', name: 'Çapraz', desc: 'Diagonal bölünmüş ekran' },
                                    { id: 'horizon', name: 'Şerit', desc: 'Parallax yatay şeritler' },
                                    { id: 'spotlight', name: 'Zaman Çizelgesi', desc: 'Dikey timeline navigasyon' },
                                    { id: 'stack', name: '3D Kart', desc: '3D perspektif kart yığını' },
                                ] as { id: string; name: string; desc: string }[]).map((v) => {
                                    const isActive = theme.welcomeVariant === v.id;
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => updateTheme('welcomeVariant', v.id)}
                                            className={`group rounded-2xl border overflow-hidden transition-all ${isActive
                                                ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                                                : 'border-gray-700 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800'
                                                }`}
                                        >
                                            {/* Mini preview */}
                                            <div className="px-2 pt-2">
                                                <div className="rounded-lg overflow-hidden h-16 relative" style={{ backgroundColor: theme.welcomeBg || '#000' }}>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                                    {v.id === 'classic' && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                                            <div className="w-4 h-4 rounded-full border border-white/40" />
                                                            <div className="h-1 w-8 rounded-full bg-white/60" />
                                                            <div className="flex gap-1 mt-1"><div className="h-2 w-5 rounded-sm bg-white/80" /><div className="h-2 w-5 rounded-sm bg-white/30" /><div className="h-2 w-5 rounded-sm bg-white/30" /></div>
                                                        </div>
                                                    )}
                                                    {v.id === 'left-text' && (
                                                        <div className="absolute inset-0 flex flex-col justify-end p-2">
                                                            <div className="h-1.5 w-10 rounded-full bg-white/70 mb-0.5" />
                                                            <div className="h-1 w-6 rounded-full bg-white/40 mb-2" />
                                                            <div className="flex gap-1"><div className="h-2 w-5 rounded-sm bg-white/80" /><div className="h-2 w-5 rounded-sm bg-white/30" /><div className="h-2 w-5 rounded-sm bg-white/30" /></div>
                                                        </div>
                                                    )}
                                                    {v.id === 'fullscreen' && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                                            <div className="w-6 h-6 rounded-lg border border-white/40" />
                                                            <div className="h-1 w-10 rounded-full bg-white/50" />
                                                            <div className="h-2.5 w-12 rounded-md bg-white/80 mt-1" />
                                                        </div>
                                                    )}
                                                    {v.id === 'split-btn' && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                                            <div className="w-4 h-4 rounded-full border border-white/40" />
                                                            <div className="h-1 w-8 rounded-full bg-white/60" />
                                                            <div className="flex flex-col gap-0.5 mt-1 w-10"><div className="h-2 w-full rounded-sm bg-white/80" /><div className="h-2 w-full rounded-sm bg-white/30" /><div className="h-2 w-full rounded-sm bg-white/30" /></div>
                                                        </div>
                                                    )}
                                                    {v.id === 'minimal' && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                                                            <div className="h-1 w-8 rounded-full bg-white/50" />
                                                            <div className="h-2.5 w-10 rounded-md bg-white/80" />
                                                        </div>
                                                    )}
                                                    {v.id === 'editorial' && (
                                                        <div className="absolute inset-0 flex flex-col justify-end p-2">
                                                            <div className="h-2 w-12 rounded-full bg-white/70 mb-0.5" />
                                                            <div className="h-1 w-8 rounded-full bg-white/40 mb-1" />
                                                            <div className="h-2 w-8 rounded-sm bg-white/60" />
                                                        </div>
                                                    )}
                                                    {v.id === 'neon' && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                                            <div className="w-4 h-4 rounded-full" style={{ border: `1px solid ${theme.welcomeBtnBg || '#fff'}`, boxShadow: `0 0 6px ${theme.welcomeBtnBg || '#fff'}44` }} />
                                                            <div className="h-1 w-8 rounded-full" style={{ backgroundColor: theme.welcomeBtnBg || '#fff', opacity: 0.5 }} />
                                                            <div className="h-2 w-8 rounded-sm mt-0.5" style={{ border: `1px solid ${theme.welcomeBtnBg || '#fff'}66` }} />
                                                        </div>
                                                    )}
                                                    {/* ── New radical variant previews ── */}
                                                    {v.id === 'glass-card' && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            {/* Blur circles */}
                                                            <div className="absolute top-1 left-0 w-4 h-4 rounded-full bg-white/10" style={{ filter: 'blur(3px)' }} />
                                                            <div className="absolute bottom-2 right-1 w-3 h-3 rounded-full bg-white/10" style={{ filter: 'blur(2px)' }} />
                                                            {/* Glass card */}
                                                            <div className="w-14 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center gap-0.5 p-1" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                                                                <div className="w-full h-[2px] rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${theme.welcomeBtnBg || '#fff'}44, transparent)` }} />
                                                                <div className="w-3 h-3 rounded-full border border-white/30 mt-0.5" style={{ borderStyle: 'dashed' }} />
                                                                <div className="h-0.5 w-6 rounded-full bg-white/50" />
                                                                <div className="h-1.5 w-10 rounded-sm bg-white/70 mt-0.5" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {v.id === 'wave' && (
                                                        <div className="absolute inset-0">
                                                            {/* Logo floating on top */}
                                                            <div className="flex items-center justify-center pt-2">
                                                                <div className="w-4 h-4 rounded-full border-2 border-white/30 bg-white/5" />
                                                            </div>
                                                            {/* Double wave */}
                                                            <div className="absolute bottom-0 left-0 right-0">
                                                                <svg viewBox="0 0 60 16" className="w-full block" preserveAspectRatio="none" style={{ height: '12px' }}>
                                                                    <path d="M0,10 C8,3 16,14 24,7 C32,0 40,10 48,5 C54,0 58,8 60,6 L60,16 L0,16 Z" fill="white" fillOpacity="0.12" />
                                                                    <path d="M0,12 C10,5 18,15 26,8 C34,1 42,12 50,6 C56,1 59,9 60,7 L60,16 L0,16 Z" fill="white" fillOpacity="0.06" />
                                                                </svg>
                                                                <div className="h-4 bg-white/10 px-1 flex items-center justify-center">
                                                                    <div className="h-1.5 w-8 rounded-sm bg-white/60" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {v.id === 'cinema' && (
                                                        <div className="absolute inset-0">
                                                            {/* Film strip borders */}
                                                            <div className="absolute top-0 bottom-0 left-0 w-[4px] flex flex-col gap-[1px] p-[0.5px]" style={{ opacity: 0.3 }}>
                                                                {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="flex-1 rounded-[0.5px] bg-white/40" />))}
                                                            </div>
                                                            <div className="absolute top-0 bottom-0 right-0 w-[4px] flex flex-col gap-[1px] p-[0.5px]" style={{ opacity: 0.3 }}>
                                                                {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="flex-1 rounded-[0.5px] bg-white/40" />))}
                                                            </div>
                                                            {/* Spotlight cone */}
                                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-8" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)', clipPath: 'polygon(35% 0%, 65% 0%, 90% 100%, 10% 100%)' }} />
                                                            <div className="flex flex-col items-center justify-center h-full gap-0.5">
                                                                <div className="text-[6px] opacity-40" style={{ color: theme.welcomeBtnBg || '#fff' }}>★</div>
                                                                <div className="w-4 h-4 rounded-full border border-white/30" />
                                                                <div className="h-0.5 w-6 rounded-full bg-white/40" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {v.id === 'mosaic' && (
                                                        <div className="absolute inset-0">
                                                            {/* Diagonal split */}
                                                            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, transparent 45%, rgba(0,0,0,0.4) 45%)` }} />
                                                            {/* Logo in top-right */}
                                                            <div className="absolute top-2 right-2 w-3 h-3 rounded bg-white/15 border border-white/20" />
                                                            {/* Text+buttons in bottom-left */}
                                                            <div className="absolute bottom-1.5 left-1.5">
                                                                <div className="h-1.5 w-7 rounded-full bg-white/60 mb-0.5" />
                                                                <div className="h-0.5 w-5 rounded-full bg-white/30 mb-1" />
                                                                <div className="h-1.5 w-10 rounded-sm bg-white/70" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {v.id === 'horizon' && (
                                                        <div className="absolute inset-0 flex flex-col">
                                                            {/* Top: bg visible */}
                                                            <div className="flex-[3] flex items-center justify-center">
                                                                <div className="w-4 h-4 rounded-full border border-white/30" />
                                                            </div>
                                                            {/* Horizontal stripes */}
                                                            <div className="h-[1px]" style={{ backgroundColor: theme.welcomeBtnBg || '#fff', opacity: 0.2 }} />
                                                            <div className="flex-[0.3] bg-white/5" />
                                                            <div className="h-[1px]" style={{ backgroundColor: theme.welcomeBtnBg || '#fff', opacity: 0.3 }} />
                                                            <div className="flex-[0.2] bg-white/8" />
                                                            <div className="h-[1px]" style={{ backgroundColor: theme.welcomeBtnBg || '#fff', opacity: 0.4 }} />
                                                            {/* Bottom */}
                                                            <div className="flex-[2] bg-white/5 flex items-center justify-center">
                                                                <div className="h-2 w-10 rounded-sm bg-white/60" style={{ clipPath: 'polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)' }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {v.id === 'spotlight' && (
                                                        <div className="absolute inset-0 flex">
                                                            {/* Timeline line */}
                                                            <div className="absolute top-2 bottom-2 left-3 w-[1px]" style={{ background: `linear-gradient(180deg, transparent, ${theme.welcomeBtnBg || '#fff'}33, transparent)` }} />
                                                            <div className="flex flex-col justify-center pl-5 gap-1.5">
                                                                {/* Node 1 */}
                                                                <div className="flex items-center gap-1.5 relative">
                                                                    <div className="absolute -left-[10px] w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.welcomeBtnBg || '#fff' }} />
                                                                    <div className="w-3 h-3 rounded-full border border-white/30" />
                                                                    <div className="h-0.5 w-6 rounded-full bg-white/50" />
                                                                </div>
                                                                {/* Node 2 */}
                                                                <div className="flex items-center gap-1 relative">
                                                                    <div className="absolute -left-[9px] w-1 h-1 rounded-full border border-white/40" />
                                                                    <div className="h-1.5 w-10 rounded-sm bg-white/70" />
                                                                </div>
                                                                {/* Node 3 */}
                                                                <div className="flex items-center gap-1 relative">
                                                                    <div className="absolute -left-[9px] w-1 h-1 rounded-full border border-white/25" />
                                                                    <div className="h-1.5 w-8 rounded-sm bg-white/30" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {v.id === 'stack' && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ perspective: '100px' }}>
                                                            <div className="w-3 h-3 rounded-full border border-white/30 mb-1" />
                                                            <div className="h-0.5 w-6 rounded-full bg-white/50 mb-2" />
                                                            {/* 3D stacked cards */}
                                                            <div className="relative w-14 h-6">
                                                                <div className="absolute bottom-0 left-2 right-2 h-1 rounded bg-white/10" style={{ transform: 'rotateX(4deg)', transformOrigin: 'top' }} />
                                                                <div className="absolute bottom-1 left-1 right-1 h-1 rounded bg-white/15" style={{ transform: 'rotateX(3deg)', transformOrigin: 'top' }} />
                                                                <div className="absolute bottom-2 left-0 right-0 h-3 rounded bg-white/10 border border-white/20 flex items-center justify-center" style={{ transform: 'rotateX(1deg)', transformOrigin: 'top' }}>
                                                                    <div className="h-1.5 w-8 rounded-sm bg-white/60" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="px-2 py-2 text-center">
                                                <p className={`text-[11px] font-semibold ${isActive ? 'text-emerald-300' : 'text-gray-200 group-hover:text-emerald-300'} transition-colors`}>{v.name}</p>
                                                <p className="text-[9px] text-gray-500">{v.desc}</p>
                                                {isActive && <div className="mx-auto mt-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center"><Check size={8} className="text-white" /></div>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="border-t border-gray-800 my-3" />

                            {/* Button Style Selector */}
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Buton Stili</p>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {([
                                    { id: 'classic', name: 'Klasik', desc: 'Düz metin' },
                                    { id: 'icon-left', name: 'İkon Sol', desc: 'Solda ikon' },
                                    { id: 'icon-top', name: 'İkon Üst', desc: 'Üstte ikon' },
                                    { id: 'pill', name: 'Hap', desc: 'Yuvarlak uç' },
                                    { id: 'outline-glow', name: 'Çerçeve', desc: 'Glow efekt' },
                                    { id: 'card', name: 'Kart', desc: 'Geniş kart' },
                                    { id: 'minimal-line', name: 'Çizgi', desc: 'Alt çizgi' },
                                ] as { id: string; name: string; desc: string }[]).map((s) => {
                                    const isActive = (theme.welcomeBtnStyle || 'classic') === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => updateTheme('welcomeBtnStyle', s.id)}
                                            className={`group rounded-xl border overflow-hidden transition-all ${isActive
                                                ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                                                : 'border-gray-700 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800'
                                                }`}
                                        >
                                            {/* Mini preview */}
                                            <div className="px-1.5 pt-1.5">
                                                <div className="rounded-md overflow-hidden h-10 relative bg-gray-900/80">
                                                    {s.id === 'classic' && (
                                                        <div className="absolute inset-0 flex items-center justify-center gap-1 px-1">
                                                            <div className="h-2 flex-1 rounded-sm bg-white/60" />
                                                            <div className="h-2 flex-1 rounded-sm bg-white/25" />
                                                            <div className="h-2 flex-1 rounded-sm bg-white/25" />
                                                        </div>
                                                    )}
                                                    {s.id === 'icon-left' && (
                                                        <div className="absolute inset-0 flex flex-col justify-center gap-0.5 px-1">
                                                            <div className="flex items-center gap-0.5"><div className="w-2 h-2 rounded bg-white/20" /><div className="h-1.5 flex-1 rounded-sm bg-white/60" /></div>
                                                            <div className="flex items-center gap-0.5"><div className="w-2 h-2 rounded bg-white/15" /><div className="h-1.5 flex-1 rounded-sm bg-white/25" /></div>
                                                        </div>
                                                    )}
                                                    {s.id === 'icon-top' && (
                                                        <div className="absolute inset-0 flex items-center justify-center gap-1 px-1">
                                                            {[0.6, 0.3, 0.3].map((o, i) => (
                                                                <div key={i} className="flex flex-col items-center gap-0.5">
                                                                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: `rgba(255,255,255,${o * 0.4})` }} />
                                                                    <div className="h-0.5 w-3 rounded-full" style={{ backgroundColor: `rgba(255,255,255,${o})` }} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {s.id === 'pill' && (
                                                        <div className="absolute inset-0 flex flex-col justify-center gap-0.5 px-1.5">
                                                            <div className="h-2 rounded-full bg-white/60 flex items-center justify-center gap-0.5"><div className="w-1 h-1 rounded-full bg-white/40" /></div>
                                                            <div className="h-2 rounded-full bg-white/25" />
                                                        </div>
                                                    )}
                                                    {s.id === 'outline-glow' && (
                                                        <div className="absolute inset-0 flex flex-col justify-center gap-0.5 px-1">
                                                            <div className="h-2 rounded border border-white/40" style={{ boxShadow: '0 0 4px rgba(255,255,255,0.1)' }} />
                                                            <div className="h-2 rounded border border-white/20" />
                                                        </div>
                                                    )}
                                                    {s.id === 'card' && (
                                                        <div className="absolute inset-0 flex flex-col justify-center gap-0.5 px-1">
                                                            <div className="flex items-center gap-1 h-3 bg-white/10 rounded px-0.5"><div className="w-2.5 h-2.5 rounded bg-white/15" /><div className="h-1 flex-1 rounded-full bg-white/60" /></div>
                                                            <div className="flex items-center gap-1 h-3 bg-white/5 rounded px-0.5"><div className="w-2.5 h-2.5 rounded bg-white/10" /><div className="h-1 flex-1 rounded-full bg-white/25" /></div>
                                                        </div>
                                                    )}
                                                    {s.id === 'minimal-line' && (
                                                        <div className="absolute inset-0 flex flex-col justify-center px-1">
                                                            <div className="flex items-center gap-1 py-0.5"><div className="w-1.5 h-1.5 rounded-full bg-white/30" /><div className="h-1 flex-1 rounded-full bg-white/50" /></div>
                                                            <div className="h-[0.5px] bg-white/10" />
                                                            <div className="flex items-center gap-1 py-0.5"><div className="w-1.5 h-1.5 rounded-full bg-white/20" /><div className="h-1 flex-1 rounded-full bg-white/30" /></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="px-1 py-1.5 text-center">
                                                <p className={`text-[9px] font-semibold ${isActive ? 'text-emerald-300' : 'text-gray-300 group-hover:text-emerald-300'} transition-colors`}>{s.name}</p>
                                                {isActive && <div className="mx-auto mt-0.5 w-2 h-2 bg-emerald-500 rounded-full flex items-center justify-center"><Check size={6} className="text-white" /></div>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="border-t border-gray-800 my-3" />

                            {/* Background Video/Image Upload */}
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Arka Plan Video / Resim</p>
                            <input ref={headerLogoRef} type="file" accept="image/*,video/*" className="hidden" id="welcomeBgUpload" onChange={async (e) => {
                                const file = e.target.files?.[0]; if (!file) return;
                                setHeaderLogoUploading(true);
                                const form = new FormData(); form.append('file', file);
                                try {
                                    const res = await fetch('/api/upload', { method: 'POST', body: form }); const data = await res.json();
                                    if (data.url) {
                                        if (file.type.startsWith('video/')) updateTheme('welcomeVideo', data.url);
                                        else updateTheme('welcomeImage', data.url);
                                    }
                                } catch (err) { console.error(err); } finally { setHeaderLogoUploading(false); }
                            }} />
                            {(theme.welcomeVideo || theme.welcomeImage) ? (
                                <div className="relative rounded-xl overflow-hidden border border-gray-700 mb-2">
                                    {theme.welcomeVideo ? (
                                        <video src={theme.welcomeVideo} className="w-full h-24 object-cover" muted autoPlay loop playsInline />
                                    ) : (
                                        <img src={theme.welcomeImage} className="w-full h-24 object-cover" alt="" />
                                    )}
                                    <button onClick={() => { updateTheme('welcomeVideo', ''); updateTheme('welcomeImage', ''); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/90 flex items-center justify-center"><X size={12} className="text-white" /></button>
                                </div>
                            ) : (
                                <button onClick={() => document.getElementById('welcomeBgUpload')?.click()} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-emerald-500/50 transition-colors flex flex-col items-center gap-1.5 mb-2">
                                    <Upload size={18} className="text-gray-500" />
                                    <span className="text-[10px] text-gray-500">Video veya resim yükle</span>
                                </button>
                            )}
                            <div className="border-t border-gray-800 my-3" />

                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Arka Plan</p>
                            <ColorPicker label="Arka Plan Rengi" value={theme.welcomeBg} onChange={(v) => updateTheme("welcomeBg", v)} />
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Video/Resim Opaklığı</label><div className="flex items-center gap-2"><input type="range" min={0} max={100} value={theme.welcomeOverlayOpacity} onChange={(e) => updateTheme("welcomeOverlayOpacity", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeOverlayOpacity}%</span></div></div>
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Gradient Ayarları</p>
                            <ColorPicker label="Gradient Başlangıç" value={theme.welcomeGradientFrom} onChange={(v) => updateTheme("welcomeGradientFrom", v)} />
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Gradient Yoğunluğu</label><div className="flex items-center gap-2"><input type="range" min={0} max={100} value={theme.welcomeGradientOpacity} onChange={(e) => updateTheme("welcomeGradientOpacity", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeGradientOpacity}%</span></div></div>
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Yazılar</p>
                            <ColorPicker label="Ana Yazı Rengi" value={theme.welcomeTextColor} onChange={(v) => updateTheme("welcomeTextColor", v)} />
                            <ColorPicker label="Alt Yazı Rengi" value={theme.welcomeSubtextColor} onChange={(v) => updateTheme("welcomeSubtextColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Logo</p>
                            <ColorPicker label="Logo Kenarlık" value={theme.welcomeLogoBorder} onChange={(v) => updateTheme("welcomeLogoBorder", v)} />
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Logo Boyutu</label><div className="flex items-center gap-2"><input type="range" min={48} max={160} value={theme.welcomeLogoSize} onChange={(e) => updateTheme("welcomeLogoSize", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeLogoSize}px</span></div></div>
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Logo Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={50} value={theme.welcomeLogoRadius} onChange={(e) => updateTheme("welcomeLogoRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeLogoRadius}px</span></div></div>
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Menü Butonu</p>
                            <ColorPicker label="Buton Arkaplan" value={theme.welcomeBtnBg} onChange={(v) => updateTheme("welcomeBtnBg", v)} />
                            <ColorPicker label="Buton Yazı" value={theme.welcomeBtnText} onChange={(v) => updateTheme("welcomeBtnText", v)} />
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Buton Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={24} value={theme.welcomeBtnRadius} onChange={(e) => updateTheme("welcomeBtnRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeBtnRadius}px</span></div></div>
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Buton Gölgesi</label><div className="flex gap-1.5">{SHADOW_OPTIONS.map((s) => (<button key={s.value} onClick={() => updateTheme("welcomeBtnShadow", s.value)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${theme.welcomeBtnShadow === s.value ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"}`}>{s.label}</button>))}</div></div>
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Diğer Butonlar</p>
                            <ColorPicker label="Arkaplan" value={theme.welcomeSecondaryBtnBg} onChange={(v) => updateTheme("welcomeSecondaryBtnBg", v)} />
                            <ColorPicker label="Yazı Rengi" value={theme.welcomeSecondaryBtnText} onChange={(v) => updateTheme("welcomeSecondaryBtnText", v)} />
                            <ColorPicker label="Kenarlık" value={theme.welcomeSecondaryBtnBorder} onChange={(v) => updateTheme("welcomeSecondaryBtnBorder", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <ColorPicker label="Ayırıcı Çizgi" value={theme.welcomeSeparatorColor} onChange={(v) => updateTheme("welcomeSeparatorColor", v)} />
                        </Section>
                    </>)}
                    {/* ─── END WELCOME TAB ─── */}

                    {/* === TEMPORARILY HIDDEN SECTIONS 2 === */}
                    {false && (<>
                        {/* Bottom Nav */}
                        <Section title="Alt Navigasyon" icon={<Monitor size={18} />} defaultOpen={false}>
                            <ColorPicker label="Arkaplan" value={theme.bottomNavBg} onChange={(v) => updateTheme("bottomNavBg", v)} />
                            <ColorPicker label="Aktif İkon" value={theme.bottomNavActive} onChange={(v) => updateTheme("bottomNavActive", v)} />
                            <ColorPicker label="Pasif İkon" value={theme.bottomNavInactive} onChange={(v) => updateTheme("bottomNavInactive", v)} />
                        </Section>

                        {/* Product Detail Overlay */}
                        <Section title="Ürün Detay Sayfası" icon={<Eye size={18} />} defaultOpen={false}>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Arka Plan & Kart</p>
                            <ColorPicker label="Kart Arka Planı" value={theme.detailBg} onChange={(v) => updateTheme("detailBg", v)} />
                            <ColorPicker label="Geri Butonu BG" value={theme.detailBackBtnBg} onChange={(v) => updateTheme("detailBackBtnBg", v)} />
                            <ColorPicker label="Geri Butonu İkon" value={theme.detailBackBtnColor} onChange={(v) => updateTheme("detailBackBtnColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Yazılar</p>
                            <ColorPicker label="Ürün Adı" value={theme.detailNameColor} onChange={(v) => updateTheme("detailNameColor", v)} />
                            <ColorPicker label="Fiyat" value={theme.detailPriceColor} onChange={(v) => updateTheme("detailPriceColor", v)} />
                            <ColorPicker label="Açıklama" value={theme.detailDescColor} onChange={(v) => updateTheme("detailDescColor", v)} />
                            <ColorPicker label="Etiket / Başlık" value={theme.detailLabelColor} onChange={(v) => updateTheme("detailLabelColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Bilgi Kutuları</p>
                            <ColorPicker label="Bilgi Kutusu BG" value={theme.detailInfoBg} onChange={(v) => updateTheme("detailInfoBg", v)} />
                            <ColorPicker label="Bilgi Kutusu Border" value={theme.detailInfoBorder} onChange={(v) => updateTheme("detailInfoBorder", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Malzeme Etiketleri</p>
                            <ColorPicker label="Etiket BG" value={theme.detailIngredientBg} onChange={(v) => updateTheme("detailIngredientBg", v)} />
                            <ColorPicker label="Etiket Yazı" value={theme.detailIngredientText} onChange={(v) => updateTheme("detailIngredientText", v)} />
                            <ColorPicker label="Etiket Border" value={theme.detailIngredientBorder} onChange={(v) => updateTheme("detailIngredientBorder", v)} />
                        </Section>

                        {/* Search Overlay */}
                        <Section title="Arama Sayfası" icon={<Search size={18} />} defaultOpen={false}>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Genel</p>
                            <ColorPicker label="Arka Plan" value={theme.searchOverlayBg} onChange={(v) => updateTheme("searchOverlayBg", v)} />
                            <ColorPicker label="Arama İkon" value={theme.searchOverlayIconColor} onChange={(v) => updateTheme("searchOverlayIconColor", v)} />
                            <ColorPicker label="Kapatma İkon" value={theme.searchOverlayCloseColor} onChange={(v) => updateTheme("searchOverlayCloseColor", v)} />
                            <ColorPicker label="Border Çizgi" value={theme.searchOverlayBorderColor} onChange={(v) => updateTheme("searchOverlayBorderColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Yazılar</p>
                            <ColorPicker label="Yazı Rengi" value={theme.searchOverlayInputColor} onChange={(v) => updateTheme("searchOverlayInputColor", v)} />
                            <ColorPicker label="Placeholder" value={theme.searchOverlayPlaceholderColor} onChange={(v) => updateTheme("searchOverlayPlaceholderColor", v)} />
                            <ColorPicker label="Boş Mesaj" value={theme.searchOverlayEmptyColor} onChange={(v) => updateTheme("searchOverlayEmptyColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Sonuç Kartları</p>
                            <ColorPicker label="Kart BG" value={theme.searchOverlayResultBg} onChange={(v) => updateTheme("searchOverlayResultBg", v)} />
                            <ColorPicker label="Ürün Adı" value={theme.searchOverlayResultNameColor} onChange={(v) => updateTheme("searchOverlayResultNameColor", v)} />
                            <ColorPicker label="Açıklama" value={theme.searchOverlayResultDescColor} onChange={(v) => updateTheme("searchOverlayResultDescColor", v)} />
                            <ColorPicker label="Fiyat" value={theme.searchOverlayResultPriceColor} onChange={(v) => updateTheme("searchOverlayResultPriceColor", v)} />
                        </Section>

                        {/* Sidebar Drawer */}
                        <Section title="Sol Menü (Drawer)" icon={<Menu size={18} />} defaultOpen={false}>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Genel</p>
                            <ColorPicker label="Arka Plan" value={theme.sidebarBg} onChange={(v) => updateTheme("sidebarBg", v)} />
                            <ColorPicker label="Bölüm Çizgisi" value={theme.sidebarBorder} onChange={(v) => updateTheme("sidebarBorder", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Başlık</p>
                            <ColorPicker label="İşletme Adı" value={theme.sidebarNameColor} onChange={(v) => updateTheme("sidebarNameColor", v)} />
                            <ColorPicker label="İşletme Açıklama" value={theme.sidebarDescColor} onChange={(v) => updateTheme("sidebarDescColor", v)} />
                            <ColorPicker label="Kapatma Buton Çerçeve" value={theme.sidebarCloseBtnBorder} onChange={(v) => updateTheme("sidebarCloseBtnBorder", v)} />
                            <ColorPicker label="Kapatma Buton İkon" value={theme.sidebarCloseBtnColor} onChange={(v) => updateTheme("sidebarCloseBtnColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Menü Öğeleri</p>
                            <ColorPicker label="Bölüm Başlığı" value={theme.sidebarLabelColor} onChange={(v) => updateTheme("sidebarLabelColor", v)} />
                            <ColorPicker label="Menü Yazısı" value={theme.sidebarItemColor} onChange={(v) => updateTheme("sidebarItemColor", v)} />
                            <ColorPicker label="Menü İkon" value={theme.sidebarItemIconColor} onChange={(v) => updateTheme("sidebarItemIconColor", v)} />
                            <ColorPicker label="Hover Arka Plan" value={theme.sidebarItemHover} onChange={(v) => updateTheme("sidebarItemHover", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Aktif Kategori</p>
                            <ColorPicker label="Aktif BG" value={theme.sidebarActiveItemBg} onChange={(v) => updateTheme("sidebarActiveItemBg", v)} />
                            <ColorPicker label="Aktif Yazı" value={theme.sidebarActiveItemColor} onChange={(v) => updateTheme("sidebarActiveItemColor", v)} />
                        </Section>
                    </>)}
                    {/* === END HIDDEN SECTION 2 === */}

                </div>


                {/* RIGHT: Phone frame - aligned with scrollable area */}
                {
                    slug && (
                        <div className="hidden lg:flex flex-col items-center w-[400px] flex-shrink-0">
                            <div className="w-[380px] bg-black overflow-hidden relative rounded-[28px] border-[5px] border-black" style={{ height: 'calc(100dvh - 120px)' }}>
                                <iframe
                                    ref={iframeRef}
                                    src={`/${slug}`}
                                    className="w-full h-full border-0"
                                    style={{ background: '#000', clipPath: 'inset(0 round 23px)' }}
                                    onLoad={() => {
                                        setTimeout(() => {
                                            if (iframeRef.current?.contentWindow) {
                                                iframeRef.current.contentWindow.postMessage({ type: 'theme-update', theme }, '*');
                                            }
                                        }, 500);
                                    }}
                                />
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}

