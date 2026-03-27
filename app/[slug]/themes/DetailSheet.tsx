/**
 * DetailSheet.tsx
 * "sheet" product detail variant — full-screen hero image + slide-up content sheet.
 * Uses the same data & theme tokens as the classic detail view.
 */
"use client";

import { useState } from "react";
import { ChevronLeft, Clock, Flame } from "lucide-react";

type Product = {
  id: string;
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
};

type Theme = Record<string, string>;

type Props = {
  product: Product;
  T: Theme;
  t: (key: string) => string;
  onClose: () => void;
};

export default function DetailSheet({ product, T, t, onClose }: Props) {
  const accent = (T as any).accentColor || "#6366f1";
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "#000" }}
    >
      {/* Full-screen media behind */}
      <div className="absolute inset-0">
        {product.video ? (
          <video
            src={product.video}
            poster={product.image || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        ) : product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-7xl">🍽️</span>
          </div>
        )}
        {/* Dark gradient at bottom for sheet readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Back button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-[51] w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors"
        style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#ffffff" }}
      >
        <ChevronLeft size={22} />
      </button>

      {/* Popular badge */}
      {product.isPopular && (
        <div
          className="absolute top-4 right-4 z-[51] px-3 py-1 rounded-full text-xs font-bold"
          style={{ backgroundColor: T.popularBadgeBg, color: T.popularBadgeText }}
        >
          ⭐ Popüler
        </div>
      )}

      {/* Slide-up sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-y-auto overscroll-contain"
        style={{
          borderRadius: "24px 24px 0 0",
          backgroundColor: T.detailBg || "#ffffff",
          maxHeight: "65dvh",
          paddingBottom: "max(32px, env(safe-area-inset-bottom))",
          animation: "slideUpSheet 0.4s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-5 pt-3 pb-6">
          {/* Name + price */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2
              className="text-2xl font-bold leading-tight flex-1"
              style={{ color: T.detailNameColor || "#111827" }}
            >
              {product.name}
            </h2>
            <div className="shrink-0 text-right">
              {product.discountPrice ? (
                <>
                  <div className="text-2xl font-bold" style={{ color: accent }}>
                    {product.discountPrice} TL
                  </div>
                  <div className="text-sm line-through" style={{ color: T.oldPriceColor || "#9ca3af" }}>
                    {product.price} TL
                  </div>
                </>
              ) : (
                <div className="text-2xl font-bold" style={{ color: T.detailPriceColor || accent }}>
                  {product.price} TL
                </div>
              )}
            </div>
          </div>

          {/* Meta row: prepTime + calories */}
          {(product.prepTime || product.calories) && (
            <div className="flex items-center gap-4 mb-4">
              {product.prepTime && (
                <div className="flex items-center gap-1.5">
                  <Clock size={14} style={{ color: accent }} />
                  <span className="text-sm" style={{ color: T.detailLabelColor || "#6b7280" }}>
                    {product.prepTime}
                  </span>
                </div>
              )}
              {product.prepTime && product.calories && (
                <div className="w-1 h-1 rounded-full bg-gray-300" />
              )}
              {product.calories && (
                <div className="flex items-center gap-1.5">
                  <Flame size={14} style={{ color: accent }} />
                  <span className="text-sm" style={{ color: T.detailLabelColor || "#6b7280" }}>
                    {product.calories}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed mb-4" style={{ color: T.detailDescColor || "#6b7280" }}>
              {product.description}
            </p>
          )}

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2.5" style={{ color: T.detailNameColor }}>
                {t("ingredients")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: T.detailIngredientBg || "#f3f4f6",
                      color: T.detailIngredientText || "#374151",
                      border: `1px solid ${T.detailIngredientBorder || "#e5e7eb"}`,
                    }}
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `@keyframes slideUpSheet { from { transform: translateY(100%); opacity:0.5; } to { transform: translateY(0); opacity:1; } }`
      }} />
    </div>
  );
}
