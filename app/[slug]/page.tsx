import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import MenuClient from "./MenuClient";

const defaultTheme = {
    pageBg: "#f9fafb", fontFamily: "Inter", headerBg: "#ffffff",
    headerGradientFrom: "#f3e8ff", headerGradientTo: "#e0f2fe",
    categoryActiveBg: "#000000", categoryActiveText: "#ffffff",
    categoryInactiveBg: "#e5e7eb", categoryInactiveText: "#374151",
    categoryRadius: "9999", searchBg: "#f3f4f6", searchBorder: "#e5e7eb",
    searchText: "#6b7280", cardBg: "#ffffff", cardBorder: "#f3f4f6",
    cardRadius: "12", cardShadow: "sm", cardImageRadius: "8",
    productNameColor: "#111827", productNameWeight: "700",
    productDescColor: "#6b7280",
    priceColor: "#000000", priceWeight: "700",
    discountColor: "#10b981", oldPriceColor: "#9ca3af",
    categoryTitleColor: "#111827", categoryTitleWeight: "700",
    popularBadgeBg: "#fef3c7", popularBadgeText: "#92400e",
    bottomNavBg: "#ffffff", bottomNavActive: "#000000", bottomNavInactive: "#9ca3af",
    accentColor: "#000000",
};

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        include: {
            categories: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
            products: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, include: { category: true } },
        },
    });

    if (!restaurant) notFound();

    // Pre-process all data server-side
    // Proxy R2 URLs through our domain to bypass mobile ISP blocks on r2.dev
    const R2_PUBLIC = "https://pub-5b35497dfb5b4103971895d42f4b4222.r2.dev";
    const toProxy = (url: string | null) => url ? url.replace(R2_PUBLIC, "/media") : "";

    const categories = [
        { id: "populer", name: "Popüler" },
        ...restaurant.categories.map((c) => ({ id: c.id, name: c.name })),
    ];

    const products = restaurant.products.map((p) => ({
        id: p.id,
        categoryId: p.categoryId,
        name: p.name,
        description: p.description || "",
        price: Number(p.discountPrice || p.price),
        image: toProxy(p.image),
        video: toProxy(p.video),
        isPopular: p.isPopular,
        prepTime: p.prepTime || "",
        calories: p.calories || "",
        ingredients: [] as string[],
        allergens: [] as string[],
    }));

    const wh = (restaurant.workingHours as { day: string; open: string; close: string; isOpen: boolean }[] || []).map((h) => ({
        day: h.day,
        hours: h.isOpen ? `${h.open} - ${h.close}` : "Kapalı",
    }));

    const businessInfo = {
        name: restaurant.name,
        description: restaurant.description || "",
        image: toProxy(restaurant.image),
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        website: restaurant.website || "",
        instagram: restaurant.instagram || "",
        whatsapp: restaurant.whatsapp || "",
        workingHours: wh,
        cuisines: (restaurant.cuisines || []) as string[],
        features: (restaurant.features || []) as string[],
        wifiName: restaurant.wifiName || '',
        wifiPassword: restaurant.wifiPassword || '',
    };

    const theme = { ...defaultTheme, ...(restaurant.theme as Record<string, string> || {}) };

    // Build Google Fonts URL for server-side injection
    const fontFamily = theme.fontFamily || "Inter";
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;

    return (
        <>
            {/* Inject critical CSS and font BEFORE any content renders */}
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="stylesheet" href={fontUrl} />
            <style dangerouslySetInnerHTML={{
                __html: `
                body { background-color: ${theme.pageBg} !important; margin: 0; overflow-x: clip; }
                html { background-color: ${theme.pageBg} !important; overflow-x: clip; }
            `}} />
            <MenuClient
                initialCategories={categories}
                initialProducts={products}
                initialBusinessInfo={businessInfo}
                initialTheme={theme}
                slug={slug}
                restaurantId={restaurant.id}
            />
        </>
    );
}

