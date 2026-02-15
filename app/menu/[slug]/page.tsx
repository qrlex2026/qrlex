"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Info, Star, Search, X, ChevronUp, Clock, Flame, AlertTriangle, ChevronLeft, MapPin, Phone, Globe, Instagram, Mail, ThumbsUp, MessageCircle, Send, Utensils, HandHeart, Music, BadgeDollarSign } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Mock Data ---
const CATEGORIES = [
    { id: "populer", name: "Popüler" },
    { id: "burgerler", name: "Burgerler" },
    { id: "pizzalar", name: "Pizzalar" },
    { id: "salatalar", name: "Salatalar" },
    { id: "baslangiclar", name: "Başlangıçlar" },
    { id: "icecekler", name: "İçecekler" },
    { id: "tatlilar", name: "Tatlılar" },
];

const BUSINESS_INFO = {
    name: "Resital Lounge",
    description: "Modern ve şık atmosferiyle Resital Lounge, taze malzemeler ve özenle hazırlanan tariflerle unutulmaz bir yemek deneyimi sunuyor. Ailece veya dostlarınızla keyifli vakit geçirebileceğiniz mekânımızda sizi ağırlamaktan mutluluk duyarız.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    address: "Atatürk Mah. Cumhuriyet Cad. No:42, Gebze / Kocaeli",
    phone: "+90 262 555 00 42",
    email: "info@resitallounge.com",
    website: "www.resitallounge.com",
    instagram: "@resitallounge",
    workingHours: [
        { day: "Pazartesi", hours: "11:00 - 23:00" },
        { day: "Salı", hours: "11:00 - 23:00" },
        { day: "Çarşamba", hours: "11:00 - 23:00" },
        { day: "Perşembe", hours: "11:00 - 23:00" },
        { day: "Cuma", hours: "11:00 - 00:00" },
        { day: "Cumartesi", hours: "10:00 - 00:00" },
        { day: "Pazar", hours: "10:00 - 23:00" },
    ],
};

const REVIEWS = {
    average: 4.6,
    totalCount: 128,
    distribution: [
        { stars: 5, count: 78 },
        { stars: 4, count: 32 },
        { stars: 3, count: 12 },
        { stars: 2, count: 4 },
        { stars: 1, count: 2 },
    ],
    items: [
        {
            id: "r1",
            name: "Ahmet Y.",
            date: "2 gün önce",
            rating: 5,
            comment: "Truffle Mushroom burger gerçekten müthişti! Trüf sosunun yoğunluğu ve etin pişirme derecesi kusursuzdu. Kesinlikle tekrar geleceğim.",
            helpful: 12,
        },
        {
            id: "r2",
            name: "Elif K.",
            date: "1 hafta önce",
            rating: 5,
            comment: "Ambiyans çok başarılı, personel çok ilgili. San Sebastian cheesecake hayatımda yediğim en iyisiydi!",
            helpful: 8,
        },
        {
            id: "r3",
            name: "Mehmet A.",
            date: "2 hafta önce",
            rating: 4,
            comment: "Yemekler lezzetli, fiyatlar biraz yüksek ama kalite göz önüne alındığında makul. Margherita pizza tavsiye.",
            helpful: 5,
        },
        {
            id: "r4",
            name: "Zeynep D.",
            date: "3 hafta önce",
            rating: 5,
            comment: "Arkadaşlarla mükemmel bir akşam geçirdik. Ev yapımı limonata şiddetle tavsiye ederim, gerçekten taze!",
            helpful: 15,
        },
        {
            id: "r5",
            name: "Can B.",
            date: "1 ay önce",
            rating: 4,
            comment: "Burgerler çok iyi, özellikle BBQ Bacon. Servis biraz yavaştı ama yoğun saatlerdeydi, anlaşılır.",
            helpful: 3,
        },
        {
            id: "r6",
            name: "Seda T.",
            date: "1 ay önce",
            rating: 3,
            comment: "Yemekler güzeldi fakat bekleme süresi uzundu. Mekan olarak çok şık, tekrar denemek isterim.",
            helpful: 2,
        },
    ],
};

type Product = {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isPopular: boolean;
    prepTime: string;
    calories: string;
    ingredients: string[];
    allergens: string[];
};

const PRODUCTS: Product[] = [
    {
        id: "1",
        categoryId: "burgerler",
        name: "Classic Cheese",
        description: "120g dana köfte, cheddar peyniri, özel sos, turşu.",
        price: 320,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
        prepTime: "15-20 dk",
        calories: "650 kcal",
        ingredients: ["Dana köfte (120g)", "Cheddar peyniri", "Özel burger sosu", "Turşu", "Marul", "Domates", "Brioche ekmeği"],
        allergens: ["Gluten", "Süt ürünleri", "Hardal"],
    },
    {
        id: "2",
        categoryId: "burgerler",
        name: "Truffle Mushroom",
        description: "Trüf mantarlı mayonez, karamelize soğan, swiss peyniri.",
        price: 380,
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
        prepTime: "20-25 dk",
        calories: "720 kcal",
        ingredients: ["Dana köfte (150g)", "Trüf mantarlı mayonez", "Karamelize soğan", "Swiss peyniri", "Roka", "Brioche ekmeği"],
        allergens: ["Gluten", "Süt ürünleri", "Yumurta"],
    },
    {
        id: "5",
        categoryId: "burgerler",
        name: "BBQ Bacon",
        description: "Dana bacon, BBQ sos, çıtır soğan halkaları, cheddar.",
        price: 360,
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=80",
        isPopular: false,
        prepTime: "18-22 dk",
        calories: "780 kcal",
        ingredients: ["Dana köfte (150g)", "Dana bacon", "BBQ sos", "Çıtır soğan halkaları", "Cheddar peyniri", "Brioche ekmeği"],
        allergens: ["Gluten", "Süt ürünleri"],
    },
    {
        id: "3",
        categoryId: "pizzalar",
        name: "Margherita",
        description: "San Marzano domates sosu, mozzarella, taze fesleğen.",
        price: 290,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
        prepTime: "12-15 dk",
        calories: "520 kcal",
        ingredients: ["Pizza hamuru", "San Marzano domates sosu", "Mozzarella peyniri", "Taze fesleğen", "Zeytinyağı"],
        allergens: ["Gluten", "Süt ürünleri"],
    },
    {
        id: "6",
        categoryId: "pizzalar",
        name: "Pepperoni",
        description: "Baharatlı sucuk dilimleri, mozzarella, domates sosu.",
        price: 330,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
        prepTime: "12-15 dk",
        calories: "580 kcal",
        ingredients: ["Pizza hamuru", "Domates sosu", "Mozzarella", "Pepperoni sucuk dilimleri", "Kekik"],
        allergens: ["Gluten", "Süt ürünleri"],
    },
    {
        id: "7",
        categoryId: "pizzalar",
        name: "Dört Peynirli",
        description: "Mozzarella, gorgonzola, parmesan, ricotta.",
        price: 350,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
        isPopular: false,
        prepTime: "12-15 dk",
        calories: "620 kcal",
        ingredients: ["Pizza hamuru", "Mozzarella", "Gorgonzola", "Parmesan", "Ricotta", "Bal"],
        allergens: ["Gluten", "Süt ürünleri"],
    },
    {
        id: "4",
        categoryId: "icecekler",
        name: "Coca-Cola Zero",
        description: "330ml kutu.",
        price: 60,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80",
        isPopular: false,
        prepTime: "1 dk",
        calories: "0 kcal",
        ingredients: ["Karbonatlı su", "Renklendirici (E150d)", "Aspartam", "Fosforik asit"],
        allergens: [],
    },
    {
        id: "8",
        categoryId: "icecekler",
        name: "Ev Yapımı Limonata",
        description: "Taze nane ile.",
        price: 80,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
        prepTime: "3-5 dk",
        calories: "120 kcal",
        ingredients: ["Taze limon suyu", "Şeker", "Su", "Taze nane yaprakları", "Buz"],
        allergens: [],
    },
    {
        id: "9",
        categoryId: "icecekler",
        name: "Ayran",
        description: "300ml şişe, bol köpüklü.",
        price: 40,
        image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=500&q=80",
        isPopular: false,
        prepTime: "1 dk",
        calories: "75 kcal",
        ingredients: ["Yoğurt", "Su", "Tuz"],
        allergens: ["Süt ürünleri"],
    },
    {
        id: "10",
        categoryId: "tatlilar",
        name: "San Sebastian Cheesecake",
        description: "Belçika çikolatalı sos ile.",
        price: 240,
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
        prepTime: "5 dk",
        calories: "450 kcal",
        ingredients: ["Krem peynir", "Yumurta", "Krema", "Şeker", "Un", "Belçika çikolatası"],
        allergens: ["Gluten", "Süt ürünleri", "Yumurta"],
    },
    {
        id: "11",
        categoryId: "tatlilar",
        name: "Çikolatalı Sufle",
        description: "İçi akışkan, yanında dondurma ile.",
        price: 250,
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&q=80",
        isPopular: false,
        prepTime: "15-18 dk",
        calories: "480 kcal",
        ingredients: ["Bitter çikolata", "Tereyağı", "Yumurta", "Şeker", "Un", "Vanilya dondurması"],
        allergens: ["Gluten", "Süt ürünleri", "Yumurta", "Soya"],
    },
    {
        id: "12",
        categoryId: "salatalar",
        name: "Sezar Salata",
        description: "Marul, parmesan, kruton, sezar sos.",
        price: 180,
        image: "",
        isPopular: false,
        prepTime: "8-10 dk",
        calories: "320 kcal",
        ingredients: ["Marul", "Parmesan peyniri", "Kruton", "Sezar sos", "Zeytinyağı"],
        allergens: ["Gluten", "Süt ürünleri", "Yumurta", "Balık (ançüez)"],
    },
    {
        id: "13",
        categoryId: "salatalar",
        name: "Akdeniz Salatası",
        description: "Domates, salatalık, zeytin, beyaz peynir, zeytinyağı.",
        price: 160,
        image: "",
        isPopular: true,
        prepTime: "5-8 dk",
        calories: "220 kcal",
        ingredients: ["Domates", "Salatalık", "Siyah zeytin", "Beyaz peynir", "Zeytinyağı", "Limon"],
        allergens: ["Süt ürünleri"],
    },
    {
        id: "14",
        categoryId: "baslangiclar",
        name: "Çıtır Soğan Halkaları",
        description: "Özel baharatlı, ranch sos ile.",
        price: 120,
        image: "",
        isPopular: false,
        prepTime: "8-10 dk",
        calories: "380 kcal",
        ingredients: ["Soğan", "Un", "Mısır unu", "Özel baharat karışımı", "Ranch sos"],
        allergens: ["Gluten", "Süt ürünleri", "Yumurta"],
    },
    {
        id: "15",
        categoryId: "baslangiclar",
        name: "Kanat Tabağı",
        description: "8 adet acı soslu tavuk kanat.",
        price: 200,
        image: "",
        isPopular: true,
        prepTime: "15-20 dk",
        calories: "520 kcal",
        ingredients: ["Tavuk kanat (8 adet)", "Acı sos", "Tereyağı", "Sarımsak", "Havuç & kereviz çubukları"],
        allergens: ["Süt ürünleri"],
    },
];

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function MenuPage({ params }: { params: { slug: string } }) {
    const [showWelcome, setShowWelcome] = useState(true);
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
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
    const [userReviews, setUserReviews] = useState<typeof REVIEWS.items>([]);
    const categoryNavRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);

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
    }, []);

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

    return (
        <>
            {/* Welcome Screen */}
            {showWelcome && (
                <div className="fixed inset-0 z-[100] flex flex-col" style={{ width: '100vw', height: '100vh' }}>
                    {/* Video Background */}
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                    </video>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
                        {/* Logo */}
                        <div className="w-[90px] h-[90px] rounded-2xl bg-black flex items-center justify-center mb-5 shadow-2xl">
                            <span className="text-white text-4xl font-bold">R</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl font-bold text-white text-center mb-2 drop-shadow-lg">Resital Lounge</h1>

                        {/* Description */}
                        <p className="text-white/70 text-sm text-center max-w-[280px] leading-relaxed">
                            Eşsiz lezzetler ve unutulmaz anlar için sizi ağırlamaktan mutluluk duyuyoruz.
                        </p>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="relative z-10 pb-8 px-6">
                        <div className="flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="flex-1 py-4 text-white font-semibold text-sm text-center hover:bg-white/10 transition-colors rounded-l-2xl"
                            >
                                Menü
                            </button>
                            <div className="w-px h-8 bg-white/20" />
                            <button onClick={() => setIsLanguageOpen(true)} className="flex-1 py-4 text-white/60 font-medium text-sm text-center hover:bg-white/10 transition-colors">
                                Dil
                            </button>
                            <div className="w-px h-8 bg-white/20" />
                            <button className="flex-1 py-4 text-white/60 font-medium text-sm text-center hover:bg-white/10 transition-colors rounded-r-2xl">
                                Kampanyalar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Language Selection Popup */}
            {isLanguageOpen && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center" style={{ width: '100vw', height: '100vh' }}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLanguageOpen(false)} />
                    <div className="relative z-10 w-full max-w-md bg-white rounded-t-3xl px-5 pt-6 pb-8 animate-in slide-in-from-bottom">
                        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Dil Seçin</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
                                { code: 'en', label: 'English', flag: '🇬🇧' },
                                { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                                { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                                { code: 'ru', label: 'Русский', flag: '🇷🇺' },
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        // Set Google Translate cookie
                                        document.cookie = `googtrans=/tr/${lang.code}; path=/; domain=${window.location.hostname}`;
                                        document.cookie = `googtrans=/tr/${lang.code}; path=/`;
                                        setIsLanguageOpen(false);
                                        window.location.reload();
                                    }}
                                    className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5 transition-colors"
                                >
                                    <span className="text-2xl">{lang.flag}</span>
                                    <span className="text-sm font-medium text-gray-800">{lang.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gray-50 pb-20 overflow-x-clip font-sans">
                {/* Custom Header */}
                <div className="h-[60px] bg-white flex items-center justify-between px-4 shadow-sm">
                    {/* Left: Info Icon + Name */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsProfileOpen(true)} className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
                            <Info size={20} />
                        </button>
                        <span className="font-bold text-lg text-gray-900">Resital Lounge</span>
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
                <div className="px-4 pt-4 pb-2 sticky top-0 z-20 bg-gray-50">
                    <div
                        onClick={() => setIsSearchOpen(true)}
                        className="w-full bg-gray-100 h-10 rounded-lg flex items-center px-3 text-gray-500 gap-2 cursor-pointer border border-gray-200 shadow-sm"
                    >
                        <Search size={18} />
                        <span className="text-sm">Ürün ara...</span>
                    </div>
                </div>

                {/* Sticky Category Navbar */}
                <div ref={categoryNavRef} className="sticky top-[56px] z-10 bg-gray-50 overflow-x-auto no-scrollbar py-3 px-4 flex gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            data-cat={cat.id}
                            onClick={() => scrollToCategory(cat.id)}
                            className={cn(
                                "whitespace-nowrap text-sm font-medium transition-all px-4 py-2 rounded-full",
                                activeCategory === cat.id
                                    ? "bg-black text-white"
                                    : "bg-gray-200 text-gray-700"
                            )}
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
                                    <h2 className="text-2xl font-bold text-gray-900">{cat.name}</h2>
                                </div>

                                <div className="px-4 space-y-4">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => setSelectedProduct(product)}
                                            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex gap-4 h-32 active:scale-[0.98] transition-transform cursor-pointer"
                                        >
                                            {/* Image */}
                                            <div className="relative w-24 h-full shrink-0">
                                                <div className="w-full h-full bg-gray-200 rounded-lg" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 line-clamp-1">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="font-bold text-lg text-black">
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
                    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ width: '100vw', height: '100vh' }}>
                        {/* Business Image Section */}
                        <div className="relative w-full shrink-0" style={{ height: '45%' }}>
                            <Image
                                src={BUSINESS_INFO.image}
                                alt={BUSINESS_INFO.name}
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />
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
                    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ width: '100vw', height: '100vh' }}>
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
                                                    style={{ width: `${(d.count / REVIEWS.totalCount) * 100}%` }}
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
                    <div className="fixed inset-0 z-[60] bg-white flex flex-col" style={{ width: '100vw', height: '100vh' }}>
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
                    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ width: '100vw', height: '100vh' }}>
                        {/* Product Image Section */}
                        <div className="relative w-full shrink-0" style={{ height: '45%' }}>
                            {selectedProduct.image ? (
                                <Image
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    fill
                                    className="object-cover"
                                    sizes="100vw"
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
