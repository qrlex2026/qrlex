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

    // Language splash screen - always show on every visit (localStorage disabled for testing)
    const [showLangSplash, setShowLangSplash] = useState(true);
    const [splashFading, setSplashFading] = useState(false);
    const [showLangPicker, setShowLangPicker] = useState(false);
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
    };

    const t = (key: string) => uiStrings[key]?.[selectedLang] || uiStrings[key]?.["tr"] || key;

    const selectLanguage = async (lang: string) => {
        setSelectedLang(lang);

        if (lang === "tr") {
            // Turkish = no translation needed
            setTranslatedCategories(initialCategories);
            setTranslatedProducts(initialProducts);
            setSplashFading(true);
            setTimeout(() => setShowLangSplash(false), 400);
            return;
        }

        // Show loading, then translate
        setSplashFading(true);
        setTimeout(() => setShowLangSplash(false), 400);
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
                    className={`fixed inset-0 z-[100] flex flex-col transition-opacity duration-500 ${splashFading ? 'opacity-0' : 'opacity-100'}`}
                    style={{ fontFamily: T.fontFamily }}
                >
                    {/* Fullscreen Video Background */}
                    <div className="absolute inset-0 overflow-hidden bg-black">
                        <video
                            src="https://github.com/qrlex2026/qrlexvideo/raw/refs/heads/main/1.mp4"
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                    </div>

                    {/* Bottom-to-Top Black Gradient */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 60%, transparent 100%)'
                    }} />

                    {/* Content */}
                    <div className="relative flex-1 flex flex-col items-center justify-center z-10">
                        {/* Restaurant Logo */}
                        {BUSINESS_INFO.image ? (
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl mb-5 border-2 border-white/20">
                                <img src={BUSINESS_INFO.image} alt={BUSINESS_INFO.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 border border-white/20">
                                <span className="text-4xl text-white font-bold">{BUSINESS_INFO.name.charAt(0)}</span>
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">{BUSINESS_INFO.name}</h1>
                        {BUSINESS_INFO.description && (
                            <p className="text-white/60 text-sm mt-2 max-w-[280px] text-center line-clamp-2">{BUSINESS_INFO.description}</p>
                        )}
                    </div>

                    {/* Bottom Navigation */}
                    <div className="relative z-10 pb-8" style={{ padding: '0 15px 32px 15px' }}>
                        {/* Gray Separator Line */}
                        <div className="mb-5 h-px bg-white/20" />

                        {/* 3 Buttons */}
                        <div className="flex items-center justify-center gap-3">
                            {/* MENÜ Button */}
                            <button
                                onClick={() => selectLanguage('tr')}
                                className="flex-1 py-3.5 rounded-xl bg-white text-black text-sm font-bold tracking-wider text-center hover:bg-gray-100 active:scale-[0.97] transition-all shadow-lg"
                                style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
                            >
                                MENÜ
                            </button>

                            {/* DİL Button */}
                            <button
                                onClick={() => setShowLangPicker(true)}
                                className="flex-1 py-3.5 rounded-xl bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-wider text-center hover:bg-white/20 active:scale-[0.97] transition-all"
                                style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
                            >
                                LANGUAGE
                            </button>

                            {/* KAMPANYALAR Button */}
                            <button
                                className="flex-1 py-3.5 rounded-xl bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-wider text-center hover:bg-white/20 active:scale-[0.97] transition-all"
                                style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
                            >
                                KAMPANYALAR
                            </button>
                        </div>

                        {/* Powered by */}
                        <p className="text-center mt-5 text-[10px] text-white/30 font-medium tracking-widest">
                            Powered by <span className="font-bold">QRlex</span>
                        </p>
                    </div>

                    {/* Language Picker Overlay */}
                    {showLangPicker && (
                        <div className="absolute inset-0 z-20 flex flex-col bg-black/70 backdrop-blur-sm" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            {/* Close area */}
                            <div className="flex-1" onClick={() => setShowLangPicker(false)} />

                            {/* Language Sheet */}
                            <div
                                className="bg-white rounded-t-3xl px-6 pt-6 pb-8 max-h-[70vh] overflow-y-auto"
                                style={{ animation: 'slideUp 0.35s ease-out' }}
                            >
                                {/* Handle bar */}
                                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Dil Seçin</h3>
                                <p className="text-xs text-gray-400 text-center mb-5">Select Language</p>

                                <div className="grid grid-cols-2 gap-2.5">
                                    {languages.map((lang, i) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setShowLangPicker(false);
                                                selectLanguage(lang.code);
                                            }}
                                            className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            style={{ animationDelay: `${i * 30}ms`, animation: 'fadeInUp 0.3s ease-out both' }}
                                        >
                                            <span className="text-xl">{lang.flag}</span>
                                            <span className="text-sm font-semibold text-gray-800">{lang.name}</span>
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

                {/* Search Trigger */}
                <div className="px-4 pt-4 pb-2 sticky top-0 z-20" style={{ backgroundColor: T.pageBg }}>
                    <div
                        onClick={() => setIsSearchOpen(true)}
                        className="w-full h-10 rounded-lg flex items-center px-3 gap-2 cursor-pointer shadow-sm"
                        style={{ backgroundColor: T.searchBg, border: `1px solid ${T.searchBorder}`, color: T.searchText }}
                    >
                        <Search size={18} />
                        <span className="text-sm">{t('searchPlaceholder')}</span>
                    </div>
                </div>

                {/* Sticky Category Navbar */}
                <div ref={categoryNavRef} className="sticky top-[56px] z-10 overflow-x-auto no-scrollbar py-3 px-4 flex gap-2" style={{ backgroundColor: T.pageBg }}>
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
                                            {/* Image / Video Preview */}
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
                                                {product.video && (
                                                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                                                        <span className="text-white text-[10px] ml-0.5">▶</span>
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
                                <p className="text-white/90 text-sm font-medium">{REVIEWS.totalCount} {t('reviewCount')}</p>

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
                                        {t('reviews')}
                                    </h3>
                                    <span className="text-sm text-gray-400">{userReviews.length + REVIEWS.items.length} {t('reviewsLabel')}</span>
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
                                                <span className="text-xs">{review.helpful} {t('helpful')}</span>
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
                            {t('writeReview')}
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
                                <h2 className="text-2xl font-bold text-white drop-shadow-md mb-1">{t('rateUs')}</h2>
                                <p className="text-white/80 text-sm mb-5">{t('rateCategoryDesc')}</p>

                                <div className="w-full max-w-[320px] space-y-3">
                                    {[
                                        { key: 'yemek' as const, label: t('foodQuality'), icon: <Utensils size={18} /> },
                                        { key: 'hizmet' as const, label: t('service'), icon: <HandHeart size={18} /> },
                                        { key: 'ambiyans' as const, label: t('ambiance'), icon: <Music size={18} /> },
                                        { key: 'fiyat' as const, label: t('pricePerformance'), icon: <BadgeDollarSign size={18} /> },
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
                                                date: t('justNow'),
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
                                    {t('submitReview')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Detail Overlay */}
                {selectedProduct && (
                    <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ width: '100vw', height: '100dvh' }}>
                        {/* Product Media Section */}
                        <div className="relative w-full shrink-0" style={{ height: '45%' }}>
                            {selectedProduct.video ? (
                                <video
                                    src={selectedProduct.video}
                                    poster={selectedProduct.image || undefined}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
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
