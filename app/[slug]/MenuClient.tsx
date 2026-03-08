"use client";

import { useState, useEffect, useRef } from "react";
// Using regular img tags for external URLs
import { Info, Star, Search, X, ChevronUp, Clock, Flame, AlertTriangle, ChevronLeft, ArrowRight, ChevronRight, MapPin, Phone, Globe, Instagram, Mail, ThumbsUp, MessageCircle, Send, Utensils, HandHeart, Music, BadgeDollarSign, Check, Loader2, CalendarDays, Users, Menu, LayoutGrid, LayoutList, Bell, Inbox, User, CigaretteOff, Baby, Car, Wifi, Accessibility, TreePine, Home, PawPrint, Wine, Coffee, Truck, ShoppingBag, Copy, Filter, BellRing, Languages } from "lucide-react";
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
    video: string;
    isPopular: boolean;
    prepTime: string;
    calories: string;
    ingredients: string[];
    allergens: string[];
};


type MenuClientProps = {
    initialCategories: { id: string; name: string }[];
    initialProducts: Product[];
    initialBusinessInfo: {
        name: string; description: string; image: string; address: string; phone: string;
        email: string; website: string; instagram: string; whatsapp: string;
        workingHours: { day: string; hours: string }[];
        cuisines: string[]; features: string[];
        wifiName: string; wifiPassword: string;
    };
    initialTheme: Record<string, string>;
    slug: string;
    restaurantId: string;
};

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function MenuClient({
    initialCategories,
    initialProducts,
    initialBusinessInfo,
    initialTheme,
    slug,
    restaurantId,
}: MenuClientProps) {
    const [activeCategory, setActiveCategory] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    // Auto-slide every 4 seconds
    useEffect(() => {
        const timer = setInterval(() => setCurrentSlide(prev => prev === 0 ? 1 : 0), 4000);
        return () => clearInterval(timer);
    }, []);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [categoryLayoutOverrides, setCategoryLayoutOverrides] = useState<Record<string, string>>({});

    // ======= Analytics Tracking =======
    const sessionIdRef = useRef<string>('');
    const pageViewIdRef = useRef<string>('');
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        // Generate unique session ID
        const sid = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        sessionIdRef.current = sid;
        startTimeRef.current = Date.now();

        // Record page view (QR scan)
        fetch('/api/analytics/pageview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                restaurantId,
                sessionId: sid,
                userAgent: navigator.userAgent,
            }),
        }).then(r => r.json()).then(d => {
            if (d.id) pageViewIdRef.current = d.id;
        }).catch(() => { });

        // Track session duration on exit
        const sendDuration = () => {
            if (!pageViewIdRef.current) return;
            const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
            navigator.sendBeacon('/api/analytics/pageview', JSON.stringify({
                id: pageViewIdRef.current,
                duration,
            }));
        };

        window.addEventListener('beforeunload', sendDuration);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') sendDuration();
        });

        return () => window.removeEventListener('beforeunload', sendDuration);
    }, [restaurantId]);



    const trackProductView = (productId: string) => {
        fetch('/api/analytics/product-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                restaurantId,
                productId,
                sessionId: sessionIdRef.current,
            }),
        }).catch(() => { });
    };
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
    const categoryNavRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);

    // Use server-provided data directly
    const CATEGORIES = initialCategories;
    const PRODUCTS = initialProducts;
    const BUSINESS_INFO = initialBusinessInfo;
    const [liveTheme, setLiveTheme] = useState<Record<string, string>>(initialTheme);
    const T = liveTheme;

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
            const stickyHeight = 110;
            const gap = 30;
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

    // Listen for live theme updates from design panel iframe
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data?.type === 'theme-update' && e.data.theme) {
                setLiveTheme(e.data.theme);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Dynamically load Google Font when theme font changes
    useEffect(() => {
        const font = liveTheme.fontFamily;
        if (font && font !== 'Inter') {
            const fontName = font.replace(/ /g, '+');
            const linkId = `gfont-${fontName}`;
            if (!document.getElementById(linkId)) {
                const link = document.createElement('link');
                link.id = linkId;
                link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
        }
    }, [liveTheme.fontFamily]);

    const getShadow = (s: string) => { switch (s) { case 'none': return 'none'; case 'sm': return '0 1px 2px 0 rgba(0,0,0,0.05)'; case 'md': return '0 4px 6px -1px rgba(0,0,0,0.1)'; case 'lg': return '0 10px 15px -3px rgba(0,0,0,0.1)'; case 'xl': return '0 20px 25px -5px rgba(0,0,0,0.1)'; default: return '0 1px 2px 0 rgba(0,0,0,0.05)'; } };

    // Language splash screen - always show on every visit (localStorage disabled for testing)
    const [showLangSplash, setShowLangSplash] = useState(true);
    const [splashFading, setSplashFading] = useState(false);
    const [showLangPicker, setShowLangPicker] = useState(false);

    // Lock body scroll when welcome screen or ANY overlay is visible
    const anyOverlayOpen = showLangSplash || isProfileOpen || !!selectedProduct || isSearchOpen;
    const scrollYRef = useRef(0);
    useEffect(() => {
        if (anyOverlayOpen) {
            scrollYRef.current = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollYRef.current}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            window.scrollTo(0, scrollYRef.current);
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [anyOverlayOpen]);
    const [selectedLang, setSelectedLang] = useState("tr");
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedCategories, setTranslatedCategories] = useState<{ id: string; name: string }[]>(initialCategories);
    const [translatedProducts, setTranslatedProducts] = useState<Product[]>(initialProducts);

    // Static UI strings dictionary
    const uiStrings: Record<string, Record<string, string>> = {
        searchPlaceholder: { tr: "Ürün ara...", en: "Search products...", de: "Produkte suchen...", fr: "Rechercher...", it: "Cerca prodotti...", es: "Buscar productos...", pt: "Pesquisar produtos...", ro: "Căutare produse...", sq: "Kërko produkte...", el: "Αναζήτηση προϊόντων...", ka: "პროდუქტების ძიება...", ru: "Поиск продуктов...", uk: "Пошук продуктів...", az: "Məhsul axtar...", hi: "उत्पाद खोजें...", ar: "...البحث عن المنتجات", fa: "...جستجوی محصولات", zh: "搜索产品...", ko: "상품 검색...", ja: "商品を検索...", id: "Cari produk..." },
        popular: { tr: "Popüler", en: "Popular", de: "Beliebt", fr: "Populaire", it: "Popolare", es: "Popular", pt: "Popular", ro: "Popular", sq: "Popullore", el: "Δημοφιλή", ka: "პოპულარული", ru: "Популярное", uk: "Популярне", az: "Populyar", hi: "लोकप्रिय", ar: "شائع", fa: "محبوب", zh: "热门", ko: "인기", ja: "人気", id: "Populer" },
        workingHours: { tr: "🕐 Çalışma Saatleri", en: "🕐 Working Hours", de: "🕐 Öffnungszeiten", fr: "🕐 Horaires", it: "🕐 Orari", es: "🕐 Horario", pt: "🕐 Horário", ro: "🕐 Program", sq: "🕐 Orari", el: "🕐 Ωράριο", ka: "🕐 სამუშაო საათები", ru: "🕐 Часы работы", uk: "🕐 Години роботи", az: "🕐 İş saatları", hi: "🕐 कार्य समय", ar: "🕐 ساعات العمل", fa: "🕐 ساعات کاری", zh: "🕐 营业时间", ko: "🕐 영업시간", ja: "🕐 営業時間", id: "🕐 Jam Kerja" },
        today: { tr: "Bugün", en: "Today", de: "Heute", fr: "Aujourd'hui", it: "Oggi", es: "Hoy", pt: "Hoje", ro: "Azi", sq: "Sot", el: "Σήμερα", ka: "დღეს", ru: "Сегодня", uk: "Сьогодні", az: "Bu gün", hi: "आज", ar: "اليوم", fa: "امروز", zh: "今天", ko: "오늘", ja: "今日", id: "Hari ini" },
        address: { tr: "Adres", en: "Address", de: "Adresse", fr: "Adresse", it: "Indirizzo", es: "Dirección", pt: "Endereço", ro: "Adresă", sq: "Adresa", el: "Διεύθυνση", ka: "მისამართი", ru: "Адрес", uk: "Адреса", az: "Ünvan", hi: "पता", ar: "العنوان", fa: "آدرس", zh: "地址", ko: "주소", ja: "住所", id: "Alamat" },
        phone: { tr: "Telefon", en: "Phone", de: "Telefon", fr: "Téléphone", it: "Telefono", es: "Teléfono", pt: "Telefone", ro: "Telefon", sq: "Telefon", el: "Τηλέφωνο", ka: "ტელეფონი", ru: "Телефон", uk: "Телефон", az: "Telefon", hi: "फ़ोन", ar: "الهاتف", fa: "تلفن", zh: "电话", ko: "전화", ja: "電話", id: "Telepon" },
        email: { tr: "E-posta", en: "Email", de: "E-Mail", fr: "E-mail", it: "E-mail", es: "Correo", pt: "E-mail", ro: "Email", sq: "Email", el: "Email", ka: "ელ.ფოსტა", ru: "Эл. почта", uk: "Ел. пошта", az: "E-poçt", hi: "ईमेल", ar: "البريد الإلكتروني", fa: "ایمیل", zh: "邮箱", ko: "이메일", ja: "メール", id: "Email" },
        web: { tr: "Web", en: "Web", de: "Web", fr: "Web", it: "Web", es: "Web", pt: "Web", ro: "Web", sq: "Web", el: "Web", ka: "ვებ", ru: "Веб", uk: "Веб", az: "Veb", hi: "वेब", ar: "الموقع", fa: "وب", zh: "网站", ko: "웹", ja: "ウェブ", id: "Web" },
        loading: { tr: "Menü çevriliyor...", en: "Translating menu...", de: "Menü wird übersetzt...", fr: "Traduction du menu...", it: "Traduzione del menu...", es: "Traduciendo el menú...", pt: "Traduzindo o menu...", ro: "Se traduce meniul...", sq: "Duke përkthyer menunë...", el: "Μετάφραση μενού...", ka: "მენიუ ითარგმნება...", ru: "Перевод меню...", uk: "Перекладаємо меню...", az: "Menyu tərcümə olunur...", hi: "मेनू का अनुवाद हो रहा है...", ar: "...جارٍ ترجمة القائمة", fa: "...در حال ترجمه منو", zh: "正在翻译菜单...", ko: "메뉴 번역 중...", ja: "メニューを翻訳中...", id: "Menerjemahkan menu..." },
        specialRecipes: { tr: "Özel Tarifler", en: "Special Recipes", de: "Spezialrezepte", fr: "Recettes spéciales", it: "Ricette speciali", es: "Recetas especiales", pt: "Receitas especiais", ro: "Rețete speciale", sq: "Receta speciale", el: "Ειδικές συνταγές", ka: "სპეციალური რეცეპტები", ru: "Особые рецепты", uk: "Особливі рецепти", az: "Xüsusi reseptlər", hi: "विशेष व्यंजन", ar: "وصفات خاصة", fa: "دستورهای ویژه", zh: "特色菜谱", ko: "특별 레시피", ja: "特別レシピ", id: "Resep spesial" },
        flavorFeast: { tr: "Lezzet Şöleni Başlıyor", en: "Flavor Feast Begins", de: "Geschmacksfest beginnt", fr: "La fête des saveurs commence", it: "La festa del sapore inizia", es: "La fiesta de sabores comienza", pt: "A festa de sabores começa", ro: "Festivalul gustului începe", sq: "Festa e shijes fillon", el: "Γιορτή γεύσεων αρχίζει", ka: "გემოს ზეიმი იწყება", ru: "Праздник вкусов начинается", uk: "Свято смаків починається", az: "Dad bayramı başlayır", hi: "स्वाद का उत्सव शुरू", ar: "مهرجان النكهات يبدأ", fa: "جشن طعم آغاز می‌شود", zh: "美味盛宴开始", ko: "맛의 향연이 시작됩니다", ja: "味の饗宴が始まる", id: "Pesta rasa dimulai" },
        freshNatural: { tr: "Taze & Doğal", en: "Fresh & Natural", de: "Frisch & Natürlich", fr: "Frais & Naturel", it: "Fresco & Naturale", es: "Fresco & Natural", pt: "Fresco & Natural", ro: "Proaspăt & Natural", sq: "I freskët & Natyral", el: "Φρέσκο & Φυσικό", ka: "ახალი & ბუნებრივი", ru: "Свежий & Натуральный", uk: "Свіжий & Натуральний", az: "Təzə & Təbii", hi: "ताज़ा और प्राकृतिक", ar: "طازج وطبيعي", fa: "تازه و طبیعی", zh: "新鲜 & 天然", ko: "신선 & 자연", ja: "新鮮 & ナチュラル", id: "Segar & Alami" },
        bestOfSeason: { tr: "Mevsimin En İyileri", en: "Best of the Season", de: "Das Beste der Saison", fr: "Le meilleur de la saison", it: "Il meglio della stagione", es: "Lo mejor de la temporada", pt: "O melhor da estação", ro: "Cele mai bune ale sezonului", sq: "Më të mirat e sezonit", el: "Τα καλύτερα της σεζόν", ka: "სეზონის საუკეთესო", ru: "Лучшее в сезоне", uk: "Найкраще сезону", az: "Mövsümün ən yaxşıları", hi: "मौसम के सर्वश्रेष्ठ", ar: "أفضل ما في الموسم", fa: "بهترین‌های فصل", zh: "当季最佳", ko: "시즌 베스트", ja: "季節のベスト", id: "Terbaik musim ini" },
        welcome: { tr: "Hoşgeldiniz", en: "Welcome", de: "Willkommen", fr: "Bienvenue", it: "Benvenuto", es: "Bienvenido", pt: "Bem-vindo", ro: "Bun venit", sq: "Mirësevini", el: "Καλωσήρθατε", ka: "მოგესალმებით", ru: "Добро пожаловать", uk: "Ласкаво просимо", az: "Xoş gəlmisiniz", hi: "स्वागत है", ar: "أهلاً وسهلاً", fa: "خوش آمدید", zh: "欢迎", ko: "환영합니다", ja: "ようこそ", id: "Selamat datang" },
        btnMenu: { tr: "MENÜ", en: "MENU", de: "MENÜ", fr: "MENU", it: "MENU", es: "MENÚ", pt: "MENU", ro: "MENIU", sq: "MENU", el: "ΜΕΝΟΥ", ka: "მენიუ", ru: "МЕНЮ", uk: "МЕНЮ", az: "MENÜ", hi: "मेन्यू", ar: "القائمة", fa: "منو", zh: "菜单", ko: "메뉴", ja: "メニュー", id: "MENU" },
        btnLanguage: { tr: "DİL", en: "LANGUAGE", de: "SPRACHE", fr: "LANGUE", it: "LINGUA", es: "IDIOMA", pt: "IDIOMA", ro: "LIMBĂ", sq: "GJUHA", el: "ΓΛΩΣΣΑ", ka: "ენა", ru: "ЯЗЫК", uk: "МОВА", az: "DİL", hi: "भाषा", ar: "اللغة", fa: "زبان", zh: "语言", ko: "언어", ja: "言語", id: "BAHASA" },
        btnCampaigns: { tr: "KAMPANYALAR", en: "CAMPAIGNS", de: "AKTIONEN", fr: "PROMOTIONS", it: "PROMOZIONI", es: "CAMPAÑAS", pt: "PROMOÇÕES", ro: "CAMPANII", sq: "FUSHATA", el: "ΠΡΟΣΦΟΡΕΣ", ka: "აქციები", ru: "АКЦИИ", uk: "АКЦІЇ", az: "KAMPANİYALAR", hi: "ऑफ़र", ar: "العروض", fa: "پیشنهادات", zh: "优惠", ko: "캐페인", ja: "キャンペーン", id: "PROMO" },
    };

    const t = (key: string) => uiStrings[key]?.[selectedLang] || uiStrings[key]?.["tr"] || key;

    // Close welcome screen and go to menu
    const goToMenu = () => {
        setSplashFading(true);
        setTimeout(() => setShowLangSplash(false), 400);
    };

    const selectLanguage = async (lang: string) => {
        setSelectedLang(lang);

        // Track language for analytics
        if (pageViewIdRef.current) {
            fetch('/api/analytics/pageview', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pageViewIdRef.current, language: lang }),
            }).catch(() => { });
        }
        if (lang === "tr") {
            // Turkish = no translation needed
            setTranslatedCategories(initialCategories);
            setTranslatedProducts(initialProducts);
            return;
        }

        // Translate menu data in background (stay on welcome screen)
        setIsTranslating(true);

        try {
            // Collect all texts to translate in one batch
            const categoryNames = initialCategories.map(c => c.id === "populer" ? "" : c.name);
            const productNames = initialProducts.map(p => p.name);
            const productDescs = initialProducts.map(p => p.description);
            const allTexts = [...categoryNames, ...productNames, ...productDescs];

            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts: allTexts, target: lang }),
            });

            if (!res.ok) throw new Error("Translation failed");

            const data = await res.json();
            const tr = data.translations as string[];

            const catCount = categoryNames.length;
            const prodCount = productNames.length;

            // Rebuild categories with translated names
            const newCats = initialCategories.map((c, i) => ({
                ...c,
                name: c.id === "populer" ? t("popular") : (tr[i] || c.name),
            }));

            // Rebuild products with translated names and descriptions
            const newProds = initialProducts.map((p, i) => ({
                ...p,
                name: tr[catCount + i] || p.name,
                description: tr[catCount + prodCount + i] || p.description,
            }));

            setTranslatedCategories(newCats);
            setTranslatedProducts(newProds);
        } catch (err) {
            console.error("Translation error:", err);
            // Fallback to original
            setTranslatedCategories(initialCategories);
            setTranslatedProducts(initialProducts);
        } finally {
            setIsTranslating(false);
        }
    };

    // Use translated data
    const DISPLAY_CATEGORIES = translatedCategories;
    const DISPLAY_PRODUCTS = translatedProducts;

    const languages = [
        { code: "tr", flag: "🇹🇷", name: "Türkçe" },
        { code: "en", flag: "🇬🇧", name: "English" },
        { code: "de", flag: "🇩🇪", name: "Deutsch" },
        { code: "fr", flag: "🇫🇷", name: "Français" },
        { code: "it", flag: "🇮🇹", name: "Italiano" },
        { code: "es", flag: "🇪🇸", name: "Español" },
        { code: "pt", flag: "🇵🇹", name: "Português" },
        { code: "ro", flag: "🇷🇴", name: "Română" },
        { code: "sq", flag: "🇦🇱", name: "Shqip" },
        { code: "el", flag: "🇬🇷", name: "Ελληνικά" },
        { code: "ka", flag: "🇬🇪", name: "ქართული" },
        { code: "ru", flag: "🇷🇺", name: "Русский" },
        { code: "uk", flag: "🇺🇦", name: "Українська" },
        { code: "az", flag: "🇦🇿", name: "Azərbaycan" },
        { code: "hi", flag: "🇮🇳", name: "हिन्दी" },
        { code: "ar", flag: "🇸🇦", name: "العربية" },
        { code: "fa", flag: "🇮🇷", name: "فارسی" },
        { code: "zh", flag: "🇨🇳", name: "中文" },
        { code: "ko", flag: "🇰🇷", name: "한국어" },
        { code: "ja", flag: "🇯🇵", name: "日本語" },
        { code: "id", flag: "🇮🇩", name: "Bahasa" },
    ];

    return (
        <>
            {/* Welcome Screen — variant-aware */}
            {showLangSplash && (() => {
                const wVariant = (T as any).welcomeVariant || 'classic';
                const wVideo = (T as any).welcomeVideo || '';
                const wImage = (T as any).welcomeImage || '';
                const wBg = T.welcomeBg || '#000000';
                const wText = T.welcomeTextColor || '#ffffff';
                const wSub = T.welcomeSubtextColor || '#ffffff80';
                const wBtnBg = T.welcomeBtnBg || '#ffffff';
                const wBtnText = T.welcomeBtnText || '#000000';
                const wBtnRadius = T.welcomeBtnRadius || '12';
                const wBtnShadow = T.welcomeBtnShadow === 'none' ? 'none' : T.welcomeBtnShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.1)' : T.welcomeBtnShadow === 'md' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 10px 15px rgba(0,0,0,0.2)';
                const wSecBg = T.welcomeSecondaryBtnBg || '#ffffff1a';
                const wSecText = T.welcomeSecondaryBtnText || '#ffffff';
                const wSecBorder = T.welcomeSecondaryBtnBorder || '#ffffff33';
                const wLogoSize = T.welcomeLogoSize || '96';
                const wLogoRadius = T.welcomeLogoRadius || '16';
                const wLogoBorder = T.welcomeLogoBorder || '#ffffff33';
                const bName = BUSINESS_INFO.name;
                const bImg = BUSINESS_INFO.image;
                const overlayOpacity = parseInt(T.welcomeOverlayOpacity || '60') / 100;
                const gradFrom = T.welcomeGradientFrom || '#000000';
                const gradOpacity = T.welcomeGradientOpacity || '85';

                // Background layer (shared by all variants)
                const bgLayer = (
                    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: wBg }}>
                        {wVideo ? (
                            <video src={wVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ opacity: overlayOpacity }} />
                        ) : wImage ? (
                            <img src={wImage} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: overlayOpacity }} />
                        ) : (
                            <video src="https://github.com/qrlex2026/qrlexvideo/raw/refs/heads/main/1.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" style={{ opacity: overlayOpacity }} />
                        )}
                    </div>
                );

                // Gradient overlay (shared)
                const gradient = (
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: `linear-gradient(to top, ${gradFrom} 0%, ${gradFrom}${Math.round((parseInt(gradOpacity) / 100) * 255).toString(16).padStart(2, '0')} 15%, transparent 60%, transparent 100%)`
                    }} />
                );

                // Logo element (shared)
                const logo = bImg ? (
                    <div className="overflow-hidden shadow-2xl" style={{ width: `${wLogoSize}px`, height: `${wLogoSize}px`, borderRadius: `${wLogoRadius}px`, border: `2px solid ${wLogoBorder}` }}>
                        <img src={bImg} alt={bName} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="backdrop-blur-md flex items-center justify-center" style={{ width: `${wLogoSize}px`, height: `${wLogoSize}px`, borderRadius: `${wLogoRadius}px`, border: `1px solid ${wLogoBorder}`, backgroundColor: wSecBg }}>
                        <span className="text-4xl font-bold" style={{ color: wText }}>{bName.charAt(0)}</span>
                    </div>
                );

                // Button styles
                const primaryBtn = { backgroundColor: wBtnBg, color: wBtnText, borderRadius: `${wBtnRadius}px`, boxShadow: wBtnShadow };
                const secondaryBtn = { backgroundColor: wSecBg, color: wSecText, border: `1px solid ${wSecBorder}`, borderRadius: `${wBtnRadius}px` };

                // Shared actions
                const menuAction = goToMenu;
                const langAction = () => setShowLangPicker(true);

                // Button style variant
                const wBtnStyle = (T as any).welcomeBtnStyle || 'classic';

                // SVG Icons
                const iconMenu = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>;
                const iconLang = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>;
                const iconMenuLg = <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>;
                const iconLangLg = <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>;

                const btnItems = [
                    { label: t('btnMenu') || 'MENÜ', sub: t('welcome'), icon: iconMenu, iconLg: iconMenuLg, action: menuAction, primary: true },
                    { label: t('btnLanguage'), sub: languages.find(l => l.code === selectedLang)?.name || 'Dil', icon: iconLang, iconLg: iconLangLg, action: langAction, primary: false },
                ];

                // Render buttons based on style
                const renderButtons = () => {
                    const delay = (i: number) => `${0.1 + i * 0.1}s`;

                    if (wBtnStyle === 'icon-left') {
                        return (
                            <div className="flex flex-col gap-3 w-full">
                                {btnItems.map((b, i) => (
                                    <button key={i} onClick={b.action} className="flex items-center gap-3 px-4 py-3.5 text-left active:scale-[0.97] transition-all backdrop-blur-md" style={{ ...(b.primary ? primaryBtn : secondaryBtn), animation: `fadeInUp 0.5s ease-out ${delay(i)} both` }}>
                                        <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: b.primary ? `${wBtnText}15` : `${wSecText}15` }}>{b.icon}</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold tracking-wider">{b.label}</span>
                                            <span className="text-[10px] opacity-60">{b.sub}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        );
                    }

                    if (wBtnStyle === 'icon-top') {
                        return (
                            <div className="grid grid-cols-3 gap-3 w-full">
                                {btnItems.map((b, i) => (
                                    <button key={i} onClick={b.action} className="flex flex-col items-center gap-2 py-4 px-2 active:scale-[0.97] transition-all backdrop-blur-md" style={{ ...(b.primary ? primaryBtn : secondaryBtn), animation: `fadeInUp 0.5s ease-out ${delay(i)} both` }}>
                                        <span className="flex items-center justify-center w-12 h-12 rounded-2xl" style={{ backgroundColor: b.primary ? `${wBtnText}15` : `${wSecText}15` }}>{b.iconLg}</span>
                                        <span className="text-[11px] font-bold tracking-wider text-center">{b.label}</span>
                                    </button>
                                ))}
                            </div>
                        );
                    }

                    if (wBtnStyle === 'pill') {
                        return (
                            <div className="flex flex-col gap-2.5 w-full">
                                {btnItems.map((b, i) => (
                                    <button key={i} onClick={b.action} className="flex items-center justify-center gap-2.5 py-3 px-5 active:scale-[0.97] transition-all backdrop-blur-md" style={{ ...(b.primary ? primaryBtn : secondaryBtn), borderRadius: '999px', animation: `fadeInUp 0.5s ease-out ${delay(i)} both` }}>
                                        {b.icon}
                                        <span className="text-sm font-bold tracking-wider">{b.label}</span>
                                    </button>
                                ))}
                            </div>
                        );
                    }

                    if (wBtnStyle === 'outline-glow') {
                        return (
                            <div className="flex flex-col gap-3 w-full">
                                {btnItems.map((b, i) => (
                                    <button key={i} onClick={b.action} className="flex items-center gap-3 px-4 py-3.5 active:scale-[0.97] transition-all" style={{
                                        backgroundColor: 'transparent',
                                        color: b.primary ? wBtnBg : wSecText,
                                        border: `1.5px solid ${b.primary ? wBtnBg : wSecBorder}`,
                                        borderRadius: `${wBtnRadius}px`,
                                        boxShadow: b.primary ? `0 0 15px ${wBtnBg}33, inset 0 0 15px ${wBtnBg}08` : `0 0 10px ${wSecBorder}22`,
                                        animation: `fadeInUp 0.5s ease-out ${delay(i)} both`
                                    }}>
                                        <span className="shrink-0">{b.icon}</span>
                                        <span className="text-sm font-bold tracking-wider">{b.label}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto opacity-40"><path d="m9 18 6-6-6-6" /></svg>
                                    </button>
                                ))}
                            </div>
                        );
                    }

                    if (wBtnStyle === 'card') {
                        return (
                            <div className="flex flex-col gap-3 w-full">
                                {btnItems.map((b, i) => (
                                    <button key={i} onClick={b.action} className="flex items-center gap-4 px-4 py-4 active:scale-[0.97] transition-all backdrop-blur-xl" style={{
                                        ...(b.primary ? primaryBtn : secondaryBtn),
                                        animation: `fadeInUp 0.5s ease-out ${delay(i)} both`
                                    }}>
                                        <span className="shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl" style={{
                                            backgroundColor: b.primary ? `${wBtnText}12` : `${wSecText}12`,
                                            border: `1px solid ${b.primary ? `${wBtnText}20` : `${wSecText}20`}`
                                        }}>{b.iconLg}</span>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-bold tracking-wider">{b.label}</span>
                                            <span className="text-[11px] mt-0.5 opacity-50">{b.sub}</span>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto opacity-30"><path d="m9 18 6-6-6-6" /></svg>
                                    </button>
                                ))}
                            </div>
                        );
                    }

                    if (wBtnStyle === 'minimal-line') {
                        return (
                            <div className="flex flex-col w-full divide-y" style={{ borderColor: `${wSecBorder}` }}>
                                {btnItems.map((b, i) => (
                                    <button key={i} onClick={b.action} className="flex items-center gap-3 px-2 py-4 active:scale-[0.98] transition-all" style={{
                                        color: b.primary ? wBtnBg : wSecText,
                                        borderColor: wSecBorder,
                                        animation: `fadeInUp 0.5s ease-out ${delay(i)} both`
                                    }}>
                                        <span className="shrink-0 opacity-70">{b.icon}</span>
                                        <span className="text-sm font-bold tracking-wider">{b.label}</span>
                                        <span className="ml-auto text-[10px] opacity-40 tracking-wide">{b.sub}</span>
                                    </button>
                                ))}
                            </div>
                        );
                    }

                    // Default: classic (original plain text buttons)
                    return (
                        <div className="flex items-center justify-center gap-3">
                            {btnItems.map((b, i) => (
                                <button key={i} onClick={b.action} className="flex-1 py-3.5 backdrop-blur-md text-sm font-bold tracking-wider text-center active:scale-[0.97] transition-all" style={{ ...(b.primary ? primaryBtn : secondaryBtn), animation: `fadeInUp 0.5s ease-out ${delay(i)} both` }}>{b.label}</button>
                            ))}
                        </div>
                    );
                };

                // Powered by
                const poweredBy = <p className="text-center mt-5 text-[10px] font-medium tracking-widest" style={{ color: wSub, opacity: 0.5 }}>Powered by <span className="font-bold">QRLEX</span></p>;

                // === CLASSIC ===
                const classicContent = (
                    <>
                        <div className="relative flex-1 flex flex-col items-center justify-center z-10">
                            <div style={{ animation: 'fadeInUp 0.5s ease-out both' }}>{logo}</div>
                            <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg mt-5" style={{ color: wText, animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>{bName}</h1>
                            <p className="text-lg mt-3 font-light tracking-wide" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>{t('welcome')}</p>
                        </div>
                        <div className="relative z-10 pb-8" style={{ padding: '0 13px 32px 13px' }}>
                            {renderButtons()}
                            {poweredBy}
                        </div>
                    </>
                );

                // === LEFT-TEXT ===
                const leftTextContent = (
                    <>
                        <div className="relative flex-1 flex flex-col justify-end z-10 px-6 pb-4">
                            <div className="mb-3" style={{ animation: 'fadeInUp 0.5s ease-out both' }}>{logo}</div>
                            <h1 className="text-4xl font-bold tracking-tight drop-shadow-lg" style={{ color: wText, animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>{bName}</h1>
                            <p className="text-base mt-2 font-light tracking-wide" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>{t('welcome')}</p>
                        </div>
                        <div className="relative z-10 pb-8" style={{ padding: '0 13px 32px 13px' }}>
                            {renderButtons()}
                            {poweredBy}
                        </div>
                    </>
                );

                // === FULLSCREEN ===
                const fullscreenContent = (
                    <>
                        <div className="relative flex-1 flex flex-col items-center justify-center z-10">
                            <div style={{ animation: 'fadeInUp 0.6s ease-out both', transform: 'scale(1.3)' }}>{logo}</div>
                            <h1 className="text-2xl font-bold tracking-tight drop-shadow-lg mt-8" style={{ color: wText, animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>{bName}</h1>
                            <p className="text-sm mt-2 font-light tracking-wide" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.25s both' }}>{t('welcome')}</p>
                        </div>
                        <div className="relative z-10 pb-8" style={{ padding: '0 24px 32px 24px' }}>
                            {renderButtons()}
                            {poweredBy}
                        </div>
                    </>
                );

                // === SPLIT-BTN (vertical stacked buttons) ===
                const splitBtnContent = (
                    <>
                        <div className="relative flex-1 flex flex-col items-center justify-center z-10">
                            <div style={{ animation: 'fadeInUp 0.5s ease-out both' }}>{logo}</div>
                            <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg mt-5" style={{ color: wText, animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>{bName}</h1>
                            <p className="text-lg mt-3 font-light tracking-wide" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>{t('welcome')}</p>
                        </div>
                        <div className="relative z-10 pb-8" style={{ padding: '0 24px 32px 24px' }}>
                            {renderButtons()}
                            {poweredBy}
                        </div>
                    </>
                );

                // === MINIMAL ===
                const minimalContent = (
                    <>
                        <div className="relative flex-1 flex flex-col items-center justify-center z-10">
                            <h1 className="text-4xl font-extralight tracking-[0.2em] uppercase drop-shadow-lg" style={{ color: wText, animation: 'fadeInUp 0.6s ease-out both' }}>{bName}</h1>
                            <div className="w-12 h-[1px] mt-4 mb-3" style={{ backgroundColor: wSub, animation: 'fadeInUp 0.5s ease-out 0.1s both' }} />
                            <p className="text-xs font-light tracking-[0.15em] uppercase" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>{t('welcome')}</p>
                        </div>
                        <div className="relative z-10 pb-8" style={{ padding: '0 24px 32px 24px' }}>
                            {renderButtons()}
                            {poweredBy}
                        </div>
                    </>
                );

                // === EDITORIAL ===
                const editorialContent = (
                    <>
                        <div className="relative flex-1 z-10" />
                        <div className="relative z-10 px-6 pb-8">
                            <div className="mb-4" style={{ animation: 'fadeInUp 0.5s ease-out both' }}>{logo}</div>
                            <h1 className="text-5xl font-black tracking-tight leading-none drop-shadow-lg" style={{ color: wText, animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>{bName}</h1>
                            <p className="text-base mt-3 font-light tracking-wide" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>{BUSINESS_INFO.description || t('welcome')}</p>
                            <div className="mt-6">
                                {renderButtons()}
                            </div>
                            {poweredBy}
                        </div>
                    </>
                );

                // === NEON ===
                const neonContent = (
                    <>
                        <div className="relative flex-1 flex flex-col items-center justify-center z-10">
                            <div className="p-1 rounded-full mb-5" style={{ border: `2px solid ${wBtnBg}`, boxShadow: `0 0 30px ${wBtnBg}33, 0 0 60px ${wBtnBg}11`, animation: 'fadeInUp 0.5s ease-out both' }}>
                                {bImg ? (
                                    <div className="overflow-hidden" style={{ width: `${wLogoSize}px`, height: `${wLogoSize}px`, borderRadius: '50%' }}>
                                        <img src={bImg} alt={bName} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center" style={{ width: `${wLogoSize}px`, height: `${wLogoSize}px`, borderRadius: '50%', backgroundColor: `${wBtnBg}11` }}>
                                        <span className="text-4xl font-bold" style={{ color: wBtnBg, textShadow: `0 0 20px ${wBtnBg}44` }}>{bName.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight" style={{ color: wText, textShadow: `0 0 40px ${wBtnBg}22`, animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>{bName}</h1>
                            <p className="text-lg mt-3 font-light tracking-wide" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>{t('welcome')}</p>
                        </div>
                        <div className="relative z-10 pb-8" style={{ padding: '0 13px 32px 13px' }}>
                            {renderButtons()}
                            {poweredBy}
                        </div>
                    </>
                );

                // ═══════════════════════════════════════════════════════
                // V8: GLASS-CARD — Frosted glass kart, köşelerde dekoratif blur daireler
                // ═══════════════════════════════════════════════════════
                const glassCardContent = (
                    <>
                        {/* Decorative floating blur circles */}
                        <div className="absolute top-[10%] left-[-30px] w-[120px] h-[120px] rounded-full z-[2] pointer-events-none" style={{ background: `${wBtnBg}15`, filter: 'blur(40px)' }} />
                        <div className="absolute bottom-[20%] right-[-20px] w-[100px] h-[100px] rounded-full z-[2] pointer-events-none" style={{ background: `${wBtnBg}20`, filter: 'blur(35px)' }} />
                        <div className="absolute top-[45%] right-[10%] w-[60px] h-[60px] rounded-full z-[2] pointer-events-none" style={{ background: `${wBtnBg}10`, filter: 'blur(25px)' }} />

                        <div className="relative flex-1 flex flex-col items-center justify-center z-10 px-5">
                            {/* Main glass card */}
                            <div className="w-full max-w-[340px] rounded-[28px] overflow-hidden" style={{
                                background: `linear-gradient(145deg, ${wBg}cc, ${wBg}99)`,
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: `1px solid ${wLogoBorder}`,
                                boxShadow: `0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 ${wLogoBorder}`,
                                animation: 'fadeInUp 0.7s ease-out both'
                            }}>
                                {/* Top accent line */}
                                <div className="h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${wBtnBg}, transparent)` }} />

                                <div className="p-7 flex flex-col items-center">
                                    {/* Logo with ring */}
                                    <div className="relative mb-5">
                                        <div className="absolute -inset-3 rounded-full" style={{ border: `1px dashed ${wBtnBg}33` }} />
                                        {logo}
                                    </div>

                                    <h1 className="text-[26px] font-extrabold tracking-tight text-center leading-tight" style={{ color: wText }}>{bName}</h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-4 h-[1px]" style={{ backgroundColor: wBtnBg, opacity: 0.4 }} />
                                        <p className="text-xs font-medium tracking-[0.15em] uppercase" style={{ color: wSub }}>{t('welcome')}</p>
                                        <div className="w-4 h-[1px]" style={{ backgroundColor: wBtnBg, opacity: 0.4 }} />
                                    </div>

                                    {/* Buttons inside card */}
                                    <div className="w-full mt-7">
                                        {renderButtons()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative z-10 pb-5">{poweredBy}</div>
                    </>
                );

                // ═══════════════════════════════════════════════════════
                // V9: WAVE — Dalga SVG kesim, üstte tam ekran görsel, altta solid panel
                // ═══════════════════════════════════════════════════════
                const waveContent = (
                    <>
                        {/* Top area: full background visible */}
                        <div className="relative flex-1 z-10 flex items-center justify-center">
                            <div className="text-center" style={{ animation: 'fadeInUp 0.6s ease-out both' }}>
                                {/* Logo floating over the background */}
                                <div className="mx-auto mb-3 p-4 rounded-full" style={{
                                    background: `${wBg}88`,
                                    backdropFilter: 'blur(10px)',
                                    border: `2px solid ${wLogoBorder}`,
                                    display: 'inline-block'
                                }}>
                                    {logo}
                                </div>
                                <h1 className="text-3xl font-black tracking-tight" style={{ color: wText, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{bName}</h1>
                            </div>
                        </div>
                        {/* SVG wave divider */}
                        <div className="relative z-10">
                            <svg viewBox="0 0 400 80" className="w-full block -mb-[2px]" preserveAspectRatio="none" style={{ height: '70px' }}>
                                <path d="M0,60 C50,20 100,70 150,35 C200,0 250,50 300,25 C350,0 380,40 400,30 L400,80 L0,80 Z" style={{ fill: wBg }} />
                                <path d="M0,65 C60,30 110,75 160,40 C210,5 260,55 310,30 C355,5 385,45 400,35 L400,80 L0,80 Z" style={{ fill: wBg, opacity: 0.5 }} />
                            </svg>
                            {/* Bottom solid panel */}
                            <div style={{ backgroundColor: wBg }} className="px-6 pb-8 pt-2">
                                <p className="text-center text-sm font-light tracking-[0.1em] mb-5" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>{t('welcome')}</p>

                                {renderButtons()}
                                {poweredBy}
                            </div>
                        </div>
                    </>
                );

                // ═══════════════════════════════════════════════════════
                // V10: CINEMA — Film şeridi kenar, altın yaldızlı lüks atmosfer
                // ═══════════════════════════════════════════════════════
                const cinemaContent = (
                    <>
                        {/* Film strip borders */}
                        <div className="absolute top-0 bottom-0 left-0 w-[18px] z-[2] pointer-events-none" style={{ opacity: 0.12 }}>
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={`l${i}`} className="mx-[4px] my-[3px] h-[22px] rounded-[2px]" style={{ backgroundColor: wText }} />
                            ))}
                        </div>
                        <div className="absolute top-0 bottom-0 right-0 w-[18px] z-[2] pointer-events-none" style={{ opacity: 0.12 }}>
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={`r${i}`} className="mx-[4px] my-[3px] h-[22px] rounded-[2px]" style={{ backgroundColor: wText }} />
                            ))}
                        </div>

                        {/* Golden spotlight cone from top */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[60%] z-[2] pointer-events-none" style={{
                            background: `linear-gradient(180deg, ${wBtnBg}12 0%, transparent 100%)`,
                            clipPath: 'polygon(40% 0%, 60% 0%, 90% 100%, 10% 100%)'
                        }} />

                        <div className="relative flex-1 flex flex-col items-center justify-center z-10 px-10">
                            {/* Star ornament */}
                            <div className="text-2xl mb-4" style={{ color: wBtnBg, opacity: 0.6, animation: 'fadeInUp 0.5s ease-out both' }}>★</div>

                            <div style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>{logo}</div>

                            <h1 className="text-2xl font-black tracking-[0.2em] uppercase mt-5 text-center" style={{ color: wText, animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>{bName}</h1>

                            {/* Double line ornament */}
                            <div className="flex items-center gap-3 mt-3 w-full max-w-[200px]" style={{ animation: 'fadeInUp 0.5s ease-out 0.25s both' }}>
                                <div className="flex-1 flex flex-col gap-[2px]">
                                    <div className="h-[1px]" style={{ backgroundColor: wBtnBg, opacity: 0.4 }} />
                                    <div className="h-[1px]" style={{ backgroundColor: wBtnBg, opacity: 0.2 }} />
                                </div>
                                <div className="text-xs" style={{ color: wBtnBg }}>◆</div>
                                <div className="flex-1 flex flex-col gap-[2px]">
                                    <div className="h-[1px]" style={{ backgroundColor: wBtnBg, opacity: 0.4 }} />
                                    <div className="h-[1px]" style={{ backgroundColor: wBtnBg, opacity: 0.2 }} />
                                </div>
                            </div>

                            <p className="text-sm font-light tracking-[0.15em] mt-3" style={{ color: wSub, fontStyle: 'italic', animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>{t('welcome')}</p>
                        </div>

                        <div className="relative z-10 px-10 pb-10" style={{ animation: 'fadeInUp 0.5s ease-out 0.35s both' }}>
                            {renderButtons()}
                            {poweredBy}
                        </div>
                    </>
                );

                // ═══════════════════════════════════════════════════════
                // V11: MOSAIC — Çapraz bölünmüş ekran, diagonal split layout
                // ═══════════════════════════════════════════════════════
                const mosaicContent = (
                    <>
                        {/* Diagonal clip: top-right triangle stays transparent for bg */}
                        <div className="absolute inset-0 z-[2] pointer-events-none" style={{
                            background: `linear-gradient(135deg, transparent 45%, ${wBg} 45%)`,
                        }} />

                        {/* Content on the dark (bottom-left) triangle */}
                        <div className="relative flex-1 flex flex-col z-10">
                            {/* Top area: logo on the visible bg part */}
                            <div className="flex-1 flex items-start justify-end p-8 pt-16" style={{ animation: 'fadeInUp 0.5s ease-out both' }}>
                                <div className="p-3 rounded-2xl" style={{ background: `${wBg}99`, backdropFilter: 'blur(10px)' }}>
                                    {logo}
                                </div>
                            </div>

                            {/* Bottom area: text and buttons on the solid bg */}
                            <div className="px-7 pb-8">
                                <h1 className="text-4xl font-black tracking-tight leading-none" style={{ color: wText, animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>{bName}</h1>
                                <p className="text-sm font-light tracking-wide mt-2 mb-6" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>{t('welcome')}</p>

                                <div style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>
                                    {renderButtons()}
                                </div>
                                {poweredBy}
                            </div>
                        </div>
                    </>
                );

                // ═══════════════════════════════════════════════════════
                // V12: HORIZON — Yatay şeritler, her şerit farklı yükseklikte, parallax his
                // ═══════════════════════════════════════════════════════
                const horizonContent = (
                    <>
                        {/* Horizontal stripe bands */}
                        <div className="absolute inset-0 z-[2] pointer-events-none flex flex-col">
                            <div className="flex-[3]" /> {/* bg visible */}
                            <div className="h-[3px]" style={{ backgroundColor: wBtnBg, opacity: 0.15 }} />
                            <div className="flex-[0.5]" style={{ backgroundColor: `${wBg}44` }} />
                            <div className="h-[2px]" style={{ backgroundColor: wBtnBg, opacity: 0.25 }} />
                            <div className="flex-[0.3]" style={{ backgroundColor: `${wBg}66` }} />
                            <div className="h-[1px]" style={{ backgroundColor: wBtnBg, opacity: 0.4 }} />
                            <div className="flex-[4]" style={{ backgroundColor: `${wBg}dd` }} />
                        </div>

                        <div className="relative flex-1 flex flex-col z-10">
                            {/* Top: logo floating */}
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center" style={{ animation: 'fadeInUp 0.6s ease-out both' }}>
                                    <div className="mx-auto mb-3 relative">
                                        {logo}
                                        {/* Pulsing ring */}
                                        <div className="absolute -inset-4 rounded-full" style={{ border: `1px solid ${wBtnBg}22`, animation: 'pulse 3s ease-in-out infinite' }} />
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: wText }}>{bName}</h1>
                                </div>
                            </div>

                            {/* Bottom: below the horizon lines */}
                            <div className="px-6 pb-8">
                                <p className="text-center text-sm font-light tracking-[0.12em] mb-6" style={{ color: wSub, animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>{t('welcome')}</p>

                                {renderButtons()}
                                {poweredBy}
                            </div>
                        </div>
                    </>
                );

                // ═══════════════════════════════════════════════════════
                // V13: SPOTLIGHT — Dikey timeline çizgisi + dot navigation tarzı
                // ═══════════════════════════════════════════════════════
                const spotlightContent = (
                    <>
                        {/* Vertical timeline line */}
                        <div className="absolute top-[15%] bottom-[15%] left-8 w-[2px] z-[2] pointer-events-none" style={{
                            background: `linear-gradient(180deg, transparent, ${wBtnBg}33, ${wBtnBg}33, transparent)`
                        }} />

                        <div className="relative flex-1 flex flex-col justify-center z-10 pl-16 pr-6">
                            {/* Timeline node 1: Logo */}
                            <div className="relative mb-8" style={{ animation: 'fadeInUp 0.5s ease-out both' }}>
                                <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ backgroundColor: wBtnBg, boxShadow: `0 0 10px ${wBtnBg}44` }} />
                                <div className="flex items-center gap-4">
                                    {logo}
                                    <div>
                                        <h1 className="text-2xl font-black tracking-tight" style={{ color: wText }}>{bName}</h1>
                                        <p className="text-xs font-light tracking-[0.1em] mt-1" style={{ color: wSub }}>{t('welcome')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline node 2: Buttons */}
                            <div className="relative" style={{ animation: 'fadeInUp 0.5s ease-out 0.15s both' }}>
                                <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full" style={{ border: `2px solid ${wBtnBg}`, backgroundColor: 'transparent' }} />
                                {renderButtons()}
                            </div>
                        </div>
                        <div className="relative z-10 pb-5 pl-16">{poweredBy}</div>
                    </>
                );

                // ═══════════════════════════════════════════════════════
                // V14: STACK — 3D perspektif kartlar, derinlik efekti
                // ═══════════════════════════════════════════════════════
                const stackContent = (
                    <>
                        <div className="relative flex-1 flex flex-col z-10" style={{ perspective: '800px' }}>
                            {/* Top: Logo area with 3D tilt */}
                            <div className="flex-1 flex items-center justify-center px-6">
                                <div className="text-center w-full max-w-[300px]" style={{
                                    transform: 'rotateX(2deg)',
                                    transformStyle: 'preserve-3d',
                                    animation: 'fadeInUp 0.6s ease-out both'
                                }}>
                                    <div className="mx-auto mb-4">{logo}</div>
                                    <h1 className="text-3xl font-black tracking-tight" style={{ color: wText }}>{bName}</h1>
                                    <p className="text-sm font-light tracking-wide mt-2" style={{ color: wSub }}>{t('welcome')}</p>
                                </div>
                            </div>

                            {/* Bottom: 3D stacked cards */}
                            <div className="px-5 pb-8" style={{ perspective: '600px' }}>
                                {/* Back card shadow */}
                                <div className="mx-4 h-3 rounded-b-2xl mb-[-8px]" style={{
                                    backgroundColor: `${wBtnBg}08`,
                                    border: `1px solid ${wLogoBorder}`,
                                    borderTop: 'none',
                                    transform: 'rotateX(4deg)',
                                    transformOrigin: 'top center',
                                    animation: 'fadeInUp 0.5s ease-out 0.15s both'
                                }} />
                                {/* Middle card shadow */}
                                <div className="mx-2 h-3 rounded-b-2xl mb-[-8px]" style={{
                                    backgroundColor: `${wBtnBg}10`,
                                    border: `1px solid ${wLogoBorder}`,
                                    borderTop: 'none',
                                    transform: 'rotateX(3deg)',
                                    transformOrigin: 'top center',
                                    animation: 'fadeInUp 0.5s ease-out 0.2s both'
                                }} />
                                {/* Main front card */}
                                <div className="rounded-2xl p-5" style={{
                                    backgroundColor: `${wSecBg}`,
                                    border: `1px solid ${wLogoBorder}`,
                                    boxShadow: `0 20px 50px rgba(0,0,0,0.25)`,
                                    transform: 'rotateX(1deg)',
                                    transformOrigin: 'top center',
                                    animation: 'fadeInUp 0.5s ease-out 0.25s both'
                                }}>
                                    {renderButtons()}
                                </div>
                                {poweredBy}
                            </div>
                        </div>
                    </>
                );

                // Pick content by variant
                const variantContent = wVariant === 'left-text' ? leftTextContent
                    : wVariant === 'fullscreen' ? fullscreenContent
                        : wVariant === 'split-btn' ? splitBtnContent
                            : wVariant === 'minimal' ? minimalContent
                                : wVariant === 'editorial' ? editorialContent
                                    : wVariant === 'neon' ? neonContent
                                        : wVariant === 'glass-card' ? glassCardContent
                                            : wVariant === 'wave' ? waveContent
                                                : wVariant === 'cinema' ? cinemaContent
                                                    : wVariant === 'mosaic' ? mosaicContent
                                                        : wVariant === 'horizon' ? horizonContent
                                                            : wVariant === 'spotlight' ? spotlightContent
                                                                : wVariant === 'stack' ? stackContent
                                                                    : classicContent;

                return (
                    <div
                        className={`fixed inset-0 z-[100] flex flex-col overflow-hidden transition-opacity duration-500 ${splashFading ? 'opacity-0' : 'opacity-100'}`}
                        style={{ fontFamily: T.fontFamily, backgroundColor: wBg }}
                    >
                        {bgLayer}
                        {gradient}
                        {variantContent}

                        {/* Language Picker Overlay */}
                        {showLangPicker && (
                            <div className="absolute inset-0 z-20 flex flex-col" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                <div className="flex-1 bg-black/50" onClick={() => setShowLangPicker(false)} />
                                <div className="bg-[#1a1a1a] rounded-t-2xl px-4 pt-4 flex flex-col" style={{ height: '40dvh', paddingBottom: 'max(24px, env(safe-area-inset-bottom))', animation: 'slideUp 0.35s ease-out' }}>
                                    <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 shrink-0" />
                                    <div className="flex-1 flex flex-wrap gap-2.5 justify-center content-center overflow-y-auto">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => { setShowLangPicker(false); selectLanguage(lang.code); }}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${selectedLang === lang.code ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                            >
                                                <span className="text-base">{lang.flag}</span>
                                                <span>{lang.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                        `}} />
                    </div>
                );
            })()}

            {/* Translation Loading Overlay */}
            {isTranslating && (
                <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm" style={{ fontFamily: T.fontFamily }}>
                    <div className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
                    <p className="text-sm text-gray-600 font-medium">{t('loading')}</p>
                </div>
            )}

            <div className="min-h-screen pb-20" style={{ backgroundColor: T.pageBg, fontFamily: T.fontFamily }}>
                {/* Sticky Header + Category Nav */}
                <div className="sticky top-0 z-10">
                    {/* Custom Header — variant-aware */}
                    {(() => {
                        const hVariant = (T as any).headerVariant || 'classic';
                        const hBg = (T as any).menuHeaderBg || '#ffffff';
                        const hText = (T as any).menuHeaderTextColor || '#111827';
                        const hIcon = (T as any).menuHeaderIconColor || '#374151';
                        const hShadow = (() => { const s = (T as any).menuHeaderShadow || 'sm'; switch (s) { case 'none': return 'none'; case 'sm': return '0 1px 2px 0 rgba(0,0,0,0.05)'; case 'md': return '0 4px 6px -1px rgba(0,0,0,0.1)'; case 'lg': return '0 10px 15px -3px rgba(0,0,0,0.1)'; default: return '0 1px 2px 0 rgba(0,0,0,0.05)'; } })();
                        const hLogo = (T as any).headerLogo || '';
                        const bName = BUSINESS_INFO.name || 'Yükleniyor...';
                        const accentColor = (T as any).accentColor || '#000000';

                        // Reusable elements — standard hamburger icon always (18px top + 14px bottom)
                        const hamburger = <button onClick={() => setIsSidebarDrawerOpen(true)} className="flex flex-col items-start justify-center gap-[4px] z-10 p-2" style={{ color: hIcon }}><span className="block w-[18px] h-[2px] bg-current rounded-full" /><span className="block w-[14px] h-[2px] bg-current rounded-full" /></button>;
                        // Search button — no circle bg, just icon
                        const searchBtn = <button onClick={() => setIsSearchOpen(true)} className="flex items-center justify-center z-10 p-2" style={{ color: hIcon }}><Search size={20} /></button>;
                        const logoImg = hLogo ? <img src={hLogo} alt="" className="object-contain" /> : null;

                        // === CLASSIC ===
                        if (hVariant === 'classic') return (
                            <div className="h-[60px] flex items-center justify-between px-4 relative" style={{ backgroundColor: hBg, boxShadow: hShadow }}>
                                {hamburger}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg truncate max-w-[60%] text-center" style={{ color: hText }}>{bName}</span>
                                {searchBtn}
                            </div>
                        );

                        // === TALL ===
                        if (hVariant === 'tall') return (
                            <div className="h-[80px] flex items-center justify-between px-4 relative" style={{ backgroundColor: hBg, boxShadow: hShadow }}>
                                {hamburger}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-[60%]">
                                    <span className="font-bold text-xl truncate block" style={{ color: hText }}>{bName}</span>
                                    {BUSINESS_INFO.description && <span className="text-xs truncate block mt-0.5" style={{ color: hText, opacity: 0.5 }}>{BUSINESS_INFO.description}</span>}
                                </div>
                                {searchBtn}
                            </div>
                        );

                        // === CENTER-LOGO ===
                        if (hVariant === 'center-logo') return (
                            <div className="flex flex-col items-center pb-2 pt-3 px-4 relative" style={{ backgroundColor: hBg, boxShadow: hShadow }}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">{hamburger}</div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">{searchBtn}</div>
                                {logoImg ? <div className="w-12 h-12 rounded-full overflow-hidden border-2 mb-1" style={{ borderColor: hIcon + '33' }}><img src={hLogo} alt="" className="w-full h-full object-cover" /></div> : <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center mb-1 text-lg font-bold" style={{ borderColor: hIcon + '33', color: hText, backgroundColor: hBg }}>{bName.charAt(0)}</div>}
                                <span className="font-bold text-sm truncate max-w-[70%]" style={{ color: hText }}>{bName}</span>
                            </div>
                        );

                        // === LEFT-LOGO ===
                        if (hVariant === 'left-logo') return (
                            <div className="h-[60px] flex items-center justify-between px-4" style={{ backgroundColor: hBg, boxShadow: hShadow }}>
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {logoImg ? <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: hIcon + '22' }}><img src={hLogo} alt="" className="w-full h-full object-cover" /></div> : <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-bold" style={{ backgroundColor: hBg, color: hText, border: `1px solid ${hIcon}22` }}>{bName.charAt(0)}</div>}
                                    <span className="font-bold text-lg truncate" style={{ color: hText }}>{bName}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {searchBtn}
                                    {hamburger}
                                </div>
                            </div>
                        );

                        // === LANG ===
                        if (hVariant === 'lang') return (
                            <div className="h-[60px] flex items-center justify-between px-4" style={{ backgroundColor: hBg, boxShadow: hShadow }}>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {hamburger}
                                    {logoImg ? <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: hIcon + '22' }}><img src={hLogo} alt="" className="w-full h-full object-cover" /></div> : <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold" style={{ backgroundColor: hBg, color: hText, border: `1px solid ${hIcon}22` }}>{bName.charAt(0)}</div>}
                                    <span className="font-bold text-lg truncate" style={{ color: hText }}>{bName}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button className="flex items-center justify-center p-2" style={{ color: hIcon }}><Globe size={18} /></button>
                                    {searchBtn}
                                </div>
                            </div>
                        );

                        // === BANNER ===
                        if (hVariant === 'banner') return (
                            <div className="h-[100px] flex items-end justify-between px-4 pb-3 relative overflow-hidden" style={{ boxShadow: hShadow }}>
                                <div className="absolute inset-0" style={{ backgroundColor: hBg }} />
                                {hLogo && <img src={hLogo} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                                <div className="relative flex items-end justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setIsSidebarDrawerOpen(true)} className="flex flex-col items-start justify-center gap-[4px] p-2 text-white/90"><span className="block w-[18px] h-[2px] bg-current rounded-full" /><span className="block w-[14px] h-[2px] bg-current rounded-full" /></button>
                                        <span className="font-bold text-xl text-white drop-shadow-lg truncate max-w-[200px]">{bName}</span>
                                    </div>
                                    <button onClick={() => setIsSearchOpen(true)} className="flex items-center justify-center p-2 text-white/90"><Search size={20} /></button>
                                </div>
                            </div>
                        );

                        // === MINIMAL ===
                        if (hVariant === 'minimal') return (
                            <div className="h-[48px] flex items-center justify-between px-4 relative" style={{ backgroundColor: hBg, boxShadow: hShadow }}>
                                {hamburger}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-sm tracking-wide uppercase truncate max-w-[60%] text-center" style={{ color: hText }}>{bName}</span>
                                {searchBtn}
                            </div>
                        );

                        // === ROUNDED ===
                        if (hVariant === 'rounded') return (
                            <div className="h-[60px] flex items-center justify-between px-4 relative" style={{ backgroundColor: hBg, boxShadow: hShadow, borderRadius: '0 0 20px 20px' }}>
                                {hamburger}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg truncate max-w-[60%] text-center" style={{ color: hText }}>{bName}</span>
                                {searchBtn}
                            </div>
                        );

                        // === SPLIT (name left, icons right) ===
                        if (hVariant === 'split') return (
                            <div className="h-[60px] flex items-center justify-between px-4" style={{ backgroundColor: hBg, boxShadow: hShadow }}>
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {hamburger}
                                    <span className="font-bold text-lg truncate" style={{ color: hText }}>{bName}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {searchBtn}
                                </div>
                            </div>
                        );

                        // === ACCENT-BAR (colored accent line at bottom) ===
                        if (hVariant === 'accent-bar') return (
                            <div className="relative" style={{ backgroundColor: hBg, boxShadow: hShadow }}>
                                <div className="h-[60px] flex items-center justify-between px-4 relative">
                                    {hamburger}
                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg truncate max-w-[60%] text-center" style={{ color: hText }}>{bName}</span>
                                    {searchBtn}
                                </div>
                                <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88, ${accentColor}22)` }} />
                            </div>
                        );

                        // === GLASS (glassmorphism) ===
                        if (hVariant === 'glass') return (
                            <div className="h-[60px] flex items-center justify-between px-4 relative backdrop-blur-md" style={{ backgroundColor: hBg + 'cc', boxShadow: hShadow, borderBottom: `1px solid ${hIcon}15` }}>
                                {hamburger}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg truncate max-w-[60%] text-center" style={{ color: hText }}>{bName}</span>
                                {searchBtn}
                            </div>
                        );

                        // === OVERLAY (transparent, dashed border) ===
                        if (hVariant === 'overlay') return (
                            <div className="h-[60px] flex items-center justify-between px-4 relative" style={{ backgroundColor: 'transparent', borderBottom: `1px dashed ${hIcon}40` }}>
                                {hamburger}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg truncate max-w-[60%] text-center" style={{ color: hText, opacity: 0.8 }}>{bName}</span>
                                {searchBtn}
                            </div>
                        );

                        // === GRADIENT (background gradient) ===
                        if (hVariant === 'gradient') return (
                            <div className="h-[60px] flex items-center justify-between px-4 relative" style={{ background: `linear-gradient(135deg, ${hBg}, ${hIcon}30)`, boxShadow: hShadow }}>
                                {hamburger}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg truncate max-w-[60%] text-center" style={{ color: hText }}>{bName}</span>
                                {searchBtn}
                            </div>
                        );

                        // === NEON (glowing border) ===
                        if (hVariant === 'neon') return (
                            <div className="h-[60px] flex items-center justify-between px-4 relative" style={{ backgroundColor: hBg, border: `1.5px solid ${hIcon}`, boxShadow: `0 0 12px ${hIcon}40, inset 0 0 12px ${hIcon}10` }}>
                                {hamburger}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg truncate max-w-[60%] text-center" style={{ color: hText }}>{bName}</span>
                                {searchBtn}
                            </div>
                        );

                        // === BOXED (thick bordered frame) ===
                        if (hVariant === 'boxed') return (
                            <div className="mx-3 mt-2 rounded-xl h-[56px] flex items-center justify-between px-4 relative" style={{ backgroundColor: hBg, border: `2px solid ${hIcon}`, boxShadow: `0 3px 0 ${hIcon}40` }}>
                                {hamburger}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg truncate max-w-[60%] text-center" style={{ color: hText }}>{bName}</span>
                                {searchBtn}
                            </div>
                        );

                        // Fallback = classic
                        return (
                            <div className="h-[60px] flex items-center justify-between px-4 relative" style={{ backgroundColor: hBg, boxShadow: hShadow }}>
                                {hamburger}
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg truncate max-w-[60%] text-center" style={{ color: hText }}>{bName}</span>
                                {searchBtn}
                            </div>
                        );
                    })()}

                    {/* Category Navbar */}
                    <div ref={categoryNavRef} className="overflow-x-auto no-scrollbar py-3 px-4 flex gap-2" style={{
                        backgroundColor: (T as any).categoryNavBg || T.pageBg,
                    }}>
                        {DISPLAY_CATEGORIES.map((cat) => {
                            const btnShadow = (T as any).categoryBtnCustomShadow || ((T as any).categoryBtnShadow && (T as any).categoryBtnShadow !== 'none' ? getShadow((T as any).categoryBtnShadow) : 'none');
                            return (
                                <button
                                    key={cat.id}
                                    data-cat={cat.id}
                                    onClick={() => scrollToCategory(cat.id)}
                                    className="whitespace-nowrap text-sm font-medium transition-all px-4 py-2"
                                    style={{
                                        backgroundColor: activeCategory === cat.id ? T.categoryActiveBg : T.categoryInactiveBg,
                                        color: activeCategory === cat.id ? T.categoryActiveText : T.categoryInactiveText,
                                        borderRadius: `${T.categoryRadius}px`,
                                        boxShadow: btnShadow,
                                    }}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Hero Slider (JS Based) — below category nav */}
                {T.showHeroSlider !== 'false' && (
                    <div className="w-full h-[300px] relative overflow-hidden bg-gray-100">
                        <div
                            className="flex h-full w-full transition-transform duration-700 ease-in-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {/* Slide 1 */}
                            <div className="min-w-full h-full relative flex-shrink-0">
                                <div className="absolute inset-0 p-[30px] flex flex-col justify-center text-gray-900">
                                    <h3 className="text-xl font-medium mb-2 opacity-80">{t('specialRecipes')}</h3>
                                    <h1 className="text-4xl font-bold leading-tight">{t('flavorFeast')}</h1>
                                </div>
                            </div>
                            {/* Slide 2 */}
                            <div className="min-w-full h-full relative flex-shrink-0">
                                <div className="absolute inset-0 p-[30px] flex flex-col justify-center text-gray-900">
                                    <h3 className="text-xl font-medium mb-2 opacity-80">{t('freshNatural')}</h3>
                                    <h1 className="text-4xl font-bold leading-tight">{t('bestOfSeason')}</h1>
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
                )}

                {/* Product List (Grouped by Category) */}
                <div className="pb-20">
                    {DISPLAY_CATEGORIES.map((cat) => {
                        const products =
                            cat.id === "populer"
                                ? DISPLAY_PRODUCTS.filter((p) => p.isPopular)
                                : DISPLAY_PRODUCTS.filter((p) => p.categoryId === cat.id);

                        if (products.length === 0) return null;

                        const defaultLayout = (T as any).layoutVariant || 'list';
                        const layout = categoryLayoutOverrides[cat.id] || defaultLayout;

                        // Shared image renderer
                        const renderImage = (product: any, className: string, imgRadius?: string) => (
                            <div className={`relative overflow-hidden ${className}`} style={{ borderRadius: imgRadius || `${T.cardImageRadius}px` }}>
                                {product.video ? (
                                    <>
                                        <video src={product.video} poster={product.image || undefined} muted autoPlay loop playsInline preload="auto" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"><span className="text-white text-[10px] ml-0.5">▶</span></div>
                                    </>
                                ) : product.image ? (
                                    <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-400 text-2xl">🍽️</span></div>
                                )}
                            </div>
                        );

                        // Shared card click handler
                        const handleClick = (product: any) => { setSelectedProduct(product); trackProductView(product.id); };

                        return (
                            <div key={cat.id} id={cat.id} className="rounded-xl px-4" style={{ backgroundColor: (T as any).categorySectionBg || 'transparent', marginBottom: '4px' }}>
                                {/* Category Header */}
                                <div className="pt-6 pb-3">
                                    <h2 className="text-lg" style={{ color: T.categoryTitleColor, fontWeight: T.categoryTitleWeight }}>{cat.name}</h2>
                                </div>

                                {/* ── LAYOUT: list (default) ── */}
                                {layout === 'list' && (
                                    <div className="space-y-2.5">
                                        {products.map((product) => (
                                            <div key={product.id} onClick={() => handleClick(product)} className="p-2 flex gap-3 min-h-[88px] active:scale-[0.98] transition-transform cursor-pointer overflow-hidden" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                {renderImage(product, 'w-20 h-[72px] shrink-0')}
                                                <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 overflow-hidden">
                                                    <div>
                                                        <h3 className="line-clamp-1 text-base" style={{ color: T.productNameColor, fontWeight: T.productNameWeight }}>{product.name}</h3>
                                                        <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: T.productDescColor }}>{product.description}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg" style={{ color: T.priceColor, fontWeight: T.priceWeight }}>{product.price} TL</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── LAYOUT: grid-2 ── */}
                                {layout === 'grid-2' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {products.map((product) => (
                                            <div key={product.id} onClick={() => handleClick(product)} className="overflow-hidden active:scale-[0.98] transition-transform cursor-pointer" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                {renderImage(product, 'w-full h-28', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                <div className="p-2.5">
                                                    <h3 className="line-clamp-1 mb-0.5 text-sm" style={{ color: T.productNameColor, fontWeight: T.productNameWeight }}>{product.name}</h3>
                                                    <p className="line-clamp-1 mb-1.5 text-[11px]" style={{ color: T.productDescColor }}>{product.description}</p>
                                                    <span className="text-sm" style={{ color: T.priceColor, fontWeight: T.priceWeight }}>{product.price} TL</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── LAYOUT: grid-3 ── */}
                                {layout === 'grid-3' && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {products.map((product) => (
                                            <div key={product.id} onClick={() => handleClick(product)} className="overflow-hidden active:scale-[0.98] transition-transform cursor-pointer" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                {renderImage(product, 'w-full h-20', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                <div className="p-1.5">
                                                    <h3 className="line-clamp-1 text-xs font-semibold" style={{ color: T.productNameColor }}>{product.name}</h3>
                                                    <span className="text-xs mt-0.5 block" style={{ color: T.priceColor, fontWeight: T.priceWeight }}>{product.price} TL</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── LAYOUT: horizontal scroll ── */}
                                {layout === 'horizontal' && (() => {
                                    const itemsPerPage = 2;
                                    const totalPages = Math.ceil(products.length / itemsPerPage);
                                    return (
                                        <div>
                                            <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory">
                                                <div className="flex gap-3" style={{ width: 'max-content' }}>
                                                    {products.map((product) => (
                                                        <div key={product.id} onClick={() => handleClick(product)} className="w-[140px] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer shrink-0 snap-start" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                            {renderImage(product, 'w-full h-24', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                            <div className="p-2">
                                                                <h3 className="line-clamp-1 text-sm font-semibold" style={{ color: T.productNameColor }}>{product.name}</h3>
                                                                <p className="line-clamp-1 mt-0.5 text-xs" style={{ color: T.productDescColor }}>{product.description}</p>
                                                                <span className="text-sm font-bold mt-1 block" style={{ color: T.priceColor }}>{product.price} TL</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {totalPages > 1 && (
                                                <div className="flex justify-center gap-1.5 mt-3">
                                                    {Array.from({ length: totalPages }).map((_, i) => (
                                                        <div key={i} className="w-2 h-2 rounded-full transition-all" style={{ backgroundColor: i === 0 ? T.accentColor : `${T.productDescColor || '#888'}40` }} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* ── LAYOUT: magazine ── */}
                                {layout === 'magazine' && (
                                    <div className="space-y-3">
                                        {/* First product large */}
                                        {products[0] && (
                                            <div onClick={() => handleClick(products[0])} className="overflow-hidden active:scale-[0.98] transition-transform cursor-pointer" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                {renderImage(products[0], 'w-full h-44', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                <div className="p-3">
                                                    <h3 className="line-clamp-1 text-base" style={{ color: T.productNameColor, fontWeight: T.productNameWeight }}>{products[0].name}</h3>
                                                    <p className="line-clamp-2 mt-1 text-xs" style={{ color: T.productDescColor }}>{products[0].description}</p>
                                                    <span className="mt-2 block text-lg" style={{ color: T.priceColor, fontWeight: T.priceWeight }}>{products[0].price} TL</span>
                                                </div>
                                            </div>
                                        )}
                                        {/* Rest in 2-col grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {products.slice(1).map((product) => (
                                                <div key={product.id} onClick={() => handleClick(product)} className="overflow-hidden active:scale-[0.98] transition-transform cursor-pointer" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                    {renderImage(product, 'w-full h-24', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                    <div className="p-2">
                                                        <h3 className="line-clamp-1 text-sm font-semibold" style={{ color: T.productNameColor }}>{product.name}</h3>
                                                        <span className="text-sm font-bold mt-1 block" style={{ color: T.priceColor }}>{product.price} TL</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── LAYOUT: compact ── */}
                                {layout === 'compact' && (
                                    <div className="px-4">
                                        {products.map((product, idx) => (
                                            <div key={product.id} onClick={() => handleClick(product)} className={`flex items-center gap-3 py-3 cursor-pointer active:bg-gray-50 transition-colors ${idx > 0 ? 'border-t' : ''}`} style={{ borderColor: T.cardBorder }}>
                                                {renderImage(product, 'w-12 h-12 shrink-0', '8px')}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="line-clamp-1 text-sm font-semibold" style={{ color: T.productNameColor }}>{product.name}</h3>
                                                    <p className="line-clamp-1 text-xs mt-0.5" style={{ color: T.productDescColor }}>{product.description}</p>
                                                </div>
                                                <span className="text-sm font-bold shrink-0" style={{ color: T.priceColor }}>{product.price} TL</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── LAYOUT: full-card ── */}
                                {layout === 'full-card' && (
                                    <div className="space-y-4">
                                        {products.map((product) => (
                                            <div key={product.id} onClick={() => handleClick(product)} className="overflow-hidden active:scale-[0.98] transition-transform cursor-pointer" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                {renderImage(product, 'w-full h-48', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                <div className="p-4">
                                                    <h3 className="line-clamp-1 text-lg" style={{ color: T.productNameColor, fontWeight: T.productNameWeight }}>{product.name}</h3>
                                                    <p className="line-clamp-2 mt-1 text-xs" style={{ color: T.productDescColor }}>{product.description}</p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-xl" style={{ color: T.priceColor, fontWeight: T.priceWeight }}>{product.price} TL</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}


                                {/* ── LAYOUT: text-only ── */}
                                {layout === 'text-only' && (
                                    <div className="px-4" style={{ backgroundColor: T.cardBg, borderRadius: `${T.cardRadius}px`, border: `1px solid ${T.cardBorder}`, boxShadow: getShadow(T.cardShadow) }}>
                                        {products.map((product, idx) => (
                                            <div key={product.id} onClick={() => handleClick(product)} className={`flex items-center justify-between py-3.5 px-3 cursor-pointer hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t' : ''}`} style={{ borderColor: T.cardBorder }}>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold" style={{ color: T.productNameColor }}>{product.name}</h3>
                                                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: T.productDescColor }}>{product.description}</p>
                                                </div>
                                                <span className="text-sm font-bold shrink-0 ml-4" style={{ color: T.priceColor }}>{product.price} TL</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ===== ALL OVERLAYS ARE OUTSIDE MAIN SCROLL CONTAINER ===== */}

            {/* Business Profile Overlay */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain" style={{ backgroundColor: T.pageBg || '#ffffff' }}>
                    {/* Back Button - Sticky */}
                    <button
                        onClick={() => setIsProfileOpen(false)}
                        className="fixed top-4 left-4 z-[51] w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                    >
                        <ChevronLeft size={22} />
                    </button>

                    {/* Business Image Section */}
                    <div className="relative w-full" style={{ height: '45vh' }}>
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
                        {/* Business Name on Image */}
                        <div className="absolute bottom-8 left-5 right-5">
                            <h1 className="text-3xl font-bold text-white drop-shadow-lg">{BUSINESS_INFO.name}</h1>
                        </div>
                    </div>

                    {/* Detail Card - scrolls with page */}
                    <div
                        className="relative -mt-6"
                        style={{ borderRadius: '25px 25px 0 0', backgroundColor: T.cardBg || '#ffffff' }}
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
                                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t('address')}</p>
                                        <p className="text-sm font-medium text-gray-900">{BUSINESS_INFO.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <Phone size={18} className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t('phone')}</p>
                                        <p className="text-sm font-medium text-gray-900">{BUSINESS_INFO.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                        <Mail size={18} className="text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t('email')}</p>
                                        <p className="text-sm font-medium text-gray-900">{BUSINESS_INFO.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                        <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                            <Globe size={18} className="text-sky-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{t('web')}</p>
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
                                <h3 className="text-base font-bold text-gray-900 mb-3">{t('workingHours')}</h3>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="space-y-2.5">
                                        {BUSINESS_INFO.workingHours.map((item, i) => {
                                            const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long' });
                                            const isToday = item.day.toLowerCase() === today.toLowerCase();
                                            return (
                                                <div key={i} className={`flex items-center justify-between py-1 ${isToday ? '' : ''}`}>
                                                    <span className={`text-sm ${isToday ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                        {item.day}
                                                        {isToday && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{t('today')}</span>}
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




            {/* Sidebar Drawer */}
            {isSidebarDrawerOpen && (() => {
                const FEATURE_MAP: Record<string, { tr: string; en: string; Icon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> }> = {
                    no_smoking: { tr: 'Sigara İçilmez', en: 'No Smoking', Icon: CigaretteOff },
                    kids_area: { tr: 'Çocuk Alanı', en: 'Kids Area', Icon: Baby },
                    parking: { tr: 'Park Alanı', en: 'Parking', Icon: Car },
                    wifi: { tr: 'Ücretsiz Wi-Fi', en: 'Free Wi-Fi', Icon: Wifi },
                    live_music: { tr: 'Canlı Müzik', en: 'Live Music', Icon: Music },
                    valet: { tr: 'Vale Hizmeti', en: 'Valet Service', Icon: Car },
                    wheelchair: { tr: 'Engelli Erişimi', en: 'Wheelchair Access', Icon: Accessibility },
                    outdoor: { tr: 'Açık Alan', en: 'Outdoor Seating', Icon: TreePine },
                    indoor: { tr: 'Kapalı Alan', en: 'Indoor Seating', Icon: Home },
                    pet_friendly: { tr: 'Pet Friendly', en: 'Pet Friendly', Icon: PawPrint },
                    alcohol: { tr: 'Alkol Servisi', en: 'Alcohol Served', Icon: Wine },
                    breakfast: { tr: 'Kahvaltı', en: 'Breakfast', Icon: Coffee },
                    delivery: { tr: 'Paket Servis', en: 'Delivery', Icon: Truck },
                    takeaway: { tr: 'Gel-Al', en: 'Takeaway', Icon: ShoppingBag },
                    reservation_available: { tr: 'Rezervasyon', en: 'Reservation', Icon: CalendarDays },
                };
                const mapsUrl = BUSINESS_INFO.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_INFO.address)}` : '';
                return (
                    <div className="fixed inset-0 z-[60]" style={{ fontFamily: T.fontFamily }}>
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsSidebarDrawerOpen(false)}
                            style={{ animation: 'fadeIn 0.2s ease-out' }}
                        />
                        {/* Drawer */}
                        <div
                            className="absolute top-0 left-0 bottom-0 w-[300px] shadow-2xl flex flex-col overflow-y-auto"
                            style={{ backgroundColor: T.sidebarBg || '#ffffff', animation: 'slideInLeft 0.3s ease-out' }}
                        >
                            {/* ── Logo + Name + Description ── */}
                            <div className="px-5 pt-6 pb-4 relative" style={{ borderBottom: `1px solid ${T.sidebarBorder || '#f3f4f6'}` }}>
                                {/* Close button - top right */}
                                <button onClick={() => setIsSidebarDrawerOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors" style={{ border: `1px solid ${T.sidebarCloseBtnBorder || '#e5e7eb'}`, color: T.sidebarCloseBtnColor || '#9ca3af' }}>
                                    <ChevronLeft size={16} />
                                </button>
                                {/* Logo */}
                                {BUSINESS_INFO.image ? (
                                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 mb-3" style={{ border: `2px solid ${T.sidebarBorder || '#e5e7eb'}` }}>
                                        <img src={BUSINESS_INFO.image} alt={BUSINESS_INFO.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 mb-3" style={{ backgroundColor: '#000000' }}>
                                        {BUSINESS_INFO.name.charAt(0)}
                                    </div>
                                )}
                                {/* Name + Description below logo */}
                                <p className="font-bold text-sm leading-tight" style={{ color: T.sidebarNameColor || '#111827' }}>{BUSINESS_INFO.name}</p>
                                {BUSINESS_INFO.description && <p className="text-xs mt-1 leading-relaxed break-words pr-8" style={{ color: T.sidebarDescColor || '#9ca3af' }}>{BUSINESS_INFO.description}</p>}
                            </div>

                            {/* ── Navigation: MENÜ / DİL ── */}
                            <div className="px-5 py-3" style={{ borderBottom: `1px solid ${T.sidebarBorder || '#f3f4f6'}` }}>
                                <button
                                    onClick={() => { setIsSidebarDrawerOpen(false); }}
                                    className="w-full text-left py-2.5 text-sm font-semibold tracking-wide transition-colors"
                                    style={{ color: T.sidebarItemColor || '#374151' }}
                                >
                                    {t('btnMenu')}
                                </button>
                                <button
                                    onClick={() => { setIsSidebarDrawerOpen(false); setShowLangSplash(true); setShowLangPicker(true); }}
                                    className="w-full text-left py-2.5 text-sm font-semibold tracking-wide transition-colors"
                                    style={{ color: T.sidebarItemColor || '#374151' }}
                                >
                                    {t('btnLanguage')}
                                </button>
                            </div>

                            {/* ── İletişim: WhatsApp / E-posta / Yol Tarifi ── */}
                            {(BUSINESS_INFO.whatsapp || BUSINESS_INFO.email || BUSINESS_INFO.address) && (
                                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${T.sidebarBorder || '#f3f4f6'}` }}>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: T.sidebarLabelColor || '#9ca3af' }}>{selectedLang === 'tr' ? 'İletişim' : 'Contact'}</p>
                                    <div className="space-y-1">
                                        {BUSINESS_INFO.whatsapp && (
                                            <a href={`https://wa.me/${BUSINESS_INFO.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2 text-sm font-medium transition-colors" style={{ color: T.sidebarItemColor || '#374151' }}>
                                                <MessageCircle size={16} style={{ color: T.sidebarItemIconColor || '#9ca3af' }} />
                                                WhatsApp
                                            </a>
                                        )}
                                        {BUSINESS_INFO.email && (
                                            <a href={`mailto:${BUSINESS_INFO.email}`} className="flex items-center gap-3 py-2 text-sm font-medium transition-colors" style={{ color: T.sidebarItemColor || '#374151' }}>
                                                <Mail size={16} style={{ color: T.sidebarItemIconColor || '#9ca3af' }} />
                                                {selectedLang === 'tr' ? 'E-posta' : 'Email'}
                                            </a>
                                        )}
                                        {mapsUrl && (
                                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2 text-sm font-medium transition-colors" style={{ color: T.sidebarItemColor || '#374151' }}>
                                                <MapPin size={16} style={{ color: T.sidebarItemIconColor || '#9ca3af' }} />
                                                {selectedLang === 'tr' ? 'Yol Tarifi Al' : 'Get Directions'}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Mutfaklar ── */}
                            {BUSINESS_INFO.cuisines && BUSINESS_INFO.cuisines.length > 0 && (
                                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${T.sidebarBorder || '#f3f4f6'}` }}>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: T.sidebarLabelColor || '#9ca3af' }}>{selectedLang === 'tr' ? 'Mutfaklar' : 'Cuisines'}</p>
                                    <p className="text-sm leading-relaxed" style={{ color: T.sidebarItemColor || '#374151' }}>
                                        {BUSINESS_INFO.cuisines.join(' · ')}
                                    </p>
                                </div>
                            )}

                            {/* ── İşletme Özellikleri ── */}
                            {BUSINESS_INFO.features && BUSINESS_INFO.features.length > 0 && (
                                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${T.sidebarBorder || '#f3f4f6'}` }}>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: T.sidebarLabelColor || '#9ca3af' }}>{selectedLang === 'tr' ? 'İşletme Özellikleri' : 'Amenities'}</p>
                                    <div className="space-y-1">
                                        {BUSINESS_INFO.features.map((f: string) => {
                                            const feat = FEATURE_MAP[f];
                                            if (!feat) return null;
                                            return (
                                                <div key={f} className="flex items-center gap-2.5 py-1.5 text-sm" style={{ color: T.sidebarItemColor || '#374151' }}>
                                                    <feat.Icon size={16} style={{ color: T.sidebarItemIconColor || '#9ca3af' }} />
                                                    <span className="font-medium">{selectedLang === 'tr' ? feat.tr : feat.en}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── Wi-Fi Bilgileri ── */}
                            {(BUSINESS_INFO.wifiName || BUSINESS_INFO.wifiPassword) && (
                                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${T.sidebarBorder || '#f3f4f6'}` }}>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: T.sidebarLabelColor || '#9ca3af' }}>
                                        <Wifi size={12} className="inline mr-1" />
                                        {selectedLang === 'tr' ? 'Wi-Fi' : 'Wi-Fi'}
                                    </p>
                                    <div className="space-y-2">
                                        {BUSINESS_INFO.wifiName && (
                                            <div className="flex items-center justify-between py-1.5 text-sm">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: T.sidebarDescColor || '#9ca3af' }}>{selectedLang === 'tr' ? 'Ağ Adı' : 'Network'}</p>
                                                    <p className="font-medium" style={{ color: T.sidebarItemColor || '#374151' }}>{BUSINESS_INFO.wifiName}</p>
                                                </div>
                                                <button onClick={() => { navigator.clipboard.writeText(BUSINESS_INFO.wifiName); }} className="p-1.5 rounded-lg transition-colors" style={{ color: T.sidebarItemIconColor || '#9ca3af' }} title="Kopyala">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        )}
                                        {BUSINESS_INFO.wifiPassword && (
                                            <div className="flex items-center justify-between py-1.5 text-sm">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: T.sidebarDescColor || '#9ca3af' }}>{selectedLang === 'tr' ? 'Şifre' : 'Password'}</p>
                                                    <p className="font-medium font-mono" style={{ color: T.sidebarItemColor || '#374151' }}>{BUSINESS_INFO.wifiPassword}</p>
                                                </div>
                                                <button onClick={() => { navigator.clipboard.writeText(BUSINESS_INFO.wifiPassword); }} className="p-1.5 rounded-lg transition-colors" style={{ color: T.sidebarItemIconColor || '#9ca3af' }} title="Kopyala">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Çalışma Saatleri ── */}
                            {BUSINESS_INFO.workingHours && BUSINESS_INFO.workingHours.length > 0 && (
                                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${T.sidebarBorder || '#f3f4f6'}` }}>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: T.sidebarLabelColor || '#9ca3af' }}>{t('workingHours')}</p>
                                    <div className="space-y-1">
                                        {BUSINESS_INFO.workingHours.map((wh: { day: string; hours: string }) => (
                                            <div key={wh.day} className="flex items-center justify-between py-1 text-xs" style={{ color: T.sidebarItemColor || '#374151' }}>
                                                <span className="font-medium">{wh.day}</span>
                                                <span style={{ color: wh.hours === 'Kapalı' ? '#ef4444' : (T.sidebarDescColor || '#9ca3af') }}>{wh.hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Powered by ── */}
                            <div className="px-5 py-4 text-center mt-auto">
                                <p className="text-[10px] font-medium" style={{ color: T.sidebarDescColor || '#d1d5db' }}>Powered by <span className="font-bold">QRlex</span></p>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Product Detail Overlay */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain" style={{ backgroundColor: T.pageBg || '#ffffff' }}>
                    {/* Back Button - Sticky */}
                    <button
                        onClick={() => setSelectedProduct(null)}
                        className="fixed top-4 left-4 z-[51] w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
                        style={{ backgroundColor: T.detailBackBtnBg || '#00000066', color: T.detailBackBtnColor || '#ffffff' }}
                    >
                        <ChevronLeft size={22} />
                    </button>

                    {/* Product Media Section */}
                    <div className="relative w-full" style={{ height: '45vh' }}>
                        {selectedProduct.video ? (
                            <video
                                src={selectedProduct.video}
                                poster={selectedProduct.image || undefined}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="auto"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : selectedProduct.image ? (
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
                    </div>

                    {/* Detail Card - scrolls with page */}
                    <div
                        className="relative -mt-6"
                        style={{ borderRadius: '25px 25px 0 0', backgroundColor: T.detailBg || '#ffffff' }}
                    >
                        <div className="px-5 pt-7 pb-10">
                            {/* Product Name & Price */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <h2 className="text-2xl font-bold leading-tight" style={{ color: T.detailNameColor || '#111827' }}>{selectedProduct.name}</h2>
                                <span className="text-2xl font-bold whitespace-nowrap" style={{ color: T.detailPriceColor || '#000000' }}>{selectedProduct.price} TL</span>
                            </div>

                            {/* Description */}
                            <p className="text-sm leading-relaxed mb-5" style={{ color: T.detailDescColor || '#6b7280' }}>{selectedProduct.description}</p>

                            {/* Prep Time & Calories */}
                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 rounded-xl p-3.5 flex items-center gap-3" style={{ backgroundColor: T.detailInfoBg || '#f9fafb', border: `1px solid ${T.detailInfoBorder || '#f3f4f6'}` }}>
                                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                        <Clock size={18} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: T.detailDescColor || '#9ca3af' }}>Hazırlanış</p>
                                        <p className="text-sm font-semibold" style={{ color: T.detailNameColor || '#111827' }}>{selectedProduct.prepTime}</p>
                                    </div>
                                </div>
                                <div className="flex-1 rounded-xl p-3.5 flex items-center gap-3" style={{ backgroundColor: T.detailInfoBg || '#f9fafb', border: `1px solid ${T.detailInfoBorder || '#f3f4f6'}` }}>
                                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <Flame size={18} className="text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: T.detailDescColor || '#9ca3af' }}>Kalori</p>
                                        <p className="text-sm font-semibold" style={{ color: T.detailNameColor || '#111827' }}>{selectedProduct.calories}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div className="mb-6">
                                <h3 className="text-base font-bold mb-3" style={{ color: T.detailLabelColor || '#111827' }}>📋 İçindekiler</h3>
                                <div className="rounded-xl p-4" style={{ backgroundColor: T.detailInfoBg || '#f9fafb', border: `1px solid ${T.detailInfoBorder || '#f3f4f6'}` }}>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProduct.ingredients.map((item, i) => (
                                            <span
                                                key={i}
                                                className="text-xs font-medium px-3 py-1.5 rounded-full"
                                                style={{ backgroundColor: T.detailIngredientBg || '#ffffff', color: T.detailIngredientText || '#374151', border: `1px solid ${T.detailIngredientBorder || '#e5e7eb'}` }}
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
                                    <h3 className="text-base font-bold mb-3" style={{ color: T.detailLabelColor || '#111827' }}>⚠️ Alerjen Uyarısı</h3>
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
                <div className="fixed inset-0 z-50 flex flex-col p-4 overflow-hidden overscroll-none" style={{ backgroundColor: T.searchOverlayBg || '#ffffff' }}>
                    <div className="flex items-center gap-3 pb-4" style={{ borderBottom: `1px solid ${T.searchOverlayBorderColor || '#f3f4f6'}` }}>
                        <Search size={20} style={{ color: T.searchOverlayIconColor || '#9ca3af' }} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Ürün ara..."
                            className="flex-1 outline-none text-lg bg-transparent"
                            style={{ color: T.searchOverlayInputColor || '#000000' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="p-2">
                            <X size={24} style={{ color: T.searchOverlayCloseColor || '#1f2937' }} />
                        </button>
                    </div>
                    <div className="mt-4 flex-1 overflow-y-auto space-y-3">
                        {!searchQuery && (
                            <p className="text-center mt-10" style={{ color: T.searchOverlayEmptyColor || '#9ca3af' }}>
                                Aramak istediğiniz ürünü yazın...
                            </p>
                        )}

                        {searchQuery && searchResults.length === 0 && (
                            <p className="text-center mt-10" style={{ color: T.searchOverlayEmptyColor || '#9ca3af' }}>
                                Sonuç bulunamadı.
                            </p>
                        )}

                        {searchQuery &&
                            searchResults.map((product) => (
                                <div
                                    key={product.id}
                                    className="rounded-xl p-3 flex gap-3 h-24"
                                    style={{ backgroundColor: T.searchOverlayResultBg || '#f9fafb' }}
                                >
                                    <div className="relative w-20 h-full shrink-0">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 rounded-lg" />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold line-clamp-1" style={{ color: T.searchOverlayResultNameColor || '#111827' }}>
                                                {product.name}
                                            </h3>
                                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: T.searchOverlayResultDescColor || '#6b7280' }}>
                                                {product.description}
                                            </p>
                                        </div>
                                        <div className="font-bold" style={{ color: T.searchOverlayResultPriceColor || '#000000' }}>
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
                    style={{ bottom: 20, right: 10 }}
                >
                    <ChevronUp size={24} />
                </button>
            )}

            {/* Bottom Action Bar removed */}

            {/* Success Toast Alert */}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.7); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </>
    );
}

