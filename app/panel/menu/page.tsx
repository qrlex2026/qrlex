"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Plus, Trash2, Star, ToggleLeft, ToggleRight, Pencil, X, Upload } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { compressVideo } from "@/lib/videoCompress";

interface Category { id: string; name: string; }
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
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("all");
    const [loading, setLoading] = useState(true);
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

    const fetchData = () => {
        if (!restaurantId) return;
        setLoading(true);
        Promise.all([
            fetch(`/api/admin/products?restaurantId=${restaurantId}`).then((r) => r.json()),
            fetch(`/api/admin/categories?restaurantId=${restaurantId}`).then((r) => r.json()),
        ]).then(([prods, cats]) => { setProducts(prods); setCategories(cats); setLoading(false); });
    };
    useEffect(() => { if (restaurantId) fetchData(); }, [restaurantId]);

    const filtered = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === "all" || p.categoryId === filterCat;
        return matchSearch && matchCat;
    });

    const toggleField = async (id: string, field: "isPopular" | "isActive", value: boolean) => {
        await fetch(`/api/admin/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !value }) });
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: !value } : p)));
    };
    const deleteProduct = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };
    const openAddModal = () => { setEditProduct(null); setForm({ name: "", description: "", price: "", discountPrice: "", image: "", video: "", prepTime: "", calories: "", categoryId: categories[0]?.id || "", isPopular: false, isActive: true }); setShowModal(true); };
    const openEditModal = (p: Product) => { setEditProduct(p); setForm({ name: p.name, description: p.description || "", price: String(p.price), discountPrice: p.discountPrice ? String(p.discountPrice) : "", image: p.image || "", video: p.video || "", prepTime: p.prepTime || "", calories: p.calories || "", categoryId: p.categoryId, isPopular: p.isPopular, isActive: p.isActive }); setShowModal(true); };

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("Sadece resim dosyaları yüklenebilir!");
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            alert("Dosya boyutu 50MB'dan küçük olmalı!");
            return;
        }
        setUploading(true);
        setUploadProgress(10);
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("folder", "products");
            setUploadProgress(30);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            setUploadProgress(80);
            const data = await res.json();
            if (data.success) {
                setForm((prev) => ({ ...prev, image: data.url }));
                setUploadProgress(100);
            } else {
                alert("Yükleme hatası: " + (data.error || "Bilinmeyen hata"));
            }
        } catch {
            alert("Yükleme başarısız!");
        } finally {
            setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
        }
    };

    const handleVideoUpload = async (file: File) => {
        if (!file.type.startsWith("video/")) {
            alert("Sadece video dosyaları yüklenebilir!");
            return;
        }
        if (file.size > 200 * 1024 * 1024) {
            alert("Video boyutu 200MB'dan küçük olmalı!");
            return;
        }
        setVideoUploading(true);
        setVideoUploadProgress(5);
        try {
            // Phase 1: Compress video (0-60%)
            setVideoStatus("FFmpeg yükleniyor...");
            const compressed = await compressVideo(file, (p) => {
                setVideoUploadProgress(Math.round(p * 0.6)); // 0-60%
                if (p > 0) setVideoStatus(`Sıkıştırılıyor... %${p}`);
            });
            const savedPct = Math.round((1 - compressed.size / file.size) * 100);
            setVideoStatus(`Sıkıştırıldı! (${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressed.size / 1024 / 1024).toFixed(1)}MB, %${savedPct} küçüldü)`);

            // Phase 2: Upload compressed video (60-100%)
            setVideoUploadProgress(65);
            setVideoStatus("Yükleniyor...");
            const fd = new FormData();
            fd.append("file", compressed);
            fd.append("folder", "videos");
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            setVideoUploadProgress(90);
            const data = await res.json();
            if (data.success) {
                setForm((prev) => ({ ...prev, video: data.url }));
                setVideoUploadProgress(100);
                setVideoStatus("Yüklendi ✓");
            } else {
                alert("Video yükleme hatası: " + (data.error || "Bilinmeyen hata"));
            }
        } catch (err) {
            console.error("Video compression/upload error:", err);
            alert("Video işleme başarısız!");
        } finally {
            setTimeout(() => { setVideoUploading(false); setVideoUploadProgress(0); setVideoStatus(""); }, 1500);
        }
    };

    const removeImage = async () => {
        if (form.image) {
            try {
                await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: form.image }) });
            } catch { /* ignore */ }
        }
        setForm((prev) => ({ ...prev, image: "" }));
    };

    const removeVideo = async () => {
        if (form.video) {
            try {
                await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: form.video }) });
            } catch { /* ignore */ }
        }
        setForm((prev) => ({ ...prev, video: "" }));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = { name: form.name, description: form.description || null, price: form.price, discountPrice: form.discountPrice || null, image: form.image || null, video: form.video || null, prepTime: form.prepTime || null, calories: form.calories || null, categoryId: form.categoryId, isPopular: form.isPopular, isActive: form.isActive };
        if (editProduct) { await fetch(`/api/admin/products/${editProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
        else { await fetch(`/api/admin/products?restaurantId=${restaurantId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
        setShowModal(false); setSaving(false); fetchData();
    };

    if (sessionLoading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-white">Menü Yönetimi</h1><p className="text-sm text-gray-400 mt-1">{products.length} ürün</p></div>
                <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"><Plus size={18} /> Yeni Ürün</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" placeholder="Ürün ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" /></div>
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"><option value="all">Tüm Kategoriler</option>{categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select>
            </div>
            {loading ? (<div className="text-center py-20 text-gray-500">Yükleniyor...</div>) : (
                <div className="space-y-2">
                    {filtered.map((product) => (
                        <div key={product.id} className={`bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 ${!product.isActive ? "opacity-50" : ""}`}>
                            {product.image ? <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" /> : <div className="w-14 h-14 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-600 text-xs">Resim yok</div>}
                            <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>{product.isPopular && <Star size={14} className="text-amber-400 flex-shrink-0" fill="currentColor" />}</div><p className="text-xs text-gray-500 mt-0.5">{product.category.name}</p></div>
                            <div className="text-right flex-shrink-0">{product.discountPrice ? (<><p className="text-sm font-bold text-emerald-400">₺{Number(product.discountPrice).toFixed(0)}</p><p className="text-xs text-gray-500 line-through">₺{Number(product.price).toFixed(0)}</p></>) : (<p className="text-sm font-bold text-white">₺{Number(product.price).toFixed(0)}</p>)}</div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => toggleField(product.id, "isPopular", product.isPopular)} className="p-2 rounded-lg hover:bg-gray-800 transition-colors"><Star size={16} className={product.isPopular ? "text-amber-400" : "text-gray-600"} fill={product.isPopular ? "currentColor" : "none"} /></button>
                                <button onClick={() => toggleField(product.id, "isActive", product.isActive)} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">{product.isActive ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} className="text-gray-600" />}</button>
                                <button onClick={() => openEditModal(product)} className="p-2 rounded-lg hover:bg-gray-800 transition-colors"><Pencil size={16} className="text-gray-400" /></button>
                                <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 size={16} className="text-red-400" /></button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="text-center py-10 text-gray-500">Ürün bulunamadı</div>}
                </div>
            )}
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
                                    <div className="relative group">
                                        <img src={form.image} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-gray-700" />
                                        <button onClick={removeImage} className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white" /></button>
                                    </div>
                                ) : (
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-700 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                                    >
                                        {uploading ? (
                                            <div>
                                                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                                                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                                </div>
                                                <p className="text-xs text-gray-400">Yükleniyor... %{uploadProgress}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={24} className="mx-auto mb-2 text-gray-600" />
                                                <p className="text-sm text-gray-400">Sürükle & bırak veya tıkla</p>
                                                <p className="text-xs text-gray-600 mt-1">Max 50MB · JPG, PNG, WebP, MP4</p>
                                            </>
                                        )}
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
                            </div>
                            {/* Video Upload */}
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Ürün Videosu</label>
                                {form.video ? (
                                    <div className="relative group">
                                        <video src={form.video} className="w-full h-40 object-cover rounded-xl border border-gray-700" muted playsInline />
                                        <button onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white" /></button>
                                    </div>
                                ) : (
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleVideoUpload(f); }}
                                        onClick={() => videoInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-700 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors"
                                    >
                                        {videoUploading ? (
                                            <div>
                                                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                                                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${videoUploadProgress}%` }} />
                                                </div>
                                                <p className="text-xs text-gray-400">{videoStatus || `İşleniyor... %${videoUploadProgress}`}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={20} className="mx-auto mb-1 text-gray-600" />
                                                <p className="text-xs text-gray-400">Video sürükle veya tıkla</p>
                                                <p className="text-[10px] text-gray-600 mt-1">Max 200MB · Otomatik sıkıştırılır (720p)</p>
                                            </>
                                        )}
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
        </div>
    );
}
