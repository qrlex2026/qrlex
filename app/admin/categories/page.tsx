"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight, X, GripVertical } from "lucide-react";

interface Category {
    id: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
    _count: { products: number };
}

export default function CategoriesManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchCategories = () => {
        setLoading(true);
        fetch("/api/admin/categories")
            .then((r) => r.json())
            .then((data) => { setCategories(data); setLoading(false); });
    };

    useEffect(() => { fetchCategories(); }, []);

    const toggleActive = async (id: string, isActive: boolean) => {
        await fetch(`/api/admin/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !isActive }),
        });
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c)));
    };

    const deleteCategory = async (id: string) => {
        const cat = categories.find((c) => c.id === id);
        if (cat && cat._count.products > 0) {
            alert(`Bu kategoride ${cat._count.products} ürün var. Önce ürünleri başka bir kategoriye taşıyın.`);
            return;
        }
        if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
        await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    const openAddModal = () => {
        setEditCategory(null);
        setName("");
        setShowModal(true);
    };

    const openEditModal = (cat: Category) => {
        setEditCategory(cat);
        setName(cat.name);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        if (editCategory) {
            await fetch(`/api/admin/categories/${editCategory.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
        } else {
            await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
        }
        setShowModal(false);
        setSaving(false);
        fetchCategories();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kategoriler</h1>
                    <p className="text-sm text-gray-400 mt-1">{categories.length} kategori</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Plus size={18} /> Yeni Kategori
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Yükleniyor...</div>
            ) : (
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat.id} className={`bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 ${!cat.isActive ? "opacity-50" : ""}`}>
                            <GripVertical size={16} className="text-gray-700 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{cat._count.products} ürün</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => toggleActive(cat.id, cat.isActive)} className="p-2 rounded-lg hover:bg-gray-800 transition-colors" title="Aktif/Pasif">
                                    {cat.isActive ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} className="text-gray-600" />}
                                </button>
                                <button onClick={() => openEditModal(cat)} className="p-2 rounded-lg hover:bg-gray-800 transition-colors" title="Düzenle">
                                    <Pencil size={16} className="text-gray-400" />
                                </button>
                                <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Sil">
                                    <Trash2 size={16} className="text-red-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">{editCategory ? "Kategoriyi Düzenle" : "Yeni Kategori"}</h2>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Kategori Adı</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500" placeholder="Örn: Burgerler" />
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving || !name}
                                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
                            >
                                {saving ? "Kaydediliyor..." : editCategory ? "Güncelle" : "Ekle"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
