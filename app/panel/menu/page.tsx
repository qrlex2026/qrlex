"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Star, Pencil, X, Upload, ChevronDown, ChevronRight, GripVertical, ToggleLeft, ToggleRight, Smartphone } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { compressVideo } from "@/lib/videoCompress";

interface Category { id: string; name: string; sortOrder: number; isActive: boolean; }
interface Product {
    id: string; name: string; description: string | null; price: number;
    discountPrice: number | null; image: string | null; video: string | null; prepTime: string | null;
    calories: string | null; isPopular: boolean; isActive: boolean;
    categoryId: string; category: Category;
}

export default function PanelMenu() {
    const { restaurantId, loading: sessionLoading } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [form, setForm] = useState({ name: "", description: "", price: "", discountPrice: "", image: "", video: "", prepTime: "", calories: "", categoryId: "", isPopular: false, isActive: true });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoUploading, setVideoUploading] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [videoStatus, setVideoStatus] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Inline editing
    const [inlineEdit, setInlineEdit] = useState<{ id: string; field: string; value: string } | null>(null);

    // Category modal
    const [showCatModal, setShowCatModal] = useState(false);
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [catName, setCatName] = useState("");
    const [catSaving, setCatSaving] = useState(false);

    const fetchData = () => {
        if (!restaurantId) return;
        setLoading(true);
        Promise.all([
            fetch(`/api/admin/products?restaurantId=${restaurantId}`).then((r) => r.json()),
            fetch(`/api/admin/categories?restaurantId=${restaurantId}`).then((r) => r.json()),
        ]).then(([prods, cats]) => {
            setProducts(prods);
            setCategories(cats);
            // Expand all categories by default
            setExpandedCats(new Set(cats.map((c: Category) => c.id)));
            setLoading(false);
        });
    };
    useEffect(() => { if (restaurantId) fetchData(); }, [restaurantId]);

    const productsByCategory = (catId: string) => products.filter(p => p.categoryId === catId);

    // === Product actions ===
    const toggleField = async (id: string, field: "isPopular" | "isActive", value: boolean) => {
        await fetch(`/api/admin/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !value }) });
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: !value } : p)));
    };
    const deleteProduct = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };
    const openAddModal = (catId: string) => {
        setEditProduct(null);
        setForm({ name: "", description: "", price: "", discountPrice: "", image: "", video: "", prepTime: "", calories: "", categoryId: catId, isPopular: false, isActive: true });
        setShowModal(true);
    };
    const openEditModal = (p: Product) => {
        setEditProduct(p);
        setForm({ name: p.name, description: p.description || "", price: String(p.price), discountPrice: p.discountPrice ? String(p.discountPrice) : "", image: p.image || "", video: p.video || "", prepTime: p.prepTime || "", calories: p.calories || "", categoryId: p.categoryId, isPopular: p.isPopular, isActive: p.isActive });
        setShowModal(true);
    };

    // Inline edit - double click on name
    const startInlineEdit = (product: Product) => {
        setInlineEdit({ id: product.id, field: "name", value: product.name });
    };
    const saveInlineEdit = async () => {
        if (!inlineEdit) return;
        await fetch(`/api/admin/products/${inlineEdit.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: inlineEdit.value }),
        });
        setProducts(prev => prev.map(p => p.id === inlineEdit.id ? { ...p, name: inlineEdit.value } : p));
        setInlineEdit(null);
    };

    // === Category actions ===
    const toggleCat = (id: string) => {
        setExpandedCats(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const openAddCatModal = () => { setEditCat(null); setCatName(""); setShowCatModal(true); };
    const openEditCatModal = (cat: Category) => { setEditCat(cat); setCatName(cat.name); setShowCatModal(true); };
    const deleteCat = async (id: string) => {
        const count = productsByCategory(id).length;
        if (count > 0) { alert(`Bu kategoride ${count} ürün var. Önce ürünleri silin.`); return; }
        if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
        await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        setCategories(prev => prev.filter(c => c.id !== id));
    };
    const saveCat = async () => {
        setCatSaving(true);
        if (editCat) {
            await fetch(`/api/admin/categories/${editCat.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: catName }) });
        } else {
            await fetch(`/api/admin/categories?restaurantId=${restaurantId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: catName }) });
        }
        setShowCatModal(false); setCatSaving(false); fetchData();
    };

    // === File uploads (same as before) ===
    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) { alert("Sadece resim dosyaları!"); return; }
        setUploading(true); setUploadProgress(10);
        try {
            const fd = new FormData(); fd.append("file", file); fd.append("folder", "products");
            setUploadProgress(30);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            setUploadProgress(80);
            const data = await res.json();
            if (data.success) { setForm(prev => ({ ...prev, image: data.url })); setUploadProgress(100); }
            else alert("Yükleme hatası: " + (data.error || "Bilinmeyen hata"));
        } catch { alert("Yükleme başarısız!"); }
        finally { setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500); }
    };
    const handleVideoUpload = async (file: File) => {
        if (!file.type.startsWith("video/")) { alert("Sadece video dosyaları!"); return; }
        setVideoUploading(true); setVideoUploadProgress(5);
        try {
            setVideoStatus("FFmpeg yükleniyor...");
            const result = await compressVideo(file, (p) => { setVideoUploadProgress(Math.round(p * 0.5)); if (p > 0) setVideoStatus(`Sıkıştırılıyor... %${p}`); });
            const savedPct = Math.round((1 - result.video.size / file.size) * 100);
            setVideoStatus(`Sıkıştırıldı! (${(file.size / 1024 / 1024).toFixed(1)}MB → ${(result.video.size / 1024 / 1024).toFixed(1)}MB, %${savedPct} küçüldü)`);
            if (result.thumbnail && !form.image) {
                setVideoUploadProgress(55); setVideoStatus("Thumbnail yükleniyor...");
                const thumbFd = new FormData(); thumbFd.append("file", result.thumbnail); thumbFd.append("folder", "products");
                const thumbRes = await fetch("/api/upload", { method: "POST", body: thumbFd }); const thumbData = await thumbRes.json();
                if (thumbData.success) setForm(prev => ({ ...prev, image: thumbData.url }));
            }
            setVideoUploadProgress(70); setVideoStatus("Video yükleniyor...");
            const fd = new FormData(); fd.append("file", result.video); fd.append("folder", "videos");
            const res = await fetch("/api/upload", { method: "POST", body: fd }); setVideoUploadProgress(90);
            const data = await res.json();
            if (data.success) { setForm(prev => ({ ...prev, video: data.url })); setVideoUploadProgress(100); setVideoStatus("Yüklendi ✓"); }
            else alert("Video yükleme hatası: " + (data.error || "Bilinmeyen hata"));
        } catch (err) { console.error("Video error:", err); alert("Video işleme başarısız!"); }
        finally { setTimeout(() => { setVideoUploading(false); setVideoUploadProgress(0); setVideoStatus(""); }, 1500); }
    };
    const removeImage = async () => { if (form.image) try { await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: form.image }) }); } catch { } setForm(prev => ({ ...prev, image: "" })); };
    const removeVideo = async () => { if (form.video) try { await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: form.video }) }); } catch { } setForm(prev => ({ ...prev, video: "" })); };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file); };
    const handleSave = async () => {
        setSaving(true);
        const payload = { name: form.name, description: form.description || null, price: form.price, discountPrice: form.discountPrice || null, image: form.image || null, video: form.video || null, prepTime: form.prepTime || null, calories: form.calories || null, categoryId: form.categoryId, isPopular: form.isPopular, isActive: form.isActive };
        if (editProduct) await fetch(`/api/admin/products/${editProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        else await fetch(`/api/admin/products?restaurantId=${restaurantId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        setShowModal(false); setSaving(false); fetchData();
    };

    if (sessionLoading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    return (
        <div className="flex gap-6 h-[calc(100dvh-112px)]">
            {/* LEFT: Editor Panel */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-4">
                    <div><h1 className="text-2xl font-bold text-white">Menü Yönetimi</h1><p className="text-sm text-gray-400 mt-0.5">{categories.length} kategori · {products.length} ürün</p></div>
                    <button onClick={openAddCatModal} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"><Plus size={18} /> Kategori Ekle</button>
                </div>

                {loading ? (<div className="text-center py-20 text-gray-500">Yükleniyor...</div>) : (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {categories.map((cat) => {
                            const catProducts = productsByCategory(cat.id);
                            const expanded = expandedCats.has(cat.id);
                            return (
                                <div key={cat.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                                    {/* Category Header */}
                                    <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => toggleCat(cat.id)}>
                                        {expanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                                        <h3 className="text-sm font-semibold text-white flex-1">{cat.name}</h3>
                                        <span className="text-xs text-gray-500 mr-2">{catProducts.length} ürün</span>
                                        <button onClick={(e) => { e.stopPropagation(); openEditCatModal(cat); }} className="p-1 rounded hover:bg-gray-700 transition-colors"><Pencil size={14} className="text-gray-500" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteCat(cat.id); }} className="p-1 rounded hover:bg-red-500/10 transition-colors"><Trash2 size={14} className="text-red-400/60" /></button>
                                    </div>

                                    {/* Products List */}
                                    {expanded && (
                                        <div className="border-t border-gray-800">
                                            {catProducts.map((product) => (
                                                <div key={product.id} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors ${!product.isActive ? "opacity-40" : ""}`}>
                                                    <GripVertical size={14} className="text-gray-700 flex-shrink-0" />
                                                    {product.image ? <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 text-xs text-gray-600">🍽️</div>}

                                                    {/* Inline edit on double click */}
                                                    <div className="flex-1 min-w-0" onDoubleClick={() => startInlineEdit(product)}>
                                                        {inlineEdit?.id === product.id ? (
                                                            <input
                                                                autoFocus
                                                                value={inlineEdit.value}
                                                                onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                                                                onBlur={saveInlineEdit}
                                                                onKeyDown={e => { if (e.key === "Enter") saveInlineEdit(); if (e.key === "Escape") setInlineEdit(null); }}
                                                                className="w-full bg-gray-800 border border-emerald-500 rounded px-2 py-1 text-sm text-white outline-none"
                                                            />
                                                        ) : (
                                                            <>
                                                                <p className="text-sm text-white truncate cursor-text">{product.name}</p>
                                                                <p className="text-[11px] text-gray-500">{product.discountPrice ? `₺${Number(product.discountPrice).toFixed(0)}` : `₺${Number(product.price).toFixed(0)}`}</p>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-0.5 flex-shrink-0">
                                                        <button onClick={() => toggleField(product.id, "isPopular", product.isPopular)} className="p-1.5 rounded hover:bg-gray-800 transition-colors"><Star size={14} className={product.isPopular ? "text-amber-400" : "text-gray-600"} fill={product.isPopular ? "currentColor" : "none"} /></button>
                                                        <button onClick={() => toggleField(product.id, "isActive", product.isActive)} className="p-1.5 rounded hover:bg-gray-800 transition-colors">{product.isActive ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} className="text-gray-600" />}</button>
                                                        <button onClick={() => openEditModal(product)} className="p-1.5 rounded hover:bg-gray-800 transition-colors"><Pencil size={14} className="text-gray-400" /></button>
                                                        <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded hover:bg-red-500/10 transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => openAddModal(cat.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/5 transition-colors"><Plus size={16} /> Ürün Ekle</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {categories.length === 0 && <div className="text-center py-16 text-gray-500"><p className="mb-3">Henüz kategori yok</p><button onClick={openAddCatModal} className="text-emerald-400 text-sm font-medium">+ İlk kategoriyi ekle</button></div>}
                    </div>
                )}
            </div>

            {/* RIGHT: Live Preview */}
            <div className="hidden lg:flex flex-col items-center w-[320px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3"><Smartphone size={16} className="text-gray-500" /><span className="text-xs text-gray-500 font-medium">Canlı Önizleme</span></div>
                <div className="w-[300px] bg-white rounded-[2rem] border-4 border-gray-700 overflow-hidden shadow-2xl flex-1 max-h-[600px]">
                    {/* Phone Top Bar */}
                    <div className="h-6 bg-gray-100 flex items-center justify-center"><div className="w-16 h-1.5 bg-gray-300 rounded-full" /></div>
                    {/* Menu Content */}
                    <div className="overflow-y-auto bg-gray-50 p-3 space-y-4" style={{ height: 'calc(100% - 24px)' }}>
                        {categories.filter(c => c.isActive !== false).map(cat => {
                            const catProducts = productsByCategory(cat.id).filter(p => p.isActive);
                            if (catProducts.length === 0) return null;
                            return (
                                <div key={cat.id}>
                                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">{cat.name}</h3>
                                    <div className="space-y-2">
                                        {catProducts.map(p => (
                                            <div key={p.id} className="bg-white rounded-xl p-2.5 flex gap-2.5 shadow-sm border border-gray-100">
                                                {p.image ? <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" /> : <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-lg">🍽️</div>}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                                                    {p.description && <p className="text-[10px] text-gray-400 truncate mt-0.5">{p.description}</p>}
                                                    <div className="mt-1">
                                                        {p.discountPrice ? (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs font-bold text-emerald-600">₺{Number(p.discountPrice).toFixed(0)}</span>
                                                                <span className="text-[10px] text-gray-400 line-through">₺{Number(p.price).toFixed(0)}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs font-bold text-gray-900">₺{Number(p.price).toFixed(0)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {p.isPopular && <div className="self-start"><span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">⭐</span></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">{editProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2><button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"><X size={18} /></button></div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-gray-400 mb-1 block">Ürün Adı *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div>
                            <div><label className="text-xs text-gray-400 mb-1 block">Açıklama</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 resize-none" /></div>
                            <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-400 mb-1 block">Fiyat (₺) *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div><div><label className="text-xs text-gray-400 mb-1 block">İndirimli Fiyat</label><input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div></div>
                            <div><label className="text-xs text-gray-400 mb-1 block">Kategori *</label><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500">{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                            {/* Image Upload */}
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Ürün Resmi</label>
                                {form.image ? (
                                    <div className="relative group"><img src={form.image} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-gray-700" /><button onClick={removeImage} className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white" /></button></div>
                                ) : (
                                    <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-700 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors">
                                        {uploading ? (<div><div className="w-full bg-gray-800 rounded-full h-2 mb-2"><div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div><p className="text-xs text-gray-400">Yükleniyor... %{uploadProgress}</p></div>) : (<><Upload size={24} className="mx-auto mb-2 text-gray-600" /><p className="text-sm text-gray-400">Sürükle & bırak veya tıkla</p></>)}
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
                            </div>
                            {/* Video Upload */}
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Ürün Videosu</label>
                                {form.video ? (
                                    <div className="relative group"><video src={form.video} className="w-full h-40 object-cover rounded-xl border border-gray-700" autoPlay muted loop playsInline /><button onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white" /></button></div>
                                ) : (
                                    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleVideoUpload(f); }} onClick={() => videoInputRef.current?.click()} className="border-2 border-dashed border-gray-700 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors">
                                        {videoUploading ? (<div><div className="w-full bg-gray-800 rounded-full h-2 mb-2"><div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${videoUploadProgress}%` }} /></div><p className="text-xs text-gray-400">{videoStatus || `İşleniyor... %${videoUploadProgress}`}</p></div>) : (<><Upload size={20} className="mx-auto mb-1 text-gray-600" /><p className="text-xs text-gray-400">Video sürükle veya tıkla</p><p className="text-[10px] text-gray-600 mt-1">Max 200MB · Otomatik 480p sıkıştırma</p></>)}
                                    </div>
                                )}
                                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); e.target.value = ""; }} />
                            </div>
                            <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-400 mb-1 block">Hazırlama Süresi</label><input value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: e.target.value })} placeholder="15-20 dk" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" /></div><div><label className="text-xs text-gray-400 mb-1 block">Kalori</label><input value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="650 kcal" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" /></div></div>
                            <div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} className="accent-emerald-500" /><span className="text-sm text-gray-300">Popüler</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-emerald-500" /><span className="text-sm text-gray-300">Aktif</span></label></div>
                            <button onClick={handleSave} disabled={saving || !form.name || !form.price || !form.categoryId} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">{saving ? "Kaydediliyor..." : editProduct ? "Güncelle" : "Ekle"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCatModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCatModal(false)}>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">{editCat ? "Kategoriyi Düzenle" : "Yeni Kategori"}</h2><button onClick={() => setShowCatModal(false)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"><X size={18} /></button></div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-gray-400 mb-1 block">Kategori Adı</label><input value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Örn: Burgerler" /></div>
                            <button onClick={saveCat} disabled={catSaving || !catName} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">{catSaving ? "Kaydediliyor..." : editCat ? "Güncelle" : "Ekle"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
