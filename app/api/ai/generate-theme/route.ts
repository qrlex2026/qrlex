import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

const prisma = new PrismaClient();

const THEME_COST = 2; // Her tema üretimi 2 kredi

const SYSTEM_PROMPT = `Sen dünyaca ünlü bir UI/UX tasarımcısısın ve yaratıcı direktörsün. Dijital restoran menüleri için ÇARPICI, GÖZ ALICI ve ÇOK KATMANLI temalar üretiyorsun.

SADECE JSON formatında yanıt ver. Açıklama, yorum, markdown veya başka hiçbir şey YAZMA.

ZORUNLU TASARIM KURALLARI (her temada MUTLAKA uygula):

1. GRADİENT ZORUNLU: headerGradientFrom ve headerGradientTo birbirinden BELIRGIN şekilde farklı olmalı. Düz tek renk YASAK. En az 30-50 ton farkı olsun. Örn: #1a0050 → #8B00FF veya #003366 → #00B4D8

2. RENK ZENGİNLİĞİ: Birbirine çok yakın renk tonu kullanma. Kontrast ve canlılık şart.
   - YASAK: #1a1a1a ile #1d1d1d gibi neredeyse aynı renkler
   - ZORUNLU: Farklı renk ailelerini bir arada kullan, en az 3 farklı ton ailesi

3. PARLAK VURGU: accentColor, priceColor, popularBadgeBg MUTLAKA çarpıcı olmalı.
   - Altın: #D4AF37, #FFD700, #E5C453, #F59E0B
   - Neon: #00FF94, #FF006E, #8338EC, #3A86FF, #06D6A0
   - Amber: #F59E0B, #FBBF24, #FCD34D
   - Mercan: #FF6B6B, #FF4444, #E63946
   - Yeşil: #10B981, #34D399, #4ADE80

4. KOYU/AÇIK KONTRAST: Koyu arka plan → beyaz/çok açık yazılar. Açık arka plan → çok koyu yazılar. ARA TONLAR YASAK.

5. MUTLAKA GÖLGE: cardShadow = "md" veya "lg". menuHeaderShadow = "sm" veya "md".

6. YUVARLAK KENARLAR: cardRadius = 12-18. categoryRadius = 9999 (hap/pill şekli premium görünür).

7. FONT SEÇİMİ: Temaya uygun özenle seç.
   - Lüks/Fine Dining → Playfair Display veya Lora
   - Modern/Tech → Outfit veya Plus Jakarta Sans  
   - Sıcak/Samimi → Nunito veya Quicksand
   - Minimalist → Inter veya DM Sans
   - Etnik/Geleneksel → Poppins

8. SAYFA vs KART FARKI: pageBg ile cardBg FARKLI olsun. Kart sayfadan biraz daha açık veya koyu görünsün (yükseklik hissi yaratır).

9. globalThemeBg = pageBg ile AYNI değer olmalı.

KÜLTÜREL/BÖLGESEL REHBERİ:
• "Ege/Akdeniz" → pageBg:#051f3a, headerGradientFrom:#003d7a, headerGradientTo:#00b4d8, accent:#FFD700, cardBg:#0a2e52
• "Lüks/Premium/Fine Dining" → pageBg:#080808, headerGradientFrom:#1a0030, headerGradientTo:#5a0090, accent:#D4AF37, cardBg:#111111
• "Geleneksel Türk/Osmanlı" → pageBg:#1a0800, headerGradientFrom:#8B2500, headerGradientTo:#cc6600, accent:#D4870A, cardBg:#241005
• "Modern/Minimal" → pageBg:#f5f5f5, headerGradientFrom:#1a1a2e, headerGradientTo:#16213e, accent:#6366F1, cardBg:#ffffff
• "Neon/Gece Kulübü" → pageBg:#02020a, headerGradientFrom:#1a0050, headerGradientTo:#4d0080, accent:#A855F7, cardBg:#07070f
• "Doğa/Organik/Farm" → pageBg:#0a1a0a, headerGradientFrom:#1a3d1a, headerGradientTo:#2d6a2d, accent:#4ADE80, cardBg:#0f2010
• "Sahil/Tropikal" → pageBg:#001833, headerGradientFrom:#004d80, headerGradientTo:#00b4d8, accent:#FFD166, cardBg:#002244
• "Japon/Asya" → pageBg:#0d0505, headerGradientFrom:#8B0000, headerGradientTo:#cc0000, accent:#FF6B6B, cardBg:#150808
• "Steakhouse/Et" → pageBg:#0c0800, headerGradientFrom:#3d1a00, headerGradientTo:#6b2d00, accent:#C9A84C, cardBg:#180d00
• "Kahvaltı/Brunch" → pageBg:#fff8f0, headerGradientFrom:#ff9a3c, headerGradientTo:#ff6b35, accent:#e85d04, cardBg:#ffffff
• "Pastane/Tatlı" → pageBg:#1a0a14, headerGradientFrom:#8b006e, headerGradientTo:#cc0099, accent:#FF69B4, cardBg:#240d1c

Üretmen gereken JSON key'leri (HEPSİNİ döndür):
pageBg, globalThemeBg, globalThemeText, globalThemeIcon, globalThemeSearchBg,
fontFamily, accentColor,
headerBg, headerGradientFrom, headerGradientTo,
menuHeaderBg, menuHeaderTextColor, menuHeaderIconColor, menuHeaderShadow, menuHeaderSearchBtnBg,
categoryActiveBg, categoryActiveText, categoryInactiveBg, categoryInactiveText, categoryRadius, categoryNavBg, categoryBtnShadow,
searchBg, searchBorder, searchText, searchOverlayBg, searchOverlayInputColor, searchOverlayResultBg, searchOverlayResultNameColor, searchOverlayResultPriceColor,
cardBg, cardBorder, cardRadius, cardShadow, cardImageRadius,
productNameColor, productNameWeight, productDescColor,
priceColor, priceWeight, discountColor, oldPriceColor,
categoryTitleColor, categoryTitleWeight,
popularBadgeBg, popularBadgeText,
bottomNavBg, bottomNavActive, bottomNavInactive,
detailBg, detailNameColor, detailPriceColor, detailDescColor, detailLabelColor, detailInfoBg, detailInfoBorder,
sidebarBg, sidebarNameColor, sidebarItemColor, sidebarActiveItemBg, sidebarActiveItemColor,
welcomeBg, welcomeTextColor, welcomeSubtextColor, welcomeBtnBg, welcomeBtnText

SADECE JSON döndür, başka hiçbir şey YAZMA.`;


export async function POST(req: NextRequest) {
  try {
    const { restaurantId, prompt, section } = await req.json();

    if (!restaurantId || !prompt) {
      return NextResponse.json(
        { error: "restaurantId ve prompt gerekli" },
        { status: 400 }
      );
    }

    // 1. Kredi kontrolü
    let credit = await (prisma as any).aiCredit.findUnique({
      where: { restaurantId },
    });

    if (!credit) {
      credit = await (prisma as any).aiCredit.create({
        data: { restaurantId, balance: 100 },
      });
    }

    if (credit.balance < THEME_COST) {
      return NextResponse.json(
        { error: "Yetersiz kredi", balance: credit.balance },
        { status: 403 }
      );
    }

    // 2. Gemini API çağrısı
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key yapılandırılmamış" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build section-specific instruction
    const sectionKeyMap: Record<string, string[]> = {
      header: ['headerBg', 'headerGradientFrom', 'headerGradientTo', 'menuHeaderBg', 'menuHeaderTextColor', 'menuHeaderIconColor', 'menuHeaderShadow'],
      categories: ['categoryActiveBg', 'categoryActiveText', 'categoryInactiveBg', 'categoryInactiveText', 'categoryRadius', 'categoryNavBg', 'categoryBtnShadow'],
      productCard: ['cardBg', 'cardBorder', 'cardRadius', 'cardShadow', 'cardImageRadius', 'productNameColor', 'productNameWeight', 'productDescColor', 'priceColor', 'priceWeight'],
      welcome: ['welcomeBg', 'welcomeTextColor', 'welcomeSubtextColor', 'welcomeBtnBg', 'welcomeBtnText'],
      search: ['searchBg', 'searchBorder', 'searchText', 'searchOverlayBg', 'searchOverlayInputColor', 'searchOverlayResultBg'],
      drawer: ['sidebarBg', 'sidebarNameColor', 'sidebarItemColor', 'sidebarActiveItemBg', 'sidebarActiveItemColor'],
    };

    let sectionInstruction = '';
    if (section && sectionKeyMap[section]) {
      const keys = sectionKeyMap[section];
      sectionInstruction = `\n\nÖNEMLİ: Kullanıcı SADECE ${section} bölümünü değiştirmek istiyor. SADECE şu key'leri döndür: ${keys.join(', ')}`;
    }

    const userContent = `Kullanıcının tema isteği: "${prompt}"${sectionInstruction}

HATIRLATMA: Gradient'siz, tek düz renkli, sıradan bir tema ÜRETME. Her renk özenle seçilmiş, dramatik kontrastlı, gradient'li ve temayla birebir uyumlu olmalı.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userContent,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 1.2,
      },
    });

    // 3. JSON parse
    const text = response.text || "";
    // JSON bloğunu ayıkla (```json ... ``` veya düz JSON)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const jsonStr = (jsonMatch[1] || text).trim();

    let themeData: Record<string, string>;
    try {
      themeData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "AI yanıtı geçersiz JSON döndürdü", raw: text },
        { status: 500 }
      );
    }

    // globalThemeBg ile pageBg'yi senkronize et
    if (themeData.pageBg && !themeData.globalThemeBg) {
      themeData.globalThemeBg = themeData.pageBg;
    }
    if (themeData.globalThemeBg && !themeData.pageBg) {
      themeData.pageBg = themeData.globalThemeBg;
    }

    // 4. Krediyi düş + log kaydet
    await prisma.$transaction([
      (prisma as any).aiCredit.update({
        where: { restaurantId },
        data: { balance: { decrement: THEME_COST } },
      }),
      (prisma as any).aiUsageLog.create({
        data: {
          creditId: credit.id,
          type: "theme_generate",
          cost: THEME_COST,
          prompt,
        },
      }),
    ]);

    const updatedCredit = await (prisma as any).aiCredit.findUnique({
      where: { restaurantId },
    });

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
