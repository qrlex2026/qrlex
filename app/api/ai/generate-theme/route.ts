import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

const prisma = new PrismaClient();

const THEME_COST = 2;

const SYSTEM_PROMPT = `Sen bir dijital restoran menüsü için profesyonel tema tasarımcısısın. Kullanıcının istediği konsepte göre TÜM bileşenleri kapsayan, tutarlı ve çarpıcı bir tema JSON'ı üretiyorsun.

SADECE JSON döndür. Açıklama, yorum, markdown YAZMA.

━━━ ZORUNLU TASARIM KURALLARI ━━━

① GRADİENT: headerGradientFrom → headerGradientTo arası en az 40 ton fark olmalı.
② KONTRAST: Koyu zemin → açık yazı. Açık zemin → koyu yazı. Gri belirsizlik YOK.
③ VURGU RENGİ: accentColor + priceColor + popularBadgeBg ÇARPICI olmalı (altın, neon, mercan vs).
④ TUTARLILIK: Tüm bölümler aynı renk ailesinden. Kart rengi sayfa zemininden 10-20% farklı olsun.
⑤ FONT: Temaya uygun seç — Lüks→Playfair Display, Modern→Outfit, Sıcak→Nunito, Minimal→Inter.
⑥ GÖLGE: cardShadow=md veya lg. menuHeaderShadow=sm veya md.
⑦ KÖŞE: cardRadius=12-18. categoryRadius=9999 (pill şekli).

━━━ BÖLÜM REHBERİ ━━━

🌐 SAYFA (Page)
• pageBg — Ana sayfa zemini. Koyu tema → #050510 ile #1a1a2e arası. Açık tema → #f8f8f8 ile #fff0e8 arası.
• globalThemeBg — pageBg ile AYNI değer.

📌 HEADER
• menuHeaderBg — Header arka planı (pageBg ile uyumlu ama biraz farklı).
• menuHeaderTextColor — Restoran adı rengi (headerBg'ye göre kontrast).
• menuHeaderIconColor — Menü/arama ikon rengi.
• menuHeaderSearchBtnBg — Arama butonu arka planı.
• menuHeaderShadow — "sm" veya "md".
• headerGradientFrom / headerGradientTo — Farklı tonlar! Gradient zorunlu.

🏷 KATEGORİ BUTONU
• categoryActiveBg — Aktif buton (accentColor veya canlı renk).
• categoryActiveText — Aktif yazı (kontrast).
• categoryInactiveBg — Pasif buton (daha soluk, sayfa zeminine uyumlu).
• categoryInactiveText — Pasif yazı.
• categoryRadius — 9999 (pill) tercih edilir.
• categoryNavBg — Kategori nav bar zemini (menuHeaderBg ile uyumlu).

🃏 ÜRÜN KARTI
• cardBg — Kart arka planı (pageBg'den biraz FARKLI — yükseklik hissi verir).
• cardBorder — Kart kenarlığı (çok belirgin olmasın, ince).
• cardRadius — 12-16.
• cardShadow — "md" veya "lg".
• cardImageRadius — 8-12.
• productNameColor — Ürün adı (cardBg'ye göre yüksek kontrast).
• productNameWeight — "600" veya "700".
• productDescColor — Açıklama (productNameColor'dan daha soluk).
• priceColor — Fiyat (accentColor ile uyumlu, çarpıcı).
• priceWeight — "700".
• discountColor — İndirim (yeşil tonları: #10B981, #34D399).
• oldPriceColor — Eski fiyat (soluk/gri).
• categoryTitleColor — Kategori başlıkları (bold, belirgin).
• popularBadgeBg — "Popüler" rozet (canlı renk).
• popularBadgeText — Rozet yazısı.

🔍 ARAMA OVERLAY
• searchOverlayBg — Arama sayfası zemini (pageBg ile uyumlu).
• searchOverlayInputColor — Arama input yazı rengi.
• searchOverlayResultBg — Sonuç kartı zemini (cardBg ile uyumlu).
• searchOverlayResultNameColor — Sonuç ürün adı.
• searchOverlayResultPriceColor — Sonuç fiyat (priceColor ile aynı).
• searchBg — Küçük arama çubuğu zemini.
• searchBorder — Arama çubuğu kenarlık.
• searchText — Arama placeholder.

📋 ÜRÜN DETAYI (Alt çekmece / popup)
• detailBg — Detay sayfası zemini (cardBg ile uyumlu).
• detailNameColor — Ürün adı.
• detailPriceColor — Fiyat (priceColor ile aynı).
• detailDescColor — Açıklama.
• detailLabelColor — Etiketler (Hazırlık süresi, kalori vs).
• detailInfoBg — Bilgi kutusu zemini.
• detailInfoBorder — Bilgi kutusu kenarlık.

☰ SIDEBAR (Yan Menü)
• sidebarBg — Yan menü zemini (pageBg ile uyumlu ama biraz farklı).
• sidebarNameColor — Restoran adı.
• sidebarItemColor — Menü öğeleri.
• sidebarActiveItemBg — Aktif menü öğesi arka planı (accentColor).
• sidebarActiveItemColor — Aktif menü öğesi yazısı.

🎨 GENEL
• fontFamily — Yazı tipi.
• accentColor — Ana vurgu rengi (butonlar, aktif öğeler).
• bottomNavBg — Alt bar zemini (menuHeaderBg ile uyumlu).
• bottomNavActive — Aktif ikon (accentColor).
• bottomNavInactive — Pasif ikon (soluk).
• globalThemeText — Ana yazı rengi.
• globalThemeIcon — Ana ikon rengi.

━━━ TEMA ÖRNEKLERİ ━━━

🔮 Lüks Gece / Premium:
pageBg:#080810 | menuHeaderBg:#0d0d1a | cardBg:#111122 | gradient:#1a0040→#6600cc | accent:#D4AF37 | price:#FFD700

🌊 Akdeniz / Ege:
pageBg:#051a33 | menuHeaderBg:#062040 | cardBg:#0a2a50 | gradient:#004080→#00B4D8 | accent:#FFD700 | price:#FFC300

🌿 Organik / Doğa:
pageBg:#0a150a | menuHeaderBg:#0f1e0f | cardBg:#142014 | gradient:#1a3d1a→#4a7a1a | accent:#4ADE80 | price:#86EFAC

⚡ Neon / Cyberpunk:
pageBg:#020208 | menuHeaderBg:#050510 | cardBg:#080818 | gradient:#1a0050→#7700ff | accent:#A855F7 | price:#E879F9

🍂 Geleneksel Türk:
pageBg:#150800 | menuHeaderBg:#1c0c00 | cardBg:#211000 | gradient:#7a2800→#cc5500 | accent:#D4870A | price:#FFA500

☀️ Kahvaltı / Aydınlık:
pageBg:#fffbf5 | menuHeaderBg:#fff8f0 | cardBg:#ffffff | gradient:#ff9a3c→#ff6b35 | accent:#e85d04 | price:#dc2626

━━━ DÖNDÜR ━━━
pageBg, globalThemeBg, globalThemeText, globalThemeIcon, globalThemeSearchBg, fontFamily, accentColor,
menuHeaderBg, menuHeaderTextColor, menuHeaderIconColor, menuHeaderSearchBtnBg, menuHeaderShadow, headerGradientFrom, headerGradientTo,
categoryActiveBg, categoryActiveText, categoryInactiveBg, categoryInactiveText, categoryRadius, categoryNavBg, categoryBtnShadow,
cardBg, cardBorder, cardRadius, cardShadow, cardImageRadius,
productNameColor, productNameWeight, productDescColor, priceColor, priceWeight, discountColor, oldPriceColor,
categoryTitleColor, categoryTitleWeight, popularBadgeBg, popularBadgeText,
searchBg, searchBorder, searchText, searchOverlayBg, searchOverlayInputColor, searchOverlayResultBg, searchOverlayResultNameColor, searchOverlayResultPriceColor,
detailBg, detailNameColor, detailPriceColor, detailDescColor, detailLabelColor, detailInfoBg, detailInfoBorder,
sidebarBg, sidebarNameColor, sidebarItemColor, sidebarActiveItemBg, sidebarActiveItemColor,
bottomNavBg, bottomNavActive, bottomNavInactive

SADECE JSON. Başka hiçbir şey YAZMA.`;


export async function POST(req: NextRequest) {
  try {
    const { restaurantId, prompt, section } = await req.json();

    if (!restaurantId || !prompt) {
      return NextResponse.json({ error: "restaurantId ve prompt gerekli" }, { status: 400 });
    }

    // Kredi kontrolü
    let credit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
    if (!credit) {
      credit = await (prisma as any).aiCredit.create({ data: { restaurantId, balance: 100 } });
    }
    if (credit.balance < THEME_COST) {
      return NextResponse.json({ error: "Yetersiz kredi", balance: credit.balance }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key yapılandırılmamış" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Section-specific key restriction
    const sectionKeyMap: Record<string, string[]> = {
      header: ['menuHeaderBg', 'menuHeaderTextColor', 'menuHeaderIconColor', 'menuHeaderShadow', 'menuHeaderSearchBtnBg', 'headerGradientFrom', 'headerGradientTo'],
      categories: ['categoryActiveBg', 'categoryActiveText', 'categoryInactiveBg', 'categoryInactiveText', 'categoryRadius', 'categoryNavBg', 'categoryBtnShadow'],
      productCard: ['cardBg', 'cardBorder', 'cardRadius', 'cardShadow', 'cardImageRadius', 'productNameColor', 'productNameWeight', 'productDescColor', 'priceColor', 'priceWeight', 'popularBadgeBg', 'popularBadgeText'],
      search: ['searchBg', 'searchBorder', 'searchText', 'searchOverlayBg', 'searchOverlayInputColor', 'searchOverlayResultBg', 'searchOverlayResultNameColor', 'searchOverlayResultPriceColor'],
      detail: ['detailBg', 'detailNameColor', 'detailPriceColor', 'detailDescColor', 'detailLabelColor', 'detailInfoBg', 'detailInfoBorder'],
      sidebar: ['sidebarBg', 'sidebarNameColor', 'sidebarItemColor', 'sidebarActiveItemBg', 'sidebarActiveItemColor'],
    };

    let sectionInstruction = '';
    if (section && sectionKeyMap[section]) {
      sectionInstruction = `\n\nNOT: Kullanıcı sadece "${section}" bölümünü güncellemek istiyor. Sadece şu key'leri döndür: ${sectionKeyMap[section].join(', ')}`;
    }

    const userContent = `Kullanıcı isteği: "${prompt}"${sectionInstruction}

ÖNEMLİ HATIRLATMA:
- Tüm bölümler (sayfa, header, kart, arama, detay, sidebar) tutarlı aynı renk ailesinden olmalı
- Gradient kullan: headerGradientFrom ≠ headerGradientTo (en az 40 ton fark)
- Kart (cardBg) sayfa zemininden (pageBg) biraz farklı olsun
- pageBg = globalThemeBg olmalı`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userContent,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 1.1,
      },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const jsonStr = (jsonMatch[1] || text).trim();

    let themeData: Record<string, string>;
    try {
      themeData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "AI yanıtı geçersiz JSON", raw: text }, { status: 500 });
    }

    // Ensure pageBg ↔ globalThemeBg sync
    if (themeData.pageBg && !themeData.globalThemeBg) themeData.globalThemeBg = themeData.pageBg;
    if (themeData.globalThemeBg && !themeData.pageBg) themeData.pageBg = themeData.globalThemeBg;

    // Kredi düş + log
    await prisma.$transaction([
      (prisma as any).aiCredit.update({
        where: { restaurantId },
        data: { balance: { decrement: THEME_COST } },
      }),
      (prisma as any).aiUsageLog.create({
        data: { creditId: credit.id, type: "theme_generate", cost: THEME_COST, prompt },
      }),
    ]);

    const updatedCredit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });

    return NextResponse.json({
      theme: themeData,
      balance: updatedCredit?.balance ?? credit.balance - THEME_COST,
    });
  } catch (error: unknown) {
    console.error("AI tema üretim hatası:", error);
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
