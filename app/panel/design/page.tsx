"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    Save, Loader2, Palette, Type, Square, Layers, Eye, RotateCcw, Settings,
    Sun, Moon, Sparkles, Paintbrush, SlidersHorizontal, Monitor, Menu, Upload, X, Globe,
    LayoutGrid, ChevronDown, ChevronUp, Check, Smartphone, Tablet, RefreshCw, Search, Image as ImageIcon,
    LayoutList, Grid2X2, Grid3X3, GalleryHorizontal, Newspaper, AlignJustify, RectangleHorizontal, Rows3, LayoutDashboard, FileText,
    Droplets, MoreHorizontal, Plus, Minus, Trash2
} from "lucide-react";
import { useSession } from "@/lib/useSession";

// ─── Default Theme ─────────────────────────────────────────
const DEFAULT_THEME = {
    // General
    pageBg: "#f9fafb",
    fontFamily: "Inter",
    pageBgGradFrom: "",
    pageBgGradTo: "",
    pageBgGradAngle: "135",
    pageBgImage: "",
    pageBgVideo: "",

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

    // Header Dimensions
    menuHeaderHeight: "60",
    menuHeaderPaddingX: "16",

    // Header Icon Visibility
    showLangIcon: "false",

    // Icon Positions (left / center / right)
    menuIconPos: "left",
    searchIconPos: "right",
    langIconPos: "right",

    // Menu Icon Style
    menuIconSize: "20",
    menuIconBg: "transparent",
    menuIconRadius: "0",

    // Search Icon Style
    searchIconSize: "20",
    searchIconBg: "transparent",
    searchIconRadius: "0",

    // Lang Icon Style
    langIconSize: "20",
    langIconBg: "transparent",
    langIconRadius: "0",

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
    sliderAutoPlay: "true",
    sliderInterval: "5000",
    sliderHeight: "220",
    sliderBorderRadius: "0",
    sliderOverlayBg: "#00000030",
    sliderDotColor: "#ffffff80",
    sliderDotActiveColor: "#ffffff",
    showSliderArrows: "true",
    sliderArrowBg: "#00000040",
    sliderArrowColor: "#ffffff",
    showSliderDots: "true",
    sliderBgImage: "",
    sliderBgVideo: "",
    sliderH1Size: "36",
    sliderH2Size: "20",
    sliderFontFamily: "",

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
type GradientStop = { color: string; position: number; opacity: number };
type PanelTab = 'solid' | 'linear' | 'radial' | 'angular' | 'image';

function AdvancedColorPanel({ value, onChange, onClose, panelStyle }: { value: string; onChange: (v: string) => void; onClose: () => void; panelStyle?: React.CSSProperties }) {
    const panelRef = useRef<HTMLDivElement>(null);
    const satValRef = useRef<HTMLCanvasElement>(null);
    const [activeTab, setActiveTab] = useState<PanelTab>(() => {
        if (value.startsWith('linear-gradient')) return 'linear';
        if (value.startsWith('radial-gradient')) return 'radial';
        if (value.startsWith('conic-gradient')) return 'angular';
        if (value.startsWith('url(')) return 'image';
        return 'solid';
    });
    // Extract initial hex for HSV/hexInput (handles rgba too)
    const initHex = (() => {
        if (value.startsWith('#')) return value;
        if (value.startsWith('rgba') || value.startsWith('rgb')) {
            const m = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (m) return '#' + [parseInt(m[1]),parseInt(m[2]),parseInt(m[3])].map(n=>n.toString(16).padStart(2,'0')).join('');
        }
        return '#000000';
    })();
    const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(initHex));
    const [opacity, setOpacity] = useState(() => {
        if (value.startsWith('rgba')) {
            const m = value.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
            if (m) return Math.round(parseFloat(m[1]) * 100);
        }
        return 100;
    });
    const [hexInput, setHexInput] = useState(initHex);
    const isDraggingSV = useRef(false);
    const isDraggingHue = useRef(false);
    const isDraggingOpacity = useRef(false);
    const opacityBarRef = useRef<HTMLDivElement>(null);
    const [gradAngle, setGradAngle] = useState(135);
    const [gradStops, setGradStops] = useState<GradientStop[]>([{ color: '#E8C3C3', position: 0, opacity: 100 }, { color: '#826D6D', position: 100, opacity: 100 }]);
    const [editingStop, setEditingStop] = useState(0);
    const [imageUrl, setImageUrl] = useState(() => value.startsWith('url(') ? value.slice(4, -1) : '');
    const [uploading, setUploading] = useState(false);
    const gradBarRef = useRef<HTMLDivElement>(null);
    const draggingStopIdx = useRef<number>(-1);
    const [stopHexInput, setStopHexInput] = useState(gradStops[0]?.color?.replace('#','') ?? 'E8C3C3');
    const isDraggingGradSV = useRef(false);
    const isDraggingGradHue = useRef(false);
    const gradSVRef = useRef<HTMLDivElement>(null);
    const gradHueRef = useRef<HTMLDivElement>(null);

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

    // Emit when HSV changes (keep current opacity)
    useEffect(() => {
        if (activeTab !== 'solid') return;
        const hex = hsvToHex(hsv[0], hsv[1], hsv[2]); setHexInput(hex);
        if (opacity < 100) {
            const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            onChange(`rgba(${r}, ${g}, ${b}, ${(opacity/100).toFixed(2)})`);
        } else { onChange(hex); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hsv, activeTab]);

    // Emit when opacity changes separately (keep current HSV)
    useEffect(() => {
        if (activeTab !== 'solid') return;
        const hex = hsvToHex(hsv[0], hsv[1], hsv[2]);
        if (opacity < 100) {
            const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            onChange(`rgba(${r}, ${g}, ${b}, ${(opacity/100).toFixed(2)})`);
        } else { onChange(hex); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opacity]);

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
            if (isDraggingOpacity.current && opacityBarRef.current) {
                const r = opacityBarRef.current.getBoundingClientRect();
                const pct = Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 100);
                setOpacity(pct);
            }
        };
        const up = () => { isDraggingSV.current = false; isDraggingHue.current = false; isDraggingOpacity.current = false; };
        window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
        return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    }, []);

    const stopColor = (s: GradientStop) => {
        if (s.opacity < 100) {
            const r = parseInt(s.color.slice(1,3),16), g = parseInt(s.color.slice(3,5),16), b = parseInt(s.color.slice(5,7),16);
            return `rgba(${r},${g},${b},${(s.opacity/100).toFixed(2)})`;
        }
        return s.color;
    };
    const buildGrad = (type: PanelTab, stops: GradientStop[], angle: number) => {
        const s = [...stops].sort((a,b) => a.position - b.position).map(st => `${stopColor(st)} ${st.position}%`).join(', ');
        return type === 'linear' ? `linear-gradient(${angle}deg, ${s})` : type === 'radial' ? `radial-gradient(circle, ${s})` : `conic-gradient(from ${angle}deg, ${s})`;
    };
    const emitGrad = (stops?: GradientStop[], angle?: number, tab?: PanelTab) => onChange(buildGrad(tab || activeTab, stops || gradStops, angle ?? gradAngle));
    const updateStop = (i: number, k: keyof GradientStop, v: string | number) => {
        const ns = gradStops.map((s,j) => j === i ? { ...s, [k]: v } : s);
        setGradStops(ns);
        if (k === 'color') setStopHexInput((v as string).replace('#',''));
        emitGrad(ns);
    };
    const addStopAtPct = (pct: number) => {
        // interpolate colour at pct
        const sorted = [...gradStops].sort((a,b)=>a.position-b.position);
        let col = sorted[0].color;
        for (let i=0;i<sorted.length-1;i++) {
            if (pct >= sorted[i].position && pct <= sorted[i+1].position) {
                const t = (pct - sorted[i].position) / (sorted[i+1].position - sorted[i].position || 1);
                const hexToRgb = (h: string) => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
                const a = hexToRgb(sorted[i].color), b2 = hexToRgb(sorted[i+1].color);
                col = '#'+[0,1,2].map(c=>Math.round(a[c]+(b2[c]-a[c])*t).toString(16).padStart(2,'0')).join('');
                break;
            }
        }
        const newStop: GradientStop = { color: col, position: Math.round(pct), opacity: 100 };
        const ns = [...gradStops, newStop].sort((a,b)=>a.position-b.position);
        const idx = ns.findIndex(s=>s===newStop);
        setGradStops(ns); setEditingStop(idx); setStopHexInput(col.replace('#','')); emitGrad(ns);
    };
    const addStop = () => addStopAtPct(50);
    const removeStop = (i: number) => {
        if (gradStops.length <= 2) return;
        const ns = gradStops.filter((_,j)=>j!==i);
        setGradStops(ns); setEditingStop(Math.min(editingStop, ns.length-1)); emitGrad(ns);
    };
    // Drag stops on bar + sat/val + hue for selected stop
    useEffect(() => {
        const move = (e: MouseEvent) => {
            // Bar drag
            if (draggingStopIdx.current >= 0 && gradBarRef.current) {
                const r = gradBarRef.current.getBoundingClientRect();
                const pct = Math.round(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)));
                const ns = gradStops.map((s,j)=>j===draggingStopIdx.current?{...s,position:pct}:s);
                setGradStops(ns); emitGrad(ns);
            }
            // Sat/Val drag for selected stop
            if (isDraggingGradSV.current && gradSVRef.current) {
                const r = gradSVRef.current.getBoundingClientRect();
                const sx = Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
                const sy = Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
                const [h2] = hexToHsv(gradStops[editingStop]?.color || '#ff0000');
                const nc = hsvToHex(h2, sx*100, (1-sy)*100);
                const ns = gradStops.map((s,j)=>j===editingStop?{...s,color:nc}:s);
                setGradStops(ns); setStopHexInput(nc.replace('#','')); emitGrad(ns);
            }
            // Hue drag for selected stop
            if (isDraggingGradHue.current && gradHueRef.current) {
                const r = gradHueRef.current.getBoundingClientRect();
                const h2 = Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*360;
                const [,s2,v2] = hexToHsv(gradStops[editingStop]?.color || '#ff0000');
                const nc = hsvToHex(h2,s2,v2);
                const ns = gradStops.map((s,j)=>j===editingStop?{...s,color:nc}:s);
                setGradStops(ns); setStopHexInput(nc.replace('#','')); emitGrad(ns);
            }
        };
        const up = () => { draggingStopIdx.current = -1; isDraggingGradSV.current = false; isDraggingGradHue.current = false; };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gradStops, gradAngle, activeTab, editingStop]);

    const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return; setUploading(true);
        try { const fd = new FormData(); fd.append('file', f); const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json(); if (d.url) { setImageUrl(d.url); onChange(`url(${d.url})`); } } catch { }
        setUploading(false);
    };

    const curColor = hsvToHex(hsv[0], hsv[1], hsv[2]);
    const tBtn = (t: PanelTab) => `w-7 h-7 rounded-lg flex items-center justify-center transition-all ${activeTab === t ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04] opacity-50 hover:opacity-80'}`;

    return (
        <div ref={panelRef} className="fixed z-[99999] w-[272px] bg-[#2c2c2c] rounded-xl shadow-2xl border border-white/[0.08]" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.5)', ...panelStyle }}>
            {/* Tabs */}
            <div className="flex items-center gap-0.5 px-3 pt-3 pb-2 border-b border-white/[0.06]">
                <button className={tBtn('solid')} onClick={() => { if (activeTab === 'image' && imageUrl && !window.confirm('Resim silinecek. Devam etmek istiyor musun?')) return; setActiveTab('solid'); const hex = hsvToHex(hsv[0], hsv[1], hsv[2]); onChange(hex); }} title="Düz Renk"><div className="w-3.5 h-3.5 rounded-[3px] border-2 border-gray-400" /></button>
                <button className={tBtn('linear')} onClick={() => { if (activeTab === 'image' && imageUrl && !window.confirm('Resim silinecek. Devam etmek istiyor musun?')) return; setActiveTab('linear'); onChange(buildGrad('linear', gradStops, gradAngle)); }} title="Linear"><div className="w-3.5 h-3.5 rounded-[3px]" style={{ background: 'linear-gradient(135deg, #fff, #555)' }} /></button>
                <button className={tBtn('radial')} onClick={() => { if (activeTab === 'image' && imageUrl && !window.confirm('Resim silinecek. Devam etmek istiyor musun?')) return; setActiveTab('radial'); onChange(buildGrad('radial', gradStops, gradAngle)); }} title="Radial"><div className="w-3.5 h-3.5 rounded-full" style={{ background: 'radial-gradient(circle, #fff, #555)' }} /></button>
                <button className={tBtn('angular')} onClick={() => { if (activeTab === 'image' && imageUrl && !window.confirm('Resim silinecek. Devam etmek istiyor musun?')) return; setActiveTab('angular'); onChange(buildGrad('angular', gradStops, gradAngle)); }} title="Angular"><div className="w-3.5 h-3.5 rounded-full" style={{ background: 'conic-gradient(#fff, #555, #fff)' }} /></button>
                <button className={tBtn('image')} onClick={() => setActiveTab('image')} title="Resim">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                </button>
                {/* Renk Yok */}
                <div className="flex-1" />
                <button
                    onClick={() => { onChange('transparent'); onClose(); }}
                    className="flex items-center gap-1 px-2 h-6 rounded-md text-[10px] text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/[0.06] hover:border-red-500/20"
                    title="Renk Yok">
                    <X size={10} />
                    <span>Yok</span>
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
                        <div id="acp-hue-slider" className="h-3 rounded-full cursor-pointer relative overflow-hidden"
                            style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                            onMouseDown={(e) => { isDraggingHue.current = true; const r = e.currentTarget.getBoundingClientRect(); setHsv([Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 360, hsv[1], hsv[2]]); }}>
                            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none"
                                style={{ left: `clamp(0px, calc(${(hsv[0] / 360) * 100}% - 7px), calc(100% - 14px))`, boxShadow: '0 1px 3px rgba(0,0,0,0.3)', backgroundColor: `hsl(${hsv[0]}, 100%, 50%)` }} />
                        </div>
                        <div ref={opacityBarRef} className="h-3 rounded-full cursor-pointer relative overflow-hidden"
                            style={{ background: `linear-gradient(to right, transparent, ${curColor}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50%/8px 8px` }}
                            onMouseDown={(e) => { isDraggingOpacity.current = true; const r = opacityBarRef.current!.getBoundingClientRect(); setOpacity(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 100)); }}
                        >
                            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none"
                                style={{ left: `clamp(0px, calc(${opacity}% - 7px), calc(100% - 14px))`, boxShadow: '0 1px 3px rgba(0,0,0,0.3)', backgroundColor: curColor }} />
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
                        <input type="text" value={opacity} onChange={(e) => {
                            const newOp = Math.max(0, Math.min(100, Number(e.target.value.replace(/[^0-9]/g,''))||0));
                            setOpacity(newOp);
                            if (activeTab === 'solid') {
                                const r = parseInt(hexInput.slice(1,3),16), g = parseInt(hexInput.slice(3,5),16), b = parseInt(hexInput.slice(5,7),16);
                                onChange(`rgba(${r}, ${g}, ${b}, ${(newOp/100).toFixed(2)})`);
                            }
                        }}
                            className="w-8 bg-transparent border-0 text-[11px] text-gray-300 font-mono focus:outline-none text-center" />
                        <span className="text-[10px] text-gray-500 ml-0.5">%</span>
                    </div>
                </div>
            </>)}

            {/* GRADIENT */}
            {(activeTab === 'linear' || activeTab === 'radial' || activeTab === 'angular') && (<>
                {/* Angle row */}
                <div className="px-3 pt-2 pb-2 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-medium">{activeTab === 'linear' ? 'Linear' : activeTab === 'radial' ? 'Radial' : 'Angular'}</span>
                    {activeTab !== 'radial' && (
                        <div className="flex items-center gap-1">
                            <input type="number" value={gradAngle} onChange={(e) => { const a = ((Number(e.target.value) % 360)+360)%360; setGradAngle(a); emitGrad(undefined, a); }}
                                className="w-10 bg-[#1e1e1e] rounded px-1.5 py-0.5 text-[10px] text-gray-300 font-mono border-0 focus:outline-none text-center" />
                            <span className="text-[10px] text-gray-500">°</span>
                        </div>
                    )}
                </div>

                {/* Interactive gradient bar */}
                <div className="px-3 pb-2">
                    <div className="relative" style={{ height: 32 }}>
                        {/* bar */}
                        <div
                            ref={gradBarRef}
                            className="absolute inset-x-0 rounded-lg border border-white/[0.06] cursor-crosshair"
                            style={{ top: 8, bottom: 8, background: buildGrad(activeTab, gradStops, gradAngle) }}
                            onClick={(e) => {
                                if (draggingStopIdx.current >= 0) return;
                                const r = gradBarRef.current!.getBoundingClientRect();
                                const pct = Math.round(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)));
                                addStopAtPct(pct);
                            }}
                        />
                        {/* stop markers */}
                        {gradStops.map((stop, i) => (
                            <div
                                key={i}
                                onMouseDown={(e) => { e.stopPropagation(); draggingStopIdx.current = i; setEditingStop(i); setStopHexInput(stop.color.replace('#','')); }}
                                onClick={(e) => { e.stopPropagation(); setEditingStop(i); setStopHexInput(stop.color.replace('#','')); }}
                                className="absolute top-1/2 -translate-y-1/2 cursor-grab"
                                style={{ left: `calc(${stop.position}% - 8px)`, zIndex: editingStop === i ? 10 : 5 }}
                            >
                                <div className="w-4 h-4 rounded-[3px] border-2 shadow-md"
                                    style={{
                                        backgroundColor: stopColor(stop),
                                        borderColor: editingStop === i ? '#60a5fa' : '#fff',
                                        boxShadow: editingStop === i ? '0 0 0 1px #3b82f6' : '0 1px 4px rgba(0,0,0,0.5)'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected stop controls */}
                {gradStops[editingStop] && (
                    <div className="mx-3 mb-2 bg-[#1a1a1a] rounded-lg p-2 space-y-2">
                        {/* sat/val mini canvas for selected stop */}
                        <div ref={gradSVRef} className="relative rounded-md overflow-hidden cursor-crosshair" style={{ height: 100 }}
                            onMouseDown={(e) => {
                                isDraggingGradSV.current = true;
                                const r = gradSVRef.current!.getBoundingClientRect();
                                const sx = Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
                                const sy = Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
                                const [h2] = hexToHsv(gradStops[editingStop].color);
                                const nc = hsvToHex(h2, sx*100, (1-sy)*100);
                                updateStop(editingStop,'color',nc);
                            }}
                        >
                            {(() => {
                                const [h2] = hexToHsv(gradStops[editingStop].color);
                                return (
                                    <>
                                        <div className="absolute inset-0" style={{ background: `hsl(${h2},100%,50%)` }} />
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,#fff,rgba(255,255,255,0))' }} />
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0),#000)' }} />
                                        {(() => { const [,s2,v2]=hexToHsv(gradStops[editingStop].color); return (
                                            <div className="absolute w-3 h-3 rounded-full border-2 border-white pointer-events-none"
                                                style={{ left:`calc(${s2}% - 6px)`, top:`calc(${100-v2}% - 6px)`, backgroundColor:gradStops[editingStop].color, boxShadow:'0 0 0 1px rgba(0,0,0,0.3)' }} />
                                        ); })()}
                                    </>
                                );
                            })()}
                        </div>
                        {/* hue for stop */}
                        <div ref={gradHueRef} className="h-3 rounded-full cursor-pointer relative"
                            style={{ background:'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
                            onMouseDown={(e) => {
                                isDraggingGradHue.current = true;
                                const r = gradHueRef.current!.getBoundingClientRect();
                                const h2 = Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*360;
                                const [,s2,v2]=hexToHsv(gradStops[editingStop].color);
                                updateStop(editingStop,'color',hsvToHex(h2,s2,v2));
                            }}
                        >
                            {(() => { const [h2]=hexToHsv(gradStops[editingStop].color); return (
                                <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white pointer-events-none"
                                    style={{ left:`clamp(0px,calc(${(h2/360)*100}% - 7px),calc(100% - 14px))`, backgroundColor:`hsl(${h2},100%,50%)`, boxShadow:'0 1px 3px rgba(0,0,0,0.4)' }} />
                            ); })()}
                        </div>
                        {/* hex + opacity row for selected stop */}
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-[3px] flex-shrink-0 border border-white/10" style={{ backgroundColor: stopColor(gradStops[editingStop]) }} />
                            <div className="flex items-center bg-[#111] rounded px-1.5 py-1 flex-1">
                                <span className="text-[9px] text-gray-600 mr-1">Hex</span>
                                <input type="text" value={stopHexInput}
                                    onChange={(e) => {
                                        setStopHexInput(e.target.value);
                                        const c = e.target.value.replace('#','');
                                        if (c.length===6 && /^[0-9a-fA-F]{6}$/.test(c)) updateStop(editingStop,'color','#'+c);
                                    }}
                                    className="flex-1 bg-transparent border-0 text-[10px] text-gray-300 font-mono focus:outline-none w-14" />
                            </div>
                            <div className="flex items-center bg-[#111] rounded px-1.5 py-1">
                                <input type="text" value={gradStops[editingStop].opacity}
                                    onChange={(e) => updateStop(editingStop,'opacity',Math.max(0,Math.min(100,Number(e.target.value.replace(/[^0-9]/g,''))||0)))}
                                    className="w-6 bg-transparent border-0 text-[10px] text-gray-300 font-mono focus:outline-none text-right" />
                                <span className="text-[9px] text-gray-600 ml-0.5">%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stops list */}
                <div className="px-3 pb-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest">Stops</span>
                    <button onClick={addStop} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                </div>
                <div className="px-3 pb-3 space-y-0.5 max-h-[120px] overflow-y-auto">
                    {[...gradStops].sort((a,b)=>a.position-b.position).map((stop) => {
                        const origIdx = gradStops.indexOf(stop);
                        const isActive = origIdx === editingStop;
                        return (
                            <div key={origIdx} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`}
                                onClick={() => { setEditingStop(origIdx); setStopHexInput(stop.color.replace('#','')); }}>
                                <span className="text-[10px] text-gray-500 font-mono w-8">{stop.position}%</span>
                                <div className="w-[14px] h-[14px] rounded-[3px] flex-shrink-0 border border-white/10" style={{ backgroundColor: stopColor(stop) }} />
                                <span className="flex-1 text-[10px] text-gray-300 font-mono">{stop.color.replace('#','').toUpperCase()}</span>
                                <span className="text-[10px] text-gray-500 font-mono">{stop.opacity}%</span>
                                {gradStops.length > 2 && (
                                    <button onClick={(e) => { e.stopPropagation(); removeStop(origIdx); }}
                                        className="w-4 h-4 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                                    </button>
                                )}
                            </div>
                        );
                    })}
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
                    {imageUrl && <button onClick={() => { setImageUrl(''); onChange(''); }} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-red-400 transition-colors mt-1"><Trash2 size={12} /> Resmi Kaldır</button>}
                </div>
            </>)}
        </div>
    );
}


// ─── Color Input Component ─────────────────────────────────
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const [showPanel, setShowPanel] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);

    // Extract display hex
    const hexVal = value.startsWith('#')
        ? value.replace('#', '').substring(0, 6).toUpperCase()
        : value.startsWith('rgba')
            ? (() => { const m = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); if (!m) return '000000'; return [parseInt(m[1]),parseInt(m[2]),parseInt(m[3])].map(n => n.toString(16).padStart(2,'0')).join('').toUpperCase(); })()
            : '';

    // Extract current opacity (0-100)
    const opacityVal = (() => {
        if (value.startsWith('rgba')) { const m = value.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/); if (m) return Math.round(parseFloat(m[1]) * 100); }
        if (value.startsWith('#') && value.length === 9) return Math.round(parseInt(value.slice(7, 9), 16) / 255 * 100);
        return 100;
    })();

    const handleOpacity = (opPct: number) => {
        opPct = Math.max(0, Math.min(100, opPct));
        if (opPct === 100) {
            // Full opacity -> emit plain hex
            const hex = (value.startsWith('#') ? value.replace('#', '').substring(0, 6) : hexVal) || '000000';
            onChange(`#${hex}`);
            return;
        }
        const hex = (value.startsWith('#') ? value.replace('#', '').substring(0, 6) : hexVal) || '000000';
        const r = parseInt(hex.substring(0, 2), 16) || 0;
        const g = parseInt(hex.substring(2, 4), 16) || 0;
        const b = parseInt(hex.substring(4, 6), 16) || 0;
        // Use precise float: e.g. 99 -> 0.99, 1 -> 0.01
        const alpha = opPct / 100;
        onChange(`rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`);
    };

    const openPanel = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Position panel below the trigger, right-aligned
            const panelWidth = 272;
            let left = rect.right - panelWidth;
            if (left < 8) left = 8;
            // If panel would go off-screen bottom, position above
            const spaceBelow = window.innerHeight - rect.bottom;
            let top = rect.bottom + 8;
            if (spaceBelow < 380) {
                top = rect.top - 380;
                if (top < 8) top = 8;
            }
            setPanelPos({ top, left });
        }
        setShowPanel(!showPanel);
    };

    return (
        <div className="flex items-center h-7 gap-1.5 relative">
            <span className="text-[11px] text-gray-500 flex-1 min-w-0 truncate">{label}</span>
            {/* Color trigger (hex) */}
            <div
                ref={triggerRef}
                className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-md px-1.5 h-7 cursor-pointer transition-colors border border-transparent hover:border-white/[0.06]"
                onClick={openPanel}
            >
                <div
                    className="w-[14px] h-[14px] rounded-[3px] flex-shrink-0"
                    style={{ ...(value.includes('gradient') || value.startsWith('url(') ? { background: value } : { backgroundColor: value }), border: '1px solid rgba(255,255,255,0.12)' }}
                />
                <input
                    type="text"
                    value={hexVal}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onChange('#' + e.target.value.replace('#', ''))}
                    className="w-[52px] bg-transparent border-0 text-[11px] text-gray-300 font-mono focus:outline-none"
                />
            </div>
            {/* Opacity — separate, does NOT open color picker */}
            <div className="flex items-center gap-0.5 bg-[#1a1a1a] hover:bg-[#222] rounded-md px-1.5 h-7 transition-colors">
                <input
                    type="text"
                    value={opacityVal}
                    onChange={(e) => handleOpacity(Number(e.target.value.replace(/[^0-9]/g, '')))}
                    className="w-6 bg-transparent border-0 text-[11px] text-gray-300 font-mono focus:outline-none text-right"
                />
                <span className="text-[10px] text-gray-600">%</span>
            </div>
            {showPanel && panelPos && <AdvancedColorPanel value={value} onChange={onChange} onClose={() => setShowPanel(false)} panelStyle={{ top: panelPos.top, left: panelPos.left }} />}
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
function ShadowPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [showDetail, setShowDetail] = useState(false);
    const [showColorPanel, setShowColorPanel] = useState(false);
    const detailRef = useRef<HTMLDivElement>(null);

    const resolved = getShadowCSS(value);
    const isNone = resolved === 'none';

    const parsed = (() => {
        if (resolved === 'none') return { x: 0, y: 4, blur: 8, spread: 0, color: '000000', opacity: 25 };
        const m = resolved.match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+rgba?\(([^)]+)\)/);
        if (m) {
            const parts = m[5].split(',').map((s: string) => s.trim());
            const r = parseInt(parts[0]) || 0, g = parseInt(parts[1]) || 0, b = parseInt(parts[2]) || 0;
            const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
            const hex = [r, g, b].map((c: number) => c.toString(16).padStart(2, '0')).join('');
            return { x: parseFloat(m[1]), y: parseFloat(m[2]), blur: parseFloat(m[3]), spread: parseFloat(m[4]), color: hex, opacity: Math.round(a * 100) };
        }
        return { x: 0, y: 4, blur: 8, spread: 0, color: '000000', opacity: 25 };
    })();

    const buildShadow = (p: typeof parsed) => {
        const r = parseInt(p.color.substring(0, 2), 16) || 0;
        const g = parseInt(p.color.substring(2, 4), 16) || 0;
        const b = parseInt(p.color.substring(4, 6), 16) || 0;
        return `${p.x}px ${p.y}px ${p.blur}px ${p.spread}px rgba(${r},${g},${b},${(p.opacity / 100).toFixed(2)})`;
    };

    const update = (field: string, val: number | string) => {
        const p = { ...parsed, [field]: val };
        onChange(buildShadow(p));
    };

    useEffect(() => {
        if (!showDetail) return;
        const handler = (e: MouseEvent) => { if (detailRef.current && !detailRef.current.contains(e.target as Node)) setShowDetail(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showDetail]);

    return (
        <div className="relative">
            {/* Shadow row */}
            {!isNone && (
                <div className="flex items-center h-7 gap-1.5 mb-1">
                    {/* Color swatch + hex — opens color picker */}
                    <div className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-md px-1.5 h-7 flex-1 cursor-pointer transition-colors"
                        onClick={() => setShowColorPanel(!showColorPanel)}>
                        <div className="w-[14px] h-[14px] rounded-[3px] flex-shrink-0" style={{ backgroundColor: `#${parsed.color}`, border: '1px solid rgba(255,255,255,0.12)' }} />
                        <span className="text-[11px] text-gray-300 font-mono">{parsed.color.toUpperCase()}</span>
                    </div>
                    {/* Opacity */}
                    <div className="flex items-center gap-0.5 bg-[#1a1a1a] hover:bg-[#222] rounded-md px-1.5 h-7 transition-colors">
                        <input type="text" value={parsed.opacity}
                            onChange={(e) => update('opacity', Math.max(0, Math.min(100, Number(e.target.value.replace(/[^0-9]/g, '')))))}
                            className="w-6 bg-transparent text-[11px] text-gray-300 font-mono text-right focus:outline-none" />
                        <span className="text-[10px] text-gray-600">%</span>
                    </div>
                    {/* Drop icon → detail panel */}
                    <button onClick={() => setShowDetail(!showDetail)}
                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${showDetail ? 'bg-violet-500/20 text-violet-400' : 'bg-[#1a1a1a] hover:bg-[#222] text-gray-400'}`}>
                        <Droplets size={12} />
                    </button>
                    {/* Remove */}
                    <button onClick={() => onChange('none')}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white/[0.06] rounded-md transition-colors text-gray-600 hover:text-red-400">
                        <Minus size={12} />
                    </button>
                </div>
            )}

            {/* Detail panel (X, Y, Blur, Spread) */}
            {showDetail && !isNone && (
                <div ref={detailRef} className="bg-[#111] rounded-xl border border-white/[0.05] p-2.5 space-y-1 mb-1">
                    {([
                        { label: 'X', field: 'x', value: parsed.x },
                        { label: 'Y', field: 'y', value: parsed.y },
                        { label: 'Bulanıklık', field: 'blur', value: parsed.blur },
                        { label: 'Yayılma', field: 'spread', value: parsed.spread },
                    ] as { label: string; field: string; value: number }[]).map(({ label, field, value: fval }) => (
                        <div key={field} className="flex items-center h-7">
                            <span className="text-[11px] text-gray-500 flex-1">{label}</span>
                            <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-md px-2 h-7">
                                <input type="text" value={fval}
                                    onChange={(e) => update(field, Number(e.target.value.replace(/[^0-9.-]/g, '')) || 0)}
                                    className="w-8 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                <span className="text-[10px] text-gray-600">px</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Color panel — anchored to outer relative div, stays in front */}
            {showColorPanel && !isNone && (
                <div className="absolute left-0 top-8 z-[9999]">
                    <AdvancedColorPanel
                        value={`#${parsed.color}`}
                        onChange={(v) => {
                            const hex = v.startsWith('#') ? v.replace('#','').substring(0,6) :
                                v.startsWith('rgba') ? (() => { const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? [parseInt(m[1]),parseInt(m[2]),parseInt(m[3])].map(n=>n.toString(16).padStart(2,'0')).join('') : '000000'; })() : '000000';
                            update('color', hex);
                        }}
                        onClose={() => setShowColorPanel(false)}
                    />
                </div>
            )}

            {/* Bottom: ... + */}
            <div className="flex items-center justify-end gap-1">
                <button className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-400 transition-colors">
                    <MoreHorizontal size={12} />
                </button>
                <button onClick={() => { if (isNone) onChange(buildShadow(parsed)); }}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-200 transition-colors">
                    <Plus size={12} />
                </button>
            </div>
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
    const [activeSection, setActiveSection] = useState('');
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
    const [iconPanelOpen, setIconPanelOpen] = useState<Record<string,boolean>>({});
    type SavedTheme = { id: string; name: string; ts: number; data: ThemeType; cardVariant?: string; detailVariant?: string };
    const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
    // Image upload for AI

    useEffect(() => {
        if (!restaurantId) return;
        fetch(`/api/admin/theme?restaurantId=${restaurantId}`)
            .then((r) => r.json())
            .then((data) => {
                if (data && typeof data === 'object' && !('error' in data)) {
                    const loaded = { ...DEFAULT_THEME, ...data };
                    setTheme(loaded);
                    setSavedTheme(loaded);
                    if (Array.isArray((data as any)._savedThemes)) setSavedThemes((data as any)._savedThemes as SavedTheme[]);
                }
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

    // Listen for device toggle from panel header
    useEffect(() => {
        const handler = (e: Event) => {
            const mode = (e as CustomEvent).detail;
            setPreviewWidth(mode === 'tablet' ? 630 : 360);
        };
        window.addEventListener('panel-device-change', handler);
        return () => window.removeEventListener('panel-device-change', handler);
    }, []);

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
            // Strip variant keys — AI should only change colors/fonts, not layout
            delete (merged as any).cardVariant;
            delete (merged as any).detailVariant;
            delete (merged as any).welcomeVariant;
            delete (merged as any).headerVariant;
            delete (merged as any).layoutVariant;
            const newTheme = merged;
            setTheme(newTheme);
            doSave(newTheme);
            saveAiThemePreset(newTheme as ThemeType, aiPrompt);
            setAiCredits(data.balance);
            setAiSuccess(true);
            setTimeout(() => setAiSuccess(false), 3000);
        } catch (e: any) {
            setAiError(e.message || 'Hata');
        } finally {
            setAiLoading(false);
        }
    }, [aiPrompt, aiLoading, restaurantId, theme, doSave]);

    const saveAiThemePreset = (themeData: ThemeType, prompt: string) => {
        const name = prompt.length > 28 ? prompt.substring(0, 28) + '...' : prompt;
        const newEntry: SavedTheme = { id: Date.now().toString(36), name, ts: Date.now(), data: themeData, cardVariant: (themeData as any).cardVariant, detailVariant: (themeData as any).detailVariant };
        setSavedThemes(prev => {
            const updated = [newEntry, ...prev].slice(0, 20);
            const next: any = { ...themeData, _savedThemes: updated };
            doSave(next as ThemeType);
            return updated;
        });
    };
    const applyAiTheme = (st: SavedTheme) => { const next = { ...theme, ...st.data }; setTheme(next); doSave(next); if (iframeRef.current) { const s = iframeRef.current.src; iframeRef.current.src = ''; iframeRef.current.src = s; } };
    const deleteAiTheme = (id: string) => { setSavedThemes(prev => { const updated = prev.filter(t => t.id !== id); const next: any = { ...theme, _savedThemes: updated }; doSave(next as ThemeType); return updated; }); };
    const resetToDefault = () => { const next: any = { ...DEFAULT_THEME, _savedThemes: savedThemes }; setTheme(next as ThemeType); doSave(next as ThemeType); if (iframeRef.current) { const s = iframeRef.current.src; iframeRef.current.src = ''; iframeRef.current.src = s; } };

    if (sessionLoading || loading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    return (
        <div className="flex flex-col h-[calc(100dvh-64px)] -m-4 lg:-m-6 bg-[#050505]">
            {/* CONTENT ROW */}
            <div className="flex flex-1 min-h-0 bg-[#050505]">
                {/* LEFT SIDEBAR: Section selector */}
                <div className="w-[180px] border-r border-white/[0.06] overflow-y-auto py-4 px-2.5 flex-shrink-0 bg-[#080808]">
                    <p className="text-[10px] text-gray-600 uppercase font-semibold tracking-widest px-1 mb-3">Bileşenler</p>
                    {/* Genel — full width */}
                    <button
                        onClick={() => setActiveSection(activeSection === 'genel' ? '' : 'genel')}
                        className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border text-center transition-all mb-2 ${
                            activeSection === 'genel'
                                ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20'
                                : 'border-white/[0.04] bg-[#111] text-gray-400 hover:bg-[#161616] hover:text-gray-300'
                        }`}
                    >
                        <Settings size={14} className={activeSection === 'genel' ? 'text-rose-400' : 'text-gray-500'} />
                        <span className="text-[10px] font-semibold tracking-wide">Genel Ayarlar</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setActiveSection(activeSection === 'header' ? '' : 'header')}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all ${
                                activeSection === 'header'
                                    ? 'border-violet-500/40 bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20'
                                    : 'border-white/[0.04] bg-[#111] text-gray-400 hover:bg-[#161616] hover:text-gray-300'
                            }`}
                        >
                            <LayoutGrid size={16} className={activeSection === 'header' ? 'text-violet-400' : 'text-gray-500'} />
                            <span className="text-[10px] font-medium leading-tight">Başlık</span>
                        </button>
                        <button
                            onClick={() => setActiveSection(activeSection === 'tema' ? '' : 'tema')}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all ${
                                activeSection === 'tema'
                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
                                    : 'border-white/[0.04] bg-[#111] text-gray-400 hover:bg-[#161616] hover:text-gray-300'
                            }`}
                        >
                            <Sparkles size={16} className={activeSection === 'tema' ? 'text-emerald-400' : 'text-gray-500'} />
                            <span className="text-[10px] font-medium leading-tight">Tema</span>
                        </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setActiveSection(activeSection === 'welcome' ? '' : 'welcome')}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all ${
                                activeSection === 'welcome'
                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20'
                                    : 'border-white/[0.04] bg-[#111] text-gray-400 hover:bg-[#161616] hover:text-gray-300'
                            }`}
                        >
                            <Globe size={16} className={activeSection === 'welcome' ? 'text-amber-400' : 'text-gray-500'} />
                            <span className="text-[10px] font-medium leading-tight">Hoşgeldiniz</span>
                        </button>
                        <button
                            onClick={() => setActiveSection(activeSection === 'slider' ? '' : 'slider')}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all ${
                                activeSection === 'slider'
                                    ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20'
                                    : 'border-white/[0.04] bg-[#111] text-gray-400 hover:bg-[#161616] hover:text-gray-300'
                            }`}
                        >
                            <GalleryHorizontal size={16} className={activeSection === 'slider' ? 'text-sky-400' : 'text-gray-500'} />
                            <span className="text-[10px] font-medium leading-tight">Slider</span>
                        </button>
                    </div>
                </div>

                {/* CENTER: Phone/Tablet preview */}
                <div className="flex-1 flex flex-col items-center py-4 min-w-0">
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
                {activeSection && <div className="w-[260px] border-l border-white/[0.06] overflow-y-auto py-4 px-3 flex-shrink-0 bg-[#0a0a0a]">
                    {/* Auto-save toast */}
                    {(saving || saved) && (
                        <div className="fixed bottom-[50px] left-[80px] z-50">
                            {saving && <div className="flex items-center gap-2 text-sm text-white bg-gray-800 border border-gray-700 px-4 py-2.5 rounded-xl shadow-2xl"><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</div>}
                            {saved && <div className="flex items-center gap-2 text-sm text-emerald-400 bg-gray-800 border border-emerald-500/30 px-4 py-2.5 rounded-xl shadow-2xl"><Check size={14} /> Kaydedildi</div>}
                        </div>
                    )}

                    {activeSection === 'genel' && (<>
                        {/* ── Yazı Tipi ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Yazı Tipi</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <select value={theme.fontFamily || 'Inter'}
                                onChange={(e) => updateTheme('fontFamily', e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-white/[0.06] rounded-xl text-[12px] text-gray-200 px-3 h-9 focus:outline-none focus:border-rose-500/40">
                                {['Inter','Roboto','Outfit','Poppins','Lato','Raleway','Nunito','Playfair Display','Merriweather','Bebas Neue','Montserrat','Ubuntu','DM Sans','Plus Jakarta Sans','serif','sans-serif','monospace'].map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-600 mt-1.5">Tüm menü yazılarını etkiler</p>
                        </div>
                        {/* ── Logo ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Logo</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            {(theme as any).headerLogo ? (
                                <div className="relative h-20 rounded-xl overflow-hidden border border-white/[0.06] bg-[#111] flex items-center justify-center">
                                    <img src={(theme as any).headerLogo} alt="" className="max-h-full max-w-full object-contain p-2" />
                                    <button onClick={() => updateTheme('headerLogo' as any, '')}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-lg flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
                                        <X size={11} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-20 rounded-xl border border-dashed border-white/[0.1] text-gray-500 hover:text-gray-300 hover:border-white/[0.2] cursor-pointer transition-colors gap-1.5">
                                    <Upload size={16} />
                                    <span className="text-[11px]">Logo Yükle</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                        const f = e.target.files?.[0]; if (!f) return;
                                        const fd = new FormData(); fd.append('file', f); fd.append('folder', 'logo');
                                        const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json();
                                        if (d.url) updateTheme('headerLogo' as any, d.url);
                                    }} />
                                </label>
                            )}
                            <p className="text-[10px] text-gray-600 mt-1.5">Header ve sidebar&apos;da kullanılır</p>
                        </div>
                        {/* ── Menü Arka Planı ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Menü Arka Planı</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-2.5">
                                <ColorPicker label="Renk" value={theme.pageBg && !theme.pageBg.startsWith('linear') && !theme.pageBg.startsWith('url') ? theme.pageBg : '#f9fafb'}
                                    onChange={(v) => { updateTheme('pageBg', v); updateTheme('pageBgGradFrom' as any, ''); updateTheme('pageBgImage' as any, ''); }} />
                                <div className="bg-[#111] rounded-xl p-2.5 border border-white/[0.05] space-y-2">
                                    <p className="text-[10px] text-gray-500 font-medium">Gradient</p>
                                    <ColorPicker label="Başlangıç" value={(theme as any).pageBgGradFrom || '#f9fafb'} onChange={(v) => {
                                        const to = (theme as any).pageBgGradTo || '#e0f2fe'; const angle = (theme as any).pageBgGradAngle || '135';
                                        updateTheme('pageBgGradFrom' as any, v); updateTheme('pageBg', `linear-gradient(${angle}deg, ${v}, ${to})`);
                                    }} />
                                    <ColorPicker label="Bitiş" value={(theme as any).pageBgGradTo || '#e0f2fe'} onChange={(v) => {
                                        const from = (theme as any).pageBgGradFrom || '#f9fafb'; const angle = (theme as any).pageBgGradAngle || '135';
                                        updateTheme('pageBgGradTo' as any, v); updateTheme('pageBg', `linear-gradient(${angle}deg, ${from}, ${v})`);
                                    }} />
                                    <div className="flex items-center h-7">
                                        <span className="text-[11px] text-gray-500 flex-1">Açı</span>
                                        <div className="flex items-center gap-1">
                                            <input type="range" min="0" max="360" value={(theme as any).pageBgGradAngle || '135'}
                                                onChange={(e) => { const from = (theme as any).pageBgGradFrom || ''; const to = (theme as any).pageBgGradTo || ''; updateTheme('pageBgGradAngle' as any, e.target.value); if (from && to) updateTheme('pageBg', `linear-gradient(${e.target.value}deg, ${from}, ${to})`); }}
                                                className="w-16 accent-rose-500" />
                                            <span className="text-[10px] text-gray-400 w-8 text-right">{(theme as any).pageBgGradAngle || '135'}°</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-600 mb-1">Arka Plan Resmi</p>
                                    {(theme as any).pageBgImage ? (
                                        <div className="relative h-14 rounded-lg overflow-hidden border border-white/[0.06]">
                                            <img src={(theme as any).pageBgImage} alt="" className="w-full h-full object-cover" />
                                            <button onClick={() => { updateTheme('pageBgImage' as any, ''); if (theme.pageBg?.startsWith('url(')) updateTheme('pageBg', '#f9fafb'); }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"><X size={10} /></button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center h-9 rounded-lg border border-dashed border-white/[0.1] text-[11px] text-gray-500 hover:text-gray-300 hover:border-white/[0.2] cursor-pointer transition-colors gap-1.5">
                                            <Upload size={12} /> Resim Yükle
                                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const fd = new FormData(); fd.append('file', f); fd.append('folder', 'bg'); const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json(); if (d.url) { updateTheme('pageBgImage' as any, d.url); updateTheme('pageBg', `url(${d.url}) center/cover no-repeat`); } }} />
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-600 mb-1">Arka Plan Videosu (öncelikli)</p>
                                    {(theme as any).pageBgVideo ? (
                                        <div className="rounded-lg overflow-hidden border border-white/[0.06] bg-[#111]">
                                            <div className="relative">
                                                <video src={(theme as any).pageBgVideo} className="w-full h-14 object-cover" muted playsInline preload="metadata" />
                                                <button onClick={() => updateTheme('pageBgVideo' as any, '')} className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"><X size={10} /></button>
                                            </div>
                                            <div className="px-2 py-1 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-gray-400">Video aktif</span></div>
                                                <label className="text-[9px] text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Değiştir<input type="file" accept="video/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const fd = new FormData(); fd.append('file', f); fd.append('folder', 'bg'); const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json(); if (d.url) updateTheme('pageBgVideo' as any, d.url); }} /></label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center h-9 rounded-lg border border-dashed border-white/[0.1] text-[11px] text-gray-500 hover:text-gray-300 hover:border-white/[0.2] cursor-pointer transition-colors gap-1.5">
                                            <Upload size={12} /> Video Yükle
                                            <input type="file" accept="video/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const fd = new FormData(); fd.append('file', f); fd.append('folder', 'bg'); const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json(); if (d.url) updateTheme('pageBgVideo' as any, d.url); }} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* ── Kategori Bar ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Kategori Bar</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                <ColorPicker label="Arka Plan" value={(theme as any).categoryNavBg || theme.pageBg} onChange={(v) => updateTheme('categoryNavBg' as any, v)} />
                                <ColorPicker label="Aktif Buton" value={theme.categoryActiveBg} onChange={(v) => updateTheme('categoryActiveBg', v)} />
                                <ColorPicker label="Aktif Metin" value={theme.categoryActiveText} onChange={(v) => updateTheme('categoryActiveText', v)} />
                                <ColorPicker label="Pasif Buton" value={theme.categoryInactiveBg} onChange={(v) => updateTheme('categoryInactiveBg', v)} />
                                <ColorPicker label="Pasif Metin" value={theme.categoryInactiveText} onChange={(v) => updateTheme('categoryInactiveText', v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'header' && (<>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                { id: 'classic', name: 'Klasik' },
                                { id: 'tall', name: 'Yüksek' },
                                { id: 'center-logo', name: 'Logo' },
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
                                        <div className="flex flex-col items-start gap-[3px]">
                                            <div className="w-[10px] h-[2px] rounded-full" style={{ backgroundColor: hIcon }} />
                                            <div className="w-[8px] h-[2px] rounded-full" style={{ backgroundColor: hIcon }} />
                                        </div>
                                    );
                                    const searchIcon = <Search size={12} strokeWidth={2.5} style={{ color: hIcon }} />;
                                    const titleBar = <div className="h-[3px] w-[23px] rounded-full" style={{ backgroundColor: hIcon }} />;
                                    const logoCircle = <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: hIcon, backgroundColor: hBg }} />;

                                    switch (v.id) {
                                        case 'classic':
                                            return (
                                                <div className="rounded-lg px-3 py-[20px] flex items-center justify-between" style={{ backgroundColor: hBg }}>
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
                                                <div className="rounded-lg px-3 py-[20px] flex items-center justify-between" style={{ backgroundColor: hBg }}>
                                                    {menuIcon}
                                                    {logoCircle}
                                                    {searchIcon}
                                                </div>
                                            );
                                        case 'left-logo':
                                            return (
                                                <div className="rounded-lg px-3 py-[20px] flex items-center justify-between" style={{ backgroundColor: hBg }}>
                                                    <div className="flex items-center gap-2">
                                                        {logoCircle}
                                                        {titleBar}
                                                    </div>
                                                    {menuIcon}
                                                </div>
                                            );
                                        case 'lang':
                                            return (
                                                <div className="rounded-lg px-3 py-[20px] flex items-center justify-between" style={{ backgroundColor: hBg }}>
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
                                                <div className="rounded-lg px-3 py-[20px] flex items-center justify-between" style={{ backgroundColor: `${hBg}cc`, backdropFilter: 'blur(8px)', border: `1px solid ${hIcon}20` }}>
                                                    {menuIcon}
                                                    {titleBar}
                                                    {searchIcon}
                                                </div>
                                            );
                                        case 'overlay':
                                            return (
                                                <div className="rounded-lg px-3 py-[20px] flex items-center justify-between" style={{ backgroundColor: 'transparent', border: `1px dashed ${hIcon}40` }}>
                                                    {menuIcon}
                                                    <div className="h-2 w-10 rounded-full" style={{ backgroundColor: hText, opacity: 0.3 }} />
                                                    {searchIcon}
                                                </div>
                                            );
                                        case 'gradient':
                                            return (
                                                <div className="rounded-lg px-3 py-[20px] flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${hBg}, ${hIcon}30)` }}>
                                                    {menuIcon}
                                                    {titleBar}
                                                    {searchIcon}
                                                </div>
                                            );

                                        default:
                                            return (
                                                <div className="rounded-lg px-3 py-[20px] flex items-center justify-between" style={{ backgroundColor: hBg }}>
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
                                            ? 'border-violet-500/50 bg-violet-500/10 ring-1 ring-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                                            : 'border-white/[0.04] bg-[#111] hover:border-white/[0.08] hover:bg-[#161616]'
                                            }`}
                                    >
                                        <div className="p-2 h-[62px] flex items-center">
                                            <div className="w-full">{renderPreview()}</div>
                                        </div>
                                        <div className="pb-2 pt-0.5">
                                            <p className={`text-[10px] font-semibold ${isActive ? 'text-violet-300' : 'text-gray-400'} transition-colors`}>{v.name}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>)}
                </div>}

                {/* RIGHT PANEL: Properties & Settings */}
                {activeSection && <div className="w-[280px] border-l border-white/[0.06] overflow-y-auto py-4 px-3 flex-shrink-0 bg-[#080808]">
                    {activeSection === 'header' && (<>

                        {/* ── Boyutlar ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Boyutlar</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Yükseklik</span>
                                    <div className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#222] rounded-md px-2 h-7 transition-colors">
                                        <input type="text" defaultValue={theme.menuHeaderHeight || '60'} onBlur={(e) => { const v = Math.min(200, Math.max(32, parseInt(e.target.value) || 60)); e.target.value = String(v); updateTheme("menuHeaderHeight", String(v)); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} className="w-8 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                        <span className="text-[10px] text-gray-600">px</span>
                                    </div>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Yatay Boşluk</span>
                                    <div className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#222] rounded-md px-2 h-7 transition-colors">
                                        <input type="text" defaultValue={theme.menuHeaderPaddingX || '16'} onBlur={(e) => { const v = Math.min(64, Math.max(0, parseInt(e.target.value) || 16)); e.target.value = String(v); updateTheme("menuHeaderPaddingX", String(v)); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} className="w-8 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                        <span className="text-[10px] text-gray-600">px</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Renkler ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Renkler</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1">
                                <ColorPicker label="Arkaplan" value={theme.menuHeaderBg} onChange={(v) => updateTheme("menuHeaderBg", v)} />
                                <ColorPicker label="Yazı Rengi" value={theme.menuHeaderTextColor} onChange={(v) => updateTheme("menuHeaderTextColor", v)} />
                            </div>
                        </div>

                        {/* ── Tipografi ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Tipografi</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Yazı Boyutu</span>
                                    <div className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#222] rounded-md px-2 h-7 transition-colors">
                                        <input type="text" defaultValue={theme.menuHeaderFontSize || '18'} onBlur={(e) => { const v = Math.min(36, Math.max(10, parseInt(e.target.value) || 18)); e.target.value = String(v); updateTheme("menuHeaderFontSize", String(v)); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} className="w-8 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                        <span className="text-[10px] text-gray-600">px</span>
                                    </div>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Kalınlık</span>
                                    <select value={theme.menuHeaderFontWeight || '700'} onChange={(e) => updateTheme("menuHeaderFontWeight", e.target.value)} className="bg-[#1a1a1a] hover:bg-[#222] h-7 rounded-md px-2 pr-6 text-[11px] text-gray-300 outline-none cursor-pointer appearance-none transition-colors" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 5px center' }}>
                                        <option value="100">Thin</option>
                                        <option value="300">Light</option>
                                        <option value="400">Regular</option>
                                        <option value="500">Medium</option>
                                        <option value="600">SemiBold</option>
                                        <option value="700">Bold</option>
                                        <option value="800">ExtraBold</option>
                                    </select>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Hizalama</span>
                                    <div className="flex gap-0.5">
                                        {([
                                            { value: 'left', icon: <><div className="w-3 h-[1.5px] bg-current rounded-full" /><div className="w-2 h-[1.5px] bg-current rounded-full mt-[2px]" /><div className="w-2.5 h-[1.5px] bg-current rounded-full mt-[2px]" /></> },
                                            { value: 'center', icon: <><div className="w-3 h-[1.5px] bg-current rounded-full mx-auto" /><div className="w-2 h-[1.5px] bg-current rounded-full mt-[2px] mx-auto" /><div className="w-2.5 h-[1.5px] bg-current rounded-full mt-[2px] mx-auto" /></> },
                                            { value: 'right', icon: <><div className="w-3 h-[1.5px] bg-current rounded-full ml-auto" /><div className="w-2 h-[1.5px] bg-current rounded-full mt-[2px] ml-auto" /><div className="w-2.5 h-[1.5px] bg-current rounded-full mt-[2px] ml-auto" /></> },
                                        ] as { value: string; icon: React.ReactNode }[]).map((a) => (
                                            <button key={a.value} onClick={() => updateTheme("menuHeaderTextAlign" as any, a.value)} className={`w-7 h-7 rounded flex flex-col items-center justify-center transition-colors ${(theme.menuHeaderTextAlign || 'center') === a.value ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{a.icon}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Gölge ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Gölge</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <ShadowPicker value={theme.menuHeaderShadow} onChange={(v) => updateTheme("menuHeaderShadow", v)} />
                        </div>

                        {/* ── İkonlar ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">İkonlar</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                {([
                                    { label: 'Menü', showKey: 'showMenuButton', posKey: 'menuIconPos', sizeKey: 'menuIconSize', bgKey: 'menuIconBg', radKey: 'menuIconRadius' },
                                    { label: 'Arama', showKey: 'showSearchIcon', posKey: 'searchIconPos', sizeKey: 'searchIconSize', bgKey: 'searchIconBg', radKey: 'searchIconRadius' },
                                    { label: 'Dil', showKey: 'showLangIcon', posKey: 'langIconPos', sizeKey: 'langIconSize', bgKey: 'langIconBg', radKey: 'langIconRadius' },
                                ] as { label: string; showKey: string; posKey: string; sizeKey: string; bgKey: string; radKey: string }[]).map(({ label, showKey, posKey, sizeKey, bgKey, radKey }) => {
                                    const isOn = (theme as any)[showKey] !== 'false';
                                    const iconOpen = !!iconPanelOpen[showKey];
                                    return (
                                        <div key={showKey} className="bg-[#111] rounded-xl overflow-hidden border border-white/[0.04]">
                                            {/* Row: toggle + label + open button */}
                                            <div className="flex items-center h-9 px-3 gap-2">
                                                <button onClick={() => updateTheme(showKey as any, isOn ? 'false' : 'true')}
                                                    className={`relative w-8 h-4 rounded-full transition-colors flex-shrink-0 ${isOn ? 'bg-violet-500' : 'bg-white/10'}`}>
                                                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${isOn ? 'right-0.5' : 'left-0.5'}`} />
                                                </button>
                                                <span className="text-[11px] text-gray-300 flex-1 font-medium">{label}</span>
                                                {isOn && (
                                                    <button onClick={() => setIconPanelOpen(p => ({ ...p, [showKey]: !p[showKey] }))}
                                                        className={`text-[10px] px-2 py-0.5 rounded transition-colors ${iconOpen ? 'bg-violet-500/20 text-violet-300' : 'text-gray-500 hover:text-gray-300'}`}>
                                                        {iconOpen ? 'Kapat' : 'Düzenle'}
                                                    </button>
                                                )}
                                            </div>
                                            {/* Sub-panel */}
                                            {isOn && iconOpen && (
                                                <div className="px-3 pb-3 space-y-2 border-t border-white/[0.05] pt-2">
                                                    {/* Position */}
                                                    <div className="flex items-center h-7">
                                                        <span className="text-[11px] text-gray-500 flex-1">Konum</span>
                                                        <div className="flex gap-0.5">
                                                            {(['left','center','right'] as const).map(pos => (
                                                                <button key={pos} onClick={() => updateTheme(posKey as any, pos)}
                                                                    className={`px-2 h-6 rounded text-[10px] font-medium transition-colors ${(theme as any)[posKey] === pos ? 'bg-violet-500/20 text-violet-300' : 'text-gray-500 hover:text-gray-300 bg-white/[0.03]'}`}>
                                                                    {pos === 'left' ? 'Sol' : pos === 'center' ? 'Orta' : 'Sağ'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Size */}
                                                    <div className="flex items-center h-7">
                                                        <span className="text-[11px] text-gray-500 flex-1">Boyut</span>
                                                        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-md px-2 h-7">
                                                            <input type="text" defaultValue={(theme as any)[sizeKey] || '20'} onBlur={(e) => { const v = Math.min(48, Math.max(12, parseInt(e.target.value) || 20)); e.target.value = String(v); updateTheme(sizeKey as any, String(v)); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} className="w-8 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                                            <span className="text-[10px] text-gray-600">px</span>
                                                        </div>
                                                    </div>
                                                    {/* Bg color */}
                                                    <ColorPicker label="Arkaplan" value={(theme as any)[bgKey] || 'transparent'} onChange={(v) => updateTheme(bgKey as any, v)} />
                                                    {/* Radius */}
                                                    <div className="flex items-center h-7">
                                                        <span className="text-[11px] text-gray-500 flex-1">Radius</span>
                                                        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-md px-2 h-7">
                                                            <input type="text" defaultValue={(theme as any)[radKey] || '0'} onBlur={(e) => { const v = Math.min(999, Math.max(0, parseInt(e.target.value) || 0)); e.target.value = String(v); updateTheme(radKey as any, String(v)); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} className="w-8 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                                            <span className="text-[10px] text-gray-600">px</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </>)}

                    {activeSection === 'welcome' && (<>

                        {/* ── Arka Plan ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Arka Plan</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                <ColorPicker label="Arka Plan" value={theme.welcomeBg} onChange={(v) => updateTheme('welcomeBg', v)} />
                                <ColorPicker label="Gradient Başlangıç" value={theme.welcomeGradientFrom} onChange={(v) => updateTheme('welcomeGradientFrom', v)} />
                                <ColorPicker label="Gradient Bitiş" value={theme.welcomeGradientTo} onChange={(v) => updateTheme('welcomeGradientTo', v)} />
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Gradient Opaklık</span>
                                    <div className="flex items-center gap-1">
                                        <input type="range" min="0" max="100" value={theme.welcomeGradientOpacity || '85'}
                                            onChange={(e) => updateTheme('welcomeGradientOpacity', e.target.value)}
                                            className="w-20 accent-amber-500" />
                                        <span className="text-[10px] text-gray-400 w-7 text-right">{theme.welcomeGradientOpacity || '85'}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Overlay Opaklık</span>
                                    <div className="flex items-center gap-1">
                                        <input type="range" min="0" max="100" value={theme.welcomeOverlayOpacity || '60'}
                                            onChange={(e) => updateTheme('welcomeOverlayOpacity', e.target.value)}
                                            className="w-20 accent-amber-500" />
                                        <span className="text-[10px] text-gray-400 w-7 text-right">{theme.welcomeOverlayOpacity || '60'}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Renkler ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Renkler</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                <ColorPicker label="Ana Metin" value={theme.welcomeTextColor} onChange={(v) => updateTheme('welcomeTextColor', v)} />
                                <ColorPicker label="Alt Metin" value={theme.welcomeSubtextColor} onChange={(v) => updateTheme('welcomeSubtextColor', v)} />
                                <ColorPicker label="Ayraç" value={theme.welcomeSeparatorColor} onChange={(v) => updateTheme('welcomeSeparatorColor', v)} />
                            </div>
                        </div>

                        {/* ── Birincil Buton ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Birincil Buton</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                <ColorPicker label="Arka Plan" value={theme.welcomeBtnBg} onChange={(v) => updateTheme('welcomeBtnBg', v)} />
                                <ColorPicker label="Metin" value={theme.welcomeBtnText} onChange={(v) => updateTheme('welcomeBtnText', v)} />
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Radius</span>
                                    <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-md px-2 h-7">
                                        <input type="text" defaultValue={theme.welcomeBtnRadius || '12'}
                                            onBlur={(e) => { const v = Math.min(999, Math.max(0, parseInt(e.target.value) || 12)); e.target.value = String(v); updateTheme('welcomeBtnRadius', String(v)); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            className="w-8 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                        <span className="text-[10px] text-gray-600">px</span>
                                    </div>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Gölge</span>
                                    <div className="flex gap-0.5">
                                        {(['none','sm','md','lg','xl'] as const).map(s => (
                                            <button key={s} onClick={() => updateTheme('welcomeBtnShadow', s)}
                                                className={`px-1.5 h-6 rounded text-[9px] font-medium transition-colors ${(theme.welcomeBtnShadow || 'lg') === s ? 'bg-amber-500/20 text-amber-300' : 'text-gray-500 hover:text-gray-300 bg-white/[0.03]'}`}>
                                                {s === 'none' ? 'Yok' : s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── İkincil Buton ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">İkincil Buton</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                <ColorPicker label="Arka Plan" value={theme.welcomeSecondaryBtnBg} onChange={(v) => updateTheme('welcomeSecondaryBtnBg', v)} />
                                <ColorPicker label="Metin" value={theme.welcomeSecondaryBtnText} onChange={(v) => updateTheme('welcomeSecondaryBtnText', v)} />
                                <ColorPicker label="Kenarlık" value={theme.welcomeSecondaryBtnBorder} onChange={(v) => updateTheme('welcomeSecondaryBtnBorder', v)} />
                            </div>
                        </div>

                        {/* ── Logo ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Logo</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                <ColorPicker label="Kenarlık" value={theme.welcomeLogoBorder} onChange={(v) => updateTheme('welcomeLogoBorder', v)} />
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Radius</span>
                                    <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-md px-2 h-7">
                                        <input type="text" defaultValue={theme.welcomeLogoRadius || '16'}
                                            onBlur={(e) => { const v = Math.min(999, Math.max(0, parseInt(e.target.value) || 16)); e.target.value = String(v); updateTheme('welcomeLogoRadius', String(v)); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            className="w-8 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                        <span className="text-[10px] text-gray-600">px</span>
                                    </div>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Boyut</span>
                                    <div className="flex items-center gap-1">
                                        <input type="range" min="48" max="160" value={theme.welcomeLogoSize || '96'}
                                            onChange={(e) => updateTheme('welcomeLogoSize', e.target.value)}
                                            className="w-20 accent-amber-500" />
                                        <span className="text-[10px] text-gray-400 w-8 text-right">{theme.welcomeLogoSize || '96'}px</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Medya ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Arka Plan Medya</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-2">
                                {/* Image upload */}
                                <div>
                                    <p className="text-[10px] text-gray-600 mb-1">Resim</p>
                                    {theme.welcomeImage ? (
                                        <div className="relative h-16 rounded-lg overflow-hidden border border-white/[0.06]">
                                            <img src={theme.welcomeImage} alt="" className="w-full h-full object-cover" />
                                            <button onClick={() => updateTheme('welcomeImage', '')} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center h-10 rounded-lg border border-dashed border-white/[0.1] text-[11px] text-gray-500 hover:text-gray-300 hover:border-white/[0.2] cursor-pointer transition-colors gap-1.5">
                                            <Upload size={12} /> Resim Yükle
                                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                const f = e.target.files?.[0]; if (!f) return;
                                                const fd = new FormData(); fd.append('file', f); fd.append('folder', 'welcome');
                                                const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json();
                                                if (d.url) updateTheme('welcomeImage', d.url);
                                            }} />
                                        </label>
                                    )}
                                </div>
                                {/* Video upload */}
                                <div>
                                    <p className="text-[10px] text-gray-600 mb-1">Video (öncelikli)</p>
                                    {theme.welcomeVideo ? (
                                        <div className="rounded-lg overflow-hidden border border-white/[0.06] bg-[#111]">
                                            <div className="relative">
                                                <video
                                                    src={theme.welcomeVideo}
                                                    className="w-full h-20 object-cover"
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                                <button
                                                    onClick={() => updateTheme('welcomeVideo', '')}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                            <div className="px-2 py-1.5 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                                    <span className="text-[10px] text-gray-400 truncate max-w-[120px]">Video aktif</span>
                                                </div>
                                                <label className="text-[9px] text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
                                                    Değiştir
                                                    <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                                                        const f = e.target.files?.[0]; if (!f) return;
                                                        const fd = new FormData(); fd.append('file', f); fd.append('folder', 'welcome');
                                                        const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json();
                                                        if (d.url) updateTheme('welcomeVideo', d.url);
                                                    }} />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center h-10 rounded-lg border border-dashed border-white/[0.1] text-[11px] text-gray-500 hover:text-gray-300 hover:border-white/[0.2] cursor-pointer transition-colors gap-1.5">
                                            <Upload size={12} /> Video Yükle
                                            <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                                                const f = e.target.files?.[0]; if (!f) return;
                                                const fd = new FormData(); fd.append('file', f); fd.append('folder', 'welcome');
                                                const r = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await r.json();
                                                if (d.url) updateTheme('welcomeVideo', d.url);
                                            }} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'slider' && (<>
                        {/* ── Görünüm ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Görünüm</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                {([
                                    { label: 'Slider Göster', key: 'showHeroSlider' },
                                    { label: 'Geçiş Barları', key: 'showSliderDots' },
                                    { label: 'Otomatik Oynat', key: 'sliderAutoPlay' },
                                ] as { label: string; key: string }[]).map(({ label, key }) => {
                                    const isOn = (theme as any)[key] !== 'false';
                                    return (
                                        <div key={key} className="flex items-center h-7">
                                            <span className="text-[11px] text-gray-500 flex-1">{label}</span>
                                            <button onClick={() => updateTheme(key as any, isOn ? 'false' : 'true')}
                                                className={`relative w-8 h-4 rounded-full transition-colors flex-shrink-0 ${isOn ? 'bg-sky-500' : 'bg-white/10'}`}>
                                                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${isOn ? 'right-0.5' : 'left-0.5'}`} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Boyut ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Boyut</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Yükseklik</span>
                                    <div className="flex items-center gap-1">
                                        <input type="range" min="80" max="420" value={(theme as any).sliderHeight || '220'}
                                            onChange={(e) => updateTheme('sliderHeight' as any, e.target.value)}
                                            className="w-20 accent-sky-500" />
                                        <span className="text-[10px] text-gray-400 w-8 text-right">{(theme as any).sliderHeight || '220'}px</span>
                                    </div>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Radius</span>
                                    <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-md px-2 h-7">
                                        <input type="text" defaultValue={(theme as any).sliderBorderRadius || '0'}
                                            onBlur={(e) => { const v = Math.min(32, Math.max(0, parseInt(e.target.value) || 0)); e.target.value = String(v); updateTheme('sliderBorderRadius' as any, String(v)); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            className="w-8 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                        <span className="text-[10px] text-gray-600">px</span>
                                    </div>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Geçiş Hızı</span>
                                    <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-md px-2 h-7">
                                        <input type="text" defaultValue={(theme as any).sliderInterval || '5000'}
                                            onBlur={(e) => { const v = Math.min(15000, Math.max(1000, parseInt(e.target.value) || 5000)); e.target.value = String(v); updateTheme('sliderInterval' as any, String(v)); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            className="w-12 bg-transparent text-[11px] text-gray-200 font-mono text-right focus:outline-none" />
                                        <span className="text-[10px] text-gray-600">ms</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Arka Plan Medya ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Arka Plan Medya</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-2">
                                {/* Image */}
                                <div>
                                    <p className="text-[10px] text-gray-600 mb-1">Resim</p>
                                    {(theme as any).sliderBgImage ? (
                                        <div className="relative h-16 rounded-lg overflow-hidden border border-white/[0.06]">
                                            <img src={(theme as any).sliderBgImage} alt="" className="w-full h-full object-cover" />
                                            <button onClick={() => updateTheme('sliderBgImage' as any, '')} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center h-10 rounded-lg border border-dashed border-white/[0.1] text-[11px] text-gray-500 hover:text-gray-300 hover:border-sky-500/30 cursor-pointer transition-colors gap-1.5 relative">
                                            <Upload size={12} /> Resim Yükle
                                            <input type="file" accept="image/*,image/webp,image/jpeg,image/png,image/gif" className="hidden" onChange={async (e) => {
                                                const f = e.target.files?.[0]; if (!f) return;
                                                const label = e.target.closest('label'); if (label) { label.textContent = 'Yükleniyor...'; }
                                                try {
                                                    const fd = new FormData(); fd.append('file', f); fd.append('folder', 'slider');
                                                    const r = await fetch('/api/upload', { method: 'POST', body: fd });
                                                    const d = await r.json();
                                                    if (d.url) { updateTheme('sliderBgImage' as any, d.url); }
                                                    else { alert('Yükleme hatası: ' + (d.error || 'Bilinmeyen hata')); }
                                                } catch (err) { alert('Yükleme başarısız'); console.error(err); }
                                            }} />
                                        </label>
                                    )}
                                </div>
                                {/* Video */}
                                <div>
                                    <p className="text-[10px] text-gray-600 mb-1">Video (öncelikli)</p>
                                    {(theme as any).sliderBgVideo ? (
                                        <div className="rounded-lg overflow-hidden border border-white/[0.06] bg-[#111]">
                                            <div className="relative">
                                                <video src={(theme as any).sliderBgVideo} className="w-full h-16 object-cover" muted playsInline preload="metadata" />
                                                <button onClick={() => updateTheme('sliderBgVideo' as any, '')} className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
                                                    <X size={10} />
                                                </button>
                                            </div>
                                            <div className="px-2 py-1.5 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-[10px] text-gray-400">Video aktif</span>
                                                </div>
                                                <label className="text-[9px] text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
                                                    Değiştir
                                                    <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                                                        const f = e.target.files?.[0]; if (!f) return;
                                                        try {
                                                            const fd = new FormData(); fd.append('file', f); fd.append('folder', 'slider');
                                                            const r = await fetch('/api/upload', { method: 'POST', body: fd });
                                                            const d = await r.json();
                                                            if (d.url) updateTheme('sliderBgVideo' as any, d.url);
                                                            else alert('Yükleme hatası: ' + (d.error || 'Hata'));
                                                        } catch (err) { alert('Video yükleme başarısız'); console.error(err); }
                                                    }} />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center h-10 rounded-lg border border-dashed border-white/[0.1] text-[11px] text-gray-500 hover:text-gray-300 hover:border-sky-500/30 cursor-pointer transition-colors gap-1.5">
                                            <Upload size={12} /> Video Yükle
                                            <input type="file" accept="video/*,video/mp4,video/webm" className="hidden" onChange={async (e) => {
                                                const f = e.target.files?.[0]; if (!f) return;
                                                const label = e.target.closest('label'); if (label) { label.textContent = 'Yükleniyor...'; }
                                                try {
                                                    const fd = new FormData(); fd.append('file', f); fd.append('folder', 'slider');
                                                    const r = await fetch('/api/upload', { method: 'POST', body: fd });
                                                    const d = await r.json();
                                                    if (d.url) updateTheme('sliderBgVideo' as any, d.url);
                                                    else alert('Yükleme hatası: ' + (d.error || 'Hata'));
                                                } catch (err) { alert('Video yükleme başarısız'); console.error(err); }
                                            }} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Yazı Tipleri ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Yazı Tipi</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">Font</span>
                                    <select value={(theme as any).sliderFontFamily || ''}
                                        onChange={(e) => updateTheme('sliderFontFamily' as any, e.target.value)}
                                        className="bg-[#1a1a1a] border border-white/[0.06] rounded-md text-[11px] text-gray-200 px-2 h-7 focus:outline-none">
                                        <option value="">Varsayılan</option>
                                        <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                                        <option value="'Inter', sans-serif">Inter</option>
                                        <option value="'Roboto', sans-serif">Roboto</option>
                                        <option value="'Outfit', sans-serif">Outfit</option>
                                        <option value="'Poppins', sans-serif">Poppins</option>
                                        <option value="'Playfair Display', serif">Playfair</option>
                                        <option value="'Bebas Neue', sans-serif">Bebas Neue</option>
                                        <option value="'Montserrat', sans-serif">Montserrat</option>
                                        <option value="serif">Serif</option>
                                        <option value="monospace">Monospace</option>
                                    </select>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">H1 (Büyük Başlık)</span>
                                    <div className="flex items-center gap-1">
                                        <input type="range" min="16" max="72" value={(theme as any).sliderH1Size || '36'}
                                            onChange={(e) => updateTheme('sliderH1Size' as any, e.target.value)}
                                            className="w-16 accent-sky-500" />
                                        <span className="text-[10px] text-gray-400 w-7 text-right">{(theme as any).sliderH1Size || '36'}px</span>
                                    </div>
                                </div>
                                <div className="flex items-center h-7">
                                    <span className="text-[11px] text-gray-500 flex-1">H2 (Alt Başlık)</span>
                                    <div className="flex items-center gap-1">
                                        <input type="range" min="10" max="40" value={(theme as any).sliderH2Size || '20'}
                                            onChange={(e) => updateTheme('sliderH2Size' as any, e.target.value)}
                                            className="w-16 accent-sky-500" />
                                        <span className="text-[10px] text-gray-400 w-7 text-right">{(theme as any).sliderH2Size || '20'}px</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Renkler ── */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Renkler</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            <div className="space-y-1.5">
                                <ColorPicker label="Overlay" value={(theme as any).sliderOverlayBg || '#00000030'} onChange={(v) => updateTheme('sliderOverlayBg' as any, v)} />
                                <ColorPicker label="Geçiş Barı" value={(theme as any).sliderDotColor || '#ffffff80'} onChange={(v) => updateTheme('sliderDotColor' as any, v)} />
                                <ColorPicker label="Aktif Bar" value={(theme as any).sliderDotActiveColor || '#ffffff'} onChange={(v) => updateTheme('sliderDotActiveColor' as any, v)} />
                            </div>
                        </div>
                    </>)}

                    {activeSection === 'tema' && (<>
                        <div className="mb-4 p-3 bg-[#111] rounded-xl border border-white/[0.05]">
                            <p className="text-[10px] text-gray-600 uppercase font-semibold mb-2">Aktif Varyant</p>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Kart: {(theme as any).cardVariant || 'classic'}</span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Detay: {(theme as any).detailVariant || 'classic'}</span>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Kayıtlı Temalar</span>
                                <div className="flex-1 h-px bg-white/[0.05]" />
                            </div>
                            {savedThemes.length === 0 ? (
                                <div className="text-center py-8">
                                    <Sparkles size={24} className="text-gray-700 mx-auto mb-2" />
                                    <p className="text-[11px] text-gray-600">Henüz kayıtlı tema yok.</p>
                                    <p className="text-[10px] text-gray-700 mt-1">AI prompt kutusuna bir istek yaz!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {savedThemes.map((st) => (
                                        <div key={st.id} className="flex items-start gap-2 p-2.5 bg-[#111] rounded-xl border border-white/[0.05] hover:border-emerald-500/20 transition-all">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                                                <div className="w-full h-1/2" style={{ background: (st.data as any).accentColor || '#6366f1' }} />
                                                <div className="w-full h-1/2" style={{ background: (st.data as any).pageBg || '#111' }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] text-gray-300 font-medium truncate">{st.name}</p>
                                                <p className="text-[9px] text-gray-600">{st.cardVariant || 'classic'} · {st.detailVariant || 'classic'}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => applyAiTheme(st)} className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">Uygula</button>
                                                <button onClick={() => deleteAiTheme(st.id)} className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={11} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={resetToDefault} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.06] text-[11px] text-gray-500 hover:text-gray-200 hover:border-white/[0.12] hover:bg-white/[0.03] transition-all">
                            <RotateCcw size={12} />Varsayılana Sıfırla
                        </button>
                    </>)}
                </div>}


            </div >
        </div >
    );
}

