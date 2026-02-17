"use client";

import { useState, useEffect, useRef } from "react";
// Using regular img tags for external URLs
import { Info, Star, Search, X, ChevronUp, Clock, Flame, AlertTriangle, ChevronLeft, MapPin, Phone, Globe, Instagram, Mail, ThumbsUp, MessageCircle, Send, Utensils, HandHeart, Music, BadgeDollarSign } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type Product = {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    image: string;
    isPopular: boolean;
    prepTime: string;
    calories: string;
    ingredients: string[];
    allergens: string[];
};

type ReviewItem = { id: string; name: string; date: string; rating: number; comment: string; helpful: number };

type MenuClientProps = {
    initialCategories: { id: string; name: string }[];
    initialProducts: Product[];
    initialBusinessInfo: {
        name: string; description: string; image: string; address: string; phone: string;
        email: string; website: string; instagram: string;
        workingHours: { day: string; hours: string }[];
    };
    initialReviews: {
        average: number; totalCount: number;
        distribution: { stars: number; count: number }[];
        items: ReviewItem[];
    };
    initialTheme: Record<string, string>;
    slug: string;
};

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function MenuClient({
    initialCategories,
    initialProducts,
    initialBusinessInfo,
    initialReviews,
    initialTheme,
    slug,
}: MenuClientProps) {
    const [activeCategory, setActiveCategory] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);
    const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
    const [reviewName, setReviewName] = useState("");
    const [reviewPhone, setReviewPhone] = useState("");
    const [reviewComment, setReviewComment] = useState("");
    const [categoryRatings, setCategoryRatings] = useState({ yemek: 0, hizmet: 0, ambiyans: 0, fiyat: 0 });
    const categoryNavRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);

    // Use server-provided data directly
    const CATEGORIES = initialCategories;
    const PRODUCTS = initialProducts;
    const BUSINESS_INFO = initialBusinessInfo;
    const REVIEWS = initialReviews;
    const T = initialTheme;
    const [userReviews, setUserReviews] = useState<ReviewItem[]>([]);


    // Search Logic
    const searchResults = searchQuery
        ? PRODUCTS.filter(
            (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    // Custom smooth scroll (slower) with onComplete callback
    const smoothScrollTo = (targetY: number, onComplete?: () => void) => {
        const startY = window.scrollY;
        const diff = targetY - startY;
        if (Math.abs(diff) < 2) {
            onComplete?.();
            return;
        }
        const duration = Math.min(Math.abs(diff) * 1.5, 1500);
        let start: number | null = null;
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const ease = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            window.scrollTo(0, startY + diff * ease);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                onComplete?.();
            }
        };
        requestAnimationFrame(step);
    };

    // Center a category button in the nav bar
    const centerNavButton = (categoryId: string) => {
        const nav = categoryNavRef.current;
        if (nav && categoryId) {
            const btn = nav.querySelector(`[data-cat="${categoryId}"]`) as HTMLElement;
            if (btn) {
                const navRect = nav.getBoundingClientRect();
                const btnRect = btn.getBoundingClientRect();
                const scrollLeft = btn.offsetLeft - navRect.width / 2 + btnRect.width / 2;
                nav.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
        }
        if (!categoryId) {
            nav?.scrollTo({ left: 0, behavior: "smooth" });
        }
    };

    const scrollToCategory = (categoryId: string) => {
        // Skip if already at this category
        if (activeCategory === categoryId) return;

        isScrollingRef.current = true;
        setActiveCategory(categoryId);
        centerNavButton(categoryId);

        // Scroll page to category
        const section = document.getElementById(categoryId);
        if (section) {
            const heading = section.querySelector("h2");
            const target = heading || section;
            const rect = target.getBoundingClientRect();
            const stickyHeight = 100;
            const gap = 15;
            const scrollPosition = rect.top + window.scrollY - stickyHeight - gap;
            smoothScrollTo(scrollPosition, () => {
                // Re-enable observer after scroll completes
                setTimeout(() => { isScrollingRef.current = false; }, 100);
            });
        } else {
            isScrollingRef.current = false;
        }
    };

    // Scroll spy: update active category based on visible section
    useEffect(() => {
        const sectionIds = CATEGORIES.map((c) => c.id);
        const observers: IntersectionObserver[] = [];

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    if (isScrollingRef.current) return;
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveCategory(id);
                            centerNavButton(id);
                        }
                    });
                },
                { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
            );
            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, [CATEGORIES]);

    // Show/hide scroll-to-top button + reset active at top
    useEffect(() => {
        const handleScroll = () => {
            if (isScrollingRef.current) return;
            const scrollY = window.scrollY;
            setShowScrollTop(scrollY > 400);
            if (scrollY < 200) {
                setActiveCategory("");
                centerNavButton("");
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 2);
        }, 5000);
        return () => clearInterval(timer);
    }, []);



    const getShadow = (s: string) => { switch (s) { case 'none': return 'none'; case 'sm': return '0 1px 2px 0 rgba(0,0,0,0.05)'; case 'md': return '0 4px 6px -1px rgba(0,0,0,0.1)'; case 'lg': return '0 10px 15px -3px rgba(0,0,0,0.1)'; case 'xl': return '0 20px 25px -5px rgba(0,0,0,0.1)'; default: return '0 1px 2px 0 rgba(0,0,0,0.05)'; } };

    // Language splash screen
    const [showLangSplash, setShowLangSplash] = useState(true);
    const [splashFading, setSplashFading] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(`qrlex-lang-${slug}`);
        if (saved) setShowLangSplash(false);
    }, [slug]);

    const selectLanguage = (lang: string) => {
        localStorage.setItem(`qrlex-lang-${slug}`, lang);
        setSplashFading(true);
        setTimeout(() => setShowLangSplash(false), 400);
    };

    const languages = [
        { code: "tr", flag: "🇹🇷", name: "Türkçe" },
        { code: "en", flag: "🇬🇧", name: "English" },
        { code: "de", flag: "🇩🇪", name: "Deutsch" },
        { code: "fr", flag: "🇫🇷", name: "Français" },
        { code: "ar", flag: "🇸🇦", name: "العربية" },
        { code: "ru", flag: "🇷🇺", name: "Русский" },
    ];

    return (
        <>
            {/* Language Selection Splash */}
            {showLangSplash && (
                <div
                    className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-400 ${splashFading ? 'opacity-0' : 'opacity-100'}`}
                    style={{ backgroundColor: T.pageBg, fontFamily: T.fontFamily }}
                >
                    {/* Restaurant Logo/Name */}
                    <div className="mb-8 text-center">
                        {BUSINESS_INFO.image ? (
                            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg">
                                <img src={BUSINESS_INFO.image} alt={BUSINESS_INFO.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <span className="text-3xl text-white font-bold">{BUSINESS_INFO.name.charAt(0)}</span>
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-gray-900">{BUSINESS_INFO.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">Dil Seçin / Select Language</p>
                    </div>

                    {/* Language Grid */}
                    <div className="grid grid-cols-2 gap-3 px-8 w-full max-w-sm">
                        {languages.map((lang, i) => (
                            <button
                                key={lang.code}
                                onClick={() => selectLanguage(lang.code)}
                                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                                style={{ animationDelay: `${i * 60}ms`, animation: 'fadeInUp 0.4s ease-out both' }}
                            >
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="text-sm font-semibold text-gray-800">{lang.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Powered by */}
                    <p className="absolute bottom-6 text-[11px] text-gray-400 font-medium tracking-wider">
                        Powered by <span className="font-bold">QRlex</span>
                    </p>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(12px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}} />
                </div>
            )}

            <div className="min-h-screen pb-20 overflow-x-clip" style={{ backgroundColor: T.pageBg, fontFamily: T.fontFamily }}>
                {/* Custom Header */}
                <div className="h-[60px] bg-white flex items-center justify-between px-4 shadow-sm">
                    {/* Left: Info Icon + Name */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsProfileOpen(true)} className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
                            <Info size={20} />
                        </button>
                        <span className="font-bold text-lg text-gray-900">{BUSINESS_INFO.name || "Yükleniyor..."}</span>
                    </div>

                    {/* Right: Star Icon */}
                    <button onClick={() => setIsReviewsOpen(true)} className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
                        <Star size={20} />
                    </button>
                </div>

                {/* Hero Slider (JS Based) */}
                <div className="w-full h-[350px] relative overflow-hidden bg-gray-100">
                    <div
                        className="flex h-full w-full transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {/* Slide 1 */}
                        <div className="min-w-full h-full relative flex-shrink-0">
                            <div className="absolute inset-0 p-[30px] flex flex-col justify-center text-gray-900">
                                <h3 className="text-xl font-medium mb-2 opacity-80">Özel Tarifler</h3>
                                <h1 className="text-4xl font-bold leading-tight">Lezzet Şöleni Başlıyor</h1>
                            </div>
                        </div>
                        {/* Slide 2 */}
                        <div className="min-w-full h-full relative flex-shrink-0">
                            <div className="absolute inset-0 p-[30px] flex flex-col justify-center text-gray-900">
                                <h3 className="text-xl font-medium mb-2 opacity-80">Taze & Doğal</h3>
                                <h1 className="text-4xl font-bold leading-tight">Mevsimin En İyileri</h1>
                            </div>
                        </div>
                    </div>

                    {/* Slider Dots */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        <button
                            onClick={() => setCurrentSlide(0)}
                            className={`w-2 h-2 rounded-full transition-all ${currentSlide === 0 ? 'bg-black w-6' : 'bg-gray-400'}`}
                        />
                        <button
                            onClick={() => setCurrentSlide(1)}
                            className={`w-2 h-2 rounded-full transition-all ${currentSlide === 1 ? 'bg-black w-6' : 'bg-gray-400'}`}
                        />
                    </div>
                </div>

                {/* Search Trigger */}
                <div className="px-4 pt-4 pb-2 sticky top-0 z-20" style={{ backgroundColor: T.pageBg }}>
                    <div
                        onClick={() => setIsSearchOpen(true)}
                        className="w-full h-10 rounded-lg flex items-center px-3 gap-2 cursor-pointer shadow-sm"
                        style={{ backgroundColor: T.searchBg, border: `1px solid ${T.searchBorder}`, color: T.searchText }}
                    >
                        <Search size={18} />
                        <span className="text-sm">Ürün ara...</span>
                    </div>
                </div>

                {/* Sticky Category Navbar */}
                <div ref={categoryNavRef} className="sticky top-[56px] z-10 overflow-x-auto no-scrollbar py-3 px-4 flex gap-2" style={{ backgroundColor: T.pageBg }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            data-cat={cat.id}
                            onClick={() => scrollToCategory(cat.id)}
                            className="whitespace-nowrap text-sm font-medium transition-all px-4 py-2"
                            style={{
                                backgroundColor: activeCategory === cat.id ? T.categoryActiveBg : T.categoryInactiveBg,
                                color: activeCategory === cat.id ? T.categoryActiveText : T.categoryInactiveText,
                                borderRadius: `${T.categoryRadius}px`,
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product List (Grouped by Category) */}
                <div className="pb-20">
                    {CATEGORIES.map((cat) => {
                        const products =
                            cat.id === "populer"
                                ? PRODUCTS.filter((p) => p.isPopular)
                                : PRODUCTS.filter((p) => p.categoryId === cat.id);

                        if (products.length === 0) return null;

                        return (
                            <div key={cat.id} id={cat.id}>
                                {/* Category Header */}
                                <div className="px-4 pt-6 pb-3">
                                    <h2 style={{ color: T.categoryTitleColor, fontSize: `${T.categoryTitleSize}px`, fontWeight: T.categoryTitleWeight }}>{cat.name}</h2>
                                </div>

                                <div className="px-4 space-y-4">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => setSelectedProduct(product)}
                                            className="p-3 flex gap-4 h-32 active:scale-[0.98] transition-transform cursor-pointer"
                                            style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}
                                        >
                                            {/* Image */}
                                            <div className="relative w-24 h-full shrink-0 overflow-hidden" style={{ borderRadius: `${T.cardImageRadius}px` }}>
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-400 text-2xl">🍽️</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h3 className="line-clamp-1" style={{ color: T.productNameColor, fontSize: `${T.productNameSize}px`, fontWeight: T.productNameWeight }}>
                                                        {product.name}
                                                    </h3>
                                                    <p className="mt-1 line-clamp-2" style={{ color: T.productDescColor, fontSize: `${T.productDescSize}px` }}>
                                                        {product.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span style={{ color: T.priceColor, fontSize: `${T.priceSize}px`, fontWeight: T.priceWeight }}>
                                                        {product.price} TL
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Business Profile Overlay */}
                {isProfileOpen && (
                    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ width: '100vw', height: '100dvh' }}>
                        {/* Business Image Section */}
                        <div className="relative w-full shrink-0" style={{ height: '45%' }}>
                            {BUSINESS_INFO.image ? (
                                <img
                                    src={BUSINESS_INFO.image}
                                    alt={BUSINESS_INFO.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            {/* Back Button */}
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            {/* Business Name on Image */}
                            <div className="absolute bottom-8 left-5 right-5">
                                <h1 className="text-3xl font-bold text-white drop-shadow-lg">{BUSINESS_INFO.name}</h1>
                            </div>
                        </div>

                        {/* Detail Card */}
                        <div
                            className="flex-1 bg-white overflow-y-auto -mt-6 relative"
                            style={{ borderRadius: '25px 25px 0 0' }}
                        >
                            <div className="px-5 pt-7 pb-10">
                                {/* About */}
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">{BUSINESS_INFO.description}</p>

                                {/* Contact Info */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <MapPin size={18} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Adres</p>
                                            <p className="text-sm font-medium text-gray-900">{BUSINESS_INFO.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <Phone size={18} className="text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Telefon</p>
                                            <p className="text-sm font-medium text-gray-900">{BUSINESS_INFO.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <Mail size={18} className="text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">E-posta</p>
                                            <p className="text-sm font-medium text-gray-900">{BUSINESS_INFO.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                                <Globe size={18} className="text-sky-500" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Web</p>
                                                <p className="text-sm font-medium text-gray-900">{BUSINESS_INFO.website}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                            <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                                <Instagram size={18} className="text-pink-500" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Instagram</p>
                                                <p className="text-sm font-medium text-gray-900">{BUSINESS_INFO.instagram}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Working Hours */}
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 mb-3">🕐 Çalışma Saatleri</h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="space-y-2.5">
                                            {BUSINESS_INFO.workingHours.map((item, i) => {
                                                const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long' });
                                                const isToday = item.day.toLowerCase() === today.toLowerCase();
                                                return (
                                                    <div key={i} className={`flex items-center justify-between py-1 ${isToday ? '' : ''}`}>
                                                        <span className={`text-sm ${isToday ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                            {item.day}
                                                            {isToday && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Bugün</span>}
                                                        </span>
                                                        <span className={`text-sm ${isToday ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{item.hours}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Overlay */}
                {isReviewsOpen && (
                    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ width: '100vw', height: '100dvh' }}>
                        {/* Header Section */}
                        <div className="relative w-full shrink-0 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500" style={{ height: '45%' }}>
                            {/* Back Button */}
                            <button
                                onClick={() => setIsReviewsOpen(false)}
                                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors z-10"
                            >
                                <ChevronLeft size={22} />
                            </button>

                            {/* Rating Summary */}
                            <div className="h-full flex flex-col items-center justify-center px-6">
                                <div className="text-7xl font-bold text-white drop-shadow-md">{REVIEWS.average}</div>
                                <div className="flex gap-1 mt-2 mb-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            size={22}
                                            className={s <= Math.round(REVIEWS.average) ? 'text-white fill-white' : 'text-white/40'}
                                        />
                                    ))}
                                </div>
                                <p className="text-white/90 text-sm font-medium">{REVIEWS.totalCount} değerlendirme</p>

                                {/* Star Distribution Bars */}
                                <div className="w-full max-w-[240px] mt-5 space-y-1.5">
                                    {REVIEWS.distribution.map((d) => (
                                        <div key={d.stars} className="flex items-center gap-2">
                                            <span className="text-xs text-white/80 w-3 text-right">{d.stars}</span>
                                            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-white rounded-full transition-all"
                                                    style={{ width: `${REVIEWS.totalCount > 0 ? (d.count / REVIEWS.totalCount) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-white/70 w-6">{d.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div
                            className="flex-1 bg-white overflow-y-auto -mt-6 relative"
                            style={{ borderRadius: '25px 25px 0 0' }}
                        >
                            <div className="px-5 pt-7 pb-24">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <MessageCircle size={20} className="text-gray-400" />
                                        Yorumlar
                                    </h3>
                                    <span className="text-sm text-gray-400">{userReviews.length + REVIEWS.items.length} yorum</span>
                                </div>

                                <div className="space-y-4">
                                    {[...userReviews, ...REVIEWS.items].map((review) => (
                                        <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            {/* Review Header */}
                                            <div className="flex items-center justify-between mb-2.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-bold">
                                                        {review.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                                                        <p className="text-[11px] text-gray-400">{review.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star
                                                            key={s}
                                                            size={14}
                                                            className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Review Comment */}
                                            <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>
                                            {/* Helpful */}
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <ThumbsUp size={14} />
                                                <span className="text-xs">{review.helpful} kişi faydalı buldu</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating Write Review Button */}
                        <button
                            onClick={() => setIsWriteReviewOpen(true)}
                            className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black text-white font-semibold px-6 py-3.5 rounded-full shadow-xl hover:bg-gray-800 transition-all hover:shadow-2xl"
                            style={{ bottom: 20 }}
                        >
                            <Send size={16} />
                            Yorum Yaz
                        </button>
                    </div>
                )}

                {/* Write Review Popup */}
                {isWriteReviewOpen && (
                    <div className="fixed inset-0 z-[60] bg-white flex flex-col" style={{ width: '100vw', height: '100dvh' }}>
                        {/* Category Ratings Section */}
                        <div className="relative w-full shrink-0 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500" style={{ height: '45%' }}>
                            {/* Back Button */}
                            <button
                                onClick={() => {
                                    setIsWriteReviewOpen(false);
                                    setCategoryRatings({ yemek: 0, hizmet: 0, ambiyans: 0, fiyat: 0 });
                                    setReviewName("");
                                    setReviewPhone("");
                                    setReviewComment("");
                                }}
                                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors z-10"
                            >
                                <ChevronLeft size={22} />
                            </button>

                            <div className="h-full flex flex-col items-center justify-center px-5">
                                <h2 className="text-2xl font-bold text-white drop-shadow-md mb-1">Bizi Değerlendirin</h2>
                                <p className="text-white/80 text-sm mb-5">Her kategoriyi ayrı puanlayın</p>

                                <div className="w-full max-w-[320px] space-y-3">
                                    {[
                                        { key: 'yemek' as const, label: 'Yemek Kalitesi', icon: <Utensils size={18} /> },
                                        { key: 'hizmet' as const, label: 'Hizmet', icon: <HandHeart size={18} /> },
                                        { key: 'ambiyans' as const, label: 'Ambiyans', icon: <Music size={18} /> },
                                        { key: 'fiyat' as const, label: 'Fiyat / Performans', icon: <BadgeDollarSign size={18} /> },
                                    ].map((cat) => (
                                        <div key={cat.key} className="flex items-center justify-between bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-white/80">{cat.icon}</span>
                                                <span className="text-white text-sm font-medium">{cat.label}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setCategoryRatings((prev) => ({ ...prev, [cat.key]: s }))}
                                                        className="transition-all hover:scale-110 active:scale-90"
                                                    >
                                                        <Star
                                                            size={20}
                                                            className={s <= categoryRatings[cat.key] ? 'text-white fill-white' : 'text-white/30'}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div
                            className="flex-1 bg-white overflow-y-auto -mt-6 relative"
                            style={{ borderRadius: '25px 25px 0 0' }}
                        >
                            <div className="px-5 pt-7 pb-10">
                                {/* Ad Soyad */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">Ad Soyad</p>
                                    <input
                                        type="text"
                                        placeholder="Adınızı ve soyadınızı girin..."
                                        value={reviewName}
                                        onChange={(e) => setReviewName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
                                    />
                                </div>

                                {/* Telefon */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">Telefon</p>
                                    <input
                                        type="tel"
                                        placeholder="0 (5__) ___ __ __"
                                        value={reviewPhone}
                                        onChange={(e) => setReviewPhone(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
                                    />
                                </div>

                                {/* Mesaj */}
                                <div className="mb-6">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">Mesaj</p>
                                    <textarea
                                        placeholder="Deneyiminizi paylaşın..."
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        rows={4}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={() => {
                                        const avgRating = Math.round((categoryRatings.yemek + categoryRatings.hizmet + categoryRatings.ambiyans + categoryRatings.fiyat) / 4);
                                        if (avgRating > 0 && reviewName.trim() && reviewComment.trim()) {
                                            const newReview = {
                                                id: `user-${Date.now()}`,
                                                name: reviewName.trim(),
                                                date: "Az önce",
                                                rating: avgRating,
                                                comment: reviewComment.trim(),
                                                helpful: 0,
                                            };
                                            setUserReviews((prev) => [newReview, ...prev]);
                                            setIsWriteReviewOpen(false);
                                            setReviewName("");
                                            setReviewPhone("");
                                            setReviewComment("");
                                            setCategoryRatings({ yemek: 0, hizmet: 0, ambiyans: 0, fiyat: 0 });
                                        }
                                    }}
                                    disabled={Object.values(categoryRatings).some((v) => v === 0) || !reviewName.trim() || !reviewComment.trim()}
                                    className={`w-full py-4 rounded-xl text-base font-semibold transition-colors flex items-center justify-center gap-2 ${Object.values(categoryRatings).every((v) => v > 0) && reviewName.trim() && reviewComment.trim()
                                        ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send size={16} />
                                    Değerlendirmeyi Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Detail Overlay */}
                {selectedProduct && (
                    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ width: '100vw', height: '100dvh' }}>
                        {/* Product Image Section */}
                        <div className="relative w-full shrink-0" style={{ height: '45%' }}>
                            {selectedProduct.image ? (
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                    <span className="text-gray-400 text-6xl">🍽️</span>
                                </div>
                            )}
                            {/* Back Button */}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                            >
                                <ChevronLeft size={22} />
                            </button>
                        </div>

                        {/* Detail Card */}
                        <div
                            className="flex-1 bg-white overflow-y-auto -mt-6 relative"
                            style={{ borderRadius: '25px 25px 0 0' }}
                        >
                            <div className="px-5 pt-7 pb-10">
                                {/* Product Name & Price */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedProduct.name}</h2>
                                    <span className="text-2xl font-bold text-black whitespace-nowrap">{selectedProduct.price} TL</span>
                                </div>

                                {/* Description */}
                                <p className="text-gray-500 text-sm leading-relaxed mb-5">{selectedProduct.description}</p>

                                {/* Prep Time & Calories */}
                                <div className="flex gap-3 mb-6">
                                    <div className="flex-1 bg-gray-50 rounded-xl p-3.5 flex items-center gap-3 border border-gray-100">
                                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                            <Clock size={18} className="text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Hazırlanış</p>
                                            <p className="text-sm font-semibold text-gray-900">{selectedProduct.prepTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-xl p-3.5 flex items-center gap-3 border border-gray-100">
                                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <Flame size={18} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Kalori</p>
                                            <p className="text-sm font-semibold text-gray-900">{selectedProduct.calories}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div className="mb-6">
                                    <h3 className="text-base font-bold text-gray-900 mb-3">📋 İçindekiler</h3>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProduct.ingredients.map((item, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Allergen Warning */}
                                {selectedProduct.allergens.length > 0 && (
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 mb-3">⚠️ Alerjen Uyarısı</h3>
                                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-amber-700 mb-2 font-medium">Bu ürün aşağıdaki alerjenleri içerir:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedProduct.allergens.map((allergen, i) => (
                                                            <span
                                                                key={i}
                                                                className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full"
                                                            >
                                                                {allergen}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Popup */}
                {isSearchOpen && (
                    <div className="fixed inset-0 z-50 bg-white flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <Search size={20} className="text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Ürün ara..."
                                className="flex-1 outline-none text-lg text-black placeholder:text-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="p-2">
                                <X size={24} className="text-gray-800" />
                            </button>
                        </div>
                        <div className="mt-4 flex-1 overflow-y-auto space-y-3">
                            {!searchQuery && (
                                <p className="text-gray-400 text-center mt-10">
                                    Aramak istediğiniz ürünü yazın...
                                </p>
                            )}

                            {searchQuery && searchResults.length === 0 && (
                                <p className="text-gray-400 text-center mt-10">
                                    Sonuç bulunamadı.
                                </p>
                            )}

                            {searchQuery &&
                                searchResults.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-gray-50 rounded-xl p-3 flex gap-3 h-24"
                                    >
                                        <div className="relative w-20 h-full shrink-0">
                                            <div className="w-full h-full bg-gray-200 rounded-lg" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                    {product.description}
                                                </p>
                                            </div>
                                            <div className="font-bold text-black">
                                                {product.price} TL
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={() => {
                            smoothScrollTo(0);
                            setActiveCategory("");
                            categoryNavRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                        }}
                        className="fixed z-30 w-[50px] h-[50px] rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all"
                        style={{ bottom: 10, right: 10 }}
                    >
                        <ChevronUp size={24} />
                    </button>
                )}
            </div>
        </>
    );
}
