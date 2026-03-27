/**
 * CardVariants.tsx
 * Additional card layout variants for the AI theme system.
 * "classic" (list/grid layouts) lives in MenuClient.tsx unchanged.
 * "centered" and "magazine-overlay" are new AI-selectable variants.
 */

import React from "react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  video: string;
  isPopular: boolean;
};

type Theme = Record<string, string>;

function getShadow(s: string) {
  if (!s || s === "none") return "none";
  if (s.includes("px")) return s;
  switch (s) {
    case "sm": return "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)";
    case "md": return "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)";
    case "lg": return "0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1)";
    default: return "none";
  }
}

function MediaEl({ product, className, imgRadius }: { product: Product; className: string; imgRadius?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ borderRadius: imgRadius }}>
      {product.video ? (
        <>
          <video src={product.video} poster={product.image || undefined} muted autoPlay loop playsInline preload="auto" className="w-full h-full object-cover" />
          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
            <span className="text-white text-[9px] ml-0.5">▶</span>
          </div>
        </>
      ) : product.image ? (
        <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-2xl">🍽️</span>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────
   CENTERED — resim üstte tam genişlik, altında bilgi
   ────────────────────────────────────────────────── */
export function CardCentered({
  products,
  T,
  onClick,
}: {
  products: Product[];
  T: Theme;
  onClick: (p: Product) => void;
}) {
  const accent = (T as any).accentColor || "#6366f1";
  const r = Number(T.cardRadius || 14);

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onClick(product)}
          className="overflow-hidden active:scale-[0.97] transition-transform cursor-pointer flex flex-col"
          style={{
            backgroundColor: T.cardBg,
            border: `1px solid ${T.cardBorder}`,
            borderRadius: `${r}px`,
            boxShadow: getShadow(T.cardShadow),
          }}
        >
          {/* Image */}
          <MediaEl product={product} className="w-full h-36" imgRadius={`${r}px ${r}px 0 0`} />

          {/* Content */}
          <div className="flex flex-col flex-1 p-3 gap-1.5">
            <h3
              className="line-clamp-1 text-sm leading-snug"
              style={{ color: T.productNameColor, fontWeight: T.productNameWeight }}
            >
              {product.name}
            </h3>
            {product.description ? (
              <p className="line-clamp-2 text-[11px] flex-1" style={{ color: T.productDescColor }}>
                {product.description}
              </p>
            ) : null}

            {/* Price row */}
            <div className="flex items-center justify-between mt-auto pt-1">
              <div className="flex flex-col">
                <span className="text-base font-bold" style={{ color: T.priceColor, fontWeight: T.priceWeight }}>
                  {product.discountPrice ? product.discountPrice : product.price} TL
                </span>
                {product.discountPrice ? (
                  <span className="text-[10px] line-through" style={{ color: T.oldPriceColor || "#9ca3af" }}>
                    {product.price} TL
                  </span>
                ) : null}
              </div>

              {/* Accent circle button */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: accent }}
              >
                <span className="text-white text-base leading-none font-bold">+</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────
   MAGAZINE-OVERLAY — büyük resim, metin resim üstünde
   ────────────────────────────────────────────────── */
export function CardMagazineOverlay({
  products,
  T,
  onClick,
}: {
  products: Product[];
  T: Theme;
  onClick: (p: Product) => void;
}) {
  const accent = (T as any).accentColor || "#6366f1";
  const r = Number(T.cardRadius || 14);

  return (
    <div className="space-y-3">
      {products.map((product, idx) => {
        const isHero = idx === 0;
        return (
          <div
            key={product.id}
            onClick={() => onClick(product)}
            className={`relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer ${isHero ? "h-52" : "h-36"}`}
            style={{
              borderRadius: `${r}px`,
              boxShadow: getShadow(T.cardShadow),
            }}
          >
            {/* Background media */}
            <MediaEl product={product} className="absolute inset-0 w-full h-full" imgRadius="0" />

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)",
              }}
            />

            {/* Popular badge */}
            {product.isPopular && (
              <div
                className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: T.popularBadgeBg, color: T.popularBadgeText }}
              >
                Popüler
              </div>
            )}

            {/* Content at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3
                className={`text-white drop-shadow-sm ${isHero ? "text-lg" : "text-sm"} line-clamp-1`}
                style={{ fontWeight: T.productNameWeight }}
              >
                {product.name}
              </h3>
              {isHero && product.description ? (
                <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{product.description}</p>
              ) : null}
              <div className="flex items-center justify-between mt-1.5">
                <span
                  className="font-bold"
                  style={{ color: accent, fontSize: isHero ? "1.1rem" : "0.9rem" }}
                >
                  {product.discountPrice ? product.discountPrice : product.price} TL
                </span>
                {product.discountPrice && (
                  <span className="text-white/50 text-[10px] line-through ml-1">{product.price} TL</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
