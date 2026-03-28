import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

const prisma = new PrismaClient();

const THEME_COST = 2;

const SYSTEM_PROMPT = `Sen bir dijital restoran menüsü için ÇOK CESUR ve RADİKAL bir tema tasarımcısısın.
Her prompt için TAMAMEN FARKLI, beklenmedik, yaratıcı tasarımlar üretiyorsun.

SADECE JSON döndür. Açıklama, yorum, markdown YAZMA.

━━━ ZORUNLU TASARIM KURALLARI ━━━

① GRADIENT: headerGradientFrom → headerGradientTo arasında EN AZ 60 ton fark. Jenerik gradient YOK.
② KONTRAST: Koyu zemin → açık yazı. Açık zemin → koyu yazı. Gri belirsizlik KESİNLİKLE YOK.
③ VURGU RENGİ: accentColor + priceColor MUTLAKA göz alıcı. Jenerik mavi/yeşil YOK — altın, neon pembe, elektrik mavisi, coral, amber vs.
④ KART ZEMİNİ: cardBg, pageBg'den EN AZ %20 farklı ton. Derinlik şart.
⑤ FONT: Temayla eşleştir — Lüks→Playfair Display, Tech→Outfit, Sıcak→Nunito, Street→Inter, Bold→DM Sans.
⑥ GÖLGE: cardShadow=lg zorunlu. Koyu temalarda RENKL gölge kullan (örn: "0 8px 32px rgba(168,85,247,0.3)").
⑦ KATEGORİ BAR: categoryRadius=9999 (pill). Aktif butonu accentColor yapsın.

━━━ KESİNLİKLE YASAK ━━━

❌ "classic" cardVariant — SADECE kullanıcı "sade", "basit", "minimal" derse kullanabilirsin.
❌ "classic" welcomeVariant — Prompta göre her zaman farklı bir variant seç.
❌ "classic" headerVariant — Glass, gradient, accent-bar, tall seç.
❌ "list" layoutVariant — magazine, grid-2, full-card, horizontal seç. Sadece "sıradan menü" derlerse list.
❌ Jenerik renkler: #ffffff pageBg olarak, düz #333333 cardBg olarak. TAMAMEN FARKLI palet yap.
❌ Aynı renk kombinasyonunu tekrar kullanma.

━━━ BÖLÜM REHBERİ ━━━

• pageBg / globalThemeBg — AYNI olmalı. Koyu: #050510→#1a1a2e. Açık: #fafafa→#fff5f0.
• menuHeaderBg — pageBg'den belirgin farklı ton. Gradient veya glassmorphism.
• cardBg — pageBg'den %20 daha açık/koyu.
• categoryActiveBg — accentColor (çarpıcı).
• categoryInactiveBg — pageBg'ye çok yakın (soluk).
• searchOverlayBg — pageBg uyumlu.
• detailBg — cardBg uyumlu veya güzel gradient.
• sidebarBg — pageBg'den biraz farklı.
• bottomNavBg — menuHeaderBg ile aynı veya biraz koyu.
• welcomeBg — Koyu/sinematik temalanrda koyu gradient string.
• welcomeBtnBg — accentColor veya kontrastlı cesur renk.
• welcomeGradientFrom — pageBg ile uyumlu koyu ton.

━━━ ÖRNEK TEMA PALETLERİ (İLHAM İÇİN) ━━━

🔮 Lüks/Premium Koyu:
pageBg:#080810 | cardBg:#111122 | gradient:#1a0040→#6600cc | accent:#FFD700 | price:#FFD700
cardVariant:magazine-overlay | detailVariant:sheet | welcomeVariant:cinema | headerVariant:glass | layoutVariant:magazine

🌊 Akdeniz/Ege Mavi:
pageBg:#051a33 | cardBg:#0a2a50 | gradient:#004080→#00B4D8 | accent:#FFD700
cardVariant:centered | detailVariant:sheet | welcomeVariant:story | headerVariant:gradient | layoutVariant:grid-2

🌿 Organik/Doğa:
pageBg:#0a150a | cardBg:#142014 | gradient:#1a3d1a→#4a7a1a | accent:#4ADE80
cardVariant:centered | detailVariant:classic | welcomeVariant:story | headerVariant:minimal | layoutVariant:grid-2

⚡ Neon/Cyberpunk:
pageBg:#020208 | cardBg:#080818 | gradient:#1a0050→#7700ff | accent:#A855F7 | price:#E879F9
cardVariant:magazine-overlay | detailVariant:sheet | welcomeVariant:dark-hero | headerVariant:glass | layoutVariant:full-card

🔥 Endüstriyel/Steampunk:
pageBg:#111111 | cardBg:#1c1c1c | gradient:#1a1a1a→#3d1a00 | accent:#F97316 | price:#FB923C
cardVariant:magazine-overlay | detailVariant:sheet | welcomeVariant:cinema | headerVariant:accent-bar | layoutVariant:full-card

🌺 Tropikal/Canlı:
pageBg:#0a1a0a | cardBg:#0f2a0f | gradient:#0a3d0a→#00cc44 | accent:#FF6B35 | price:#FFD700
cardVariant:centered | detailVariant:sheet | welcomeVariant:vibrant-grid | headerVariant:gradient | layoutVariant:grid-2

☀️ Aydınlık/Minimal Beyaz:
pageBg:#fafafa | cardBg:#ffffff | gradient:#ff9a3c→#ff6b35 | accent:#e85d04
cardVariant:centered | detailVariant:classic | welcomeVariant:minimal-center | headerVariant:minimal | layoutVariant:grid-2

🍷 Fine Dining/Zarif:
pageBg:#0d0006 | cardBg:#1a0010 | gradient:#3d0020→#8b0040 | accent:#C9A84C | price:#F5C842
cardVariant:magazine-overlay | detailVariant:sheet | welcomeVariant:cinema | headerVariant:tall | layoutVariant:magazine

━━━ VARYANT SEÇİM TABLOSU (ZORUNLU) ━━━

cardVariant seç:
• "classic" → SADECE kullanıcı "sade/minimal/basit" derse
• "centered" → Modern, aydınlık, organik, tropikal, minimalist için
• "magazine-overlay" → Lüks, premium, koyu, dramatik, bold, neon için

detailVariant seç:
• "classic" → Açık/minimal/sade temalar SADECE
• "sheet" → Koyu, premium, modern, bold — ÇOĞUNLUKLA BU

welcomeVariant seç:
• "cinema" → Lüks, premium, koyu, sinematik, japon, fine dining
• "dark-hero" → Bold, dramatik, neon, cyberpunk, endüstriyel
• "story" → Organik, sıcak, tropikal, akdeniz, cafe
• "vibrant-grid" → Renkli, eğlenceli, street food, casual
• "split" → Modern kurumsal, İskandinav, tech
• "minimal-center" → SADECE saf beyaz minimal temalar
• "classic" → Sadece açıkça istenirse

headerVariant seç:
• "glass" → Koyu/dark temalar — SIK KULLAN
• "gradient" → Bold/renkli temalar
• "accent-bar" → Endüstriyel, minimal, tech
• "tall" → Lüks, fine dining, zarif
• "center-logo" → Zarif, premium
• "minimal" → SADECE saf beyaz/minimal
• "classic" → Sadece açıkça istenirse

layoutVariant seç:
• "magazine" → Premium, lüks, fine dining
• "grid-2" → Modern, cafe, organik, tropikal
• "full-card" → Bold, dramatik, hero görselli
• "horizontal" → Tech, hızlı, street food
• "grid-3" → Yoğun içerik, küçük ürünler
• "compact" → SADECE açıkça istenirse
• "list" → SADECE "sıradan liste" istenirse

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
welcomeBg, welcomeTextColor, welcomeSubtextColor, welcomeBtnBg, welcomeBtnText, welcomeGradientFrom

SADECE JSON. Başka hiçbir şey YAZMA.`;


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, prompt, section } = body;

    if (!restaurantId || !prompt) {
      return NextResponse.json({ error: "restaurantId ve prompt gerekli" }, { status: 400 });
    }

    let credit = await (prisma as any).aiCredit.findUnique({ where: { restaurantId } });
    if (!credit) {
      credit = await (prisma as any).aiCredit.create({ data: { restaurantId, balance: 500 } });
    }
    if (credit.balance < THEME_COST) {
      return NextResponse.json({ error: "Yetersiz kredi", balance: credit.balance }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key yapılandırılmamış" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const textContent = `Kullanıcı isteği: "${prompt}"${sectionInstruction}

ZORUNLU HATIRLATMA:
- Sadece renkler, fontlar ve gölgeler değişecek. Layout ve varyantlara dokunma.
- Her bölüm tutarlı aynı renk ailesinden olsun
- headerGradientFrom ≠ headerGradientTo (en az 60 ton fark)
- cardBg, pageBg'den %15-20 farklı olsun
- pageBg = globalThemeBg`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: textContent }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 1.4,
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

    if (themeData.pageBg && !themeData.globalThemeBg) themeData.globalThemeBg = themeData.pageBg;
    if (themeData.globalThemeBg && !themeData.pageBg) themeData.pageBg = themeData.globalThemeBg;

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
