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

━━━ TÜM VARYANTLAR ━━━

cardVariant — Ürün kartı düzeni:
• "classic" → Yatay: solda resim, sağda metin/fiyat. Nötr, sade.
• "centered" → 2 sütun grid: resim üstte tam genişlik. Modern, minimalist.
• "magazine-overlay" → Büyük resim hero, gradient overlay, metin resim üzerinde. Bold.

detailVariant — Ürün detay sayfası:
• "classic" → Yukarıda resim, aşağı kayan kart. Temiz.
• "sheet" → Full-ekran resim/video + alttan yukarı slide sheet. İmmersive, premium.

welcomeVariant — Hoşgeldin sayfası layout'u:
• "classic" → Logo ortada, alt butonlar. Evrensel.
• "cinema" → Tam ekran karanlık, sinematik, büyük başlık.
• "split" → Sol yarı resim, sağ yarı içerik.
• "minimal-center" → Minimalist, net beyaz alan, sade butonlar.
• "story" → Dikey story formatı, büyük resim, alttan içerik.
• "dark-hero" → Tam koyu, hero gradient, büyük CTA.
• "vibrant-grid" → Renkli card grid layout.

headerVariant — Header stili:
• "classic" → Standart, menü-başlık-arama sırası.
• "glass" → Cam (backdrop-blur) efekti.
• "gradient" → Renkli gradient arkaplan.
• "minimal" → Minimal, ince çizgi.
• "tall" → Yüksek header, 2 satır.
• "center-logo" → Logo ortada.
• "accent-bar" → Üstte vurgu çizgisi.

layoutVariant — Ürün liste düzeni:
• "list" → Standart listeleme.
• "grid-2" → 2 sütun kart grid.
• "grid-3" → 3 sütun küçük kart.
• "full-card" → Tam genişlik büyük kart.
• "magazine" → İlk büyük, geri 2 sütun.
• "horizontal" → Yatay kaydırma.
• "compact" → Küçük satır listesi.

Stile göre seç — tutarlı olsun:
- Lüks/premium koyu: magazine-overlay + sheet + cinema + glass + magazine
- Modern/minimal aydınlık: centered + classic + minimal-center + minimal + grid-2
- Bold/dramatik: magazine-overlay + sheet + dark-hero + gradient + full-card
- Sıcak/organik: classic + classic + story + classic + list
- Teknolojik/futuristik: centered + sheet + cinema + glass + grid-2

Bu 5 alanı mutlaka JSON'a ekle: cardVariant, detailVariant, welcomeVariant, headerVariant, layoutVariant

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
bottomNavBg, bottomNavActive, bottomNavInactive,
welcomeBg, welcomeTextColor, welcomeSubtextColor, welcomeBtnBg, welcomeBtnText, welcomeGradientFrom,
cardVariant, detailVariant, welcomeVariant, headerVariant, layoutVariant

SADECE JSON. Başka hiçbir şey YAZMA.`;


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, prompt, section, imageBase64, imageMimeType } = body;

    if (!restaurantId || !prompt) {
      return NextResponse.json({ error: "restaurantId ve prompt gerekli" }, { status: 400 });
    }

    // Image cost: +1 kredi if image provided
    const hasImage = !!(imageBase64 && imageMimeType);

    // Kredi kontrolü
    const totalCost = hasImage ? THEME_COST + 1 : THEME_COST;
    let credit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
    if (!credit) {
      credit = await (prisma as any).aiCredit.create({ data: { restaurantId, balance: 500 } });
    }
    if (credit.balance < totalCost) {
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

    // Build contents — multimodal if image provided
    const textPart = {
      text: `Kullanıcı isteği: "${prompt}"${sectionInstruction}\n\n${hasImage ? 'Ek görsel analizi: Yüklenen görselin renklerini, havasını, stilini analiz et. Bu görselden ilham alarak tema oluştur.' : ''}\n\nÖNEMLİ HATIRLATMA:\n- Tüm bölümler tutarlı aynı renk ailesinden olmalı\n- Gradient kullan: headerGradientFrom ≠ headerGradientTo (en az 40 ton fark)\n- Kart (cardBg) sayfa zemininden (pageBg) biraz farklı olsun\n- pageBg = globalThemeBg olmalı\n- welcomeVariant, headerVariant, layoutVariant, cardVariant, detailVariant hepsini seç`,
    };

    type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };
    const parts: GeminiPart[] = hasImage
      ? [{ inlineData: { mimeType: imageMimeType, data: imageBase64 } }, textPart]
      : [textPart];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 1.0,
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
        data: { balance: { decrement: totalCost } },
      }),
      (prisma as any).aiUsageLog.create({
        data: { creditId: credit.id, type: hasImage ? "theme_generate_vision" : "theme_generate", cost: totalCost, prompt },
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

