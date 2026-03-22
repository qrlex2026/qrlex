const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const DEFAULT_THEME = {
    pageBg: "#f9fafb", fontFamily: "Inter",
    headerGradientFrom: "#f3e8ff", headerGradientTo: "#e0f2fe",
    categoryActiveBg: "#000000", categoryActiveText: "#ffffff",
    categoryInactiveBg: "#e5e7eb", categoryInactiveText: "#374151",
    categoryRadius: "9999", searchBg: "#f3f4f6", searchBorder: "#e5e7eb",
    searchText: "#6b7280", cardBg: "#ffffff", cardBorder: "#f3f4f6",
    cardRadius: "12", cardShadow: "sm", cardImageRadius: "8",
    productNameColor: "#111827", productNameWeight: "700",
    productDescColor: "#6b7280", priceColor: "#000000", priceWeight: "700",
    discountColor: "#10b981", oldPriceColor: "#9ca3af",
    categoryTitleColor: "#111827", categoryTitleWeight: "700",
    popularBadgeBg: "#fef3c7", popularBadgeText: "#92400e",
    bottomNavBg: "#ffffff", bottomNavActive: "#000000", bottomNavInactive: "#9ca3af",
    accentColor: "#000000",
    menuHeaderBg: "#ffffff", menuHeaderTextColor: "#111827",
    menuHeaderIconColor: "#374151", menuHeaderSearchIconColor: "#374151",
    menuHeaderShadow: "sm", menuHeaderFontSize: "18", menuHeaderFontWeight: "700",
    menuHeaderTextAlign: "center", menuHeaderSearchBtnBg: "#f3f4f6",
    headerVariant: "classic", headerLogo: "",
    showMenuButton: "true", showSearchIcon: "true",
    globalThemeBg: "#ffffff", globalThemeText: "#111827",
    globalThemeIcon: "#374151", globalThemeSearchBg: "#f3f4f6",
    categoryNavBg: "#ffffff", categoryBtnShadow: "none",
    showHeroSlider: "true",
    detailBg: "#ffffff", detailNameColor: "#111827", detailPriceColor: "#000000",
    detailDescColor: "#6b7280", detailLabelColor: "#111827",
    detailInfoBg: "#f9fafb", detailInfoBorder: "#f3f4f6",
    searchOverlayBg: "#ffffff", searchOverlayInputColor: "#000000",
    searchOverlayResultBg: "#f9fafb", searchOverlayResultNameColor: "#111827",
    searchOverlayResultPriceColor: "#000000",
    sidebarBg: "#ffffff", sidebarNameColor: "#111827",
    sidebarItemColor: "#374151", sidebarActiveItemBg: "#111827",
    sidebarActiveItemColor: "#ffffff",
};

const RESTAURANT_ID = 'f9c2e101-fd84-499c-9790-264acd7f4b54';

p.restaurant.update({
    where: { id: RESTAURANT_ID },
    data: { theme: DEFAULT_THEME }
})
.then(() => {
    console.log('✓ Tema başarıyla sıfırlandı!');
    console.log('Yeni key sayısı:', Object.keys(DEFAULT_THEME).length);
    p.$disconnect();
})
.catch(e => { console.error('✗ Hata:', e.message); p.$disconnect(); });
