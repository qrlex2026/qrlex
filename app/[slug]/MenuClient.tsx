"use client";

import { useState, useEffect, useRef } from "react";
// Using regular img tags for external URLs
import { Info, Star, Search, X, ChevronUp, Clock, Flame, AlertTriangle, ChevronLeft, ArrowRight, ChevronRight, MapPin, Phone, Globe, Instagram, Mail, ThumbsUp, MessageCircle, Send, Utensils, HandHeart, Music, BadgeDollarSign, Check, Loader2, CalendarDays, Users, Menu } from "lucide-react";
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
    restaurantId: string;
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
    restaurantId,
}: MenuClientProps) {
    const [activeCategory, setActiveCategory] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);
    const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
    const [reviewName, setReviewName] = useState("");
    const [reviewPhone, setReviewPhone] = useState("");
    const [reviewComment, setReviewComment] = useState("");
    const [categoryRatings, setCategoryRatings] = useState({ yemek: 0, hizmet: 0, ambiyans: 0, fiyat: 0, temizlik: 0, sunum: 0 });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    // Reservation states
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const [reserveStep, setReserveStep] = useState(0);
    const [reserveDate, setReserveDate] = useState<Date | null>(null);
    const [reserveTime, setReserveTime] = useState("");
    const [reserveGuests, setReserveGuests] = useState(2);
    const [reserveName, setReserveName] = useState("");
    const [reservePhone, setReservePhone] = useState("");
    const [reserveNote, setReserveNote] = useState("");
    const [isSubmittingReserve, setIsSubmittingReserve] = useState(false);
    const [reserveSubmitted, setReserveSubmitted] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    const categoryNavRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);

    // Use server-provided data directly
    const CATEGORIES = initialCategories;
    const PRODUCTS = initialProducts;
    const BUSINESS_INFO = initialBusinessInfo;
    const REVIEWS = initialReviews;
    const [liveTheme, setLiveTheme] = useState<Record<string, string>>(initialTheme);
    const T = liveTheme;
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
    const anyOverlayOpen = showLangSplash || isProfileOpen || isReviewsOpen || isWriteReviewOpen || !!selectedProduct || isSearchOpen || isReservationOpen;
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
        reviews: { tr: "Yorumlar", en: "Reviews", de: "Bewertungen", fr: "Avis", it: "Recensioni", es: "Reseñas", pt: "Avaliações", ro: "Recenzii", sq: "Komentet", el: "Κριτικές", ka: "მიმოხილვები", ru: "Отзывы", uk: "Відгуки", az: "Rəylər", hi: "समीक्षाएं", ar: "التقييمات", fa: "نظرات", zh: "评价", ko: "리뷰", ja: "レビュー", id: "Ulasan" },
        reviewCount: { tr: "değerlendirme", en: "reviews", de: "Bewertungen", fr: "avis", it: "recensioni", es: "reseñas", pt: "avaliações", ro: "recenzii", sq: "vlerësime", el: "κριτικές", ka: "მიმოხილვა", ru: "отзывов", uk: "відгуків", az: "rəy", hi: "समीक्षाएं", ar: "تقييم", fa: "نظر", zh: "条评价", ko: "개 리뷰", ja: "件のレビュー", id: "ulasan" },
        reviewsLabel: { tr: "yorum", en: "reviews", de: "Bewertungen", fr: "avis", it: "recensioni", es: "reseñas", pt: "avaliações", ro: "recenzii", sq: "komente", el: "κριτικές", ka: "კომენტარი", ru: "отзывов", uk: "відгуків", az: "rəy", hi: "समीक्षाएं", ar: "تعليق", fa: "نظر", zh: "条评论", ko: "개 댓글", ja: "件のコメント", id: "ulasan" },
        writeReview: { tr: "Yorum Yaz", en: "Write Review", de: "Bewertung schreiben", fr: "Écrire un avis", it: "Scrivi recensione", es: "Escribir reseña", pt: "Escrever avaliação", ro: "Scrie recenzie", sq: "Shkruaj koment", el: "Γράψε κριτική", ka: "მიმოხილვის წერა", ru: "Написать отзыв", uk: "Написати відгук", az: "Rəy yaz", hi: "समीक्षा लिखें", ar: "اكتب تقييم", fa: "نوشتن نظر", zh: "写评价", ko: "리뷰 작성", ja: "レビューを書く", id: "Tulis ulasan" },
        rateUs: { tr: "Bizi Değerlendirin", en: "Rate Us", de: "Bewerten Sie uns", fr: "Évaluez-nous", it: "Valutaci", es: "Califícanos", pt: "Avalie-nos", ro: "Evaluează-ne", sq: "Na vlerëso", el: "Αξιολογήστε μας", ka: "შეგვაფასეთ", ru: "Оцените нас", uk: "Оцініть нас", az: "Bizi qiymətləndirin", hi: "हमें रेट करें", ar: "قيّمنا", fa: "به ما امتیاز دهید", zh: "给我们评分", ko: "평가하기", ja: "評価する", id: "Beri nilai" },
        rateCategoryDesc: { tr: "Her kategoriyi ayrı puanlayın", en: "Rate each category separately", de: "Bewerten Sie jede Kategorie einzeln", fr: "Notez chaque catégorie séparément", it: "Valuta ogni categoria separatamente", es: "Califique cada categoría por separado", pt: "Avalie cada categoria separadamente", ro: "Evaluați fiecare categorie separat", sq: "Vlerësoni çdo kategori veçmas", el: "Βαθμολογήστε κάθε κατηγορία ξεχωριστά", ka: "შეაფასეთ ყოველი კატეგორია ცალკე", ru: "Оцените каждую категорию отдельно", uk: "Оцініть кожну категорію окремо", az: "Hər kateqoriyanı ayrı qiymətləndirin", hi: "प्रत्येक श्रेणी को अलग से रेट करें", ar: "قيّم كل فئة على حدة", fa: "هر دسته را جداگانه امتیاز دهید", zh: "请分别为每个类别评分", ko: "각 카테고리를 별도로 평가하세요", ja: "各カテゴリーを個別に評価してください", id: "Beri nilai setiap kategori secara terpisah" },
        foodQuality: { tr: "Yemek Kalitesi", en: "Food Quality", de: "Essensqualität", fr: "Qualité de la nourriture", it: "Qualità del cibo", es: "Calidad de la comida", pt: "Qualidade da comida", ro: "Calitatea mâncării", sq: "Cilësia e ushqimit", el: "Ποιότητα φαγητού", ka: "საკვების ხარისხი", ru: "Качество еды", uk: "Якість їжі", az: "Yemək keyfiyyəti", hi: "खाने की गुणवत्ता", ar: "جودة الطعام", fa: "کیفیت غذا", zh: "食物质量", ko: "음식 품질", ja: "料理の品質", id: "Kualitas makanan" },
        service: { tr: "Hizmet", en: "Service", de: "Service", fr: "Service", it: "Servizio", es: "Servicio", pt: "Serviço", ro: "Serviciu", sq: "Shërbimi", el: "Εξυπηρέτηση", ka: "სერვისი", ru: "Обслуживание", uk: "Обслуговування", az: "Xidmət", hi: "सेवा", ar: "الخدمة", fa: "خدمات", zh: "服务", ko: "서비스", ja: "サービス", id: "Layanan" },
        ambiance: { tr: "Ambiyans", en: "Ambiance", de: "Ambiente", fr: "Ambiance", it: "Atmosfera", es: "Ambiente", pt: "Ambiente", ro: "Ambient", sq: "Ambienti", el: "Ατμόσφαιρα", ka: "ატმოსფერო", ru: "Атмосфера", uk: "Атмосфера", az: "Mühit", hi: "माहौल", ar: "الأجواء", fa: "فضا", zh: "氛围", ko: "분위기", ja: "雰囲気", id: "Suasana" },
        pricePerformance: { tr: "Fiyat / Performans", en: "Value for Money", de: "Preis-Leistung", fr: "Rapport qualité-prix", it: "Rapporto qualità-prezzo", es: "Relación calidad-precio", pt: "Custo-benefício", ro: "Raport calitate-preț", sq: "Çmimi / Cilësia", el: "Σχέση ποιότητας-τιμής", ka: "ფასი / ხარისხი", ru: "Цена / Качество", uk: "Ціна / Якість", az: "Qiymət / Keyfiyyət", hi: "पैसा वसूल", ar: "السعر مقابل الجودة", fa: "ارزش در برابر قیمت", zh: "性价比", ko: "가성비", ja: "コストパフォーマンス", id: "Harga / Kualitas" },
        fullName: { tr: "Ad Soyad", en: "Full Name", de: "Vollständiger Name", fr: "Nom complet", it: "Nome completo", es: "Nombre completo", pt: "Nome completo", ro: "Nume complet", sq: "Emri i plotë", el: "Ονοματεπώνυμο", ka: "სახელი გვარი", ru: "Полное имя", uk: "Повне ім'я", az: "Ad Soyad", hi: "पूरा नाम", ar: "الاسم الكامل", fa: "نام کامل", zh: "全名", ko: "성명", ja: "氏名", id: "Nama Lengkap" },
        fullNamePlaceholder: { tr: "Adınızı ve soyadınızı girin...", en: "Enter your full name...", de: "Geben Sie Ihren vollständigen Namen ein...", fr: "Entrez votre nom complet...", it: "Inserisci il tuo nome completo...", es: "Ingrese su nombre completo...", pt: "Digite seu nome completo...", ro: "Introduceți numele complet...", sq: "Shkruani emrin e plotë...", el: "Εισάγετε το πλήρες όνομά σας...", ka: "შეიყვანეთ სახელი და გვარი...", ru: "Введите полное имя...", uk: "Введіть повне ім'я...", az: "Adınızı və soyadınızı daxil edin...", hi: "अपना पूरा नाम दर्ज करें...", ar: "...أدخل اسمك الكامل", fa: "...نام کامل خود را وارد کنید", zh: "请输入您的全名...", ko: "성명을 입력하세요...", ja: "氏名を入力してください...", id: "Masukkan nama lengkap..." },
        phonePlaceholder: { tr: "0 (5__) ___ __ __", en: "Phone number...", de: "Telefonnummer...", fr: "Numéro de téléphone...", it: "Numero di telefono...", es: "Número de teléfono...", pt: "Número de telefone...", ro: "Număr de telefon...", sq: "Numri i telefonit...", el: "Αριθμός τηλεφώνου...", ka: "ტელეფონის ნომერი...", ru: "Номер телефона...", uk: "Номер телефону...", az: "Telefon nömrəsi...", hi: "फ़ोन नंबर...", ar: "...رقم الهاتف", fa: "...شماره تلفن", zh: "电话号码...", ko: "전화번호...", ja: "電話番号...", id: "Nomor telepon..." },
        message: { tr: "Mesaj", en: "Message", de: "Nachricht", fr: "Message", it: "Messaggio", es: "Mensaje", pt: "Mensagem", ro: "Mesaj", sq: "Mesazhi", el: "Μήνυμα", ka: "შეტყობინება", ru: "Сообщение", uk: "Повідомлення", az: "Mesaj", hi: "संदेश", ar: "الرسالة", fa: "پیام", zh: "消息", ko: "메시지", ja: "メッセージ", id: "Pesan" },
        messagePlaceholder: { tr: "Deneyiminizi paylaşın...", en: "Share your experience...", de: "Teilen Sie Ihre Erfahrung...", fr: "Partagez votre expérience...", it: "Condividi la tua esperienza...", es: "Comparte tu experiencia...", pt: "Compartilhe sua experiência...", ro: "Împărtășiți experiența...", sq: "Ndani përvojën tuaj...", el: "Μοιραστείτε την εμπειρία σας...", ka: "გაგვიზიარეთ თქვენი გამოცდილება...", ru: "Поделитесь впечатлениями...", uk: "Поділіться враженнями...", az: "Təcrübənizi paylaşın...", hi: "अपना अनुभव साझा करें...", ar: "...شاركنا تجربتك", fa: "...تجربه خود را به اشتراک بگذارید", zh: "分享您的体验...", ko: "경험을 공유하세요...", ja: "体験を共有してください...", id: "Bagikan pengalaman Anda..." },
        submitReview: { tr: "Değerlendirmeyi Gönder", en: "Submit Review", de: "Bewertung senden", fr: "Envoyer l'avis", it: "Invia recensione", es: "Enviar reseña", pt: "Enviar avaliação", ro: "Trimite recenzia", sq: "Dërgo vlerësimin", el: "Υποβολή κριτικής", ka: "მიმოხილვის გაგზავნა", ru: "Отправить отзыв", uk: "Надіслати відгук", az: "Rəyi göndər", hi: "समीक्षा भेजें", ar: "إرسال التقييم", fa: "ارسال نظر", zh: "提交评价", ko: "리뷰 제출", ja: "レビューを送信", id: "Kirim ulasan" },
        helpful: { tr: "kişi faydalı buldu", en: "people found this helpful", de: "Personen fanden dies hilfreich", fr: "personnes ont trouvé cela utile", it: "persone hanno trovato utile", es: "personas encontraron esto útil", pt: "pessoas acharam útil", ro: "persoane au găsit util", sq: "persona e gjetën të dobishme", el: "άτομα βρήκαν χρήσιμο", ka: "ადამიანმა მიიჩნია სასარგებლოდ", ru: "человек сочли полезным", uk: "осіб вважають корисним", az: "nəfər faydalı hesab etdi", hi: "लोगों को उपयोगी लगा", ar: "أشخاص وجدوا هذا مفيدًا", fa: "نفر این را مفید دانستند", zh: "人觉得有用", ko: "명이 도움이 됐다고 함", ja: "人が役に立ったと評価", id: "orang menganggap ini bermanfaat" },
        justNow: { tr: "Az önce", en: "Just now", de: "Gerade eben", fr: "À l'instant", it: "Proprio ora", es: "Ahora mismo", pt: "Agora mesmo", ro: "Chiar acum", sq: "Pikërisht tani", el: "Μόλις τώρα", ka: "ახლახანს", ru: "Только что", uk: "Щойно", az: "İndicə", hi: "अभी", ar: "الآن", fa: "همین الان", zh: "刚刚", ko: "방금", ja: "たった今", id: "Baru saja" },
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
            {/* Welcome Screen */}
            {showLangSplash && (
                <div
                    className={`fixed inset-0 z-[100] flex flex-col overflow-hidden transition-opacity duration-500 ${splashFading ? 'opacity-0' : 'opacity-100'}`}
                    style={{ fontFamily: T.fontFamily, backgroundColor: T.welcomeBg || '#000000' }}
                >
                    {/* Fullscreen Video Background */}
                    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: T.welcomeBg || '#000000' }}>
                        <video
                            src="https://github.com/qrlex2026/qrlexvideo/raw/refs/heads/main/1.mp4"
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ opacity: (parseInt(T.welcomeOverlayOpacity || '60') / 100) }}
                        />
                    </div>

                    {/* Bottom-to-Top Gradient */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: `linear-gradient(to top, ${T.welcomeGradientFrom || '#000000'} 0%, ${T.welcomeGradientFrom || '#000000'}${Math.round((parseInt(T.welcomeGradientOpacity || '85') / 100) * 255).toString(16).padStart(2, '0')} 15%, transparent 60%, transparent 100%)`
                    }} />

                    {/* Content */}
                    <div className="relative flex-1 flex flex-col items-center justify-center z-10">
                        {/* Restaurant Logo */}
                        {BUSINESS_INFO.image ? (
                            <div className="overflow-hidden shadow-2xl mb-5" style={{
                                width: `${T.welcomeLogoSize || '96'}px`,
                                height: `${T.welcomeLogoSize || '96'}px`,
                                borderRadius: `${T.welcomeLogoRadius || '16'}px`,
                                border: `2px solid ${T.welcomeLogoBorder || '#ffffff33'}`
                            }}>
                                <img src={BUSINESS_INFO.image} alt={BUSINESS_INFO.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="backdrop-blur-md flex items-center justify-center mb-5" style={{
                                width: `${T.welcomeLogoSize || '96'}px`,
                                height: `${T.welcomeLogoSize || '96'}px`,
                                borderRadius: `${T.welcomeLogoRadius || '16'}px`,
                                border: `1px solid ${T.welcomeLogoBorder || '#ffffff33'}`,
                                backgroundColor: `${T.welcomeSecondaryBtnBg || '#ffffff1a'}`
                            }}>
                                <span className="text-4xl font-bold" style={{ color: T.welcomeTextColor || '#ffffff' }}>{BUSINESS_INFO.name.charAt(0)}</span>
                            </div>
                        )}
                        <h1 className="text-3xl font-bold tracking-tight drop-shadow-lg" style={{ color: T.welcomeTextColor || '#ffffff' }}>{BUSINESS_INFO.name}</h1>
                        <p className="text-lg mt-3 font-light tracking-wide" style={{ color: T.welcomeSubtextColor || '#ffffff80' }}>{t('welcome')}</p>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="relative z-10 pb-8" style={{ padding: '0 13px 32px 13px' }}>
                        {/* Separator Line */}
                        <div className="mb-5 h-px" style={{ backgroundColor: T.welcomeSeparatorColor || '#ffffff33' }} />

                        {/* 3 Buttons */}
                        <div className="flex items-center justify-center gap-3">
                            {/* MENÜ Button */}
                            <button
                                onClick={goToMenu}
                                className="flex-1 py-3.5 text-sm font-bold tracking-wider text-center active:scale-[0.97] transition-all"
                                style={{
                                    backgroundColor: T.welcomeBtnBg || '#ffffff',
                                    color: T.welcomeBtnText || '#000000',
                                    borderRadius: `${T.welcomeBtnRadius || '12'}px`,
                                    boxShadow: T.welcomeBtnShadow === 'none' ? 'none' : T.welcomeBtnShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.1)' : T.welcomeBtnShadow === 'md' ? '0 4px 6px rgba(0,0,0,0.1)' : '0 10px 15px rgba(0,0,0,0.2)',
                                    animation: 'fadeInUp 0.5s ease-out 0.1s both'
                                }}
                            >
                                MENÜ
                            </button>

                            {/* LANGUAGE Button */}
                            <button
                                onClick={() => setShowLangPicker(true)}
                                className="flex-1 py-3.5 backdrop-blur-md text-sm font-bold tracking-wider text-center active:scale-[0.97] transition-all"
                                style={{
                                    backgroundColor: T.welcomeSecondaryBtnBg || '#ffffff1a',
                                    color: T.welcomeSecondaryBtnText || '#ffffff',
                                    border: `1px solid ${T.welcomeSecondaryBtnBorder || '#ffffff33'}`,
                                    borderRadius: `${T.welcomeBtnRadius || '12'}px`,
                                    animation: 'fadeInUp 0.5s ease-out 0.2s both'
                                }}
                            >
                                {t('btnLanguage')}
                            </button>

                            {/* REZERVE Button */}
                            <button
                                onClick={() => { setShowLangSplash(false); setIsReservationOpen(true); }}
                                className="flex-1 py-3.5 backdrop-blur-md text-sm font-bold tracking-wider text-center active:scale-[0.97] transition-all"
                                style={{
                                    backgroundColor: T.welcomeSecondaryBtnBg || '#ffffff1a',
                                    color: T.welcomeSecondaryBtnText || '#ffffff',
                                    border: `1px solid ${T.welcomeSecondaryBtnBorder || '#ffffff33'}`,
                                    borderRadius: `${T.welcomeBtnRadius || '12'}px`,
                                    animation: 'fadeInUp 0.5s ease-out 0.3s both'
                                }}
                            >
                                REZERVE
                            </button>
                        </div>

                        {/* Powered by */}
                        <p className="text-center mt-5 text-[10px] font-medium tracking-widest" style={{ color: T.welcomeSubtextColor || '#ffffff80', opacity: 0.5 }}>
                            Powered by <span className="font-bold">QRlex</span>
                        </p>
                    </div>

                    {/* Language Picker Overlay */}
                    {showLangPicker && (
                        <div className="absolute inset-0 z-20 flex flex-col" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            {/* Close area */}
                            <div className="flex-1 bg-black/50" onClick={() => setShowLangPicker(false)} />

                            {/* Language Sheet - 40% height */}
                            <div
                                className="bg-[#1a1a1a] rounded-t-2xl px-4 pt-4 flex flex-col"
                                style={{ height: '40dvh', paddingBottom: 'max(24px, env(safe-area-inset-bottom))', animation: 'slideUp 0.35s ease-out' }}
                            >
                                {/* Handle bar */}
                                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3 shrink-0" />

                                <div className="flex-1 flex flex-wrap gap-2.5 justify-center content-center overflow-y-auto">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setShowLangPicker(false);
                                                selectLanguage(lang.code);
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${selectedLang === lang.code
                                                ? 'bg-white text-black'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}
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
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(16px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes slideUp {
                            from { transform: translateY(100%); }
                            to { transform: translateY(0); }
                        }
                    `}} />
                </div>
            )}

            {/* Translation Loading Overlay */}
            {isTranslating && (
                <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm" style={{ fontFamily: T.fontFamily }}>
                    <div className="w-10 h-10 border-3 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
                    <p className="text-sm text-gray-600 font-medium">{t('loading')}</p>
                </div>
            )}

            <div className="min-h-screen pb-20 overflow-x-clip" style={{ backgroundColor: T.pageBg, fontFamily: T.fontFamily }}>
                {/* Custom Header */}
                <div className="h-[60px] bg-white flex items-center justify-between px-4 shadow-sm relative">
                    {/* Left: Hamburger Menu */}
                    <button onClick={() => setIsSidebarDrawerOpen(true)} className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors z-10">
                        <Menu size={20} />
                    </button>

                    {/* Center: Business Name */}
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg text-gray-900 truncate max-w-[60%] text-center">{BUSINESS_INFO.name || "Yükleniyor..."}</span>

                    {/* Right: Search Icon */}
                    <button onClick={() => setIsSearchOpen(true)} className="w-[42px] h-[42px] rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors z-10">
                        <Search size={20} />
                    </button>
                </div>

                {/* Hero Slider (JS Based) — toggle from design panel */}
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


                {/* Sticky Category Navbar */}
                <div ref={categoryNavRef} className="sticky top-0 z-10 overflow-x-auto no-scrollbar py-3 px-4 flex gap-2" style={{ backgroundColor: T.pageBg }}>
                    {DISPLAY_CATEGORIES.map((cat) => (
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
                    {DISPLAY_CATEGORIES.map((cat) => {
                        const products =
                            cat.id === "populer"
                                ? DISPLAY_PRODUCTS.filter((p) => p.isPopular)
                                : DISPLAY_PRODUCTS.filter((p) => p.categoryId === cat.id);

                        if (products.length === 0) return null;

                        const layout = (T as any).layoutVariant || 'list';

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
                            <div key={cat.id} id={cat.id}>
                                {/* Category Header */}
                                {layout !== 'banner-scroll' && (
                                    <div className="px-4 pt-6 pb-3">
                                        <h2 style={{ color: T.categoryTitleColor, fontSize: `${T.categoryTitleSize}px`, fontWeight: T.categoryTitleWeight }}>{cat.name}</h2>
                                    </div>
                                )}

                                {/* ── LAYOUT: list (default) ── */}
                                {layout === 'list' && (
                                    <div className="px-4 space-y-4">
                                        {products.map((product) => (
                                            <div key={product.id} onClick={() => handleClick(product)} className="p-3 flex gap-4 h-32 active:scale-[0.98] transition-transform cursor-pointer" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                {renderImage(product, 'w-24 h-full shrink-0')}
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <h3 className="line-clamp-1" style={{ color: T.productNameColor, fontSize: `${T.productNameSize}px`, fontWeight: T.productNameWeight }}>{product.name}</h3>
                                                        <p className="mt-1 line-clamp-2" style={{ color: T.productDescColor, fontSize: `${T.productDescSize}px` }}>{product.description}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span style={{ color: T.priceColor, fontSize: `${T.priceSize}px`, fontWeight: T.priceWeight }}>{product.price} TL</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── LAYOUT: grid-2 ── */}
                                {layout === 'grid-2' && (
                                    <div className="px-4 grid grid-cols-2 gap-3">
                                        {products.map((product) => (
                                            <div key={product.id} onClick={() => handleClick(product)} className="overflow-hidden active:scale-[0.98] transition-transform cursor-pointer" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                {renderImage(product, 'w-full h-28', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                <div className="p-2.5">
                                                    <h3 className="line-clamp-1 mb-0.5" style={{ color: T.productNameColor, fontSize: `${Number(T.productNameSize) - 2}px`, fontWeight: T.productNameWeight }}>{product.name}</h3>
                                                    <p className="line-clamp-1 mb-1.5" style={{ color: T.productDescColor, fontSize: `${Number(T.productDescSize) - 1}px` }}>{product.description}</p>
                                                    <span style={{ color: T.priceColor, fontSize: `${Number(T.priceSize) - 2}px`, fontWeight: T.priceWeight }}>{product.price} TL</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── LAYOUT: grid-3 ── */}
                                {layout === 'grid-3' && (
                                    <div className="px-4 grid grid-cols-3 gap-2">
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
                                {layout === 'horizontal' && (
                                    <div className="px-4 overflow-x-auto no-scrollbar">
                                        <div className="flex gap-3" style={{ width: 'max-content' }}>
                                            {products.map((product) => (
                                                <div key={product.id} onClick={() => handleClick(product)} className="w-[140px] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer shrink-0" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
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
                                )}

                                {/* ── LAYOUT: magazine ── */}
                                {layout === 'magazine' && (
                                    <div className="px-4 space-y-3">
                                        {/* First product large */}
                                        {products[0] && (
                                            <div onClick={() => handleClick(products[0])} className="overflow-hidden active:scale-[0.98] transition-transform cursor-pointer" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                {renderImage(products[0], 'w-full h-44', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                <div className="p-3">
                                                    <h3 className="line-clamp-1" style={{ color: T.productNameColor, fontSize: `${T.productNameSize}px`, fontWeight: T.productNameWeight }}>{products[0].name}</h3>
                                                    <p className="line-clamp-2 mt-1" style={{ color: T.productDescColor, fontSize: `${T.productDescSize}px` }}>{products[0].description}</p>
                                                    <span className="mt-2 block" style={{ color: T.priceColor, fontSize: `${T.priceSize}px`, fontWeight: T.priceWeight }}>{products[0].price} TL</span>
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
                                    <div className="px-4 space-y-4">
                                        {products.map((product) => (
                                            <div key={product.id} onClick={() => handleClick(product)} className="overflow-hidden active:scale-[0.98] transition-transform cursor-pointer" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                {renderImage(product, 'w-full h-48', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                <div className="p-4">
                                                    <h3 className="line-clamp-1" style={{ color: T.productNameColor, fontSize: `${Number(T.productNameSize) + 2}px`, fontWeight: T.productNameWeight }}>{product.name}</h3>
                                                    <p className="line-clamp-2 mt-1" style={{ color: T.productDescColor, fontSize: `${T.productDescSize}px` }}>{product.description}</p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span style={{ color: T.priceColor, fontSize: `${Number(T.priceSize) + 2}px`, fontWeight: T.priceWeight }}>{product.price} TL</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── LAYOUT: banner-scroll ── */}
                                {layout === 'banner-scroll' && (
                                    <div className="mb-2">
                                        {/* Banner header with gradient */}
                                        <div className="relative h-24 mx-4 rounded-2xl overflow-hidden mb-3" style={{ backgroundColor: T.categoryActiveBg }}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                                            <div className="relative h-full flex items-center px-5">
                                                <h2 className="text-white text-xl font-bold drop-shadow-lg">{cat.name}</h2>
                                            </div>
                                        </div>
                                        {/* Horizontal scroll */}
                                        <div className="px-4 overflow-x-auto no-scrollbar">
                                            <div className="flex gap-3" style={{ width: 'max-content' }}>
                                                {products.map((product) => (
                                                    <div key={product.id} onClick={() => handleClick(product)} className="w-[150px] overflow-hidden active:scale-[0.98] transition-transform cursor-pointer shrink-0" style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}>
                                                        {renderImage(product, 'w-full h-28', `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                        <div className="p-2.5">
                                                            <h3 className="line-clamp-1 text-sm font-semibold" style={{ color: T.productNameColor }}>{product.name}</h3>
                                                            <span className="text-sm font-bold mt-1 block" style={{ color: T.priceColor }}>{product.price} TL</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── LAYOUT: mosaic ── */}
                                {layout === 'mosaic' && (
                                    <div className="px-4">
                                        <div className="grid grid-cols-3 gap-2">
                                            {products.map((product, idx) => {
                                                // Alternating: every 3rd item takes 2 columns
                                                const isLarge = idx % 3 === 0;
                                                return (
                                                    <div
                                                        key={product.id}
                                                        onClick={() => handleClick(product)}
                                                        className={`overflow-hidden active:scale-[0.98] transition-transform cursor-pointer ${isLarge ? 'col-span-2 row-span-2' : ''}`}
                                                        style={{ backgroundColor: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: `${T.cardRadius}px`, boxShadow: getShadow(T.cardShadow) }}
                                                    >
                                                        {renderImage(product, `w-full ${isLarge ? 'h-40' : 'h-20'}`, `${T.cardRadius}px ${T.cardRadius}px 0 0`)}
                                                        <div className={isLarge ? 'p-3' : 'p-1.5'}>
                                                            <h3 className={`line-clamp-1 ${isLarge ? 'text-sm font-bold' : 'text-xs font-semibold'}`} style={{ color: T.productNameColor }}>{product.name}</h3>
                                                            <span className={`${isLarge ? 'text-sm' : 'text-xs'} font-bold mt-0.5 block`} style={{ color: T.priceColor }}>{product.price} TL</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
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

            {/* Review Form Overlay — direct form with 6 category ratings */}
            {isReviewsOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto overscroll-none" style={{ width: '100vw', height: '100dvh', backgroundColor: T.pageBg || '#ffffff' }}>
                    {/* Fixed Back Button */}
                    <button
                        onClick={() => {
                            setIsReviewsOpen(false);
                            setCategoryRatings({ yemek: 0, hizmet: 0, ambiyans: 0, fiyat: 0, temizlik: 0, sunum: 0 });
                            setReviewName("");
                            setReviewComment("");
                        }}
                        className="fixed top-4 left-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors z-[60]"
                    >
                        <ChevronLeft size={22} />
                    </button>

                    {/* Orange header with category ratings */}
                    <div className="relative w-full bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 px-5 pb-10 pt-16">
                        <div className="flex flex-col items-center mb-5">
                            <h2 className="text-2xl font-bold text-white drop-shadow-md">{t('rateUs')}</h2>
                            <p className="text-white/80 text-sm mt-1">{t('rateCategoryDesc')}</p>
                        </div>

                        {/* Category Ratings — inside the orange area */}
                        <div className="space-y-2.5">
                            {[
                                { key: 'yemek' as const, label: t('foodQuality'), icon: <Utensils size={16} /> },
                                { key: 'hizmet' as const, label: t('service'), icon: <HandHeart size={16} /> },
                                { key: 'ambiyans' as const, label: t('ambiance'), icon: <Music size={16} /> },
                                { key: 'fiyat' as const, label: t('pricePerformance'), icon: <BadgeDollarSign size={16} /> },
                                { key: 'temizlik' as const, label: selectedLang === 'tr' ? 'Temizlik' : 'Cleanliness', icon: <AlertTriangle size={16} /> },
                                { key: 'sunum' as const, label: selectedLang === 'tr' ? 'Sunum' : 'Presentation', icon: <Flame size={16} /> },
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
                                                    size={18}
                                                    className={s <= categoryRatings[cat.key] ? 'text-white fill-white' : 'text-white/30'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form section — name, phone, comment, submit */}
                    <div
                        className="-mt-5 relative"
                        style={{ borderRadius: '20px 20px 0 0', backgroundColor: T.cardBg || '#ffffff' }}
                    >
                        <div className="px-5 pt-6 pb-10">
                            {/* Ad Soyad */}
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2 font-medium">{t('fullName')}</p>
                                <input
                                    type="text"
                                    placeholder={t('fullNamePlaceholder')}
                                    value={reviewName}
                                    onChange={(e) => setReviewName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Telefon */}
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2 font-medium">{t('phone')}</p>
                                <input
                                    type="tel"
                                    placeholder={t('phonePlaceholder')}
                                    value={reviewPhone}
                                    onChange={(e) => setReviewPhone(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Mesaj */}
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 mb-2 font-medium">{t('message')}</p>
                                <textarea
                                    placeholder={t('messagePlaceholder')}
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={async () => {
                                    if (isSubmittingReview || reviewSubmitted) return;
                                    const avgRating = Math.round(
                                        (categoryRatings.yemek + categoryRatings.hizmet + categoryRatings.ambiyans + categoryRatings.fiyat + categoryRatings.temizlik + categoryRatings.sunum) / 6
                                    );
                                    if (avgRating > 0 && reviewName.trim() && reviewComment.trim()) {
                                        setIsSubmittingReview(true);
                                        try {
                                            await fetch('/api/reviews', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    restaurantId,
                                                    authorName: reviewName.trim(),
                                                    rating: avgRating,
                                                    comment: reviewComment.trim(),
                                                }),
                                            });
                                            // Close overlay immediately and show toast on menu
                                            setIsSubmittingReview(false);
                                            setIsReviewsOpen(false);
                                            setReviewName("");
                                            setReviewPhone("");
                                            setReviewComment("");
                                            setCategoryRatings({ yemek: 0, hizmet: 0, ambiyans: 0, fiyat: 0, temizlik: 0, sunum: 0 });
                                            setReviewSubmitted(true);
                                            setTimeout(() => setReviewSubmitted(false), 2500);
                                        } catch (err) {
                                            console.error('Review submit error:', err);
                                            setIsSubmittingReview(false);
                                        }
                                    }
                                }}
                                disabled={isSubmittingReview || Object.values(categoryRatings).some((v) => v === 0) || !reviewName.trim() || !reviewComment.trim()}
                                className={`w-full py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${Object.values(categoryRatings).every((v) => v > 0) && reviewName.trim() && reviewComment.trim() && !isSubmittingReview
                                    ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmittingReview ? (
                                    <><Loader2 size={18} className="animate-spin" /> {selectedLang === 'tr' ? 'Gönderiliyor...' : 'Sending...'}</>
                                ) : (
                                    <>{selectedLang === 'tr' ? 'Gönder' : 'Submit'} <ArrowRight size={18} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reservation Bottom Sheet — 40% height popup */}
            {isReservationOpen && (() => {
                const resetReservation = () => {
                    setIsReservationOpen(false);
                    setReserveStep(0);
                    setReserveDate(null);
                    setReserveTime("");
                    setReserveGuests(2);
                    setReserveName("");
                    setReservePhone("");
                    setReserveNote("");
                };

                const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dayNames = selectedLang === 'tr' ? ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                const monthNames = selectedLang === 'tr'
                    ? ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
                    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                const timeSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

                return (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                            onClick={resetReservation}
                            style={{ animation: 'fadeIn 0.2s ease-out' }}
                        />

                        {/* Bottom Sheet */}
                        <div
                            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col"
                            style={{ height: '60dvh', animation: 'slideUp 0.3s ease-out' }}
                        >
                            {/* Handle bar */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className="w-10 h-1 bg-gray-300 rounded-full" />
                            </div>

                            {/* Step indicator */}
                            <div className="flex items-center gap-2 px-5 pb-3">
                                {[0, 1, 2].map((s) => (
                                    <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= reserveStep ? 'bg-amber-500' : 'bg-gray-200'}`} />
                                ))}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-5 pb-5">
                                {/* Step 0: Date Selection */}
                                {reserveStep === 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            <CalendarDays size={18} className="inline mr-2 text-amber-500" />
                                            {selectedLang === 'tr' ? 'Tarih Seçin' : 'Select Date'}
                                        </h3>

                                        {/* Month Navigation */}
                                        <div className="flex items-center justify-between mb-3 mt-2">
                                            <button onClick={() => {
                                                if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
                                                else setCalendarMonth(calendarMonth - 1);
                                            }} className="p-1.5 rounded-full hover:bg-gray-100"><ChevronLeft size={18} /></button>
                                            <span className="text-sm font-semibold text-gray-800">{monthNames[calendarMonth]} {calendarYear}</span>
                                            <button onClick={() => {
                                                if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
                                                else setCalendarMonth(calendarMonth + 1);
                                            }} className="p-1.5 rounded-full hover:bg-gray-100"><ChevronRight size={18} /></button>
                                        </div>

                                        {/* Day Names */}
                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                            {dayNames.map((d) => (
                                                <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                                            ))}
                                        </div>

                                        {/* Calendar Grid */}
                                        <div className="grid grid-cols-7 gap-1">
                                            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                                <div key={`empty-${i}`} />
                                            ))}
                                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                                const day = i + 1;
                                                const thisDate = new Date(calendarYear, calendarMonth, day);
                                                const isPast = thisDate < today;
                                                const isSelected = reserveDate && reserveDate.getTime() === thisDate.getTime();
                                                const isToday = thisDate.getTime() === today.getTime();
                                                return (
                                                    <button
                                                        key={day}
                                                        disabled={isPast}
                                                        onClick={() => setReserveDate(thisDate)}
                                                        className={`w-[30px] h-[30px] mx-auto rounded-full text-xs font-medium flex items-center justify-center transition-all ${isPast
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-amber-500 text-white shadow-md'
                                                                : isToday
                                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                                    : 'text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Next Button */}
                                        <button
                                            disabled={!reserveDate}
                                            onClick={() => setReserveStep(1)}
                                            className={`w-full mt-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${reserveDate
                                                ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {selectedLang === 'tr' ? 'İleri' : 'Next'} <ArrowRight size={16} />
                                        </button>
                                    </div>
                                )}

                                {/* Step 1: Time & Guest Count */}
                                {reserveStep === 1 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                                            <Clock size={18} className="inline mr-2 text-amber-500" />
                                            {selectedLang === 'tr' ? 'Saat & Kişi Sayısı' : 'Time & Guests'}
                                        </h3>

                                        {/* Time Slots */}
                                        <p className="text-xs text-gray-500 mb-2 font-medium">{selectedLang === 'tr' ? 'Saat Seçin' : 'Select Time'}</p>
                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            {timeSlots.map((t_slot) => (
                                                <button
                                                    key={t_slot}
                                                    onClick={() => setReserveTime(t_slot)}
                                                    className={`py-2 rounded-lg text-xs font-medium transition-all ${reserveTime === t_slot
                                                        ? 'bg-amber-500 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {t_slot}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Guest Count */}
                                        <p className="text-xs text-gray-500 mb-2 font-medium">
                                            <Users size={14} className="inline mr-1" />
                                            {selectedLang === 'tr' ? 'Kişi Sayısı' : 'Guests'}
                                        </p>
                                        <div className="flex gap-2 flex-wrap mb-4">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                <button
                                                    key={n}
                                                    onClick={() => setReserveGuests(n)}
                                                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-all ${reserveGuests === n
                                                        ? 'bg-amber-500 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Navigation */}
                                        <div className="flex gap-3">
                                            <button onClick={() => setReserveStep(0)} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                                                <ChevronLeft size={16} className="inline mr-1" />{selectedLang === 'tr' ? 'Geri' : 'Back'}
                                            </button>
                                            <button
                                                disabled={!reserveTime}
                                                onClick={() => setReserveStep(2)}
                                                className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${reserveTime
                                                    ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                {selectedLang === 'tr' ? 'İleri' : 'Next'} <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Contact Info */}
                                {reserveStep === 2 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                                            <Users size={18} className="inline mr-2 text-amber-500" />
                                            {selectedLang === 'tr' ? 'Bilgileriniz' : 'Your Info'}
                                        </h3>

                                        {/* Summary */}
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={14} />
                                                <span>{reserveDate?.toLocaleDateString(selectedLang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                <span className="mx-1">•</span>
                                                <Clock size={14} />
                                                <span>{reserveTime}</span>
                                                <span className="mx-1">•</span>
                                                <Users size={14} />
                                                <span>{reserveGuests} {selectedLang === 'tr' ? 'kişi' : 'guests'}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1.5 font-medium">{selectedLang === 'tr' ? 'Ad Soyad' : 'Full Name'} *</p>
                                                <input
                                                    type="text"
                                                    value={reserveName}
                                                    onChange={(e) => setReserveName(e.target.value)}
                                                    placeholder={selectedLang === 'tr' ? 'Adınız Soyadınız' : 'Your full name'}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-amber-400 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1.5 font-medium">{selectedLang === 'tr' ? 'Telefon' : 'Phone'} *</p>
                                                <input
                                                    type="tel"
                                                    value={reservePhone}
                                                    onChange={(e) => setReservePhone(e.target.value)}
                                                    placeholder={selectedLang === 'tr' ? '05XX XXX XX XX' : 'Phone number'}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-amber-400 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1.5 font-medium">{selectedLang === 'tr' ? 'Not (opsiyonel)' : 'Note (optional)'}</p>
                                                <textarea
                                                    value={reserveNote}
                                                    onChange={(e) => setReserveNote(e.target.value)}
                                                    placeholder={selectedLang === 'tr' ? 'Özel istekleriniz...' : 'Special requests...'}
                                                    rows={2}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-amber-400 transition-colors resize-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <div className="flex gap-3">
                                            <button onClick={() => setReserveStep(1)} className="w-12 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center">
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                disabled={!reserveName.trim() || !reservePhone.trim() || isSubmittingReserve}
                                                onClick={async () => {
                                                    setIsSubmittingReserve(true);
                                                    try {
                                                        await fetch('/api/reservations', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                restaurantId,
                                                                name: reserveName.trim(),
                                                                phone: reservePhone.trim(),
                                                                date: reserveDate?.toISOString(),
                                                                time: reserveTime,
                                                                guestCount: reserveGuests,
                                                                note: reserveNote.trim() || null,
                                                            }),
                                                        });
                                                        setIsSubmittingReserve(false);
                                                        setIsReservationOpen(false);
                                                        setReserveStep(0);
                                                        setReserveDate(null);
                                                        setReserveTime("");
                                                        setReserveGuests(2);
                                                        setReserveName("");
                                                        setReservePhone("");
                                                        setReserveNote("");
                                                        setReserveSubmitted(true);
                                                        setTimeout(() => setReserveSubmitted(false), 2500);
                                                    } catch (err) {
                                                        console.error('Reservation error:', err);
                                                        setIsSubmittingReserve(false);
                                                    }
                                                }}
                                                className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${reserveName.trim() && reservePhone.trim() && !isSubmittingReserve
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                {isSubmittingReserve ? (
                                                    <><Loader2 size={16} className="animate-spin" /> {selectedLang === 'tr' ? 'Gönderiliyor...' : 'Sending...'}</>
                                                ) : (
                                                    <>{selectedLang === 'tr' ? 'Rezervasyon Yap' : 'Book Now'} <ArrowRight size={16} /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                );
            })()}

            {/* Reservation Success Toast */}
            {reserveSubmitted && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 border border-gray-100" style={{ animation: 'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', minWidth: '260px' }}>
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check size={28} className="text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedLang === 'tr' ? 'Rezervasyon Alındı!' : 'Reservation Received!'}</h3>
                        <p className="text-sm text-gray-500 text-center">{selectedLang === 'tr' ? 'Rezervasyonunuz başarıyla gönderildi. Teşekkürler!' : 'Your reservation has been sent. Thank you!'}</p>
                    </div>
                </div>
            )}

            {/* Sidebar Drawer */}
            {isSidebarDrawerOpen && (
                <div className="fixed inset-0 z-[60]" style={{ fontFamily: T.fontFamily }}>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsSidebarDrawerOpen(false)}
                        style={{ animation: 'fadeIn 0.2s ease-out' }}
                    />
                    {/* Drawer */}
                    <div
                        className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col"
                        style={{ animation: 'slideInLeft 0.3s ease-out' }}
                    >
                        {/* Drawer Header */}
                        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {BUSINESS_INFO.image ? (
                                    <img src={BUSINESS_INFO.image} alt={BUSINESS_INFO.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                                        {BUSINESS_INFO.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{BUSINESS_INFO.name}</p>
                                    <p className="text-[11px] text-gray-400">{BUSINESS_INFO.description?.slice(0, 30)}{BUSINESS_INFO.description?.length > 30 ? '...' : ''}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsSidebarDrawerOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">{selectedLang === 'tr' ? 'Kategoriler' : 'Categories'}</p>
                            <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
                                {DISPLAY_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setIsSidebarDrawerOpen(false);
                                            setTimeout(() => scrollToCategory(cat.id), 300);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat.id
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="px-4 py-3 space-y-1">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">{selectedLang === 'tr' ? 'Hızlı Erişim' : 'Quick Access'}</p>
                            <button
                                onClick={() => { setIsSidebarDrawerOpen(false); setIsProfileOpen(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <Info size={18} className="text-gray-400" />
                                {selectedLang === 'tr' ? 'Hakkımızda' : 'About Us'}
                            </button>
                            <button
                                onClick={() => { setIsSidebarDrawerOpen(false); setIsReservationOpen(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <CalendarDays size={18} className="text-gray-400" />
                                {selectedLang === 'tr' ? 'Rezervasyon' : 'Reservation'}
                            </button>
                            <button
                                onClick={() => { setIsSidebarDrawerOpen(false); setIsReviewsOpen(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <Star size={18} className="text-gray-400" />
                                {selectedLang === 'tr' ? 'Yorum Yap' : 'Write a Review'}
                            </button>
                            <button
                                onClick={() => { setIsSidebarDrawerOpen(false); setIsSearchOpen(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <Search size={18} className="text-gray-400" />
                                {selectedLang === 'tr' ? 'Ürün Ara' : 'Search'}
                            </button>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Contact & Language */}
                        <div className="px-4 py-3 border-t border-gray-100">
                            {BUSINESS_INFO.phone && (
                                <a href={`tel:${BUSINESS_INFO.phone}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                    <Phone size={16} className="text-green-500" />
                                    {BUSINESS_INFO.phone}
                                </a>
                            )}
                            {BUSINESS_INFO.instagram && (
                                <a href={`https://instagram.com/${BUSINESS_INFO.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                    <Instagram size={16} className="text-pink-500" />
                                    @{BUSINESS_INFO.instagram}
                                </a>
                            )}
                        </div>

                        {/* Powered by */}
                        <div className="px-5 py-3 border-t border-gray-100 text-center">
                            <p className="text-[10px] text-gray-300 font-medium">Powered by QRlex</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Detail Overlay */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain" style={{ backgroundColor: T.pageBg || '#ffffff' }}>
                    {/* Back Button - Sticky */}
                    <button
                        onClick={() => setSelectedProduct(null)}
                        className="fixed top-4 left-4 z-[51] w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
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
                        style={{ borderRadius: '25px 25px 0 0', backgroundColor: T.cardBg || '#ffffff' }}
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
                <div className="fixed inset-0 z-50 flex flex-col p-4 overflow-hidden overscroll-none" style={{ backgroundColor: T.pageBg || '#ffffff' }}>
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

            {/* Floating Review Button — bottom left */}
            <button
                onClick={() => setIsReviewsOpen(true)}
                className="fixed z-30 flex items-center gap-2 bg-amber-500 text-white px-5 py-3 rounded-full shadow-lg hover:bg-amber-600 active:scale-95 transition-all font-semibold text-sm"
                style={{ bottom: 20, left: 20 }}
            >
                <Star size={16} className="fill-white" />
                {selectedLang === 'tr' ? 'Yorum Yap' : 'Review'}
            </button>

            {/* Success Toast Alert */}
            {reviewSubmitted && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                    <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 border border-gray-100" style={{ animation: 'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', minWidth: '260px' }}>
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check size={28} className="text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{selectedLang === 'tr' ? 'Gönderildi!' : 'Sent!'}</h3>
                        <p className="text-sm text-gray-500 text-center">{selectedLang === 'tr' ? 'Değerlendirmeniz başarıyla gönderildi. Teşekkürler!' : 'Your review has been sent. Thank you!'}</p>
                    </div>
                </div>
            )}

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

