"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Info, Star, Search, X, ChevronUp } from "lucide-react";
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

const PRODUCTS = [
    {
        id: "1",
        categoryId: "burgerler",
        name: "Classic Cheese",
        description: "120g dana köfte, cheddar peyniri, özel sos, turşu.",
        price: 320,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
    },
    {
        id: "2",
        categoryId: "burgerler",
        name: "Truffle Mushroom",
        description: "Trüf mantarlı mayonez, karamelize soğan, swiss peyniri.",
        price: 380,
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
    },
    {
        id: "5",
        categoryId: "burgerler",
        name: "BBQ Bacon",
        description: "Dana bacon, BBQ sos, çıtır soğan halkaları, cheddar.",
        price: 360,
        image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=80", // reused or new
        isPopular: false,
    },
    {
        id: "3",
        categoryId: "pizzalar",
        name: "Margherita",
        description: "San Marzano domates sosu, mozzarella, taze fesleğen.",
        price: 290,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
    },
    {
        id: "6",
        categoryId: "pizzalar",
        name: "Pepperoni",
        description: "Baharatlı sucuk dilimleri, mozzarella, domates sosu.",
        price: 330,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
    },
    {
        id: "7",
        categoryId: "pizzalar",
        name: "Dört Peynirli",
        description: "Mozzarella, gorgonzola, parmesan, ricotta.",
        price: 350,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
        isPopular: false,
    },
    {
        id: "4",
        categoryId: "icecekler",
        name: "Coca-Cola Zero",
        description: "330ml kutu.",
        price: 60,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80",
        isPopular: false,
    },
    {
        id: "8",
        categoryId: "icecekler",
        name: "Ev Yapımı Limonata",
        description: "Taze nane ile.",
        price: 80,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
    },
    {
        id: "9",
        categoryId: "icecekler",
        name: "Ayran",
        description: "300ml şişe, bol köpüklü.",
        price: 40,
        image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=500&q=80",
        isPopular: false,
    },
    {
        id: "10",
        categoryId: "tatlilar",
        name: "San Sebastian Cheesecake",
        description: "Belçika çikolatalı sos ile.",
        price: 240,
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80",
        isPopular: true,
    },
    {
        id: "11",
        categoryId: "tatlilar",
        name: "Çikolatalı Sufle",
        description: "İçi akışkan, yanında dondurma ile.",
        price: 250,
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&q=80",
        isPopular: false,
    },
    {
        id: "12",
        categoryId: "salatalar",
        name: "Sezar Salata",
        description: "Marul, parmesan, kruton, sezar sos.",
        price: 180,
        image: "",
        isPopular: false,
    },
    {
        id: "13",
        categoryId: "salatalar",
        name: "Akdeniz Salatası",
        description: "Domates, salatalık, zeytin, beyaz peynir, zeytinyağı.",
        price: 160,
        image: "",
        isPopular: true,
    },
    {
        id: "14",
        categoryId: "baslangiclar",
        name: "Çıtır Soğan Halkaları",
        description: "Özel baharatlı, ranch sos ile.",
        price: 120,
        image: "",
        isPopular: false,
    },
    {
        id: "15",
        categoryId: "baslangiclar",
        name: "Kanat Tabağı",
        description: "8 adet acı soslu tavuk kanat.",
        price: 200,
        image: "",
        isPopular: true,
    },
];

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function MenuPage({ params }: { params: { slug: string } }) {
    const [activeCategory, setActiveCategory] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);
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
        <div className="min-h-screen bg-gray-50 pb-20 overflow-x-clip font-sans">
            {/* Custom Header */}
            <div className="h-[60px] bg-white flex items-center justify-between px-4 shadow-sm">
                {/* Left: Info Icon + Name */}
                <div className="flex items-center gap-3">
                    <button className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
                        <Info size={20} />
                    </button>
                    <span className="font-bold text-lg text-gray-900">Resital Lounge</span>
                </div>

                {/* Right: Star Icon */}
                <button className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
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
                                        className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex gap-4 h-32 active:scale-[0.98] transition-transform"
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
    );
}
