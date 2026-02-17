"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Store, Plus, Search, MoreVertical, UtensilsCrossed, LayoutGrid, Star,
    Trash2, Edit3, ExternalLink, QrCode, X
} from "lucide-react";

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    phone: string | null;
    address: string | null;
    createdAt: string;
    _count: {
        products: number;
        categories: number;
        reviews: number;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteModal, setDeleteModal] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        const res = await fetch("/api/admin/restaurants");
        const data = await res.json();
        setRestaurants(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        setDeleting(true);
        await fetch(`/api/admin/restaurants/${id}`, { method: "DELETE" });
        setRestaurants((prev) => prev.filter((r) => r.id !== id));
        setDeleteModal(null);
        setDeleting(false);
    };

    const filtered = restaurants.filter(
        (r) =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Restoranlar</h1>
                    <p className="text-sm text-gray-400">
                        {restaurants.length} işletme kayıtlı
                    </p>
                </div>
                <Link
                    href="/admin/restaurants/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
                >
                    <Plus size={18} />
                    Yeni Restoran Ekle
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    placeholder="Restoran ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-violet-500 transition-colors"
                />
            </div>

            {/* Restaurants Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <Store size={32} className="text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">
                        {searchQuery ? "Sonuç bulunamadı" : "Henüz restoran yok"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {searchQuery
                            ? "Farklı bir arama terimi deneyin"
                            : "İlk restoranınızı ekleyerek başlayın"}
                    </p>
                    {!searchQuery && (
                        <Link
                            href="/admin/restaurants/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            <Plus size={18} />
                            Restoran Ekle
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((restaurant) => (
                        <div
                            key={restaurant.id}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all group relative"
                        >
                            {/* 3-dot menu */}
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenu(openMenu === restaurant.id ? null : restaurant.id);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <MoreVertical size={16} />
                                </button>

                                {/* Dropdown */}
                                {openMenu === restaurant.id && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                                        <div className="absolute right-0 top-10 z-20 w-44 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-1 overflow-hidden">
                                            <Link
                                                href={`/admin/restaurants/${restaurant.id}`}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                                onClick={() => setOpenMenu(null)}
                                            >
                                                <Store size={15} />
                                                Yönet
                                            </Link>
                                            <Link
                                                href={`/admin/restaurants/${restaurant.id}/edit`}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                                onClick={() => setOpenMenu(null)}
                                            >
                                                <Edit3 size={15} />
                                                Düzenle
                                            </Link>
                                            <Link
                                                href={`/${restaurant.slug}`}
                                                target="_blank"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                                onClick={() => setOpenMenu(null)}
                                            >
                                                <ExternalLink size={15} />
                                                Menüyü Gör
                                            </Link>
                                            <div className="h-px bg-gray-700 my-1" />
                                            <button
                                                onClick={() => {
                                                    setOpenMenu(null);
                                                    setDeleteModal(restaurant.id);
                                                }}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                                            >
                                                <Trash2 size={15} />
                                                Sil
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Card Content */}
                            <Link href={`/admin/restaurants/${restaurant.id}`} className="block">
                                {/* Icon + Name */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
                                        <span className="text-white text-lg font-bold">
                                            {restaurant.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-bold text-white truncate group-hover:text-violet-300 transition-colors">
                                            {restaurant.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">/{restaurant.slug}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                {restaurant.description && (
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                                        {restaurant.description}
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="flex gap-4 pt-3 border-t border-gray-800">
                                    <div className="flex items-center gap-1.5">
                                        <UtensilsCrossed size={13} className="text-gray-500" />
                                        <span className="text-xs text-gray-400">
                                            {restaurant._count.products} ürün
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <LayoutGrid size={13} className="text-gray-500" />
                                        <span className="text-xs text-gray-400">
                                            {restaurant._count.categories} kategori
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Star size={13} className="text-gray-500" />
                                        <span className="text-xs text-gray-400">
                                            {restaurant._count.reviews} yorum
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}

                    {/* Add New Card */}
                    <Link
                        href="/admin/restaurants/new"
                        className="bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[180px] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gray-800 group-hover:bg-violet-500/10 flex items-center justify-center mb-3 transition-colors">
                            <Plus size={24} className="text-gray-500 group-hover:text-violet-400 transition-colors" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-violet-400 transition-colors">
                            Yeni Restoran Ekle
                        </p>
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
                    <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <button
                            onClick={() => setDeleteModal(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                            <Trash2 size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Restoranı Sil</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Bu restoranı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm ürünler, kategoriler ve yorumlar silinecektir.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => handleDelete(deleteModal)}
                                disabled={deleting}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {deleting ? "Siliniyor..." : "Evet, Sil"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
