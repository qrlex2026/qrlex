"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Star, Pencil, X, Upload, ChevronDown, ChevronRight, GripVertical, ToggleLeft, ToggleRight, Smartphone, Percent, RefreshCw, Sparkles, Loader2, FileText, Wand2 } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { compressVideo } from "@/lib/videoCompress";

interface Category { id: string; name: string; sortOrder: number; isActive: boolean; }
interface Product {
    id: string; name: string; description: string | null; price: number;
    discountPrice: number | null; image: string | null; video: string | null; prepTime: string | null;
    calories: string | null; isPopular: boolean; isActive: boolean;
    categoryId: string; sortOrder: number; category: Category;
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
    const [inlineEdit, setInlineEdit] = useState<{ id: string; field: string; value: string } | null>(null);
    const [showCatModal, setShowCatModal] = useState(false);
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [catName, setCatName] = useState("");
    const [catSaving, setCatSaving] = useState(false);

    // Price toolbar
    const [showPricePanel, setShowPricePanel] = useState(false);
    const [pricePercent, setPricePercent] = useState("");
    const [priceScope, setPriceScope] = useState<"all" | "category">("all");
    const [priceCatId, setPriceCatId] = useState("");
    const [priceApplying, setPriceApplying] = useState(false);

    // Bulk select
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const toggleSelectProduct = (id: string) => setSelectedProducts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const bulkDeleteSelected = async () => {
        if (!selectedProducts.size || bulkDeleting) return;
        setBulkDeleting(true);
        setConfirmBulkDelete(false);
        // Find categories where ALL products are selected → delete those categories too
        const catsToDelete = categories.filter(cat => {
            const catProds = products.filter(p => p.categoryId === cat.id);
            return catProds.length > 0 && catProds.every(p => selectedProducts.has(p.id));
        });
        // Delete products first
        await Promise.all([...selectedProducts].map(id => fetch(`/api/admin/products/${id}`, { method: 'DELETE' })));
        // Delete empty categories
        if (catsToDelete.length > 0) {
            await Promise.all(catsToDelete.map(cat => fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })));
        }
        setSelectedProducts(new Set());
        setBulkDeleting(false);
        fetchData();
    };

    // AI Image generation
    const [showAiImageModal, setShowAiImageModal] = useState(false);
    const [aiImagePrompt, setAiImagePrompt] = useState("");
    const [aiImageLoading, setAiImageLoading] = useState(false);
    const [aiImageResult, setAiImageResult] = useState("");
    const [aiImageError, setAiImageError] = useState("");

    // AI Menu Creator
    const [showAiMenuModal, setShowAiMenuModal] = useState(false);
    const [aiMenuTab, setAiMenuTab] = useState<"image" | "prompt">("prompt");
    const [aiMenuPrompt, setAiMenuPrompt] = useState("");
    const [aiMenuFile, setAiMenuFile] = useState<File | null>(null);
    const [aiMenuFilePreview, setAiMenuFilePreview] = useState("");
    const [aiMenuLoading, setAiMenuLoading] = useState(false);
    const [aiMenuError, setAiMenuError] = useState("");
    const [aiMenuResult, setAiMenuResult] = useState<{ categories: Array<{ name: string; products: Array<{ name: string; description: string; price: number }> }> } | null>(null);
    const [aiMenuImporting, setAiMenuImporting] = useState(false);
    const [aiMenuImportDone, setAiMenuImportDone] = useState(false);
    const aiMenuFileRef = useRef<HTMLInputElement>(null);

    const handleAiImageGenerate = async () => {
        if (!aiImagePrompt.trim() || aiImageLoading || !restaurantId) return;
        setAiImageLoading(true);
        setAiImageError("");
        setAiImageResult("");
        try {
            const res = await fetch("/api/ai/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    restaurantId,
                    productName: form.name,
                    productDescription: form.description,
                    prompt: aiImagePrompt,
                }),
            });
            const data = await res.json();
            if (data.imageUrl) {
                setAiImageResult(data.imageUrl);
            } else {
                setAiImageError(data.error || "Görsel üretilemedi");
            }
        } catch {
            setAiImageError("Bağlantı hatası");
        } finally {
            setAiImageLoading(false);
        }
    };

    const applyAiImage = () => {
        if (!aiImageResult) return;
        setForm(prev => ({ ...prev, image: aiImageResult }));
        setShowAiImageModal(false);
        setAiImageResult("");
        setAiImagePrompt("");
    };

    // AI Menu handlers
    const handleAiMenuFileChange = (file: File) => {
        setAiMenuFile(file);
        setAiMenuError("");
        setAiMenuResult(null);
        setAiMenuImportDone(false);
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => setAiMenuFilePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setAiMenuFilePreview("");
        }
    };

    const handleAiMenuGenerate = async () => {
        if (aiMenuLoading || !restaurantId) return;
        if (aiMenuTab === "prompt" && !aiMenuPrompt.trim()) return;
        if (aiMenuTab === "image" && !aiMenuFile) return;

        setAiMenuLoading(true);
        setAiMenuError("");
        setAiMenuResult(null);
        setAiMenuImportDone(false);

        try {
            let res: Response;
            if (aiMenuTab === "image" && aiMenuFile) {
                const fd = new FormData();
                fd.append("restaurantId", restaurantId);
                fd.append("file", aiMenuFile);
                fd.append("prompt", aiMenuPrompt);
                res = await fetch("/api/ai/generate-menu", { method: "POST", body: fd });
            } else {
                res = await fetch("/api/ai/generate-menu", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ restaurantId, prompt: aiMenuPrompt }),
                });
            }
            const data = await res.json();
            if (data.success && data.menu) {
                setAiMenuResult(data.menu);
            } else {
                setAiMenuError(data.error || "Menü oluşturulamadı");
            }
        } catch {
            setAiMenuError("Bağlantı hatası");
        } finally {
            setAiMenuLoading(false);
        }
    };

    const handleAiMenuImport = async () => {
        if (!aiMenuResult || !restaurantId || aiMenuImporting) return;
        setAiMenuImporting(true);
        try {
            for (const cat of aiMenuResult.categories) {
                // Create category
                const catRes = await fetch(`/api/admin/categories?restaurantId=${restaurantId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: cat.name }),
                });
                const catData = await catRes.json();
                const catId = catData.id;
                if (!catId) continue;
                // Create products in parallel batches of 3
                const prods = cat.products || [];
                for (let i = 0; i < prods.length; i += 3) {
                    await Promise.all(prods.slice(i, i + 3).map(p =>
                        fetch(`/api/admin/products?restaurantId=${restaurantId}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: p.name,
                                description: p.description || null,
                                price: Number(p.price) || 0,
                                categoryId: catId,
                                isActive: true,
                                isPopular: false,
                            }),
                        })
                    ));
                }
            }
            setAiMenuImportDone(true);
            fetchData();
        } catch {
            setAiMenuError("İçe aktarma hatası");
        } finally {
            setAiMenuImporting(false);
        }
    };

    // Slug + iframe
    const [slug, setSlug] = useState("");
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Drag state
    const [dragType, setDragType] = useState<"category" | "product" | null>(null);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [dragCatId, setDragCatId] = useState<string | null>(null);

    // Fetch slug
    useEffect(() => {
        if (!restaurantId) return;
        fetch(`/api/admin/restaurants/${restaurantId}`).then(r => r.json()).then(d => { if (d.slug) setSlug(d.slug); }).catch(() => { });
    }, [restaurantId]);

    const reloadPreview = useCallback(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'reload-menu' }, '*');
        }
    }, []);

    const fetchData = useCallback(() => {
        if (!restaurantId) return;
        setLoading(true);
        Promise.all([
            fetch(`/api/admin/products?restaurantId=${restaurantId}`).then(r => r.json()),
            fetch(`/api/admin/categories?restaurantId=${restaurantId}`).then(r => r.json()),
        ]).then(([prods, cats]) => {
            setProducts(prods);
            setCategories(cats);
            setExpandedCats(new Set(cats.map((c: Category) => c.id)));
            setLoading(false);
            setTimeout(reloadPreview, 500);
        });
    }, [restaurantId]);
    useEffect(() => { if (restaurantId) fetchData(); }, [restaurantId, fetchData]);

    const productsByCategory = (catId: string) => products.filter(p => p.categoryId === catId).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const toggleSelectAllInCat = (catId: string) => {
        const catProds = productsByCategory(catId);
        const allSelected = catProds.length > 0 && catProds.every(p => selectedProducts.has(p.id));
        setSelectedProducts(prev => { const n = new Set(prev); catProds.forEach(p => allSelected ? n.delete(p.id) : n.add(p.id)); return n; });
    };
    const selectAllProducts = () => setSelectedProducts(new Set(products.map(p => p.id)));
    const clearSelection = () => { setSelectedProducts(new Set()); setConfirmBulkDelete(false); };

    // === Product actions ===
    const toggleField = async (id: string, field: "isPopular" | "isActive", value: boolean) => {
        await fetch(`/api/admin/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: !value }) });
        setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: !value } : p));
    };
    const deleteProduct = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
        await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        setProducts(prev => prev.filter(p => p.id !== id));
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
    const startInlineEdit = (product: Product) => { setInlineEdit({ id: product.id, field: "name", value: product.name }); };
    const saveInlineEdit = async () => {
        if (!inlineEdit) return;
        await fetch(`/api/admin/products/${inlineEdit.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: inlineEdit.value }) });
        setProducts(prev => prev.map(p => p.id === inlineEdit.id ? { ...p, name: inlineEdit.value } : p));
        setInlineEdit(null);
    };

    // === Category actions ===
    const toggleCat = (id: string) => { setExpandedCats(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };
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
        if (editCat) await fetch(`/api/admin/categories/${editCat.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: catName }) });
        else await fetch(`/api/admin/categories?restaurantId=${restaurantId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: catName }) });
        setShowCatModal(false); setCatSaving(false); fetchData();
    };

    // === Bulk Price Update ===
    const applyPriceChange = async () => {
        const pct = parseFloat(pricePercent);
        if (isNaN(pct) || pct === 0) return;
        setPriceApplying(true);
        const multiplier = 1 + pct / 100;
        const targetProducts = priceScope === "all" ? products : products.filter(p => p.categoryId === priceCatId);
        await Promise.all(targetProducts.map(p => {
            const newPrice = Math.round(Number(p.price) * multiplier);
            const newDiscount = p.discountPrice ? Math.round(Number(p.discountPrice) * multiplier) : null;
            return fetch(`/api/admin/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ price: newPrice, discountPrice: newDiscount }) });
        }));
        setProducts(prev => prev.map(p => {
            if (priceScope !== "all" && p.categoryId !== priceCatId) return p;
            return { ...p, price: Math.round(Number(p.price) * multiplier), discountPrice: p.discountPrice ? Math.round(Number(p.discountPrice) * multiplier) : null };
        }));
        setPriceApplying(false);
        setShowPricePanel(false);
        setPricePercent("");
    };

    // === Drag & Drop ===
    const handleCatDragStart = (catId: string) => { setDragType("category"); setDragId(catId); };
    const handleCatDragOver = (e: React.DragEvent, catId: string) => { if (dragType !== "category") return; e.preventDefault(); setDragOverId(catId); };
    const handleCatDrop = async (targetCatId: string) => {
        if (dragType !== "category" || !dragId || dragId === targetCatId) { setDragId(null); setDragOverId(null); setDragType(null); return; }
        const newCats = [...categories];
        const fromIdx = newCats.findIndex(c => c.id === dragId);
        const toIdx = newCats.findIndex(c => c.id === targetCatId);
        const [moved] = newCats.splice(fromIdx, 1);
        newCats.splice(toIdx, 0, moved);
        setCategories(newCats);
        setDragId(null); setDragOverId(null); setDragType(null);
        await fetch("/api/admin/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "categories", items: newCats.map((c, i) => ({ id: c.id, sortOrder: i })) }) });
    };

    const handleProdDragStart = (productId: string, catId: string) => { setDragType("product"); setDragId(productId); setDragCatId(catId); };
    const handleProdDragOver = (e: React.DragEvent, productId: string) => { if (dragType !== "product") return; e.preventDefault(); setDragOverId(productId); };
    const handleProdDrop = async (targetProductId: string, catId: string) => {
        if (dragType !== "product" || !dragId || dragId === targetProductId || dragCatId !== catId) { setDragId(null); setDragOverId(null); setDragType(null); setDragCatId(null); return; }
        const catProds = productsByCategory(catId);
        const newProds = [...catProds];
        const fromIdx = newProds.findIndex(p => p.id === dragId);
        const toIdx = newProds.findIndex(p => p.id === targetProductId);
        const [moved] = newProds.splice(fromIdx, 1);
        newProds.splice(toIdx, 0, moved);
        // Update local state
        const updatedIds = newProds.map((p, i) => ({ ...p, sortOrder: i }));
        setProducts(prev => {
            const otherProds = prev.filter(p => p.categoryId !== catId);
            return [...otherProds, ...updatedIds];
        });
        setDragId(null); setDragOverId(null); setDragType(null); setDragCatId(null);
        await fetch("/api/admin/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "products", items: updatedIds.map((p, i) => ({ id: p.id, sortOrder: i })) }) });
    };

    // === File uploads ===
    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) { alert("Sadece resim dosyaları!"); return; }
        setUploading(true); setUploadProgress(10);
        try {
            const fd = new FormData(); fd.append("file", file); fd.append("folder", "products");
            setUploadProgress(30);
            const res = await fetch("/api/upload", { method: "POST", body: fd }); setUploadProgress(80);
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
            setVideoStatus(`Sıkıştırıldı! (${(file.size / 1024 / 1024).toFixed(1)}MB → ${(result.video.size / 1024 / 1024).toFixed(1)}MB)`);
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
            else alert("Video yükleme hatası");
        } catch (err) { console.error(err); alert("Video işleme başarısız!"); }
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
            <div className="w-[900px] shrink-0 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.06]">
                    <div>
                        <h1 className="text-xl font-semibold text-white tracking-tight">Menü Yönetimi</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[12px] text-gray-500">{categories.length} kategori</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700" />
                            <span className="text-[12px] text-gray-500">{products.length} ürün</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedProducts.size > 0 ? (
                            confirmBulkDelete ? (
                                <>
                                    <span className="text-xs text-red-400">{selectedProducts.size} ürün silinecek!</span>
                                    <button onClick={bulkDeleteSelected} disabled={bulkDeleting} className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-semibold transition-all bg-red-500 text-white hover:bg-red-600 disabled:opacity-40">
                                        <Trash2 size={14} /> {bulkDeleting ? 'Siliniyor...' : 'Onayla'}
                                    </button>
                                    <button onClick={() => setConfirmBulkDelete(false)} className="h-9 px-3 rounded-xl text-[13px] bg-gray-800 text-gray-400 hover:text-white">Vazgeç</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={selectAllProducts} className="h-9 px-3 rounded-xl text-[13px] bg-gray-800 text-gray-400 hover:text-white border border-white/[0.06]">Tümünü Seç</button>
                                    <button onClick={clearSelection} className="h-9 px-3 rounded-xl text-[13px] bg-gray-800 text-gray-400 hover:text-white border border-white/[0.06]">Temizle</button>
                                    <button onClick={() => setConfirmBulkDelete(true)} disabled={bulkDeleting} className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium transition-all bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
                                        <Trash2 size={14} /> {selectedProducts.size} Ürünü Sil
                                    </button>
                                </>
                            )
                        ) : (
                            <button onClick={selectAllProducts} className="h-9 px-3 rounded-xl text-[13px] bg-gray-800/60 text-gray-500 hover:text-gray-300 border border-white/[0.04] transition-all">Tümünü Seç</button>
                        )}
                        <button onClick={() => { setShowAiMenuModal(true); setAiMenuResult(null); setAiMenuError(""); setAiMenuImportDone(false); setAiMenuFile(null); setAiMenuFilePreview(""); }} className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium transition-all bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20">
                            <Wand2 size={14} /> AI Menü Oluştur
                        </button>
                        <button onClick={() => setShowPricePanel(!showPricePanel)} className={`flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium transition-all ${showPricePanel ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-[#1e1e1e] text-gray-400 hover:text-white border border-white/[0.06]"}`}><Percent size={14} /> Toplu Fiyat</button>
                        <button onClick={openAddCatModal} className="flex items-center gap-2 h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[13px] font-medium transition-colors"><Plus size={14} /> Kategori</button>
                    </div>
                </div>

                {/* Price Toolbar */}
                {showPricePanel && (
                    <div className="mb-4 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="text-[11px] text-amber-400/70 mb-1 block font-medium">Oran (%)</label>
                                <div className="flex gap-1.5">
                                    {[5, 10, 15, 20, -5, -10].map(v => (
                                        <button key={v} onClick={() => setPricePercent(String(v))} className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${pricePercent === String(v) ? "bg-amber-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"}`}>{v > 0 ? "+" : ""}{v}%</button>
                                    ))}
                                    <input value={pricePercent} onChange={e => setPricePercent(e.target.value)} placeholder="±%" className="w-14 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white text-center focus:outline-none focus:border-amber-500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] text-amber-400/70 mb-1 block font-medium">Uygulama</label>
                                <div className="flex gap-1.5">
                                    <button onClick={() => setPriceScope("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${priceScope === "all" ? "bg-amber-500 text-black" : "bg-gray-800 text-gray-400"}`}>Hepsi</button>
                                    <button onClick={() => { setPriceScope("category"); if (!priceCatId && categories[0]) setPriceCatId(categories[0].id); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${priceScope === "category" ? "bg-amber-500 text-black" : "bg-gray-800 text-gray-400"}`}>Kategori</button>
                                </div>
                            </div>
                            {priceScope === "category" && (
                                <div>
                                    <label className="text-[11px] text-amber-400/70 mb-1 block font-medium">Kategori</label>
                                    <select value={priceCatId} onChange={e => setPriceCatId(e.target.value)} className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500">
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <button onClick={applyPriceChange} disabled={priceApplying || !pricePercent} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black rounded-lg text-xs font-bold transition-colors">{priceApplying ? "Uygulanıyor..." : "Uygula"}</button>
                        </div>
                        {pricePercent && (
                            <p className="text-[11px] text-gray-500 mt-2">
                                {priceScope === "all" ? `Tüm ${products.length} ürünün` : `"${categories.find(c => c.id === priceCatId)?.name}" kategorisindeki ${productsByCategory(priceCatId).length} ürünün`} fiyatı <span className={`font-bold ${Number(pricePercent) > 0 ? "text-red-400" : "text-emerald-400"}`}>{Number(pricePercent) > 0 ? "+" : ""}{pricePercent}%</span> {Number(pricePercent) > 0 ? "artırılacak" : "azaltılacak"}
                            </p>
                        )}
                    </div>
                )}

                {loading ? (<div className="text-center py-20 text-gray-500">Yükleniyor...</div>) : (
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {categories.map(cat => {
                            const catProducts = productsByCategory(cat.id);
                            const expanded = expandedCats.has(cat.id);
                            return (
                                <div key={cat.id}
                                    className={`bg-gray-900 border rounded-xl overflow-hidden transition-colors ${dragOverId === cat.id && dragType === "category" ? "border-emerald-500/50 bg-emerald-500/5" : "border-gray-800"}`}
                                    draggable onDragStart={() => handleCatDragStart(cat.id)} onDragOver={e => handleCatDragOver(e, cat.id)} onDrop={() => handleCatDrop(cat.id)} onDragEnd={() => { setDragId(null); setDragOverId(null); setDragType(null); }}
                                >
                                    {/* Category Header */}
                                    <div className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => toggleCat(cat.id)}>
                                        <input
                                            type="checkbox"
                                            checked={catProducts.length > 0 && catProducts.every(p => selectedProducts.has(p.id))}
                                            onChange={e => { e.stopPropagation(); toggleSelectAllInCat(cat.id); }}
                                            onClick={e => e.stopPropagation()}
                                            className="w-3.5 h-3.5 accent-emerald-500 flex-shrink-0"
                                        />
                                        {expanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
                                        <h3 className="text-sm font-semibold text-white flex-1">{cat.name}</h3>
                                        <span className="text-xs text-gray-500 mr-2">{catProducts.length} ürün</span>
                                        <button onClick={e => { e.stopPropagation(); openEditCatModal(cat); }} className="p-1 rounded hover:bg-gray-700 transition-colors"><Pencil size={14} className="text-gray-500" /></button>
                                        <button onClick={e => { e.stopPropagation(); deleteCat(cat.id); }} className="p-1 rounded hover:bg-red-500/10 transition-colors"><Trash2 size={14} className="text-red-400/60" /></button>
                                    </div>
                                    {expanded && (
                                        <div className="border-t border-gray-800">
                                            {catProducts.map(product => (
                                                <div key={product.id}
                                                    className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors ${!product.isActive ? "opacity-40" : ""} ${dragOverId === product.id && dragType === "product" ? "bg-emerald-500/5 border-l-2 border-l-emerald-500" : ""}`}
                                                    draggable onDragStart={e => { e.stopPropagation(); handleProdDragStart(product.id, cat.id); }} onDragOver={e => { e.stopPropagation(); handleProdDragOver(e, product.id); }} onDrop={e => { e.stopPropagation(); handleProdDrop(product.id, cat.id); }} onDragEnd={() => { setDragId(null); setDragOverId(null); setDragType(null); setDragCatId(null); }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProducts.has(product.id)}
                                                        onChange={() => toggleSelectProduct(product.id)}
                                                        onClick={e => e.stopPropagation()}
                                                        className="w-3.5 h-3.5 accent-emerald-500 flex-shrink-0"
                                                    />
                                                    {product.image ? <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 text-xs text-gray-600">🍽️</div>}
                                                    <div className="flex-1 min-w-0" onDoubleClick={() => startInlineEdit(product)}>
                                                        {inlineEdit?.id === product.id ? (
                                                            <input autoFocus value={inlineEdit.value} onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })} onBlur={saveInlineEdit} onKeyDown={e => { if (e.key === "Enter") saveInlineEdit(); if (e.key === "Escape") setInlineEdit(null); }} className="w-full bg-gray-800 border border-emerald-500 rounded px-2 py-1 text-sm text-white outline-none" />
                                                        ) : (
                                                            <><p className="text-sm text-white truncate cursor-text">{product.name}</p><p className="text-[11px] text-gray-500">{product.discountPrice ? `₺${Number(product.discountPrice).toFixed(0)}` : `₺${Number(product.price).toFixed(0)}`}</p></>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-0.5 flex-shrink-0">
                                                        <button onClick={() => toggleField(product.id, "isPopular", product.isPopular)} className="p-1.5 rounded hover:bg-gray-800"><Star size={14} className={product.isPopular ? "text-amber-400" : "text-gray-600"} fill={product.isPopular ? "currentColor" : "none"} /></button>
                                                        <button onClick={() => toggleField(product.id, "isActive", product.isActive)} className="p-1.5 rounded hover:bg-gray-800">{product.isActive ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} className="text-gray-600" />}</button>
                                                        <button onClick={() => openEditModal(product)} className="p-1.5 rounded hover:bg-gray-800"><Pencil size={14} className="text-gray-400" /></button>
                                                        <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded hover:bg-red-500/10"><Trash2 size={14} className="text-red-400" /></button>
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


            {/* AI Menu Creator Modal */}
            {showAiMenuModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowAiMenuModal(false)}>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                    <Wand2 size={18} className="text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">AI Menü Oluşturucu</h2>
                                    <p className="text-[11px] text-gray-500">Resim veya prompt ile otomatik menü oluştur</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAiMenuModal(false)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>

                        <div className="p-6">
                            {/* Tabs */}
                            <div className="flex gap-1 p-1 bg-gray-800 rounded-xl mb-5">
                                <button onClick={() => setAiMenuTab("prompt")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${aiMenuTab === "prompt" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
                                    <Sparkles size={14} /> Prompt ile
                                </button>
                                <button onClick={() => setAiMenuTab("image")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${aiMenuTab === "image" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
                                    <FileText size={14} /> Resim / PDF
                                </button>
                            </div>

                            {/* Prompt Tab */}
                            {aiMenuTab === "prompt" && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1.5 block">Menünü tarif et</label>
                                        <textarea
                                            value={aiMenuPrompt}
                                            onChange={e => setAiMenuPrompt(e.target.value)}
                                            placeholder="Örn: 20 çeşit Türk yemeği, ana yemekler, tatlılar ve içecekler. Fiyatlar 50-300 TL arası."
                                            rows={3}
                                            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-2">Hazır şablonlar:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[
                                                "Türk mutfağı, kebaplar, mezeler, tatlılar",
                                                "Fast food, burgerler, pizzalar, içecekler",
                                                "Kahvaltı menüsü, serpme ve tabak seçenekleri",
                                                "Kahve & tatlı menüsü, pastane ürünleri",
                                                "Deniz ürünleri restoranı, balık çeşitleri",
                                            ].map(t => (
                                                <button key={t} onClick={() => setAiMenuPrompt(t)} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-[11px] transition-colors text-left">{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-600">💳 3 kredi kullanılacak</p>
                                </div>
                            )}

                            {/* Image Tab */}
                            {aiMenuTab === "image" && (
                                <div className="space-y-3">
                                    <div
                                        onClick={() => aiMenuFileRef.current?.click()}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleAiMenuFileChange(f); }}
                                        className="border-2 border-dashed border-gray-700 hover:border-violet-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                                    >
                                        {aiMenuFilePreview ? (
                                            <img src={aiMenuFilePreview} alt="" className="max-h-40 mx-auto rounded-lg object-contain" />
                                        ) : aiMenuFile ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText size={32} className="text-violet-400" />
                                                <p className="text-sm text-gray-300">{aiMenuFile.name}</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload size={28} className="text-gray-600" />
                                                <p className="text-sm text-gray-400">Menü resmi veya PDF yükle</p>
                                                <p className="text-[11px] text-gray-600">JPG, PNG, PDF desteklenir</p>
                                            </div>
                                        )}
                                    </div>
                                    <input ref={aiMenuFileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAiMenuFileChange(f); e.target.value = ""; }} />
                                    {aiMenuFile && (
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Ek not (opsiyonel)</label>
                                            <input value={aiMenuPrompt} onChange={e => setAiMenuPrompt(e.target.value)} placeholder="Örn: Sadece ana yemekleri al" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500" />
                                        </div>
                                    )}
                                    <p className="text-[11px] text-gray-600">💳 5 kredi kullanılacak</p>
                                </div>
                            )}

                            {/* Error */}
                            {aiMenuError && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{aiMenuError}</div>
                            )}

                            {/* Preview Result */}
                            {aiMenuResult && !aiMenuImportDone && (
                                <div className="mt-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-white">Önizleme</p>
                                        <span className="text-[11px] text-gray-500">{aiMenuResult.categories.reduce((a, c) => a + c.products.length, 0)} ürün / {aiMenuResult.categories.length} kategori</span>
                                    </div>
                                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                        {aiMenuResult.categories.map((cat, ci) => (
                                            <div key={ci} className="bg-gray-800 rounded-xl overflow-hidden">
                                                <div className="px-3 py-2 bg-gray-750">
                                                    <p className="text-xs font-bold text-violet-300">{cat.name}</p>
                                                </div>
                                                {cat.products.map((p, pi) => (
                                                    <div key={pi} className="flex items-center justify-between px-3 py-1.5 border-t border-gray-700/50">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-white truncate">{p.name}</p>
                                                            {p.description && <p className="text-[10px] text-gray-500 truncate">{p.description}</p>}
                                                        </div>
                                                        <span className="text-xs font-semibold text-emerald-400 ml-2 flex-shrink-0">₺{p.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={handleAiMenuImport} disabled={aiMenuImporting} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                            {aiMenuImporting ? <><Loader2 size={15} className="animate-spin" />İçe Aktarılıyor...</> : "✓ Menüyü İçe Aktar"}
                                        </button>
                                        <button onClick={() => { setAiMenuResult(null); setAiMenuError(""); }} className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">Yeniden</button>
                                    </div>
                                </div>
                            )}

                            {/* Import Done */}
                            {aiMenuImportDone && (
                                <div className="mt-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                    <p className="text-emerald-400 font-semibold text-sm">✓ Menü başarıyla oluşturuldu!</p>
                                    <p className="text-gray-500 text-xs mt-1">{aiMenuResult?.categories.reduce((a, c) => a + c.products.length, 0)} ürün eklendi</p>
                                    <button onClick={() => setShowAiMenuModal(false)} className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">Kapat</button>
                                </div>
                            )}

                            {/* Generate Button */}
                            {!aiMenuResult && !aiMenuImportDone && (
                                <button
                                    onClick={handleAiMenuGenerate}
                                    disabled={aiMenuLoading || (aiMenuTab === "prompt" ? !aiMenuPrompt.trim() : !aiMenuFile)}
                                    className="w-full mt-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white' }}
                                >
                                    {aiMenuLoading
                                        ? <><Loader2 size={16} className="animate-spin" />Menü Oluşturuluyor...</>
                                        : <><Wand2 size={16} />Menü Oluştur ({aiMenuTab === "image" ? "5" : "3"} Kredi)</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">{editProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2><button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"><X size={18} /></button></div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-gray-400 mb-1 block">Ürün Adı *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div>
                            <div><label className="text-xs text-gray-400 mb-1 block">Açıklama</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 resize-none" /></div>
                            <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-400 mb-1 block">Fiyat (₺) *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div><div><label className="text-xs text-gray-400 mb-1 block">İndirimli Fiyat</label><input type="number" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div></div>
                            <div><label className="text-xs text-gray-400 mb-1 block">Kategori *</label><select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500">{categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Ürün Resmi</label>
                                {form.image ? (<div className="relative group"><img src={form.image} alt="" className="w-full h-40 object-cover rounded-xl border border-gray-700" /><button onClick={removeImage} className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white" /></button></div>
                                ) : (<div onDragOver={e => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-700 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors">{uploading ? (<div><div className="w-full bg-gray-800 rounded-full h-2 mb-2"><div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div><p className="text-xs text-gray-400">Yükleniyor... %{uploadProgress}</p></div>) : (<><Upload size={24} className="mx-auto mb-2 text-gray-600" /><p className="text-sm text-gray-400">Sürükle & bırak veya tıkla</p></>)}</div>)}
                                <button
                                    type="button"
                                    onClick={() => { setAiImageResult(""); setAiImageError(""); setShowAiImageModal(true); }}
                                    className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all"
                                >
                                    <Sparkles size={13} />
                                    AI ile Görsel Üret (5 Kredi)
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Ürün Videosu</label>
                                {form.video ? (<div className="relative group"><video src={form.video} className="w-full h-40 object-cover rounded-xl border border-gray-700" autoPlay muted loop playsInline /><button onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white" /></button></div>
                                ) : (<div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleVideoUpload(f); }} onClick={() => videoInputRef.current?.click()} className="border-2 border-dashed border-gray-700 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors">{videoUploading ? (<div><div className="w-full bg-gray-800 rounded-full h-2 mb-2"><div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${videoUploadProgress}%` }} /></div><p className="text-xs text-gray-400">{videoStatus || `İşleniyor... %${videoUploadProgress}`}</p></div>) : (<><Upload size={20} className="mx-auto mb-1 text-gray-600" /><p className="text-xs text-gray-400">Video sürükle veya tıkla</p></>)}</div>)}
                                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); e.target.value = ""; }} />
                            </div>
                            <div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-gray-400 mb-1 block">Hazırlama Süresi</label><input value={form.prepTime} onChange={e => setForm({ ...form, prepTime: e.target.value })} placeholder="15-20 dk" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" /></div><div><label className="text-xs text-gray-400 mb-1 block">Kalori</label><input value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} placeholder="650 kcal" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" /></div></div>
                            <div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} className="accent-emerald-500" /><span className="text-sm text-gray-300">Popüler</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-emerald-500" /><span className="text-sm text-gray-300">Aktif</span></label></div>
                            <button onClick={handleSave} disabled={saving || !form.name || !form.price || !form.categoryId} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">{saving ? "Kaydediliyor..." : editProduct ? "Güncelle" : "Ekle"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Image Generation Modal */}
            {showAiImageModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowAiImageModal(false)}>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                    <Sparkles size={16} className="text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">AI Görsel Üret</h2>
                                    <p className="text-[11px] text-gray-500">5 kredi · Gemini 2.0 Flash ile üretim</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAiImageModal(false)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        {form.name && (
                            <div className="mb-3 px-3 py-2 bg-gray-800/60 rounded-xl text-xs text-gray-400">
                                🍽️ <span className="text-gray-300 font-medium">{form.name}</span>
                                {form.description && <span className="text-gray-500"> — {form.description.substring(0, 60)}{form.description.length > 60 ? '...' : ''}</span>}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="text-xs text-gray-400 mb-1.5 block">Görsel stili ve detayları tarif edin</label>
                            <textarea
                                value={aiImagePrompt}
                                onChange={e => setAiImagePrompt(e.target.value)}
                                placeholder="Örn: Beyaz tabakta, üzerinde sos, modern sunum, koyu arka plan"
                                rows={3}
                                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {["Profesyonel sunum", "Rustik ahşap masa", "Beyaz arka plan", "Koyu lüks tema", "Taze malzemeler"].map(s => (
                                    <button key={s} onClick={() => setAiImagePrompt(s)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-[11px] transition-colors">{s}</button>
                                ))}
                            </div>
                        </div>

                        {aiImageError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{aiImageError}</div>
                        )}

                        {aiImageResult ? (
                            <div className="mb-4">
                                <img src={aiImageResult} alt="AI Generated" className="w-full h-48 object-cover rounded-xl border border-gray-700" />
                                <div className="flex gap-2 mt-3">
                                    <button onClick={applyAiImage} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">✓ Bu Görseli Kullan</button>
                                    <button onClick={() => { setAiImageResult(""); handleAiImageGenerate(); }} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">Yeniden Üret</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleAiImageGenerate}
                                disabled={aiImageLoading || !aiImagePrompt.trim()}
                                className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white' }}
                            >
                                {aiImageLoading ? (
                                    <><Loader2 size={16} className="animate-spin" />Üretiliyor... (~10 sn)</>
                                ) : (
                                    <><Sparkles size={16} />Görsel Üret (5 Kredi)</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCatModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCatModal(false)}>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-white">{editCat ? "Kategoriyi Düzenle" : "Yeni Kategori"}</h2><button onClick={() => setShowCatModal(false)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"><X size={18} /></button></div>
                        <div className="space-y-4">
                            <div><label className="text-xs text-gray-400 mb-1 block">Kategori Adı</label><input value={catName} onChange={e => setCatName(e.target.value)} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Örn: Burgerler" /></div>
                            <button onClick={saveCat} disabled={catSaving || !catName} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">{catSaving ? "Kaydediliyor..." : editCat ? "Güncelle" : "Ekle"}</button>
                        </div>
                    </div>
                </div>
            )}
            {/* RIGHT: Live iframe preview */}
            {slug && (
                <div className="hidden lg:flex flex-col items-center w-[400px] flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        <Smartphone size={16} className="text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">Canlı Önizleme</span>
                        <button onClick={reloadPreview} className="ml-2 p-1 rounded-lg hover:bg-gray-800 text-gray-600 hover:text-emerald-400 transition-colors" title="Yenile">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    <div className="w-[380px] bg-gray-950 rounded-[2.5rem] p-3 shadow-2xl border-[3px] border-gray-800 overflow-hidden flex-1 max-h-[700px] relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-950 rounded-b-2xl z-20" />
                        <iframe
                            ref={iframeRef}
                            src={`/${slug}`}
                            className="w-full h-full rounded-[1.8rem] border-0"
                            style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
