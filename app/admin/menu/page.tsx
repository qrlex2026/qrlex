"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Flame } from "lucide-react";

type Product = {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    isPopular: boolean;
    isActive: boolean;
    prepTime: string;
    calories: string;
};

const INITIAL_PRODUCTS: Product[] = [
    { id: "1", categoryId: "burgerler", name: "Classic Cheese", description: "120g dana köfte, cheddar peyniri, özel sos, turşu.", price: 320, isPopular: true, isActive: true, prepTime: "15-20 dk", calories: "650 kcal" },
    { id: "2", categoryId: "burgerler", name: "Truffle Mushroom", description: "Trüf mantarlı mayonez, karamelize soğan, swiss peyniri.", price: 380, isPopular: true, isActive: true, prepTime: "20-25 dk", calories: "720 kcal" },
    { id: "5", categoryId: "burgerler", name: "BBQ Bacon", description: "Dana bacon, BBQ sos, çıtır soğan halkaları, cheddar.", price: 360, isPopular: false, isActive: true, prepTime: "18-22 dk", calories: "780 kcal" },
    { id: "3", categoryId: "pizzalar", name: "Margherita", description: "San Marzano domates sosu, mozzarella, taze fesleğen.", price: 290, isPopular: true, isActive: true, prepTime: "12-15 dk", calories: "520 kcal" },
    { id: "6", categoryId: "pizzalar", name: "Pepperoni", description: "Baharatlı sucuk dilimleri, mozzarella, domates sosu.", price: 330, isPopular: true, isActive: true, prepTime: "12-15 dk", calories: "580 kcal" },
    { id: "7", categoryId: "pizzalar", name: "Dört Peynirli", description: "Mozzarella, gorgonzola, parmesan, ricotta.", price: 350, isPopular: false, isActive: true, prepTime: "12-15 dk", calories: "620 kcal" },
    { id: "4", categoryId: "icecekler", name: "Coca-Cola Zero", description: "330ml kutu.", price: 60, isPopular: false, isActive: true, prepTime: "1 dk", calories: "0 kcal" },
    { id: "8", categoryId: "icecekler", name: "Ev Yapımı Limonata", description: "Taze nane ile.", price: 80, isPopular: true, isActive: true, prepTime: "3-5 dk", calories: "120 kcal" },
    { id: "9", categoryId: "icecekler", name: "Ayran", description: "300ml şişe, bol köpüklü.", price: 40, isPopular: false, isActive: true, prepTime: "1 dk", calories: "75 kcal" },
    { id: "10", categoryId: "tatlilar", name: "San Sebastian Cheesecake", description: "Belçika çikolatalı sos ile.", price: 240, isPopular: true, isActive: true, prepTime: "5 dk", calories: "450 kcal" },
    { id: "11", categoryId: "tatlilar", name: "Çikolatalı Sufle", description: "İçi akışkan, yanında dondurma ile.", price: 250, isPopular: false, isActive: true, prepTime: "15-18 dk", calories: "480 kcal" },
    { id: "12", categoryId: "salatalar", name: "Sezar Salata", description: "Marul, parmesan, kruton, sezar sos.", price: 180, isPopular: false, isActive: true, prepTime: "8-10 dk", calories: "320 kcal" },
    { id: "13", categoryId: "salatalar", name: "Akdeniz Salatası", description: "Domates, salatalık, zeytin, beyaz peynir.", price: 160, isPopular: true, isActive: true, prepTime: "5-8 dk", calories: "220 kcal" },
    { id: "14", categoryId: "baslangiclar", name: "Çıtır Soğan Halkaları", description: "Özel baharatlı, ranch sos ile.", price: 120, isPopular: false, isActive: true, prepTime: "8-10 dk", calories: "380 kcal" },
    { id: "15", categoryId: "baslangiclar", name: "Kanat Tabağı", description: "8 adet acı soslu tavuk kanat.", price: 200, isPopular: true, isActive: true, prepTime: "15-20 dk", calories: "520 kcal" },
];

const CATEGORIES: Record<string, string> = {
    burgerler: "Burgerler",
    pizzalar: "Pizzalar",
    salatalar: "Salatalar",
    baslangiclar: "Başlangıçlar",
    icecekler: "İçecekler",
    tatlilar: "Tatlılar",
};

export default function MenuManagement() {
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    const filtered = products.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "all" || p.categoryId === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const togglePopular = (id: string) => {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isPopular: !p.isPopular } : p)));
    };

    const toggleActive = (id: string) => {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
    };

    const deleteProduct = (id: string) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">Menü Yönetimi</h1>
                    <p className="text-sm text-gray-500">{products.length} ürün</p>
                </div>
                <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-violet-500/20">
                    <Plus size={18} />
                    Yeni Ürün Ekle
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Ürün ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-violet-500 transition-colors"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500 transition-colors"
                >
                    <option value="all">Tüm Kategoriler</option>
                    {Object.entries(CATEGORIES).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
            </div>

            {/* Products Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Ürün</div>
                    <div className="col-span-2">Kategori</div>
                    <div className="col-span-1">Fiyat</div>
                    <div className="col-span-1">Süre</div>
                    <div className="col-span-1 text-center">Popüler</div>
                    <div className="col-span-1 text-center">Durum</div>
                    <div className="col-span-2 text-right">İşlem</div>
                </div>

                {filtered.length === 0 ? (
                    <div className="px-5 py-12 text-center text-gray-500">Sonuç bulunamadı.</div>
                ) : (
                    <div className="divide-y divide-gray-800/60">
                        {filtered.map((product) => (
                            <div key={product.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-5 py-4 items-center hover:bg-gray-800/30 transition-colors ${!product.isActive ? 'opacity-50' : ''}`}>
                                {/* Product Info */}
                                <div className="lg:col-span-4">
                                    <p className="font-semibold text-white text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.description}</p>
                                </div>

                                {/* Category */}
                                <div className="lg:col-span-2">
                                    <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-lg">
                                        {CATEGORIES[product.categoryId]}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="lg:col-span-1">
                                    <span className="text-sm font-bold text-white">{product.price} ₺</span>
                                </div>

                                {/* Prep Time */}
                                <div className="lg:col-span-1">
                                    <span className="text-xs text-gray-500">{product.prepTime}</span>
                                </div>

                                {/* Popular */}
                                <div className="lg:col-span-1 flex lg:justify-center">
                                    <button
                                        onClick={() => togglePopular(product.id)}
                                        className={`p-1.5 rounded-lg transition-colors ${product.isPopular ? "text-amber-400 bg-amber-400/10" : "text-gray-600 hover:text-gray-400"
                                            }`}
                                    >
                                        <Flame size={16} />
                                    </button>
                                </div>

                                {/* Active Status */}
                                <div className="lg:col-span-1 flex lg:justify-center">
                                    <button
                                        onClick={() => toggleActive(product.id)}
                                        className={`p-1.5 rounded-lg transition-colors ${product.isActive ? "text-emerald-400 bg-emerald-400/10" : "text-gray-600 hover:text-gray-400"
                                            }`}
                                    >
                                        {product.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="lg:col-span-2 flex gap-2 justify-end">
                                    <button className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors">
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
