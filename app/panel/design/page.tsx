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
    menuHeaderFontWeight: "700",
    menuHeaderTextAlign: "center",
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
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [aiSuccess, setAiSuccess] = useState(false);
    const [aiCredits, setAiCredits] = useState<number | null>(null);
    const [miniPrompt, setMiniPrompt] = useState('');
    const [miniLoading, setMiniLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    // Fetch AI credits
    useEffect(() => {
        if (!restaurantId) return;
        fetch(`/api/ai/credits?restaurantId=${restaurantId}`)
            .then(r => r.json())
            .then(d => setAiCredits(d.balance ?? 0))
            .catch(() => {});
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
            if (key === 'pageBg') { next.globalThemeBg = value; }
            if (key === 'pageBg') { next.globalThemeBg = value; }
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

    const handleAiGenerate = useCallback(async () => {
        if (!aiPrompt.trim() || aiLoading || !restaurantId) return;
        setAiLoading(true); setAiError(''); setAiSuccess(false);
        try {
            const res = await fetch('/api/ai/generate-theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId, prompt: aiPrompt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Hata');
            const merged = { ...theme, ...data.theme };
            // Force pageBg ↔ globalThemeBg sync after AI generation
            if (merged.globalThemeBg && merged.globalThemeBg !== '#ffffff') {
                merged.pageBg = merged.globalThemeBg;
            } else if (merged.pageBg && merged.pageBg !== theme.pageBg) {
                merged.globalThemeBg = merged.pageBg;
            }
            const newTheme = merged;
            setTheme(newTheme);
            doSave(newTheme);
            setAiCredits(data.balance);
            setAiSuccess(true);
            setTimeout(() => setAiSuccess(false), 3000);
        } catch (e: any) {
            setAiError(e.message || 'Hata');
        } finally {
            setAiLoading(false);
        }
    }, [aiPrompt, aiLoading, restaurantId, theme, doSave]);

    if (sessionLoading || loading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    return (
        <div className="flex flex-col h-[calc(100dvh-64px)] -m-4 lg:-m-6 bg-[#050505]">
            {/* CONTENT ROW */}
            <div className="flex flex-1 min-h-0 bg-[#050505]">
                {/* LEFT SIDEBAR: Section selector */}
                <div className="w-[220px] border-r border-white/[0.06] overflow-y-auto py-4 px-3 flex-shrink-0 bg-[#080808]">
                    <p className="text-[12px] text-gray-500 uppercase font-medium px-2 mb-3">Bileşenler</p>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setActiveSection('header')}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-center transition-all bg-white/[0.08] border-emerald-500/40 text-white ring-1 ring-emerald-500/20"
                        >
                            <LayoutGrid size={20} className="text-emerald-400" />
                            <span className="text-[11px] font-medium leading-tight px-1">Başlık Düzenleri</span>
                        </button>
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

                    {/* AI Prompt Bar */}
                    <div className="w-full px-6 pb-4 pt-2 flex-shrink-0">
                        {aiError && (<div className="max-w-2xl mx-auto mb-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl"><p className="text-[12px] text-red-400">{aiError}</p></div>)}
                        {aiSuccess && (<div className="max-w-2xl mx-auto mb-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2"><Check size={14} className="text-emerald-400" /><p className="text-[12px] text-emerald-400">Tema oluşturuldu!</p></div>)}
                        <div className="max-w-2xl mx-auto relative">
                            {/* Suggestions popup */}
                            {showSuggestions && (
                                <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 bg-[#111] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/40 p-3 max-h-[380px] overflow-y-auto">
                                    <p className="text-[10px] text-gray-500 uppercase font-semibold px-2 mb-2">Hazır Öneriler</p>
                                    <div className="grid grid-cols-1 gap-1">
                                        {[
                                            'Lüks altın ve mat siyah tema, derin gölgeler, altın vurgu rengi',
                                            'Akdeniz sahil cafesi, turkuaz ve kum beji tonları, yumuşak gölgeler',
                                            'Minimalist İskandinav, saf beyaz, açık gri, siyah tipografi',
                                            'Koyu gece modu, deep navy ve mor tonları, neon vurgu',
                                            'Bahar pasteli, soft pembe ve mint yeşili, hafif drop shadow',
                                            'Endüstriyel çelik grisi, cam efekti, turuncu aksanlar',
                                            'Japon minimalizmi, beyaz arka plan, siyah Zen vurgu, sıfır gölge',
                                            'Vintage kahvaltı, sıcak kahverengi ve krem, eski kağıt dokusu hissi',
                                            'Neon gece kulübü, siyah zemin, elektrik mavisi ve pürpür gölgeler',
                                            'Doğa teması, yaprak yeşili ve toprak tonu, yumuşak iç gölge',
                                            'Lüks otel bar, bordo ve altın, ince kenar gölgeleri',
                                            'Modern şehirli kafe, slate gri ve beyaz, keskin drop shadow',
                                            'Pastellerin prensesi, lavanta ve gül pembesi, yumuşak parlama',
                                            'Japon ramen dükkanı, kırmızı ve siyah, yatay çizgi aksanlar',
                                            'Art Deco restoran, altın geometrik, koyu bordo arka plan',
                                            'Okyanus mavisi dalga, derin safir ve yüzeysel beyaz köpük',
                                            'Toskana mutfağı, zeytin yeşili ve terra cotta, doğal gölgeler',
                                            'Siyah beyaz klasik bistro, striped desenler, kırmızı detay',
                                            'Miami beach vibe, neon pembe ve cyan, parlak ışık gölgeleri',
                                            'Farm to table, açık yeşil ve ahşap tonu, yumuşak iç gölge',
                                            'Ultra modern dark, saf siyah, minimal beyaz çizgiler, glow efekt',
                                            'Meksika tavernası, turuncu ve sarı, canlı arka plan gölgeleri',
                                            'Kore street food, neşeli kırmızı ve beyaz, yuvarlak köşeler',
                                            'Fransız patisserie, krem ve gül altını, zarif drop shadow',
                                            'Tech startup kafe, gradient mor-mavi, glassmorphism efekti',
                                            'Bohem yaratıcı, terracotta ve koyu yeşil, organik gölgeler',
                                            'Steakhouse prime, koyu meşe ve derin kırmızı, güçlü gölge',
                                            'Sushi minimal, beyaz ve siyah, ince kırmızı aksanlar',
                                            'Tropikal ada barı, sarı ve palmiye yeşili, gün batımı gölgeleri',
                                            'Akşam fine dining, koyu navy, gümüş ve altın, zarif ışık efekti',
                                        ].map((s) => (
                                            <button key={s} onClick={() => { setAiPrompt(s); setShowSuggestions(false); }}
                                                className="text-left px-3 py-2.5 rounded-xl text-[12px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all leading-relaxed">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-all shadow-lg shadow-black/20">
                                <Sparkles size={18} className="text-violet-400 flex-shrink-0" />
                                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiGenerate(); } }} placeholder="Nasıl bir tasarım istiyorsun?" className="flex-1 bg-transparent text-[14px] text-gray-200 placeholder:text-gray-500 focus:outline-none" />
                                <span className="text-[10px] text-gray-500 flex-shrink-0 whitespace-nowrap">{aiCredits !== null ? aiCredits : '...'} kredi</span>
                                <button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim() || (aiCredits !== null && aiCredits < 2)} className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white flex-shrink-0 flex items-center gap-2">
                                    {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Üretiyor...</> : <>Oluştur</>}
                                </button>
                                <button onClick={() => setShowSuggestions((v) => !v)} className="flex-shrink-0 px-3 py-2 rounded-xl text-[12px] font-medium border border-white/[0.1] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5">
                                    <Sparkles size={13} className="text-violet-400" /> Öneri
                                </button>
                            </div>
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
                            <span className="text-[14px] text-gray-500 uppercase font-semibold mb-3 block">Tipografi</span>
                            <div className="flex items-center justify-between gap-3 mb-3"><label className="text-xs text-gray-400">Yazı Boyutu</label><input type="text" defaultValue={theme.menuHeaderFontSize || '18'} onBlur={(e) => { const v = Math.min(36, Math.max(10, parseInt(e.target.value) || 18)); e.target.value = String(v); updateTheme("menuHeaderFontSize", String(v)); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} className="w-12 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-gray-300 text-center outline-none focus:border-white/20" /></div>
                            <div className="flex items-center justify-between gap-3 mb-3 relative"><label className="text-xs text-gray-400">Kalınlık</label>
                                <select value={theme.menuHeaderFontWeight || '700'} onChange={(e) => updateTheme("menuHeaderFontWeight", e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-gray-300 outline-none focus:border-white/20 cursor-pointer appearance-none pr-6" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}>
                                    <option value="100">Thin</option>
                                    <option value="300">Light</option>
                                    <option value="400">Regular</option>
                                    <option value="500">Medium</option>
                                    <option value="600">SemiBold</option>
                                    <option value="700">Bold</option>
                                    <option value="800">ExtraBold</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between gap-3"><label className="text-xs text-gray-400">Hizalama</label>
                                <div className="flex gap-1">
                                    {([
                                        { value: 'left', icon: <><div className="w-3 h-[1.5px] bg-current rounded-full" /><div className="w-2 h-[1.5px] bg-current rounded-full mt-[2px]" /><div className="w-2.5 h-[1.5px] bg-current rounded-full mt-[2px]" /></> },
                                        { value: 'center', icon: <><div className="w-3 h-[1.5px] bg-current rounded-full mx-auto" /><div className="w-2 h-[1.5px] bg-current rounded-full mt-[2px] mx-auto" /><div className="w-2.5 h-[1.5px] bg-current rounded-full mt-[2px] mx-auto" /></> },
                                        { value: 'right', icon: <><div className="w-3 h-[1.5px] bg-current rounded-full ml-auto" /><div className="w-2 h-[1.5px] bg-current rounded-full mt-[2px] ml-auto" /><div className="w-2.5 h-[1.5px] bg-current rounded-full mt-[2px] ml-auto" /></> },
                                    ] as { value: string; icon: React.ReactNode }[]).map((a) => (
                                        <button key={a.value} onClick={() => updateTheme("menuHeaderTextAlign" as any, a.value)} className={`w-8 h-7 rounded flex flex-col items-center justify-center transition-colors ${(theme.menuHeaderTextAlign || 'center') === a.value ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{a.icon}</button>
                                    ))}
                                </div>
                            </div>
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

                </div>
            </div >
        </div >
    );
}

