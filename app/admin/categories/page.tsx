"use client";

import { useState } from "react";
import { Plus, GripVertical, Edit2, Trash2, Package } from "lucide-react";

type Category = {
    id: string;
    name: string;
    productCount: number;
    isActive: boolean;
};

const INITIAL_CATEGORIES: Category[] = [
    { id: "populer", name: "Popüler", productCount: 7, isActive: true },
    { id: "burgerler", name: "Burgerler", productCount: 3, isActive: true },
    { id: "pizzalar", name: "Pizzalar", productCount: 3, isActive: true },
    { id: "salatalar", name: "Salatalar", productCount: 2, isActive: true },
    { id: "baslangiclar", name: "Başlangıçlar", productCount: 2, isActive: true },
    { id: "icecekler", name: "İçecekler", productCount: 3, isActive: true },
    { id: "tatlilar", name: "Tatlılar", productCount: 2, isActive: true },
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

    const toggleActive = (id: string) => {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    };

    const deleteCategory = (id: string) => {
        if (id === "populer") return;
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">Kategoriler</h1>
                    <p className="text-sm text-gray-500">{categories.length} kategori</p>
                </div>
                <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-violet-500/20">
                    <Plus size={18} />
                    Yeni Kategori
                </button>
            </div>

            {/* Categories List */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1"></div>
                    <div className="col-span-4">Kategori Adı</div>
                    <div className="col-span-2">Ürün Sayısı</div>
                    <div className="col-span-2">Durum</div>
                    <div className="col-span-3 text-right">İşlem</div>
                </div>

                <div className="divide-y divide-gray-800/60">
                    {categories.map((cat, index) => (
                        <div
                            key={cat.id}
                            className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 items-center hover:bg-gray-800/30 transition-colors ${!cat.isActive ? 'opacity-50' : ''}`}
                        >
                            {/* Drag Handle */}
                            <div className="hidden sm:flex sm:col-span-1 justify-center">
                                <GripVertical size={16} className="text-gray-600 cursor-grab" />
                            </div>

                            {/* Name */}
                            <div className="sm:col-span-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                                        {index + 1}
                                    </span>
                                    <span className="font-semibold text-white text-sm">{cat.name}</span>
                                    {cat.id === "populer" && (
                                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">Otomatik</span>
                                    )}
                                </div>
                            </div>

                            {/* Product Count */}
                            <div className="sm:col-span-2 flex items-center gap-1.5">
                                <Package size={14} className="text-gray-500" />
                                <span className="text-sm text-gray-400">{cat.productCount} ürün</span>
                            </div>

                            {/* Status */}
                            <div className="sm:col-span-2">
                                <button
                                    onClick={() => toggleActive(cat.id)}
                                    className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${cat.isActive
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-gray-800 text-gray-500"
                                        }`}
                                >
                                    {cat.isActive ? "Aktif" : "Pasif"}
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="sm:col-span-3 flex gap-2 justify-end">
                                <button className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors">
                                    <Edit2 size={15} />
                                </button>
                                {cat.id !== "populer" && (
                                    <button
                                        onClick={() => deleteCategory(cat.id)}
                                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
