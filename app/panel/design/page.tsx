"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    Save, Loader2, Palette, Type, Square, Layers, Eye, RotateCcw, Settings,
    Sun, Moon, Sparkles, Paintbrush, SlidersHorizontal, Monitor, Menu, Upload, X, Globe,
    LayoutGrid, ChevronDown, ChevronUp, Check, Smartphone, Tablet, RefreshCw, Search, Image as ImageIcon,
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
    menuHeaderSearchIconColor: "#374151",
    menuHeaderShadow: "sm",
    menuHeaderFontSize: "18",
    menuHeaderSearchBtnBg: "#f3f4f6",
    headerVariant: "classic",
    headerLogo: "",
    showMenuButton: "true",
    showSearchIcon: "true",

    // Global Theme Preset (independent from header)
    globalThemeBg: "#ffffff",
    globalThemeText: "#111827",
    globalThemeIcon: "#374151",
    globalThemeSearchBg: "#f3f4f6",

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

// ─── HSV/RGB Helpers ────────────────────────────────────────
function hexToHsv(hex: string): [number, number, number] {
    let r = 0, g = 0, b = 0;
    const clean = hex.replace(/[^0-9a-fA-F]/g, '');
    if (!clean || clean.length < 3) return [0, 0, 0];
    if (clean.length === 3) {
        r = parseInt(clean[0] + clean[0], 16) / 255; g = parseInt(clean[1] + clean[1], 16) / 255; b = parseInt(clean[2] + clean[2], 16) / 255;
    } else if (clean.length >= 6) {
        r = parseInt(clean.substring(0, 2), 16) / 255; g = parseInt(clean.substring(2, 4), 16) / 255; b = parseInt(clean.substring(4, 6), 16) / 255;
    }
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0; const s = max === 0 ? 0 : d / max; const v = max;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
    }
    return [h * 360, s * 100, v * 100];
}
function hsvToHex(h: number, s: number, v: number): string {
    const _s = s / 100, _v = v / 100;
    const c = _v * _s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = _v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ─── Advanced Color Panel ───────────────────────────────────
type GradientStop = { color: string; position: number };
type PanelTab = 'solid' | 'linear' | 'radial' | 'angular' | 'image';

function AdvancedColorPanel({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
    const panelRef = useRef<HTMLDivElement>(null);
    const satValRef = useRef<HTMLCanvasElement>(null);
    const [activeTab, setActiveTab] = useState<PanelTab>(() => {
        if (value.startsWith('linear-gradient')) return 'linear';
        if (value.startsWith('radial-gradient')) return 'radial';
        if (value.startsWith('conic-gradient')) return 'angular';
        if (value.startsWith('url(')) return 'image';
        return 'solid';
    });
    const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(value.startsWith('#') ? value : '#000000'));
    const [opacity, setOpacity] = useState(100);
    const [hexInput, setHexInput] = useState(value.startsWith('#') ? value : '#000000');
    const isDraggingSV = useRef(false);
    const isDraggingHue = useRef(false);
    const [gradAngle, setGradAngle] = useState(135);
    const [gradStops, setGradStops] = useState<GradientStop[]>([{ color: '#E8C3C3', position: 0 }, { color: '#826D6D', position: 100 }]);
    const [editingStop, setEditingStop] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    useEffect(() => {
        if (activeTab !== 'solid') return;
        const canvas = satValRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = `hsl(${hsv[0]}, 100%, 50%)`; ctx.fillRect(0, 0, w, h);
        const wG = ctx.createLinearGradient(0, 0, w, 0); wG.addColorStop(0, '#fff'); wG.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = wG; ctx.fillRect(0, 0, w, h);
        const bG = ctx.createLinearGradient(0, 0, 0, h); bG.addColorStop(0, 'rgba(0,0,0,0)'); bG.addColorStop(1, '#000');
        ctx.fillStyle = bG; ctx.fillRect(0, 0, w, h);
    }, [hsv[0], activeTab]);

    useEffect(() => {
        if (activeTab !== 'solid') return;
        const hex = hsvToHex(hsv[0], hsv[1], hsv[2]); setHexInput(hex); onChange(hex);
    }, [hsv, activeTab]);

    const handleSVMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = satValRef.current; if (!canvas) return;
        const r = canvas.getBoundingClientRect();
        setHsv([hsv[0], Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 100, (1 - Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))) * 100]);
    };

    useEffect(() => {
        const move = (e: MouseEvent) => {
            if (isDraggingSV.current && satValRef.current) {
                const r = satValRef.current.getBoundingClientRect();
                const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
                const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
                setHsv(p => [p[0], x * 100, (1 - y) * 100]);
            }
            if (isDraggingHue.current) {
                const el = document.getElementById('acp-hue-slider');
                if (el) { const r = el.getBoundingClientRect(); setHsv(p => [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 360, p[1], p[2]]); }
            }
        };
        const up = () => { isDraggingSV.current = false; isDraggingHue.current = false; };
        window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
        return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    }, []);

    const buildGrad = (type: PanelTab, stops: GradientStop[], angle: number) => {
        const s = [...stops].sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position}%`).join(', ');
        return type === 'linear' ? `linear-gradient(${angle}deg, ${s})` : type === 'radial' ? `radial-gradient(circle, ${s})` : `conic-gradient(from ${angle}deg, ${s})`;
    };
    const emitGrad = (stops?: GradientStop[], angle?: number, tab?: PanelTab) => onChange(buildGrad(tab || activeTab, stops || gradStops, angle ?? gradAngle));
    const updateStop = (i: number, k: 'color' | 'position', v: string | number) => {
        const ns = [...gradStops]; if (k === 'color') ns[i].color = v as string; else ns[i].position = v as number;
        setGradStops(ns); emitGrad(ns);
    };
    const addStop = () => { const ns = [...gradStops, { color: '#ffffff', position: 50 }]; setGradStops(ns); setEditingStop(ns.length - 1); emitGrad(ns); };
    const removeStop = (i: number) => { if (gradStops.length <= 2) return; const ns = gradStops.filter((_, j) => j !== i); setGradStops(ns); setEditingStop(Math.min(editingStop, ns.length - 1)); emitGrad(ns); };

    const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return; setUploading(true);
        try { const fd = new FormData(); fd.append('file', f); const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json(); if (d.url) { setImageUrl(d.url); onChange(`url(${d.url})`); } } catch { }
        setUploading(false);
    };

    const curColor = hsvToHex(hsv[0], hsv[1], hsv[2]);
    const tBtn = (t: PanelTab) => `w-7 h-7 rounded-lg flex items-center justify-center transition-all ${activeTab === t ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04] opacity-50 hover:opacity-80'}`;

    return (
        <div ref={panelRef} className="absolute right-0 top-full mt-2 z-[100] w-[272px] bg-[#2c2c2c] rounded-xl shadow-2xl border border-white/[0.08]" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            {/* Tabs */}
            <div className="flex items-center gap-0.5 px-3 pt-3 pb-2 border-b border-white/[0.06]">
                <button className={tBtn('solid')} onClick={() => { setActiveTab('solid'); const hex = hsvToHex(hsv[0], hsv[1], hsv[2]); onChange(hex); }} title="Düz Renk"><div className="w-3.5 h-3.5 rounded-[3px] border-2 border-gray-400" /></button>
                <button className={tBtn('linear')} onClick={() => { setActiveTab('linear'); onChange(buildGrad('linear', gradStops, gradAngle)); }} title="Linear"><div className="w-3.5 h-3.5 rounded-[3px]" style={{ background: 'linear-gradient(135deg, #fff, #555)' }} /></button>
                <button className={tBtn('radial')} onClick={() => { setActiveTab('radial'); onChange(buildGrad('radial', gradStops, gradAngle)); }} title="Radial"><div className="w-3.5 h-3.5 rounded-full" style={{ background: 'radial-gradient(circle, #fff, #555)' }} /></button>
                <button className={tBtn('angular')} onClick={() => { setActiveTab('angular'); onChange(buildGrad('angular', gradStops, gradAngle)); }} title="Angular"><div className="w-3.5 h-3.5 rounded-full" style={{ background: 'conic-gradient(#fff, #555, #fff)' }} /></button>
                <button className={tBtn('image')} onClick={() => setActiveTab('image')} title="Resim">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                </button>
            </div>

            {/* SOLID */}
            {activeTab === 'solid' && (<>
                <div className="px-3 pt-2 pb-1"><span className="text-[11px] text-gray-500 font-medium">Fill</span></div>
                <div className="px-3 pb-2">
                    <div className="relative rounded-lg overflow-hidden cursor-crosshair" style={{ height: 150 }}>
                        <canvas ref={satValRef} width={248} height={150} className="w-full h-full block"
                            onMouseDown={(e) => { isDraggingSV.current = true; handleSVMouse(e); }} />
                        <div className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
                            style={{
                                left: `calc(${(hsv[1] / 100) * 100}% - 8px)`, top: `calc(${(1 - hsv[2] / 100) * 100}% - 8px)`,
                                boxShadow: '0 0 0 1px rgba(0,0,0,0.3)', backgroundColor: curColor
                            }} />
                    </div>
                </div>
                <div className="px-3 pb-2 flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 border border-white/[0.08]" style={{ backgroundColor: curColor }} />
                    <div className="flex-1 space-y-2">
                        <div id="acp-hue-slider" className="h-3 rounded-full cursor-pointer relative"
                            style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                            onMouseDown={(e) => { isDraggingHue.current = true; const r = e.currentTarget.getBoundingClientRect(); setHsv([Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 360, hsv[1], hsv[2]]); }}>
                            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none"
                                style={{ left: `calc(${(hsv[0] / 360) * 100}% - 7px)`, boxShadow: '0 1px 3px rgba(0,0,0,0.3)', backgroundColor: `hsl(${hsv[0]}, 100%, 50%)` }} />
                        </div>
                        <div className="h-3 rounded-full cursor-pointer relative"
                            style={{ background: `linear-gradient(to right, transparent, ${curColor}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50%/8px 8px` }}>
                            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none"
                                style={{ left: `calc(${opacity}% - 7px)`, boxShadow: '0 1px 3px rgba(0,0,0,0.3)', backgroundColor: curColor }} />
                        </div>
                    </div>
                </div>
                <div className="px-3 pb-3 flex items-center gap-2">
                    <div className="flex items-center bg-[#1e1e1e] rounded-lg px-2 py-1.5 flex-1">
                        <span className="text-[10px] text-gray-500 mr-1.5">Hex</span>
                        <input type="text" value={hexInput} onChange={(e) => { setHexInput(e.target.value); const c = e.target.value.replace('#', ''); if (c.length === 6 && /^[0-9a-fA-F]{6}$/.test(c)) setHsv(hexToHsv('#' + c)); }}
                            className="flex-1 bg-transparent border-0 text-[11px] text-gray-300 font-mono focus:outline-none w-[60px]" />
                    </div>
                    <div className="flex items-center bg-[#1e1e1e] rounded-lg px-2 py-1.5">
                        <input type="number" value={opacity} onChange={(e) => setOpacity(Math.max(0, Math.min(100, Number(e.target.value))))}
                            className="w-8 bg-transparent border-0 text-[11px] text-gray-300 font-mono focus:outline-none text-center" />
                        <span className="text-[10px] text-gray-500 ml-0.5">%</span>
                    </div>
                </div>
            </>)}

            {/* GRADIENT */}
            {(activeTab === 'linear' || activeTab === 'radial' || activeTab === 'angular') && (<>
                <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-medium">{activeTab === 'linear' ? 'Linear' : activeTab === 'radial' ? 'Radial' : 'Angular'}</span>
                    {activeTab !== 'radial' && (
                        <div className="flex items-center gap-1">
                            <input type="number" value={gradAngle} onChange={(e) => { const a = Number(e.target.value); setGradAngle(a); emitGrad(undefined, a); }}
                                className="w-10 bg-[#1e1e1e] rounded px-1.5 py-0.5 text-[10px] text-gray-300 font-mono border-0 focus:outline-none text-center" />
                            <span className="text-[10px] text-gray-500">°</span>
                        </div>
                    )}
                </div>
                <div className="px-3 pb-2"><div className="h-8 rounded-lg border border-white/[0.06]" style={{ background: buildGrad(activeTab, gradStops, gradAngle) }} /></div>
                <div className="px-3 pb-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-medium">Stops</span>
                    <button onClick={addStop} className="text-gray-400 hover:text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg></button>
                </div>
                <div className="px-3 pb-3 space-y-1.5 max-h-[140px] overflow-y-auto">
                    {gradStops.map((stop, i) => (
                        <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${editingStop === i ? 'bg-white/[0.04]' : ''}`} onClick={() => setEditingStop(i)}>
                            <input type="text" value={`${stop.position}%`} onChange={(e) => updateStop(i, 'position', parseInt(e.target.value) || 0)}
                                className="w-10 bg-transparent text-[10px] text-gray-400 font-mono focus:outline-none" />
                            <input type="color" value={stop.color} onChange={(e) => updateStop(i, 'color', e.target.value)}
                                className="w-5 h-5 rounded-[4px] cursor-pointer border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-0" />
                            <input type="text" value={stop.color.replace('#', '').toUpperCase()} onChange={(e) => updateStop(i, 'color', '#' + e.target.value)}
                                className="flex-1 bg-transparent text-[10px] text-gray-300 font-mono focus:outline-none" />
                            <span className="text-[10px] text-gray-500">100%</span>
                            {gradStops.length > 2 && <button onClick={(e) => { e.stopPropagation(); removeStop(i); }} className="text-gray-500 hover:text-red-400"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg></button>}
                        </div>
                    ))}
                </div>
            </>)}

            {/* IMAGE */}
            {activeTab === 'image' && (<>
                <div className="px-3 pt-2 pb-1"><span className="text-[11px] text-gray-500 font-medium">Resim</span></div>
                <div className="px-3 pb-3">
                    <div className="h-[140px] rounded-lg border border-white/[0.06] bg-[#1a1a1a] flex items-center justify-center mb-3 overflow-hidden relative"
                        style={imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                        {!imageUrl && !uploading && (
                            <label className="cursor-pointer"><div className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-medium rounded-lg transition-colors">Bilgisayardan Yükle</div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImgUpload} /></label>
                        )}
                        {uploading && <span className="text-[11px] text-gray-400">Yükleniyor...</span>}
                        {imageUrl && <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"><span className="text-[11px] text-white font-medium">Değiştir</span><input type="file" accept="image/*" className="hidden" onChange={handleImgUpload} /></label>}
                    </div>
                    {imageUrl && <button onClick={() => { setImageUrl(''); onChange(''); }} className="text-[10px] text-red-400 hover:text-red-300">Resmi Kaldır</button>}
                </div>
            </>)}
        </div>
    );
}


// ─── Color Input Component ─────────────────────────────────
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const [showPanel, setShowPanel] = useState(false);
    return (
        <div className="flex items-center justify-between gap-3 relative">
            <label className="text-[14px] text-gray-400 flex-1">{label}</label>
            <div className="flex items-center gap-1.5 bg-[#1a1a1a] rounded-lg px-1.5 py-1 cursor-pointer" onClick={() => setShowPanel(!showPanel)}>
                <div className="w-6 h-6 rounded-[5px] flex-shrink-0" style={{ ...(value.includes('gradient') || value.startsWith('url(') ? { background: value } : { backgroundColor: value }), border: '1px solid rgba(255,255,255,0.1)' }} />
                <input type="text" value={value} onClick={(e) => e.stopPropagation()} onChange={(e) => onChange(e.target.value)} className="w-[68px] px-1 py-0.5 bg-transparent border-0 text-[11px] text-gray-300 font-mono focus:outline-none" />
            </div>
            {showPanel && <AdvancedColorPanel value={value} onChange={onChange} onClose={() => setShowPanel(false)} />}
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
        case "sm": return "0px 1px 2px 0px rgba(0,0,0,0.05)";
        case "md": return "0px 4px 6px -1px rgba(0,0,0,0.1)";
        case "lg": return "0px 10px 15px -3px rgba(0,0,0,0.1)";
        case "xl": return "0px 20px 25px -5px rgba(0,0,0,0.1)";
        default: if (shadow.includes('px')) return shadow; return "0px 1px 2px 0px rgba(0,0,0,0.05)";
    }
}

// ─── Figma-Style Shadow Picker ─────────────────────────────
function ShadowPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Parse shadow string: "Xpx Ypx Blurpx Spreadpx rgba(r,g,b,a)" or preset
    const resolved = getShadowCSS(value);
    const parsed = (() => {
        if (resolved === 'none') return { x: 0, y: 0, blur: 0, spread: 0, color: '000000', opacity: 0 };
        const m = resolved.match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+rgba?\(([^)]+)\)/);
        if (m) {
            const parts = m[5].split(',').map(s => s.trim());
            const r = parseInt(parts[0]) || 0, g = parseInt(parts[1]) || 0, b = parseInt(parts[2]) || 0;
            const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
            const hex = [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
            return { x: parseFloat(m[1]), y: parseFloat(m[2]), blur: parseFloat(m[3]), spread: parseFloat(m[4]), color: hex, opacity: Math.round(a * 100) };
        }
        return { x: 0, y: 4, blur: 4, spread: 0, color: '000000', opacity: 25 };
    })();

    const build = (x: number, y: number, blur: number, spread: number, color: string, opacity: number) => {
        const r = parseInt(color.substring(0, 2), 16) || 0;
        const g = parseInt(color.substring(2, 4), 16) || 0;
        const b = parseInt(color.substring(4, 6), 16) || 0;
        if (opacity === 0 && x === 0 && y === 0 && blur === 0) return 'none';
        return `${x}px ${y}px ${blur}px ${spread}px rgba(${r},${g},${b},${(opacity / 100).toFixed(2)})`;
    };

    const update = (field: string, val: number | string) => {
        const p = { ...parsed, [field]: val };
        onChange(build(p.x, p.y, p.blur, p.spread, p.color, p.opacity));
    };

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const isNone = resolved === 'none';

    return (
        <div className="relative">
            <div className="flex items-center justify-between gap-3">
                <label className="text-xs text-gray-400">{label}</label>
                <button onClick={() => setOpen(!open)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${isNone ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-[#1a1a1a] border-gray-700 text-gray-300'}`}>
                    {!isNone && <div className="w-3 h-3 rounded-sm" style={{ boxShadow: resolved, backgroundColor: '#888' }} />}
                    <span>{isNone ? 'Yok' : 'Drop shadow'}</span>
                    <ChevronDown size={12} className="text-gray-500" />
                </button>
            </div>
            {open && (
                <div ref={panelRef} className="absolute right-0 top-full mt-2 z-[100] w-[260px] bg-[#2c2c2c] border border-white/10 rounded-xl p-4 shadow-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-gray-200 font-medium">Drop shadow</span>
                            <ChevronDown size={12} className="text-gray-500" />
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => { onChange('none'); }} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors" title="Sıfırla"><RotateCcw size={13} /></button>
                            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-colors"><X size={13} /></button>
                        </div>
                    </div>
                    {/* Position */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-2.5 py-1.5">
                            <span className="text-[11px] text-gray-500 w-4">X</span>
                            <input type="number" value={parsed.x} onChange={(e) => update('x', Number(e.target.value))} className="w-full bg-transparent text-[12px] text-gray-200 font-mono focus:outline-none" />
                        </div>
                        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-2.5 py-1.5">
                            <span className="text-[11px] text-gray-500 w-4">Y</span>
                            <input type="number" value={parsed.y} onChange={(e) => update('y', Number(e.target.value))} className="w-full bg-transparent text-[12px] text-gray-200 font-mono focus:outline-none" />
                        </div>
                    </div>
                    {/* Blur & Spread */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-2.5 py-1.5">
                            <span className="text-[11px] text-gray-500">Blur</span>
                            <input type="number" min={0} value={parsed.blur} onChange={(e) => update('blur', Math.max(0, Number(e.target.value)))} className="w-full bg-transparent text-[12px] text-gray-200 font-mono focus:outline-none text-right" />
                        </div>
                        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-2.5 py-1.5">
                            <span className="text-[11px] text-gray-500">Spread</span>
                            <input type="number" value={parsed.spread} onChange={(e) => update('spread', Number(e.target.value))} className="w-full bg-transparent text-[12px] text-gray-200 font-mono focus:outline-none text-right" />
                        </div>
                    </div>
                    {/* Color */}
                    <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-2.5 py-1.5">
                        <span className="text-[11px] text-gray-500">Color</span>
                        <div className="flex items-center gap-1.5 flex-1">
                            <input type="color" value={`#${parsed.color}`} onChange={(e) => update('color', e.target.value.replace('#', ''))} className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0" />
                            <input type="text" value={parsed.color} onChange={(e) => update('color', e.target.value.replace('#', ''))} className="w-[56px] bg-transparent text-[11px] text-gray-300 font-mono focus:outline-none" />
                        </div>
                        <div className="flex items-center gap-1 border-l border-gray-700 pl-2">
                            <input type="number" min={0} max={100} value={parsed.opacity} onChange={(e) => update('opacity', Math.min(100, Math.max(0, Number(e.target.value))))} className="w-8 bg-transparent text-[11px] text-gray-300 font-mono focus:outline-none text-right" />
                            <span className="text-[10px] text-gray-500">%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
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
    const [activeSection, setActiveSection] = useState('header');
    const headerLogoRef = useRef<HTMLInputElement>(null);
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [previewWidth, setPreviewWidth] = useState(360);
    const [previewHeight, setPreviewHeight] = useState(700);
    const previewDevice = previewWidth <= 430 ? 'phone' : 'tablet';

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
            // Sync global theme keys to actual rendering keys
            if (key === 'globalThemeBg') {
                next.pageBg = value;
                next.cardBg = value;
                next.searchBg = value;
            }
            if (key === 'globalThemeText') {
                next.productNameColor = value;
                next.categoryTitleColor = value;
            }
            if (key === 'globalThemeIcon') {
                next.accentColor = value;
            }
            if (key === 'globalThemeSearchBg') {
                next.searchBg = value;
            }
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
            <div className="flex flex-1 min-h-0 bg-[#050505]">
                {/* LEFT SIDEBAR: Section selector */}
                <div className="w-[220px] border-r border-white/[0.06] overflow-y-auto py-4 px-3 flex-shrink-0 bg-[#080808]">
                    <p className="text-[12px] text-gray-500 uppercase font-medium px-2 mb-3">Bileşenler</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { key: 'header', label: 'Başlık Düzenleri', Icon: LayoutGrid },
                            { key: 'themes', label: 'Temalar & Renkler', Icon: Palette },
                            { key: 'welcome', label: 'Hoşgeldiniz', Icon: ImageIcon },
                            { key: 'position', label: 'Pozisyon & Düzen', Icon: Layers },
                            { key: 'general', label: 'Genel Ayarlar', Icon: Settings },
                            { key: 'font', label: 'Yazı Tipi', Icon: Type },
                            { key: 'bottomnav', label: 'Alt Navigasyon', Icon: Monitor },
                            { key: 'detail', label: 'Ürün Detay', Icon: Eye },
                            { key: 'search', label: 'Arama Sayfası', Icon: Search },
                            { key: 'drawer', label: 'Sol Menü', Icon: Menu },
                        ].map((section) => (
                            <button
                                key={section.key}
                                onClick={() => setActiveSection(section.key)}
                                className={`flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border text-center transition-all ${activeSection === section.key
                                    ? 'bg-white/[0.08] border-emerald-500/40 text-white ring-1 ring-emerald-500/20'
                                    : 'border-white/[0.04] text-gray-500 hover:bg-white/[0.04] hover:text-gray-300 hover:border-white/[0.08]'
                                    }`}
                            >
                                <section.Icon size={20} className={activeSection === section.key ? 'text-emerald-400' : 'opacity-50'} />
                                <span className="text-[11px] font-medium leading-tight px-1">{section.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* CENTER: Phone/Tablet preview */}
                <div className="flex-1 flex flex-col items-center py-4 min-w-0">
                    {/* Device toggle */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1 bg-[#111] border border-white/[0.06] rounded-xl p-1">
                            <button
                                onClick={() => { setPreviewWidth(360); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${previewDevice === 'phone'
                                    ? 'bg-white/[0.1] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <Smartphone size={14} />
                                Telefon
                            </button>
                            <button
                                onClick={() => { setPreviewWidth(630); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${previewDevice === 'tablet'
                                    ? 'bg-white/[0.1] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <Tablet size={14} />
                                Tablet
                            </button>
                        </div>
                    </div>
                    {/* Preview frame */}
                    <div className="flex-1 flex flex-col items-center overflow-hidden min-h-0">
                        <div
                            className="bg-black overflow-hidden relative border-[5px] border-black transition-all duration-300"
                            style={{
                                width: previewWidth,
                                height: '100%',
                                maxHeight: previewHeight,
                                borderRadius: previewDevice === 'phone' ? 28 : 20,
                            }}
                        >
                            {slug ? (
                                <iframe
                                    ref={iframeRef}
                                    src={`/${slug}?preview=true`}
                                    className="w-full h-full border-0"
                                    style={{
                                        background: '#000',
                                        clipPath: `inset(0 round ${previewDevice === 'phone' ? 23 : 15}px)`,
                                    }}
                                    onLoad={() => {
                                        setTimeout(() => {
                                            if (iframeRef.current?.contentWindow) {
                                                iframeRef.current.contentWindow.postMessage({ type: 'theme-update', theme }, '*');
                                            }
                                        }, 500);
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#111]" style={{ borderRadius: previewDevice === 'phone' ? 23 : 15 }}>
                                    <div className="text-center">
                                        <Smartphone size={48} className="text-gray-700 mx-auto mb-3" />
                                        <p className="text-gray-600 text-sm">Ön İzleme</p>
                                        <p className="text-gray-700 text-xs mt-1">Yükleniyor...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SUB-PANEL: Variant/Option selection */}
                <div className="w-[260px] border-l border-white/[0.06] overflow-y-auto py-4 px-3 flex-shrink-0 bg-[#0a0a0a]">
                    {/* Auto-save toast */}
                    {(saving || saved) && (
                        <div className="fixed bottom-[50px] left-[80px] z-50">
                            {saving && <div className="flex items-center gap-2 text-sm text-white bg-gray-800 border border-gray-700 px-4 py-2.5 rounded-xl shadow-2xl"><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</div>}
                            {saved && <div className="flex items-center gap-2 text-sm text-emerald-400 bg-gray-800 border border-emerald-500/30 px-4 py-2.5 rounded-xl shadow-2xl"><Check size={14} /> Kaydedildi</div>}
                        </div>
                    )}

                    {activeSection === 'header' && (<>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                { id: 'classic', name: 'Klasik' },
                                { id: 'tall', name: 'Yüksek' },
                                { id: 'center-logo', name: 'Logo' },
                                { id: 'left-logo', name: 'Sol Logo' },
                                { id: 'lang', name: 'Dil' },
                                { id: 'banner', name: 'Banner' },
                                { id: 'minimal', name: 'Minimal' },
                                { id: 'rounded', name: 'Yuvarlak' },
                                { id: 'split', name: 'Split' },
                                { id: 'accent-bar', name: 'Çizgi' },
                                { id: 'glass', name: 'Cam' },
                                { id: 'overlay', name: 'Saydam' },
                                { id: 'gradient', name: 'Gradient' },

                            ] as { id: string; name: string }[]).map((v) => {
                                const isActive = theme.headerVariant === v.id;
                                // Fixed neutral colors for preview thumbnails — only show layout, not live colors
                                const hBg = '#1e1e2e';
                                const hText = '#a0a0c0';
                                const hIcon = '#6060a0';

                                /* ── Per-variant unique preview ── */
                                const renderPreview = () => {
                                    const menuIcon = (
                                        <div className="flex flex-col items-start gap-[2px]">
                                            <div className="w-[10px] h-[1.5px] rounded-full" style={{ backgroundColor: hIcon }} />
                                            <div className="w-[7px] h-[1.5px] rounded-full" style={{ backgroundColor: hIcon }} />
                                        </div>
                                    );
                                    const searchIcon = <Search size={10} strokeWidth={2.5} style={{ color: hIcon }} />;
                                    const titleBar = <div className="h-1.5 w-7 rounded-full" style={{ backgroundColor: hText, opacity: 0.6 }} />;
                                    const logoCircle = <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: hIcon, backgroundColor: hBg }} />;

                                    switch (v.id) {
                                        case 'classic':
                                            return (
                                                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: hBg }}>
                                                    {menuIcon}
                                                    {titleBar}
                                                    {searchIcon}
                                                </div>
                                            );
                                        case 'tall':
                                            return (
                                                <div className="rounded-lg px-3 pt-3 pb-4 flex flex-col gap-2" style={{ backgroundColor: hBg }}>
                                                    <div className="flex items-center justify-between">
                                                        {menuIcon}
                                                        {searchIcon}
                                                    </div>
                                                    <div className="flex items-center justify-center">{titleBar}</div>
                                                </div>
                                            );
                                        case 'center-logo':
                                            return (
                                                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: hBg }}>
                                                    {menuIcon}
                                                    {logoCircle}
                                                    {searchIcon}
                                                </div>
                                            );
                                        case 'left-logo':
                                            return (
                                                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: hBg }}>
                                                    <div className="flex items-center gap-2">
                                                        {logoCircle}
                                                        {titleBar}
                                                    </div>
                                                    {menuIcon}
                                                </div>
                                            );
                                        case 'lang':
                                            return (
                                                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: hBg }}>
                                                    {menuIcon}
                                                    {titleBar}
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="px-1.5 py-0.5 rounded text-[7px] font-bold" style={{ color: hText, border: `1px solid ${hIcon}` }}>TR</div>
                                                        {searchIcon}
                                                    </div>
                                                </div>
                                            );
                                        case 'banner':
                                            return (
                                                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: hBg }}>
                                                    <div className="px-3 py-1.5 flex items-center justify-between">
                                                        {menuIcon}
                                                        {titleBar}
                                                        {searchIcon}
                                                    </div>
                                                    <div className="h-6 mx-2 mb-1.5 rounded-md" style={{ background: `linear-gradient(135deg, ${hIcon}30, ${hIcon}10)` }} />
                                                </div>
                                            );
                                        case 'minimal':
                                            return (
                                                <div className="rounded-lg px-3 py-1.5 flex items-center justify-between" style={{ backgroundColor: hBg, borderBottom: `1.5px solid ${hIcon}20` }}>
                                                    {menuIcon}
                                                    <div className="h-1.5 w-8 rounded-full" style={{ backgroundColor: hText, opacity: 0.4 }} />
                                                    {searchIcon}
                                                </div>
                                            );
                                        case 'rounded':
                                            return (
                                                <div className="mx-1 mt-1 rounded-full px-4 py-2 flex items-center justify-between" style={{ backgroundColor: hBg, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                    {menuIcon}
                                                    {titleBar}
                                                    {searchIcon}
                                                </div>
                                            );
                                        case 'split':
                                            return (
                                                <div className="rounded-lg overflow-hidden flex" style={{ backgroundColor: hBg }}>
                                                    <div className="flex-1 px-2 py-2.5 flex items-center gap-2">
                                                        {menuIcon}
                                                        {titleBar}
                                                    </div>
                                                    <div className="px-2 py-2.5 flex items-center" style={{ backgroundColor: `${hIcon}15` }}>
                                                        {searchIcon}
                                                    </div>
                                                </div>
                                            );
                                        case 'accent-bar':
                                            return (
                                                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: hBg }}>
                                                    <div className="h-[3px]" style={{ backgroundColor: hIcon }} />
                                                    <div className="px-3 py-2 flex items-center justify-between">
                                                        {menuIcon}
                                                        {titleBar}
                                                        {searchIcon}
                                                    </div>
                                                </div>
                                            );
                                        case 'glass':
                                            return (
                                                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: `${hBg}cc`, backdropFilter: 'blur(8px)', border: `1px solid ${hIcon}20` }}>
                                                    {menuIcon}
                                                    {titleBar}
                                                    {searchIcon}
                                                </div>
                                            );
                                        case 'overlay':
                                            return (
                                                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: 'transparent', border: `1px dashed ${hIcon}40` }}>
                                                    {menuIcon}
                                                    <div className="h-2 w-10 rounded-full" style={{ backgroundColor: hText, opacity: 0.3 }} />
                                                    {searchIcon}
                                                </div>
                                            );
                                        case 'gradient':
                                            return (
                                                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${hBg}, ${hIcon}30)` }}>
                                                    {menuIcon}
                                                    {titleBar}
                                                    {searchIcon}
                                                </div>
                                            );

                                        default:
                                            return (
                                                <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: hBg }}>
                                                    {menuIcon}
                                                    {titleBar}
                                                    {searchIcon}
                                                </div>
                                            );
                                    }
                                };

                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => updateTheme('headerVariant', v.id)}
                                        className={`group rounded-xl border overflow-hidden transition-all ${isActive
                                            ? 'border-orange-500/40 bg-orange-500/5 ring-1 ring-orange-500/20'
                                            : 'border-white/[0.04] bg-[#111] hover:border-white/[0.08] hover:bg-[#161616]'
                                            }`}
                                    >
                                        <div className="p-2">
                                            {renderPreview()}
                                        </div>
                                        <div className="pb-2 pt-0.5">
                                            <p className={`text-[10px] font-semibold ${isActive ? 'text-orange-300' : 'text-gray-400'} transition-colors`}>{v.name}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>)}
                    {activeSection === 'themes' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-3 block px-1">Temalar</span>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                { name: 'Klasik Beyaz', bg: '#ffffff', text: '#111827', icon: '#374151', searchBg: '#f3f4f6' },
                                { name: 'Koyu Zarif', bg: '#1a1a2e', text: '#e0e0e0', icon: '#a0a0b8', searchBg: '#2a2a3e' },
                                { name: 'Krem Naturel', bg: '#faf7f2', text: '#5c4a3a', icon: '#8b7355', searchBg: '#f0ebe3' },
                                { name: 'Cam Efekti', bg: '#ffffffcc', text: '#1f2937', icon: '#4b5563', searchBg: '#f9fafb80' },
                                { name: 'Lacivert', bg: '#0f1b33', text: '#c8d6e5', icon: '#54a0ff', searchBg: '#1a2d4d' },
                                { name: 'Yeşil Doğa', bg: '#f0f9f4', text: '#1a4731', icon: '#2d8659', searchBg: '#e0f2e9' },
                                { name: 'Altın Premium', bg: '#1c1917', text: '#f5e6cc', icon: '#d4a853', searchBg: '#2c2520' },
                                { name: 'Gül Kurusu', bg: '#fdf2f8', text: '#831843', icon: '#be185d', searchBg: '#fce7f3' },
                                { name: 'Okyanus', bg: '#ecfeff', text: '#164e63', icon: '#0891b2', searchBg: '#cffafe' },
                                { name: 'Gece Mavisi', bg: '#0f172a', text: '#94a3b8', icon: '#3b82f6', searchBg: '#1e293b' },
                                { name: 'Turuncu Enerji', bg: '#fff7ed', text: '#7c2d12', icon: '#ea580c', searchBg: '#ffedd5' },
                                { name: 'Mor Rüya', bg: '#faf5ff', text: '#581c87', icon: '#9333ea', searchBg: '#f3e8ff' },
                            ] as { name: string; bg: string; text: string; icon: string; searchBg: string }[]).map((preset) => {
                                const isActive = theme.globalThemeBg === preset.bg && theme.globalThemeText === preset.text;
                                return (
                                    <button
                                        key={preset.name}
                                        onClick={() => {
                                            updateTheme('globalThemeBg', preset.bg);
                                            updateTheme('globalThemeText', preset.text);
                                            updateTheme('globalThemeIcon', preset.icon);
                                            updateTheme('globalThemeSearchBg', preset.searchBg);
                                        }}
                                        className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${isActive
                                            ? 'border-orange-500/40 bg-orange-500/5 ring-1 ring-orange-500/20'
                                            : 'border-white/[0.04] bg-[#111] hover:border-white/[0.08] hover:bg-[#161616]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.bg, border: '1px solid rgba(255,255,255,0.15)' }} />
                                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.text }} />
                                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.icon }} />
                                        </div>
                                        <p className={`text-[9px] font-medium leading-tight ${isActive ? 'text-orange-300' : 'text-gray-400'} transition-colors`}>{preset.name}</p>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    </>)}
                    {activeSection === 'welcome' && (<>
                        <Section title="Hoşgeldiniz Ekranı" icon={<ImageIcon size={18} />} defaultOpen={true}>
                            {/* Welcome Variant Selector */}
                            <p className="text-[14px] text-gray-600 uppercase mb-2">Giriş Ekranı Varyasyonları</p>
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
                            <p className="text-[14px] text-gray-600 uppercase mb-2">Buton Stili</p>
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
                            <p className="text-[14px] text-gray-600 uppercase mb-2">Arka Plan Video / Resim</p>
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

                            <p className="text-[14px] text-gray-600 uppercase mb-1">Arka Plan</p>
                            <ColorPicker label="Arka Plan Rengi" value={theme.welcomeBg} onChange={(v) => updateTheme("welcomeBg", v)} />
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Video/Resim Opaklığı</label><div className="flex items-center gap-2"><input type="range" min={0} max={100} value={theme.welcomeOverlayOpacity} onChange={(e) => updateTheme("welcomeOverlayOpacity", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeOverlayOpacity}%</span></div></div>
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Gradient Ayarları</p>
                            <ColorPicker label="Gradient Başlangıç" value={theme.welcomeGradientFrom} onChange={(v) => updateTheme("welcomeGradientFrom", v)} />
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Gradient Yoğunluğu</label><div className="flex items-center gap-2"><input type="range" min={0} max={100} value={theme.welcomeGradientOpacity} onChange={(e) => updateTheme("welcomeGradientOpacity", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeGradientOpacity}%</span></div></div>
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Yazılar</p>
                            <ColorPicker label="Ana Yazı Rengi" value={theme.welcomeTextColor} onChange={(v) => updateTheme("welcomeTextColor", v)} />
                            <ColorPicker label="Alt Yazı Rengi" value={theme.welcomeSubtextColor} onChange={(v) => updateTheme("welcomeSubtextColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Logo</p>
                            <ColorPicker label="Logo Kenarlık" value={theme.welcomeLogoBorder} onChange={(v) => updateTheme("welcomeLogoBorder", v)} />
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Logo Boyutu</label><div className="flex items-center gap-2"><input type="range" min={48} max={160} value={theme.welcomeLogoSize} onChange={(e) => updateTheme("welcomeLogoSize", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeLogoSize}px</span></div></div>
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Logo Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={50} value={theme.welcomeLogoRadius} onChange={(e) => updateTheme("welcomeLogoRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeLogoRadius}px</span></div></div>
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Menü Butonu</p>
                            <ColorPicker label="Buton Arkaplan" value={theme.welcomeBtnBg} onChange={(v) => updateTheme("welcomeBtnBg", v)} />
                            <ColorPicker label="Buton Yazı" value={theme.welcomeBtnText} onChange={(v) => updateTheme("welcomeBtnText", v)} />
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Buton Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={24} value={theme.welcomeBtnRadius} onChange={(e) => updateTheme("welcomeBtnRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeBtnRadius}px</span></div></div>
                            <ShadowPicker label="Buton Gölgesi" value={theme.welcomeBtnShadow} onChange={(v) => updateTheme("welcomeBtnShadow", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Diğer Butonlar</p>
                            <ColorPicker label="Arkaplan" value={theme.welcomeSecondaryBtnBg} onChange={(v) => updateTheme("welcomeSecondaryBtnBg", v)} />
                            <ColorPicker label="Yazı Rengi" value={theme.welcomeSecondaryBtnText} onChange={(v) => updateTheme("welcomeSecondaryBtnText", v)} />
                            <ColorPicker label="Kenarlık" value={theme.welcomeSecondaryBtnBorder} onChange={(v) => updateTheme("welcomeSecondaryBtnBorder", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <ColorPicker label="Ayırıcı Çizgi" value={theme.welcomeSeparatorColor} onChange={(v) => updateTheme("welcomeSeparatorColor", v)} />
                        </Section>
                        {/* Layout Position */}
                    </>)}
                    {activeSection === 'position' && (<>
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
                        {/* Header */}
                        <Section title="Başlık / Slider" icon={<Monitor size={18} />} defaultOpen={true}>
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
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Buton Bar Arkaplanı</p>
                            <ColorPicker label="Arkaplan Rengi" value={theme.categoryNavBg} onChange={(v) => updateTheme("categoryNavBg", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Buton Renkleri</p>
                            <ColorPicker label="Aktif Arkaplan" value={theme.categoryActiveBg} onChange={(v) => updateTheme("categoryActiveBg", v)} />
                            <ColorPicker label="Aktif Yazı Rengi" value={theme.categoryActiveText} onChange={(v) => updateTheme("categoryActiveText", v)} />
                            <ColorPicker label="Pasif Arkaplan" value={theme.categoryInactiveBg} onChange={(v) => updateTheme("categoryInactiveBg", v)} />
                            <ColorPicker label="Pasif Yazı Rengi" value={theme.categoryInactiveText} onChange={(v) => updateTheme("categoryInactiveText", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Köşe Yuvarlaklığı</p>
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
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Gölge</p>
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

                        {/* Search Bar */}
                        <Section title="Arama Çubuğu" icon={<SlidersHorizontal size={18} />} defaultOpen={false}>
                            <ColorPicker label="Arkaplan" value={theme.searchBg} onChange={(v) => updateTheme("searchBg", v)} />
                            <ColorPicker label="Kenarlık" value={theme.searchBorder} onChange={(v) => updateTheme("searchBorder", v)} />
                            <ColorPicker label="Yazı Rengi" value={theme.searchText} onChange={(v) => updateTheme("searchText", v)} />
                        </Section>
                        {/* General */}
                    </>)}
                    {activeSection === 'general' && (<>
                        <Section title="Genel Ayarlar" icon={<Palette size={18} />}>
                            <ColorPicker label="Sayfa Arkaplanı" value={theme.pageBg} onChange={(v) => updateTheme("pageBg", v)} />
                            <ColorPicker label="Vurgu Rengi" value={theme.accentColor} onChange={(v) => updateTheme("accentColor", v)} />
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
                    {activeSection === 'font' && (<>
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

                        {/* Text Styles */}
                        <Section title="Yazı Stilleri" icon={<Type size={18} />}>
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Ürün Adı</p>
                            <ColorPicker label="Renk" value={theme.productNameColor} onChange={(v) => updateTheme("productNameColor", v)} />
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Kalınlık</label><div className="flex gap-1.5">{["400", "500", "600", "700", "800"].map((w) => (<button key={w} onClick={() => updateTheme("productNameWeight", w)} className={`px-2 py-1 rounded-md text-[10px] transition-all border ${theme.productNameWeight === w ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400"}`} style={{ fontWeight: parseInt(w) }}>{w}</button>))}</div></div>
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Ürün Açıklaması</p>
                            <ColorPicker label="Renk" value={theme.productDescColor} onChange={(v) => updateTheme("productDescColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Kategori Başlığı</p>
                            <ColorPicker label="Renk" value={theme.categoryTitleColor} onChange={(v) => updateTheme("categoryTitleColor", v)} />
                        </Section>
                        {/* Bottom Nav */}
                    </>)}
                    {activeSection === 'bottomnav' && (<>
                        <Section title="Alt Navigasyon" icon={<Monitor size={18} />} defaultOpen={false}>
                            <ColorPicker label="Arkaplan" value={theme.bottomNavBg} onChange={(v) => updateTheme("bottomNavBg", v)} />
                            <ColorPicker label="Aktif İkon" value={theme.bottomNavActive} onChange={(v) => updateTheme("bottomNavActive", v)} />
                            <ColorPicker label="Pasif İkon" value={theme.bottomNavInactive} onChange={(v) => updateTheme("bottomNavInactive", v)} />
                        </Section>
                        {/* Product Detail Overlay */}
                    </>)}
                    {activeSection === 'detail' && (<>
                        <Section title="Ürün Detay Sayfası" icon={<Eye size={18} />} defaultOpen={false}>
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Arka Plan & Kart</p>
                            <ColorPicker label="Kart Arka Planı" value={theme.detailBg} onChange={(v) => updateTheme("detailBg", v)} />
                            <ColorPicker label="Geri Butonu BG" value={theme.detailBackBtnBg} onChange={(v) => updateTheme("detailBackBtnBg", v)} />
                            <ColorPicker label="Geri Butonu İkon" value={theme.detailBackBtnColor} onChange={(v) => updateTheme("detailBackBtnColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Yazılar</p>
                            <ColorPicker label="Ürün Adı" value={theme.detailNameColor} onChange={(v) => updateTheme("detailNameColor", v)} />
                            <ColorPicker label="Fiyat" value={theme.detailPriceColor} onChange={(v) => updateTheme("detailPriceColor", v)} />
                            <ColorPicker label="Açıklama" value={theme.detailDescColor} onChange={(v) => updateTheme("detailDescColor", v)} />
                            <ColorPicker label="Etiket / Başlık" value={theme.detailLabelColor} onChange={(v) => updateTheme("detailLabelColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Bilgi Kutuları</p>
                            <ColorPicker label="Bilgi Kutusu BG" value={theme.detailInfoBg} onChange={(v) => updateTheme("detailInfoBg", v)} />
                            <ColorPicker label="Bilgi Kutusu Border" value={theme.detailInfoBorder} onChange={(v) => updateTheme("detailInfoBorder", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Malzeme Etiketleri</p>
                            <ColorPicker label="Etiket BG" value={theme.detailIngredientBg} onChange={(v) => updateTheme("detailIngredientBg", v)} />
                            <ColorPicker label="Etiket Yazı" value={theme.detailIngredientText} onChange={(v) => updateTheme("detailIngredientText", v)} />
                            <ColorPicker label="Etiket Border" value={theme.detailIngredientBorder} onChange={(v) => updateTheme("detailIngredientBorder", v)} />
                        </Section>
                        {/* Search Overlay */}
                    </>)}
                    {activeSection === 'search' && (<>
                        <Section title="Arama Sayfası" icon={<Search size={18} />} defaultOpen={false}>
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Genel</p>
                            <ColorPicker label="Arka Plan" value={theme.searchOverlayBg} onChange={(v) => updateTheme("searchOverlayBg", v)} />
                            <ColorPicker label="Arama İkon" value={theme.searchOverlayIconColor} onChange={(v) => updateTheme("searchOverlayIconColor", v)} />
                            <ColorPicker label="Kapatma İkon" value={theme.searchOverlayCloseColor} onChange={(v) => updateTheme("searchOverlayCloseColor", v)} />
                            <ColorPicker label="Border Çizgi" value={theme.searchOverlayBorderColor} onChange={(v) => updateTheme("searchOverlayBorderColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Yazılar</p>
                            <ColorPicker label="Yazı Rengi" value={theme.searchOverlayInputColor} onChange={(v) => updateTheme("searchOverlayInputColor", v)} />
                            <ColorPicker label="Placeholder" value={theme.searchOverlayPlaceholderColor} onChange={(v) => updateTheme("searchOverlayPlaceholderColor", v)} />
                            <ColorPicker label="Boş Mesaj" value={theme.searchOverlayEmptyColor} onChange={(v) => updateTheme("searchOverlayEmptyColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Sonuç Kartları</p>
                            <ColorPicker label="Kart BG" value={theme.searchOverlayResultBg} onChange={(v) => updateTheme("searchOverlayResultBg", v)} />
                            <ColorPicker label="Ürün Adı" value={theme.searchOverlayResultNameColor} onChange={(v) => updateTheme("searchOverlayResultNameColor", v)} />
                            <ColorPicker label="Açıklama" value={theme.searchOverlayResultDescColor} onChange={(v) => updateTheme("searchOverlayResultDescColor", v)} />
                            <ColorPicker label="Fiyat" value={theme.searchOverlayResultPriceColor} onChange={(v) => updateTheme("searchOverlayResultPriceColor", v)} />
                        </Section>
                        {/* Sidebar Drawer */}
                    </>)}
                    {activeSection === 'drawer' && (<>
                        <Section title="Sol Menü (Drawer)" icon={<Menu size={18} />} defaultOpen={false}>
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Genel</p>
                            <ColorPicker label="Arka Plan" value={theme.sidebarBg} onChange={(v) => updateTheme("sidebarBg", v)} />
                            <ColorPicker label="Bölüm Çizgisi" value={theme.sidebarBorder} onChange={(v) => updateTheme("sidebarBorder", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Başlık</p>
                            <ColorPicker label="İşletme Adı" value={theme.sidebarNameColor} onChange={(v) => updateTheme("sidebarNameColor", v)} />
                            <ColorPicker label="İşletme Açıklama" value={theme.sidebarDescColor} onChange={(v) => updateTheme("sidebarDescColor", v)} />
                            <ColorPicker label="Kapatma Buton Çerçeve" value={theme.sidebarCloseBtnBorder} onChange={(v) => updateTheme("sidebarCloseBtnBorder", v)} />
                            <ColorPicker label="Kapatma Buton İkon" value={theme.sidebarCloseBtnColor} onChange={(v) => updateTheme("sidebarCloseBtnColor", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Menü Öğeleri</p>
                            <ColorPicker label="Bölüm Başlığı" value={theme.sidebarLabelColor} onChange={(v) => updateTheme("sidebarLabelColor", v)} />
                            <ColorPicker label="Menü Yazısı" value={theme.sidebarItemColor} onChange={(v) => updateTheme("sidebarItemColor", v)} />
                            <ColorPicker label="Menü İkon" value={theme.sidebarItemIconColor} onChange={(v) => updateTheme("sidebarItemIconColor", v)} />
                            <ColorPicker label="Hover Arka Plan" value={theme.sidebarItemHover} onChange={(v) => updateTheme("sidebarItemHover", v)} />
                            <div className="border-t border-gray-800 my-2" />
                            <p className="text-[14px] text-gray-600 uppercase mb-1">Aktif Kategori</p>
                            <ColorPicker label="Aktif BG" value={theme.sidebarActiveItemBg} onChange={(v) => updateTheme("sidebarActiveItemBg", v)} />
                            <ColorPicker label="Aktif Yazı" value={theme.sidebarActiveItemColor} onChange={(v) => updateTheme("sidebarActiveItemColor", v)} />
                        </Section>
                    </>)}
                </div>

                {/* RIGHT PANEL: Properties & Settings */}
                <div className="w-[340px] border-l border-white/[0.06] overflow-y-auto py-4 px-4 flex-shrink-0 bg-[#080808]">
                    {activeSection === 'header' && (<>


                        {/* Colors — no border */}
                        <div className="rounded-2xl p-4 mb-3 bg-[#111]">
                            <span className="text-[14px] text-gray-500 uppercase font-semibold mb-3 block">Renkler</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Arkaplan" value={theme.menuHeaderBg} onChange={(v) => updateTheme("menuHeaderBg", v)} />
                                <ColorPicker label="Yazı Rengi" value={theme.menuHeaderTextColor} onChange={(v) => updateTheme("menuHeaderTextColor", v)} />
                            </div>
                        </div>

                        {/* Font Size */}
                        <div className="rounded-2xl p-4 mb-3 bg-[#111]">
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Yazı Boyutu</label><div className="flex items-center gap-2"><input type="range" min={12} max={28} value={theme.menuHeaderFontSize || '18'} onChange={(e) => updateTheme("menuHeaderFontSize", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.menuHeaderFontSize || '18'}px</span></div></div>
                        </div>

                        {/* Shadow */}
                        <div className="rounded-2xl p-4 mb-3 bg-[#111]">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Gölge</span>
                            <ShadowPicker label="Header Gölge" value={theme.menuHeaderShadow} onChange={(v) => updateTheme("menuHeaderShadow", v)} />
                        </div>


                        {/* Menü (Hamburger) Card */}
                        <div className="rounded-2xl p-4 mb-3 bg-[#111]">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex flex-col items-center justify-center gap-[3px]">
                                        <div className="w-3.5 h-[2px] rounded-full bg-gray-400" />
                                        <div className="w-3.5 h-[2px] rounded-full bg-gray-400" />
                                        <div className="w-3.5 h-[2px] rounded-full bg-gray-400" />
                                    </div>
                                    <span className="text-[14px] text-gray-600 uppercase">Menü</span>
                                </div>
                                <button
                                    onClick={() => updateTheme("showMenuButton", theme.showMenuButton !== "false" ? "false" : "true")}
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${theme.showMenuButton !== "false" ? 'bg-emerald-500' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${theme.showMenuButton !== "false" ? 'translate-x-[20px]' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                            <div className="space-y-2.5">
                                <ColorPicker label="İkon Rengi" value={theme.menuHeaderIconColor} onChange={(v) => updateTheme("menuHeaderIconColor", v)} />
                            </div>
                        </div>

                        {/* İkon (Search) Card */}
                        <div className="rounded-2xl p-4 mb-3 bg-[#111]">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
                                        <Search size={14} className="text-gray-400" />
                                    </div>
                                    <span className="text-[14px] text-gray-600 uppercase">İkon</span>
                                </div>
                                <button
                                    onClick={() => updateTheme("showSearchIcon", theme.showSearchIcon !== "false" ? "false" : "true")}
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${theme.showSearchIcon !== "false" ? 'bg-emerald-500' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${theme.showSearchIcon !== "false" ? 'translate-x-[20px]' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                            <div className="space-y-2.5">
                                <ColorPicker label="İkon Rengi" value={theme.menuHeaderSearchIconColor} onChange={(v) => updateTheme("menuHeaderSearchIconColor", v)} />
                                <ColorPicker label="Buton Arkaplanı" value={theme.menuHeaderSearchBtnBg} onChange={(v) => updateTheme("menuHeaderSearchBtnBg", v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'themes' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-4 block">Renk Ayarları</span>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full ring-2 ring-white/10" style={{ backgroundColor: theme.globalThemeBg }} />
                                    <div className="w-4 h-4 rounded-full ring-2 ring-white/10" style={{ backgroundColor: theme.globalThemeText }} />
                                    <div className="w-4 h-4 rounded-full ring-2 ring-white/10" style={{ backgroundColor: theme.globalThemeIcon }} />
                                    <div className="w-4 h-4 rounded-full ring-2 ring-white/10" style={{ backgroundColor: theme.globalThemeSearchBg }} />
                                </div>
                                <span className="text-[14px] text-gray-600 uppercase">Renkler</span>
                            </div>
                            <div className="space-y-2.5">
                                <ColorPicker label="Arkaplan" value={theme.globalThemeBg} onChange={(v) => updateTheme("globalThemeBg", v)} />
                                <ColorPicker label="Yazı" value={theme.globalThemeText} onChange={(v) => updateTheme("globalThemeText", v)} />
                                <ColorPicker label="Menü" value={theme.globalThemeIcon} onChange={(v) => updateTheme("globalThemeIcon", v)} />
                                <ColorPicker label="Arama" value={theme.globalThemeSearchBg} onChange={(v) => updateTheme("globalThemeSearchBg", v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'welcome' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-4 block">Hoşgeldiniz Ayarları</span>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Arka Plan</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Arka Plan Rengi" value={theme.welcomeBg} onChange={(v) => updateTheme("welcomeBg", v)} />
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Video/Resim Opaklığı</label><div className="flex items-center gap-2"><input type="range" min={0} max={100} value={theme.welcomeOverlayOpacity} onChange={(e) => updateTheme("welcomeOverlayOpacity", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeOverlayOpacity}%</span></div></div>
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Gradient</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Gradient Başlangıç" value={theme.welcomeGradientFrom} onChange={(v) => updateTheme("welcomeGradientFrom", v)} />
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Gradient Yoğunluğu</label><div className="flex items-center gap-2"><input type="range" min={0} max={100} value={theme.welcomeGradientOpacity} onChange={(e) => updateTheme("welcomeGradientOpacity", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeGradientOpacity}%</span></div></div>
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Yazılar</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Ana Yazı Rengi" value={theme.welcomeTextColor} onChange={(v) => updateTheme("welcomeTextColor", v)} />
                                <ColorPicker label="Alt Yazı Rengi" value={theme.welcomeSubtextColor} onChange={(v) => updateTheme("welcomeSubtextColor", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Menü Butonu</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Buton Arkaplan" value={theme.welcomeBtnBg} onChange={(v) => updateTheme("welcomeBtnBg", v)} />
                                <ColorPicker label="Buton Yazı" value={theme.welcomeBtnText} onChange={(v) => updateTheme("welcomeBtnText", v)} />
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Buton Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={24} value={theme.welcomeBtnRadius} onChange={(e) => updateTheme("welcomeBtnRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeBtnRadius}px</span></div></div>
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Buton Gölgesi</label><div className="flex gap-1.5">{SHADOW_OPTIONS.map((s) => (<button key={s.value} onClick={() => updateTheme("welcomeBtnShadow", s.value)} className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${theme.welcomeBtnShadow === s.value ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"}`}>{s.label}</button>))}</div></div>
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Logo</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Logo Kenarlık" value={theme.welcomeLogoBorder} onChange={(v) => updateTheme("welcomeLogoBorder", v)} />
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Logo Boyutu</label><div className="flex items-center gap-2"><input type="range" min={48} max={160} value={theme.welcomeLogoSize} onChange={(e) => updateTheme("welcomeLogoSize", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeLogoSize}px</span></div></div>
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Logo Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={50} value={theme.welcomeLogoRadius} onChange={(e) => updateTheme("welcomeLogoRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.welcomeLogoRadius}px</span></div></div>
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Diğer Butonlar</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Arkaplan" value={theme.welcomeSecondaryBtnBg} onChange={(v) => updateTheme("welcomeSecondaryBtnBg", v)} />
                                <ColorPicker label="Yazı Rengi" value={theme.welcomeSecondaryBtnText} onChange={(v) => updateTheme("welcomeSecondaryBtnText", v)} />
                                <ColorPicker label="Kenarlık" value={theme.welcomeSecondaryBtnBorder} onChange={(v) => updateTheme("welcomeSecondaryBtnBorder", v)} />
                                <ColorPicker label="Ayırıcı Çizgi" value={theme.welcomeSeparatorColor} onChange={(v) => updateTheme("welcomeSeparatorColor", v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'position' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-4 block">Düzen Ayarları</span>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Başlık / Slider</span>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
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
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Kategori Butonları</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Buton Bar BG" value={theme.categoryNavBg} onChange={(v) => updateTheme("categoryNavBg", v)} />
                                <ColorPicker label="Aktif Arkaplan" value={theme.categoryActiveBg} onChange={(v) => updateTheme("categoryActiveBg", v)} />
                                <ColorPicker label="Aktif Yazı" value={theme.categoryActiveText} onChange={(v) => updateTheme("categoryActiveText", v)} />
                                <ColorPicker label="Pasif Arkaplan" value={theme.categoryInactiveBg} onChange={(v) => updateTheme("categoryInactiveBg", v)} />
                                <ColorPicker label="Pasif Yazı" value={theme.categoryInactiveText} onChange={(v) => updateTheme("categoryInactiveText", v)} />
                                <div className="border-t border-white/[0.06] my-2 pt-2">
                                    <span className="text-[14px] text-gray-600 uppercase mb-2 block">Köşe Yuvarlaklığı</span>
                                    <div className="flex gap-1.5 flex-wrap">{RADIUS_PRESETS.map((r) => (
                                        <button key={r.value} onClick={() => updateTheme("categoryRadius", r.value)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${theme.categoryRadius === r.value ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"}`}>{r.label}</button>
                                    ))}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Arama Çubuğu</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Arkaplan" value={theme.searchBg} onChange={(v) => updateTheme("searchBg", v)} />
                                <ColorPicker label="Kenarlık" value={theme.searchBorder} onChange={(v) => updateTheme("searchBorder", v)} />
                                <ColorPicker label="Yazı Rengi" value={theme.searchText} onChange={(v) => updateTheme("searchText", v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'general' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-4 block">Genel Ayarlar</span>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Sayfa</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Sayfa Arkaplanı" value={theme.pageBg} onChange={(v) => updateTheme("pageBg", v)} />
                                <ColorPicker label="Vurgu Rengi" value={theme.accentColor} onChange={(v) => updateTheme("accentColor", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Ürün Kartları</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Kategori Bölüm BG" value={theme.categorySectionBg} onChange={(v) => updateTheme("categorySectionBg", v)} />
                                <ColorPicker label="Kart Arkaplanı" value={theme.cardBg} onChange={(v) => updateTheme("cardBg", v)} />
                                <ColorPicker label="Kart Kenarlık" value={theme.cardBorder} onChange={(v) => updateTheme("cardBorder", v)} />
                                <ShadowPicker label="Kart Gölgesi" value={theme.cardShadow} onChange={(v) => updateTheme("cardShadow", v)} />
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Kart Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={24} value={theme.cardRadius} onChange={(e) => updateTheme("cardRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.cardRadius}px</span></div></div>
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Resim Köşe</label><div className="flex items-center gap-2"><input type="range" min={0} max={20} value={theme.cardImageRadius} onChange={(e) => updateTheme("cardImageRadius", e.target.value)} className="w-24 accent-emerald-500" /><span className="text-xs text-gray-500 w-8 text-right">{theme.cardImageRadius}px</span></div></div>
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Fiyat Stilleri</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Fiyat Rengi" value={theme.priceColor} onChange={(v) => updateTheme("priceColor", v)} />
                                <ColorPicker label="İndirimli Fiyat" value={theme.discountColor} onChange={(v) => updateTheme("discountColor", v)} />
                                <ColorPicker label="Eski Fiyat" value={theme.oldPriceColor} onChange={(v) => updateTheme("oldPriceColor", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Popüler Etiketi</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Arkaplan" value={theme.popularBadgeBg} onChange={(v) => updateTheme("popularBadgeBg", v)} />
                                <ColorPicker label="Yazı Rengi" value={theme.popularBadgeText} onChange={(v) => updateTheme("popularBadgeText", v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'font' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-4 block">Yazı Ayarları</span>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Ürün Adı</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Renk" value={theme.productNameColor} onChange={(v) => updateTheme("productNameColor", v)} />
                                <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Kalınlık</label><div className="flex gap-1.5">{"400,500,600,700,800".split(',').map((w) => (<button key={w} onClick={() => updateTheme("productNameWeight", w)} className={`px-2 py-1 rounded-md text-[10px] transition-all border ${theme.productNameWeight === w ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400"}`} style={{ fontWeight: parseInt(w) }}>{w}</button>))}</div></div>
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Ürün Açıklaması</span>
                            <ColorPicker label="Renk" value={theme.productDescColor} onChange={(v) => updateTheme("productDescColor", v)} />
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Kategori Başlığı</span>
                            <ColorPicker label="Renk" value={theme.categoryTitleColor} onChange={(v) => updateTheme("categoryTitleColor", v)} />
                        </div>
                    </>)}

                    {activeSection === 'bottomnav' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-4 block">Alt Navigasyon Ayarları</span>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <div className="space-y-2.5">
                                <ColorPicker label="Arkaplan" value={theme.bottomNavBg} onChange={(v) => updateTheme("bottomNavBg", v)} />
                                <ColorPicker label="Aktif İkon" value={theme.bottomNavActive} onChange={(v) => updateTheme("bottomNavActive", v)} />
                                <ColorPicker label="Pasif İkon" value={theme.bottomNavInactive} onChange={(v) => updateTheme("bottomNavInactive", v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'detail' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-4 block">Ürün Detay Ayarları</span>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Arka Plan & Kart</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Kart Arka Planı" value={theme.detailBg} onChange={(v) => updateTheme("detailBg", v)} />
                                <ColorPicker label="Geri Butonu BG" value={theme.detailBackBtnBg} onChange={(v) => updateTheme("detailBackBtnBg", v)} />
                                <ColorPicker label="Geri Butonu İkon" value={theme.detailBackBtnColor} onChange={(v) => updateTheme("detailBackBtnColor", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Yazılar</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Ürün Adı" value={theme.detailNameColor} onChange={(v) => updateTheme("detailNameColor", v)} />
                                <ColorPicker label="Fiyat" value={theme.detailPriceColor} onChange={(v) => updateTheme("detailPriceColor", v)} />
                                <ColorPicker label="Açıklama" value={theme.detailDescColor} onChange={(v) => updateTheme("detailDescColor", v)} />
                                <ColorPicker label="Etiket / Başlık" value={theme.detailLabelColor} onChange={(v) => updateTheme("detailLabelColor", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Bilgi Kutuları</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Bilgi Kutusu BG" value={theme.detailInfoBg} onChange={(v) => updateTheme("detailInfoBg", v)} />
                                <ColorPicker label="Bilgi Kutusu Border" value={theme.detailInfoBorder} onChange={(v) => updateTheme("detailInfoBorder", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Malzeme Etiketleri</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Etiket BG" value={theme.detailIngredientBg} onChange={(v) => updateTheme("detailIngredientBg", v)} />
                                <ColorPicker label="Etiket Yazı" value={theme.detailIngredientText} onChange={(v) => updateTheme("detailIngredientText", v)} />
                                <ColorPicker label="Etiket Border" value={theme.detailIngredientBorder} onChange={(v) => updateTheme("detailIngredientBorder", v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'search' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-4 block">Arama Sayfası Ayarları</span>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Genel</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Arka Plan" value={theme.searchOverlayBg} onChange={(v) => updateTheme("searchOverlayBg", v)} />
                                <ColorPicker label="Arama İkon" value={theme.searchOverlayIconColor} onChange={(v) => updateTheme("searchOverlayIconColor", v)} />
                                <ColorPicker label="Kapatma İkon" value={theme.searchOverlayCloseColor} onChange={(v) => updateTheme("searchOverlayCloseColor", v)} />
                                <ColorPicker label="Border Çizgi" value={theme.searchOverlayBorderColor} onChange={(v) => updateTheme("searchOverlayBorderColor", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Yazılar</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Yazı Rengi" value={theme.searchOverlayInputColor} onChange={(v) => updateTheme("searchOverlayInputColor", v)} />
                                <ColorPicker label="Placeholder" value={theme.searchOverlayPlaceholderColor} onChange={(v) => updateTheme("searchOverlayPlaceholderColor", v)} />
                                <ColorPicker label="Boş Mesaj" value={theme.searchOverlayEmptyColor} onChange={(v) => updateTheme("searchOverlayEmptyColor", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Sonuç Kartları</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Kart BG" value={theme.searchOverlayResultBg} onChange={(v) => updateTheme("searchOverlayResultBg", v)} />
                                <ColorPicker label="Ürün Adı" value={theme.searchOverlayResultNameColor} onChange={(v) => updateTheme("searchOverlayResultNameColor", v)} />
                                <ColorPicker label="Açıklama" value={theme.searchOverlayResultDescColor} onChange={(v) => updateTheme("searchOverlayResultDescColor", v)} />
                                <ColorPicker label="Fiyat" value={theme.searchOverlayResultPriceColor} onChange={(v) => updateTheme("searchOverlayResultPriceColor", v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'drawer' && (<>
                        <span className="text-[12px] text-gray-500 uppercase font-medium mb-4 block">Sol Menü Ayarları</span>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Genel</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Arka Plan" value={theme.sidebarBg} onChange={(v) => updateTheme("sidebarBg", v)} />
                                <ColorPicker label="Bölüm Çizgisi" value={theme.sidebarBorder} onChange={(v) => updateTheme("sidebarBorder", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Başlık</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="İşletme Adı" value={theme.sidebarNameColor} onChange={(v) => updateTheme("sidebarNameColor", v)} />
                                <ColorPicker label="İşletme Açıklama" value={theme.sidebarDescColor} onChange={(v) => updateTheme("sidebarDescColor", v)} />
                                <ColorPicker label="Kapatma Buton Çerçeve" value={theme.sidebarCloseBtnBorder} onChange={(v) => updateTheme("sidebarCloseBtnBorder", v)} />
                                <ColorPicker label="Kapatma Buton İkon" value={theme.sidebarCloseBtnColor} onChange={(v) => updateTheme("sidebarCloseBtnColor", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Menü Öğeleri</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Bölüm Başlığı" value={theme.sidebarLabelColor} onChange={(v) => updateTheme("sidebarLabelColor", v)} />
                                <ColorPicker label="Menü Yazısı" value={theme.sidebarItemColor} onChange={(v) => updateTheme("sidebarItemColor", v)} />
                                <ColorPicker label="Menü İkon" value={theme.sidebarItemIconColor} onChange={(v) => updateTheme("sidebarItemIconColor", v)} />
                                <ColorPicker label="Hover Arka Plan" value={theme.sidebarItemHover} onChange={(v) => updateTheme("sidebarItemHover", v)} />
                            </div>
                        </div>
                        <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-4 mb-3">
                            <span className="text-[14px] text-gray-600 uppercase mb-3 block">Aktif Kategori</span>
                            <div className="space-y-2.5">
                                <ColorPicker label="Aktif BG" value={theme.sidebarActiveItemBg} onChange={(v) => updateTheme("sidebarActiveItemBg", v)} />
                                <ColorPicker label="Aktif Yazı" value={theme.sidebarActiveItemColor} onChange={(v) => updateTheme("sidebarActiveItemColor", v)} />
                            </div>
                        </div>
                    </>)}
                </div>
            </div >
        </div >
    );
}

