"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, Star, Pencil, X, Upload, ChevronDown, ChevronRight, ChevronLeft, GripVertical, ToggleLeft, ToggleRight, Smartphone, Percent, RefreshCw, Sparkles, Loader2, FileText, Wand2 } from "lucide-react";

import { useSession } from "@/lib/useSession";
import { compressVideo } from "@/lib/videoCompress";

// Normalize media URLs: convert r2.dev direct URLs to /media proxy
// Works for both old stored URLs and new proxy URLs
const R2_PUBLIC = "https://pub-5b35497dfb5b4103971895d42f4b4222.r2.dev";
function normalizeUrl(url: string | null | undefined): string {
    if (!url) return "";
    if (url.startsWith(R2_PUBLIC)) return url.replace(R2_PUBLIC, "/media");
    return url;
}

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
    const [form, setForm] = useState({ name: "", description: "", price: "", discountPrice: "", image: "", video: "", prepTime: "", calories: "", ingredients: "", categoryId: "", isPopular: false, isActive: true });
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
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const [bulkDeleteToast, setBulkDeleteToast] = useState("");
    const toggleSelectProduct = (id: string) => setSelectedProducts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const bulkDeleteSelected = async () => {
        if (!selectedProducts.size && !selectedCategories.size || bulkDeleting) return;
        setBulkDeleting(true);
        setConfirmBulkDelete(false);
        const prodCount = selectedProducts.size;
        // Categories to delete: those in selectedCategories + those where all products are selected
        const autoDelete = categories.filter(cat => {
            const catProds = products.filter(p => p.categoryId === cat.id);
            return catProds.length > 0 && catProds.every(p => selectedProducts.has(p.id));
        });
        const allCatsToDelete = [...new Set([...selectedCategories, ...autoDelete.map(c => c.id)])];
        if (selectedProducts.size > 0) {
            await Promise.all([...selectedProducts].map(id => fetch(`/api/admin/products/${id}`, { method: 'DELETE' })));
        }
        if (allCatsToDelete.length > 0) {
            await Promise.all(allCatsToDelete.map(id => fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })));
        }
        setSelectedProducts(new Set());
        setSelectedCategories(new Set());
        setBulkDeleting(false);
        fetchData();
        const catCount = allCatsToDelete.length;
        const parts = [];
        if (prodCount > 0) parts.push(`${prodCount} ürün`);
        if (catCount > 0) parts.push(`${catCount} kategori`);
        setBulkDeleteToast(`✓ ${parts.join(' ve ')} silindi`);
        setTimeout(() => setBulkDeleteToast(""), 3000);
    };

    // AI Image generation
    const [showAiImageModal, setShowAiImageModal] = useState(false);
    const [showAiStep, setShowAiStep] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [aiImagePrompt, setAiImagePrompt] = useState("");
    const [aiImageLoading, setAiImageLoading] = useState(false);
    const [aiImageCooldown, setAiImageCooldown] = useState(false);
    const [aiImageResult, setAiImageResult] = useState("");
    const [aiImageError, setAiImageError] = useState("");
    const [aiImageBg, setAiImageBg] = useState<File | null>(null);
    const [aiImageBgPreview, setAiImageBgPreview] = useState("");
    const aiImageBgRef = useRef<HTMLInputElement>(null);
    const [aiImageProduct, setAiImageProduct] = useState<File | null>(null);
    const [aiImageProductPreview, setAiImageProductPreview] = useState("");
    const aiImageProductRef = useRef<HTMLInputElement>(null);

    // AI Menu Creator
    const [showAiMenuModal, setShowAiMenuModal] = useState(false);
    const [aiMenuTab, setAiMenuTab] = useState<"image" | "prompt">("prompt");
    const [aiMenuPrompt, setAiMenuPrompt] = useState("");
    const [aiMenuFiles, setAiMenuFiles] = useState<File[]>([]);
    const [aiMenuFilePreviews, setAiMenuFilePreviews] = useState<string[]>([]);
    const [aiMenuLoading, setAiMenuLoading] = useState(false);
    const [aiMenuError, setAiMenuError] = useState("");
    const [aiMenuResult, setAiMenuResult] = useState<{ categories: Array<{ name: string; products: Array<{ name: string; description: string; price: number }> }> } | null>(null);
    const [aiMenuImporting, setAiMenuImporting] = useState(false);
    const [aiMenuImportDone, setAiMenuImportDone] = useState(false);
    const aiMenuFileRef = useRef<HTMLInputElement>(null);
    // Wizard
    const [aiMenuStep, setAiMenuStep] = useState<1 | 2 | 3 | 4>(1);
    const [aiMenuAddImages, setAiMenuAddImages] = useState(false);
    const [aiMenuImageStyle, setAiMenuImageStyle] = useState("");
    const [aiMenuImageResults, setAiMenuImageResults] = useState<Record<string, string>>({});
    const [aiMenuImageProgress, setAiMenuImageProgress] = useState({ current: 0, total: 0 });
    const [aiMenuGeneratingImages, setAiMenuGeneratingImages] = useState(false);
    const aiMenuAbortRef = useRef(false);
    // Image mode: A = AI üretsin, B = kullanici gorsel verecek
    const [aiMenuImageMode, setAiMenuImageMode] = useState<'A'|'B'>('A');
    const [aiMenuUserImages, setAiMenuUserImages] = useState<Record<number, File>>({}); // index → File map
    const [aiMenuUserBg, setAiMenuUserBg] = useState<File | null>(null);  // shared background
    const aiMenuUserBgRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    // AI field refinement
    const [aiFieldLoading, setAiFieldLoading] = useState<{ ci: number; pi: number; field: string } | null>(null);
    const [bulkRefineLoading, setBulkRefineLoading] = useState<'name'|'description'|'price'|null>(null);
    const [bulkRefineProgress, setBulkRefineProgress] = useState({ current: 0, total: 0 });
    const [editingField, setEditingField] = useState<{ ci: number; pi: number; field: 'name'|'description'|'price' } | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const commitEdit = () => {
        if (!editingField || !aiMenuResult) { setEditingField(null); return; }
        const { ci, pi, field } = editingField;
        setAiMenuResult(prev => {
            if (!prev) return prev;
            const next = JSON.parse(JSON.stringify(prev));
            next.categories[ci].products[pi][field] = field === 'price' ? (parseFloat(editingValue) || next.categories[ci].products[pi][field]) : editingValue;
            return next;
        });
        setEditingField(null);
    };
    const removeProduct = (ci: number, pi: number) => {
        setAiMenuResult(prev => {
            if (!prev) return prev;
            const next = JSON.parse(JSON.stringify(prev));
            next.categories[ci].products.splice(pi, 1);
            // Remove empty categories
            next.categories = next.categories.filter((c: any) => c.products.length > 0);
            return next;
        });
    };
    const aiMenuReset = () => { setAiMenuStep(1); setAiMenuResult(null); setAiMenuError(""); setAiMenuImportDone(false); setAiMenuFiles([]); setAiMenuFilePreviews([]); setAiMenuImageResults({}); setAiMenuImageProgress({ current: 0, total: 0 }); setAiMenuGeneratingImages(false); setAiMenuImageMode('A'); setAiMenuUserImages({}); setAiMenuUserBg(null); setAiFieldLoading(null); setEditingField(null); };

    const refineField = async (ci: number, pi: number, field: 'name' | 'description' | 'price') => {
        if (!aiMenuResult) return;
        const prod = aiMenuResult.categories[ci].products[pi];
        const cat = aiMenuResult.categories[ci].name;
        setAiFieldLoading({ ci, pi, field });
        try {
            const res = await fetch('/api/ai/refine-field', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field, productName: prod.name, currentValue: (prod as any)[field], categoryName: cat }),
            });
            const data = await res.json();
            if (data.success && data.value !== null && data.value !== undefined) {
                setAiMenuResult(prev => {
                    if (!prev) return prev;
                    const next = JSON.parse(JSON.stringify(prev));
                    next.categories[ci].products[pi][field] = data.value;
                    return next;
                });
            }
        } catch { /* silent */ } finally {
            setAiFieldLoading(null);
        }
    };

    const bulkRefineField = async (field: 'name' | 'description' | 'price') => {
        if (!aiMenuResult || bulkRefineLoading) return;
        const allProds = aiMenuResult.categories.flatMap((c, ci) =>
            c.products.map((p, pi) => ({ ci, pi, p, cat: c.name }))
        );
        const total = allProds.length;
        setBulkRefineLoading(field);
        setBulkRefineProgress({ current: 0, total });
        for (let idx = 0; idx < total; idx++) {
            const { ci, pi, p, cat } = allProds[idx];
            try {
                const res = await fetch('/api/ai/refine-field', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ field, productName: p.name, currentValue: (p as any)[field], categoryName: cat }),
                });
                const data = await res.json();
                if (data.success && data.value !== null && data.value !== undefined) {
                    setAiMenuResult(prev => {
                        if (!prev) return prev;
                        const next = JSON.parse(JSON.stringify(prev));
                        next.categories[ci].products[pi][field] = data.value;
                        return next;
                    });
                }
            } catch { /* silent */ }
            setBulkRefineProgress({ current: idx + 1, total });
            if (idx < total - 1) await new Promise(r => setTimeout(r, 300));
        }
        setBulkRefineLoading(null);
    };

    // Body scroll lock — prevent background scroll when any modal is open
    useEffect(() => {
        const anyOpen = showModal || showCatModal || showAiMenuModal || showAiImageModal || !!lightboxSrc;
        document.body.style.overflow = anyOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [showModal, showCatModal, showAiMenuModal, showAiImageModal, lightboxSrc]);

    // Compress image to base64 using canvas (max 1024px, JPEG 80%)
    const compressImageToBase64 = (file: File, maxSize = 1024, quality = 0.8): Promise<{ base64: string; mime: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxSize || height > maxSize) {
                        if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
                        else { width = Math.round(width * maxSize / height); height = maxSize; }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve({ base64: dataUrl.replace(/^data:image\/\w+;base64,/, ''), mime: 'image/jpeg' });
                };
                img.onerror = reject;
                img.src = ev.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleAiImageGenerate = async () => {
        if ((!aiImagePrompt.trim() && !aiImageBg) || aiImageLoading || aiImageCooldown || !restaurantId) return;
        setAiImageLoading(true);
        setAiImageError("");
        setAiImageResult("");
        try {
            // Compress and convert background to base64
            let backgroundImageBase64: string | undefined;
            let backgroundImageMimeType: string | undefined;
            if (aiImageBg) {
                const compressed = await compressImageToBase64(aiImageBg);
                backgroundImageBase64 = compressed.base64;
                backgroundImageMimeType = compressed.mime;
            }

            // Compress and convert product image to base64
            let productImageBase64: string | undefined;
            let productImageMimeType: string | undefined;
            if (aiImageProduct) {
                const compressed = await compressImageToBase64(aiImageProduct);
                productImageBase64 = compressed.base64;
                productImageMimeType = compressed.mime;
            }

            let endpoint = "/api/ai/generate-image";
            let body: Record<string, unknown>;

            if (productImageBase64 && backgroundImageBase64) {
                // Both product + background → composite-image API
                endpoint = "/api/ai/composite-image";
                body = {
                    restaurantId,
                    productImageBase64,
                    productImageMimeType,
                    backgroundImageBase64,
                    backgroundImageMimeType,
                    style: aiImagePrompt,
                };
            } else {
                // Generate-image API (standard path)
                body = {
                    restaurantId,
                    productName: form.name,
                    productDescription: form.description,
                    prompt: aiImagePrompt || "professional food photography, studio lighting",
                    ...(backgroundImageBase64 ? { backgroundImageBase64, backgroundImageMimeType } : {}),
                };
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
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
            // 8s cooldown to prevent rapid re-requests
            setAiImageCooldown(true);
            setTimeout(() => setAiImageCooldown(false), 8000);
        }
    };

    const applyAiImage = () => {
        if (!aiImageResult) return;
        setForm(prev => ({ ...prev, image: aiImageResult }));
        setShowAiImageModal(false);
        setAiImageResult("");
        setAiImagePrompt("");
        setAiImageBg(null);
        setAiImageBgPreview("");
    };

    // AI Menu handlers
    const addAiMenuFiles = (newFiles: File[]) => {
        setAiMenuError("");
        setAiMenuResult(null);
        setAiMenuImportDone(false);
        setAiMenuFiles(prev => {
            const combined = [...prev, ...newFiles].slice(0, 5); // max 5 files
            // Generate previews for images
            combined.forEach((f, i) => {
                if (f.type.startsWith("image/") && !aiMenuFilePreviews[i]) {
                    const reader = new FileReader();
                    reader.onload = (e) => setAiMenuFilePreviews(p => { const n = [...p]; n[i] = e.target?.result as string; return n; });
                    reader.readAsDataURL(f);
                }
            });
            return combined;
        });
    };
    const removeAiMenuFile = (idx: number) => {
        setAiMenuFiles(prev => prev.filter((_, i) => i !== idx));
        setAiMenuFilePreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    const handleAiMenuGenerate = async () => {
        if (aiMenuLoading || !restaurantId) return;
        if (aiMenuTab === "prompt" && !aiMenuPrompt.trim()) return;
        if (aiMenuTab === "image" && aiMenuFiles.length === 0) return;

        setAiMenuLoading(true);
        setAiMenuError("");
        setAiMenuResult(null);
        setAiMenuImportDone(false);

        try {
            let res: Response;
            if (aiMenuTab === "image" && aiMenuFiles.length > 0) {
                const fd = new FormData();
                fd.append("restaurantId", restaurantId);
                aiMenuFiles.forEach(f => fd.append("files", f));
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
                setAiMenuStep(2); // → preview + image option
            } else {
                setAiMenuError(data.error || "Menü oluşturulamadı");
            }
        } catch {
            setAiMenuError("Bağlantı hatası");
        } finally {
            setAiMenuLoading(false);
        }
    };

    const generateImagesForMenu = async () => {
        if (!aiMenuResult || !restaurantId) return;
        aiMenuAbortRef.current = false;
        const allProds = aiMenuResult.categories.flatMap(c => c.products);
        const total = Math.min(allProds.length, 20);
        setAiMenuImageProgress({ current: 0, total });
        setAiMenuGeneratingImages(true);
        setAiMenuStep(3);
        const results: Record<string, string> = {};

        // --- Prepare background base64 once (shared) ---
        let bgBase64: string | undefined;
        let bgMime: string | undefined;
        if (aiMenuImageMode === 'B' && aiMenuUserBg) {
            const buf = await aiMenuUserBg.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let binary = "";
            bytes.forEach(b => binary += String.fromCharCode(b));
            bgBase64 = btoa(binary);
            bgMime = aiMenuUserBg.type || "image/jpeg";
        }

        for (let i = 0; i < total; i++) {
            if (aiMenuAbortRef.current) break;
            const prod = allProds[i];

            if (aiMenuImageMode === 'B') {
                // --- Mode B: user provided images (Record<index, File>) ---
                const userFile = aiMenuUserImages[i];
                if (!userFile) {
                    // No user image for this slot — skip
                    setAiMenuImageProgress(prev => ({ ...prev, current: i + 1 }));
                    continue;
                }

                if (!bgBase64) {
                    // No background → direct upload to R2 (no credit)
                    try {
                        const fd = new FormData();
                        fd.append("file", userFile);
                        fd.append("folder", "products");
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.success && data.url) results[String(i)] = data.url;
                    } catch { /* skip */ }
                } else {
                    // Background provided → composite-image API (multi-turn Gemini)
                    const buf = await userFile.arrayBuffer();
                    const bytes = new Uint8Array(buf);
                    let binary = "";
                    bytes.forEach(b => binary += String.fromCharCode(b));
                    const prodImgBase64 = btoa(binary);
                    let compositeSuccess = false;
                    for (let attempt = 0; attempt < 3; attempt++) {
                        try {
                            const res = await fetch('/api/ai/composite-image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    restaurantId,
                                    productImageBase64: prodImgBase64,
                                    productImageMimeType: userFile.type || "image/jpeg",
                                    backgroundImageBase64: bgBase64,
                                    backgroundImageMimeType: bgMime,
                                    style: aiMenuImageStyle || "",
                                }),
                            });
                            if (res.status === 429 || res.status >= 500) {
                                // Rate limited or server error — wait and retry
                                await delay(res.status === 429 ? 15000 : 8000);
                                continue;
                            }
                            const data = await res.json();
                            if (data.success && data.imageUrl) {
                                results[String(i)] = data.imageUrl;
                                compositeSuccess = true;
                            }
                            break;
                        } catch { if (attempt === 2) break; await delay(8000); }
                    }
                    // Always wait between composite calls — Gemini img2img is rate-limited
                    if (i < total - 1 && !aiMenuAbortRef.current) await delay(compositeSuccess ? 10000 : 5000);
                }
            } else {
                // --- Mode A: AI generates via Imagen 4 ---
                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        const res = await fetch('/api/ai/generate-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                restaurantId,
                                productName: prod.name,
                                productDescription: prod.description,
                                prompt: aiMenuImageStyle || "professional food photography, studio lighting, white background, top view",
                            }),
                        });
                        if (res.status === 429) { await delay(10000); continue; }
                        const data = await res.json();
                        if (data.success && data.imageUrl) results[String(i)] = data.imageUrl;
                        break;
                    } catch { if (attempt === 2) break; await delay(5000); }
                }
                if (i < total - 1 && !aiMenuAbortRef.current) await delay(4000);
            }

            setAiMenuImageProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setAiMenuImageResults(results);
        setAiMenuGeneratingImages(false);
        setAiMenuStep(4);
    };

    const handleAiMenuImport = async () => {
        if (!aiMenuResult || !restaurantId || aiMenuImporting) return;
        setAiMenuImporting(true);
        try {
            let globalIndex = 0;
            for (const cat of aiMenuResult.categories) {
                const catRes = await fetch(`/api/admin/categories?restaurantId=${restaurantId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: cat.name }),
                });
                const catData = await catRes.json();
                const catId = catData.id;
                if (!catId) { globalIndex += (cat.products || []).length; continue; }
                for (const p of (cat.products || [])) {
                    const imageUrl = aiMenuImageResults[String(globalIndex)] || null;
                    await fetch(`/api/admin/products?restaurantId=${restaurantId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: p.name,
                            description: p.description || null,
                            price: Number(p.price) || 0,
                            categoryId: catId,
                            image: imageUrl,
                            isActive: true,
                            isPopular: false,
                        }),
                    });
                    globalIndex++;
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
        if (catProds.length === 0) {
            // Empty category — toggle category selection
            setSelectedCategories(prev => { const n = new Set(prev); n.has(catId) ? n.delete(catId) : n.add(catId); return n; });
            return;
        }
        const allSelected = catProds.every(p => selectedProducts.has(p.id));
        setSelectedProducts(prev => { const n = new Set(prev); catProds.forEach(p => allSelected ? n.delete(p.id) : n.add(p.id)); return n; });
        // Also toggle category itself
        if (!allSelected) setSelectedCategories(prev => { const n = new Set(prev); n.add(catId); return n; });
        else setSelectedCategories(prev => { const n = new Set(prev); n.delete(catId); return n; });
    };
    const selectAllProducts = () => {
        setSelectedProducts(new Set(products.map(p => p.id)));
        // Also select all empty categories
        setSelectedCategories(new Set(categories.filter(c => productsByCategory(c.id).length === 0).map(c => c.id)));
    };
    const clearSelection = () => { setSelectedProducts(new Set()); setSelectedCategories(new Set()); setConfirmBulkDelete(false); };


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
        setForm({ name: "", description: "", price: "", discountPrice: "", image: "", video: "", prepTime: "", calories: "", ingredients: "", categoryId: catId, isPopular: false, isActive: true });
        setShowModal(true);
    };
    const openEditModal = (p: Product) => {
        setEditProduct(p);
        setForm({ name: p.name, description: p.description || "", price: String(p.price), discountPrice: p.discountPrice ? String(p.discountPrice) : "", image: p.image || "", video: p.video || "", prepTime: p.prepTime || "", calories: p.calories || "", ingredients: (p as any).ingredients ? (p as any).ingredients.join(', ') : "", categoryId: p.categoryId, isPopular: p.isPopular, isActive: p.isActive });
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

        // Size limit: 200MB max — iPhone 4K can be 500MB+
        const MAX_MB = 200;
        if (file.size > MAX_MB * 1024 * 1024) {
            alert(`Video dosyası çok büyük (${(file.size / 1024 / 1024).toFixed(0)}MB). Lütfen ${MAX_MB}MB'dan küçük bir video seçin.\n\nİpucu: iPhone'da çekerken HD (1080p) modu kullanın, 4K değil.`);
            return;
        }

        setVideoUploading(true); setVideoUploadProgress(5);
        try {
            setVideoStatus("FFmpeg yükleniyor...");
            const result = await compressVideo(file, (p) => { setVideoUploadProgress(Math.round(p * 0.5)); if (p > 0) setVideoStatus(`Sıkıştırılıyor... %${p}`); });

            const originalMB = (file.size / 1024 / 1024).toFixed(1);
            const compressedMB = (result.video.size / 1024 / 1024).toFixed(1);

            // Safety check: if compressed is not actually smaller, warn and abort
            if (result.video.size >= file.size) {
                alert(`Bu video sıkıştırılamadı (${originalMB}MB → ${compressedMB}MB).\n\nLütfen daha kısa veya daha düşük kalitede bir video deneyin. iPhone'da çekerken HD (1080p) kullanın, 4K değil.`);
                setVideoUploading(false); setVideoUploadProgress(0); setVideoStatus("");
                return;
            }

            setVideoStatus(`Sıkıştırıldı! (${originalMB}MB → ${compressedMB}MB)`);
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
        } catch (err) { console.error(err); alert("Video işleme başarısız! iPhone kullanıyorsanız videoyu önce kameranızdan bilgisayara aktarıp oradan yüklemeyi deneyin."); }
        finally { setTimeout(() => { setVideoUploading(false); setVideoUploadProgress(0); setVideoStatus(""); }, 1500); }
    };

    const removeImage = async () => { if (form.image) try { await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: form.image }) }); } catch { } setForm(prev => ({ ...prev, image: "" })); };
    const removeVideo = async () => { if (form.video) try { await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: form.video }) }); } catch { } setForm(prev => ({ ...prev, video: "" })); };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file); };
    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description || null,
                price: form.price,
                discountPrice: form.discountPrice || null,
                image: form.image || null,
                video: form.video || null,
                prepTime: form.prepTime || null,
                calories: form.calories || null,
                ingredients: form.ingredients ? form.ingredients.split(',').map(s => s.trim()).filter(Boolean) : [],
                categoryId: form.categoryId,
                isPopular: form.isPopular,
                isActive: form.isActive,
            };

            let res: Response;
            if (editProduct) {
                res = await fetch(`/api/admin/products/${editProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            } else {
                if (!restaurantId) { alert("Restoran bilgisi bulunamadı. Lütfen sayfayı yenileyin."); return; }
                res = await fetch(`/api/admin/products?restaurantId=${restaurantId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const msg = errData?.error || errData?.message || `Hata: ${res.status}`;
                console.error("Ürün kaydetme hatası:", msg, payload);
                alert(`Ürün kaydedilemedi: ${msg}`);
                return;
            }

            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error("handleSave exception:", err);
            alert("Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setSaving(false);
        }
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
                        {(selectedProducts.size > 0 || selectedCategories.size > 0) ? (
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
                                        <Trash2 size={14} /> {selectedProducts.size + selectedCategories.size} Seçiliyi Sil
                                    </button>
                                </>
                            )
                        ) : (
                            <button onClick={selectAllProducts} className="h-9 px-3 rounded-xl text-[13px] bg-gray-800/60 text-gray-500 hover:text-gray-300 border border-white/[0.04] transition-all">Tümünü Seç</button>
                        )}
                        <button onClick={() => { setShowAiMenuModal(true); setAiMenuResult(null); setAiMenuError(""); setAiMenuImportDone(false); setAiMenuFiles([]); setAiMenuFilePreviews([]); }} className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium transition-all bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20">
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
                        {/* Search bar */}
                        <div className="relative mb-3">
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Ürün ara..."
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">✕</button>}
                        </div>

                        {/* Filtered flat list when searching */}
                        {searchQuery.trim() ? (() => {
                            const q = searchQuery.toLowerCase();
                            const matched = products.filter(p => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
                            if (matched.length === 0) return <div className="text-center py-12 text-gray-500 text-sm">🔍 &quot;{searchQuery}&quot; için sonuç bulunamadı</div>;
                            return (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                                    {matched.map(product => (
                                        <div key={product.id} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors ${!product.isActive ? "opacity-40" : ""}`}>
                                            {product.image ? <img src={normalizeUrl(product.image)} alt="" loading="lazy" decoding="async" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} /> : <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 text-xs text-gray-600">🍽️</div>}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white truncate">{product.name}</p>
                                                <p className="text-[11px] text-gray-500">{categories.find(c => c.id === product.categoryId)?.name} · ₺{Number(product.price).toFixed(0)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button onClick={() => openEditModal(product)} className="p-1.5 rounded hover:bg-gray-800"><Pencil size={14} className="text-gray-500" /></button>
                                                <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded hover:bg-red-500/10"><Trash2 size={14} className="text-red-400/60" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })() : (
                            <>
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
                                            checked={catProducts.length > 0 ? catProducts.every(p => selectedProducts.has(p.id)) : selectedCategories.has(cat.id)}
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
                                                    {product.image ? <img src={normalizeUrl(product.image)} alt="" loading="lazy" decoding="async" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} /> : <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 text-xs text-gray-600">🍽️</div>}
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
                        </>
                        )}
                    </div>
                )}
            </div>

            {/* Bulk Delete Loading Overlay */}
            {bulkDeleting && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-8 py-6 flex flex-col items-center gap-3">
                        <Loader2 size={32} className="text-red-400 animate-spin" />
                        <p className="text-white font-semibold">Siliniyor...</p>
                        <p className="text-gray-500 text-xs">Lütfen bekleyin</p>
                    </div>
                </div>
            )}

            {/* Bulk Delete Success Toast */}
            {bulkDeleteToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2 animate-pulse">
                    {bulkDeleteToast}
                </div>
            )}

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
                            {/* Step indicator */}
                            {aiMenuStep > 1 && (
                                <div className="flex items-center gap-1 mb-5">
                                    {[1,2,3,4].map(s => (
                                        <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= aiMenuStep ? 'bg-violet-500' : 'bg-gray-800'}`} />
                                    ))}
                                </div>
                            )}

                            {/* STEP 1: Input */}
                            {aiMenuStep === 1 && (<>
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

                            {/* Image Tab — Multi-file */}
                            {aiMenuTab === "image" && (
                                <div className="space-y-3">
                                    {/* File list */}
                                    {aiMenuFiles.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {aiMenuFiles.map((f, i) => (
                                                <div key={i} className="relative group">
                                                    {aiMenuFilePreviews[i] ? (
                                                        <img src={aiMenuFilePreviews[i]} alt="" className="w-full h-20 object-cover rounded-lg border border-gray-700" />
                                                    ) : (
                                                        <div className="w-full h-20 bg-gray-800 rounded-lg border border-gray-700 flex flex-col items-center justify-center gap-1">
                                                            <FileText size={20} className="text-violet-400" />
                                                            <p className="text-[9px] text-gray-400 px-1 truncate w-full text-center">{f.name}</p>
                                                        </div>
                                                    )}
                                                    <button onClick={() => removeAiMenuFile(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X size={10} className="text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                            {aiMenuFiles.length < 5 && (
                                                <button onClick={() => aiMenuFileRef.current?.click()} className="h-20 border-2 border-dashed border-gray-700 hover:border-violet-500/50 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors">
                                                    <Plus size={18} className="text-gray-600" />
                                                    <span className="text-[10px] text-gray-600">Ekle</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {/* Drop zone (shown when no files) */}
                                    {aiMenuFiles.length === 0 && (
                                        <div
                                            onClick={() => aiMenuFileRef.current?.click()}
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={e => { e.preventDefault(); addAiMenuFiles(Array.from(e.dataTransfer.files)); }}
                                            className="border-2 border-dashed border-gray-700 hover:border-violet-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload size={28} className="text-gray-600" />
                                                <p className="text-sm text-gray-400">Menü resmi veya PDF yükle</p>
                                                <p className="text-[11px] text-gray-600">Birden fazla dosya eklenebilir (max 5) — JPG, PNG, PDF</p>
                                            </div>
                                        </div>
                                    )}
                                    <input ref={aiMenuFileRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={e => { const files = Array.from(e.target.files || []); if (files.length) addAiMenuFiles(files); e.target.value = ""; }} />
                                    {aiMenuFiles.length > 0 && (
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Ek not (opsiyonel)</label>
                                            <input value={aiMenuPrompt} onChange={e => setAiMenuPrompt(e.target.value)} placeholder="Örn: Sadece ana yemekleri al, fiyatları koru" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500" />
                                        </div>
                                    )}
                                    <p className="text-[11px] text-gray-600">💳 5 kredi kullanılacak ({aiMenuFiles.length} dosya)</p>
                                </div>
                            )}

                            {aiMenuError && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{aiMenuError}</div>}

                                <button onClick={handleAiMenuGenerate} disabled={aiMenuLoading || (aiMenuTab === "prompt" ? !aiMenuPrompt.trim() : aiMenuFiles.length === 0)} className="w-full mt-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white' }}>
                                    {aiMenuLoading ? <><Loader2 size={16} className="animate-spin" />Menü Oluşturuluyor...</> : <><Wand2 size={16} />Menü Oluştur ({aiMenuTab === "image" ? "5" : "3"} Kredi)</>}
                                </button>
                            </>)}

                            {/* STEP 2: Preview + image option */}
                            {aiMenuStep === 2 && aiMenuResult && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-semibold text-white">✓ Menü Hazır</p>
                                            <span className="text-[11px] text-gray-500">{aiMenuResult.categories.reduce((a,c)=>a+c.products.length,0)} ürün / {aiMenuResult.categories.length} kategori</span>
                                        </div>
                                        {/* Bulk AI buttons */}
                                        <div className="flex gap-1.5 mb-2 flex-wrap">
                                            {(['description','name','price'] as const).map(field => {
                                                const labels = { name: 'İsim', description: 'Açıklama', price: 'Fiyat' };
                                                const isThis = bulkRefineLoading === field;
                                                const isAny = bulkRefineLoading !== null || aiFieldLoading !== null;
                                                return (
                                                    <button
                                                        key={field}
                                                        onClick={() => bulkRefineField(field)}
                                                        disabled={isAny}
                                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                                                            isThis
                                                            ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-violet-500/40 hover:text-violet-400 disabled:opacity-40'
                                                        }`}
                                                    >
                                                        {isThis
                                                            ? <><Loader2 size={10} className="animate-spin" /> Tüm {labels[field]} ({bulkRefineProgress.current}/{bulkRefineProgress.total})</>
                                                            : <><Sparkles size={10} /> Tüm {labels[field]}leri AI ile Yaz</>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                            {aiMenuResult.categories.map((cat,ci) => (
                                                <div key={ci} className="bg-gray-800 rounded-xl overflow-hidden">
                                                    {/* Category header with AI name button */}
                                                    <div className="px-3 py-2 flex items-center justify-between">
                                                        <p className="text-xs font-bold text-violet-300 flex-1 truncate">{cat.name}</p>
                                                    </div>
                                                    {cat.products.map((p,pi) => {
                                                        const isLoading = (f: string) => aiFieldLoading?.ci === ci && aiFieldLoading?.pi === pi && aiFieldLoading?.field === f;
                                                        return (
                                                            <div key={pi} className="flex items-start gap-2 px-3 py-2 border-t border-gray-700/50 group/row">
                                                                <div className="min-w-0 flex-1">
                                                                    {/* Name row */}
                                                                    <div className="flex items-center gap-1">
                                                                        {editingField?.ci===ci && editingField?.pi===pi && editingField?.field==='name'
                                                                            ? <input autoFocus value={editingValue} onChange={e=>setEditingValue(e.target.value)} onBlur={commitEdit} onKeyDown={e=>{if(e.key==='Enter')commitEdit();if(e.key==='Escape')setEditingField(null);}} className="flex-1 text-xs bg-gray-700 text-white px-1.5 py-0.5 rounded outline-none border border-violet-500" />
                                                                            : <p onClick={()=>{setEditingField({ci,pi,field:'name'});setEditingValue(p.name);}} className="text-xs text-white truncate flex-1 cursor-text hover:text-violet-300 transition-colors" title="Düzenlemek için tıkla">{p.name}</p>
                                                                        }
                                                                        <button onClick={()=>refineField(ci,pi,'name')} disabled={aiFieldLoading!==null} title="AI ile isim iyileştir" className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-violet-400 hover:text-violet-300 disabled:opacity-30">
                                                                            {isLoading('name')?<Loader2 size={10} className="animate-spin"/>:<Sparkles size={10}/>}
                                                                        </button>
                                                                    </div>
                                                                    {/* Description row */}
                                                                    <div className="flex items-center gap-1 mt-0.5">
                                                                        {editingField?.ci===ci && editingField?.pi===pi && editingField?.field==='description'
                                                                            ? <input autoFocus value={editingValue} onChange={e=>setEditingValue(e.target.value)} onBlur={commitEdit} onKeyDown={e=>{if(e.key==='Enter')commitEdit();if(e.key==='Escape')setEditingField(null);}} className="flex-1 text-[10px] bg-gray-700 text-white px-1.5 py-0.5 rounded outline-none border border-violet-500" />
                                                                            : <p onClick={()=>{setEditingField({ci,pi,field:'description'});setEditingValue(p.description||'');}} className="text-[10px] text-gray-500 truncate flex-1 cursor-text hover:text-gray-300 transition-colors" title="Düzenlemek için tıkla">{p.description||<span className="italic text-gray-700">açıklama yok — tıkla</span>}</p>
                                                                        }
                                                                        <button onClick={()=>refineField(ci,pi,'description')} disabled={aiFieldLoading!==null} title="AI ile açıklama iyileştir" className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-violet-400 hover:text-violet-300 disabled:opacity-30">
                                                                            {isLoading('description')?<Loader2 size={10} className="animate-spin"/>:<Sparkles size={10}/>}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                {/* Price + AI + Delete */}
                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                    {editingField?.ci===ci && editingField?.pi===pi && editingField?.field==='price'
                                                                        ? <input autoFocus type="number" value={editingValue} onChange={e=>setEditingValue(e.target.value)} onBlur={commitEdit} onKeyDown={e=>{if(e.key==='Enter')commitEdit();if(e.key==='Escape')setEditingField(null);}} className="w-14 text-xs bg-gray-700 text-emerald-400 font-semibold px-1.5 py-0.5 rounded outline-none border border-violet-500" />
                                                                        : <span onClick={()=>{setEditingField({ci,pi,field:'price'});setEditingValue(String(p.price));}} className="text-xs font-semibold text-emerald-400 cursor-text hover:text-emerald-300 transition-colors" title="Düzenlemek için tıkla">₺{p.price}</span>
                                                                    }
                                                                    <button onClick={()=>refineField(ci,pi,'price')} disabled={aiFieldLoading!==null} title="AI ile fiyat öner" className="w-4 h-4 rounded flex items-center justify-center text-violet-400 hover:text-violet-300 disabled:opacity-30">
                                                                        {isLoading('price')?<Loader2 size={10} className="animate-spin"/>:<Sparkles size={10}/>}
                                                                    </button>
                                                                    <button onClick={()=>removeProduct(ci,pi)} title="Ürünü sil" className="w-4 h-4 rounded flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover/row:opacity-100">
                                                                        <X size={10}/>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Image mode toggle */}
                                    <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 space-y-3">
                                        <p className="text-sm font-semibold text-white">Ürün Görseli</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setAiMenuImageMode('A')}
                                                className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all border ${
                                                    aiMenuImageMode === 'A'
                                                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                                                    : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600'
                                                }`}
                                            >
                                                <div className="text-base mb-0.5">🤖</div>
                                                AI Üretsin
                                                <div className="text-[10px] opacity-60 mt-0.5">Imagen 4 · 5 kredi/ürün</div>
                                            </button>
                                            <button
                                                onClick={() => setAiMenuImageMode('B')}
                                                className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all border ${
                                                    aiMenuImageMode === 'B'
                                                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                                                    : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600'
                                                }`}
                                            >
                                                <div className="text-base mb-0.5">📸</div>
                                                Ben Vereceğim
                                                <div className="text-[10px] opacity-60 mt-0.5">Kendi fotoğrafların</div>
                                            </button>
                                        </div>

                                        {aiMenuImageMode === 'A' && (
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400">Fotoğraf stili (opsiyonel)</label>
                                                <input value={aiMenuImageStyle} onChange={e => setAiMenuImageStyle(e.target.value)} placeholder="Örn: sıcak ışık, ahşap zemin, rustik" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500" />
                                                <div className="flex flex-wrap gap-1.5">
                                                    {["sıcak ışık, ahşap zemin","beyaz zemin, modern","üstten çekim, rustik","koyu zemin, fine dining"].map(s => (
                                                        <button key={s} onClick={() => setAiMenuImageStyle(s)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-[10px] transition-colors">{s}</button>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-gray-500">{Math.min(aiMenuResult.categories.reduce((a,c)=>a+c.products.length,0),20)} ürün × 5 kredi = <span className="text-violet-300 font-semibold">{Math.min(aiMenuResult.categories.reduce((a,c)=>a+c.products.length,0),20)*5} kredi</span></p>
                                            </div>
                                        )}

                                                {aiMenuImageMode === 'B' && (() => {
                                            const allProdsFlat = aiMenuResult.categories.flatMap(c => c.products);
                                            const uploadedCount = Object.keys(aiMenuUserImages).length;
                                            const totalSlots = Math.min(allProdsFlat.length, 20);
                                            return (
                                                <div className="space-y-2">
                                                    {/* Quick-fill: apply one image to ALL products */}
                                                    <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2">
                                                        <div className="flex-1">
                                                            <p className="text-xs font-semibold text-violet-300">Tek görsel → tüm ürünlere uygula</p>
                                                            <p className="text-[10px] text-gray-500">Bir görsel seç, {totalSlots} ürünün hepsine otomatik atanır</p>
                                                        </div>
                                                        <label htmlFor="quick-fill-all" className="cursor-pointer flex-shrink-0 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                                                            <Upload size={11} /> Seç ve Uygula
                                                        </label>
                                                        <input
                                                            id="quick-fill-all"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={e => {
                                                                const f = e.target.files?.[0];
                                                                if (!f) return;
                                                                const filled: Record<number, File> = {};
                                                                for (let i = 0; i < totalSlots; i++) filled[i] = f;
                                                                setAiMenuUserImages(filled);
                                                                e.target.value = "";
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-gray-500">{uploadedCount} / {totalSlots} ürüne görsel atandı</p>
                                                    {/* Per-product upload rows */}
                                                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                                        {allProdsFlat.slice(0, 20).map((prod, idx) => {
                                                            const file = aiMenuUserImages[idx];
                                                            const inputId = `prod-img-${idx}`;
                                                            return (
                                                                <div key={idx} className="flex items-center gap-2 bg-gray-800/60 rounded-xl px-3 py-2">
                                                                    {/* Thumbnail or placeholder */}
                                                                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700 bg-gray-800">
                                                                        {file
                                                                            ? <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                                            : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">?</div>
                                                                        }
                                                                    </div>
                                                                    {/* Product name */}
                                                                    <span className="flex-1 text-xs text-white truncate">{prod.name}</span>
                                                                    {/* Action */}
                                                                    {file ? (
                                                                        <button
                                                                            onClick={() => setAiMenuUserImages(prev => { const n = {...prev}; delete n[idx]; return n; })}
                                                                            className="text-[10px] text-red-400 hover:text-red-300 flex-shrink-0"
                                                                        >✕</button>
                                                                    ) : (
                                                                        <label htmlFor={inputId} className="text-[10px] text-violet-400 hover:text-violet-300 cursor-pointer flex-shrink-0 flex items-center gap-1">
                                                                            <Upload size={10} /> Yükle
                                                                        </label>
                                                                    )}
                                                                    <input
                                                                        id={inputId}
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={e => {
                                                                            const f = e.target.files?.[0];
                                                                            if (f) setAiMenuUserImages(prev => ({ ...prev, [idx]: f }));
                                                                            e.target.value = "";
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                        {allProdsFlat.length > 20 && (
                                                            <p className="text-[10px] text-amber-400 text-center py-1">⚠ Maksimum 20 ürün işlenir</p>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-500">{uploadedCount} / {Math.min(allProdsFlat.length,20)} görsel yüklendi</p>

                                                    {/* Shared background */}
                                                    <div className="border-t border-gray-700/50 pt-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <label className="text-xs text-gray-400">🌄 Arka Plan <span className="text-gray-600">(tüm ürünlere uygulanır)</span></label>
                                                            {aiMenuUserBg && <button onClick={() => setAiMenuUserBg(null)} className="text-[10px] text-red-400 hover:text-red-300">Kaldır</button>}
                                                        </div>
                                                        {aiMenuUserBg ? (
                                                            <div className="h-14 rounded-xl overflow-hidden border border-gray-700">
                                                                <img src={URL.createObjectURL(aiMenuUserBg)} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => aiMenuUserBgRef.current?.click()} className="w-full h-10 border border-dashed border-gray-700 rounded-xl flex items-center justify-center gap-2 text-xs text-gray-500 hover:border-violet-500/50 hover:text-gray-400 transition-colors">
                                                                <Upload size={12} /> Arka plan yükle
                                                            </button>
                                                        )}
                                                        <input ref={aiMenuUserBgRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                                            onChange={e => { const f = e.target.files?.[0]; if (f) setAiMenuUserBg(f); e.target.value = ""; }}
                                                        />
                                                        {aiMenuUserBg
                                                            ? <p className="text-[10px] text-violet-400 mt-1">✨ Gemini img2img · {uploadedCount} ürün × 5 kredi = {uploadedCount*5} kredi</p>
                                                            : uploadedCount > 0 && <p className="text-[10px] text-gray-500 mt-1">Arka plan yok → görseller direkt yüklenecek (kredi harcanmaz)</p>
                                                        }
                                                    </div>

                                                    {/* Instruction prompt — only relevant when bg is set */}
                                                    {aiMenuUserBg && (
                                                        <div>
                                                            <label className="text-xs text-gray-400 mb-1 block">💬 Talimat <span className="text-gray-600">(isteğe bağlı — boş bırakırsan otomatik talimat gider)</span></label>
                                                            <textarea
                                                                value={aiMenuImageStyle}
                                                                onChange={e => setAiMenuImageStyle(e.target.value)}
                                                                rows={2}
                                                                placeholder="Örn: Ürün görselindeki yemeği arka plan görselindeki yemek ile yer değiştir"
                                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none"
                                                            />
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {["Ürün görselindeki yemeği arka plan görselindeki yemek ile yer değiştir","Tabaktaki yemeği verdiğim ürünle değiştir, başka hiçbir şeyi değiştirme"].map(s => (
                                                                    <button key={s} onClick={() => setAiMenuImageStyle(s)} className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-500 hover:text-white rounded text-[10px] transition-colors">{s.length > 40 ? s.substring(0, 40) + '...' : s}</button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex gap-2">
                                        {(aiMenuImageMode === 'A' || (aiMenuImageMode === 'B' && Object.keys(aiMenuUserImages).length > 0)) ? (
                                            <button onClick={generateImagesForMenu} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
                                                <Sparkles size={15} />
                                                {aiMenuImageMode === 'A' ? 'Resimleri Üret ve Devam Et' : aiMenuUserBg ? 'Dönüştür ve Devam Et' : 'Görselleri Yükle ve Devam Et'}
                                            </button>
                                        ) : (
                                            <button onClick={handleAiMenuImport} disabled={aiMenuImporting} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                                                {aiMenuImporting ? <><Loader2 size={15} className="animate-spin" />Yayınlanıyor...</> : "✓ Hemen Yayınla"}
                                            </button>
                                        )}
                                        <button onClick={handleAiMenuImport} disabled={aiMenuImporting} className="px-4 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 flex items-center gap-1.5">
                                            {aiMenuImporting ? <Loader2 size={13} className="animate-spin" /> : "✓"} Resimsiz Yayınla
                                        </button>
                                        <button onClick={() => { setAiMenuStep(1); setAiMenuResult(null); setAiMenuError(""); }} className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">Geri</button>
                                    </div>
                                    {aiMenuImportDone && (
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                            <p className="text-emerald-400 font-semibold text-sm">✓ Menü yayınlandı!</p>
                                            <button onClick={() => setShowAiMenuModal(false)} className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium">Kapat</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: Image generation progress */}
                            {aiMenuStep === 3 && (
                                <div className="space-y-5 py-2">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-3">
                                            <Sparkles size={28} className="text-violet-400 animate-pulse" />
                                        </div>
                                        <p className="text-white font-bold text-base">Resimler Oluşturuluyor</p>
                                        <p className="text-gray-400 text-sm mt-1">{aiMenuImageProgress.current} / {aiMenuImageProgress.total} tamamlandı</p>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                                        <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${aiMenuImageProgress.total>0?(aiMenuImageProgress.current/aiMenuImageProgress.total)*100:0}%`, background: 'linear-gradient(90deg,#7c3aed,#a855f7)' }} />
                                    </div>
                                    {Object.keys(aiMenuImageResults).length > 0 && (
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {Object.entries(aiMenuImageResults).slice(-8).map(([k,url]) => {
                                                const allProds = aiMenuResult?.categories.flatMap(c=>c.products)||[];
                                                return <div key={k}><img src={url} alt="" className="w-full h-16 object-cover rounded-lg border border-violet-500/30" /><p className="text-[8px] text-gray-500 truncate mt-0.5">{allProds[parseInt(k)]?.name}</p></div>;
                                            })}
                                        </div>
                                    )}
                                    <p className="text-[11px] text-gray-500 text-center">Rate limit koruması: istekler arasında 4s bekleniyor</p>
                                    <button onClick={() => { aiMenuAbortRef.current = true; }} disabled={!aiMenuGeneratingImages} className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-sm transition-colors disabled:opacity-40">İptal Et (oluşturulanlar korunur)</button>
                                </div>
                            )}

                            {/* STEP 4: Summary + publish */}
                            {aiMenuStep === 4 && aiMenuResult && (
                                <div className="space-y-4">
                                    <div className="text-center py-2">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                            <Sparkles size={24} className="text-emerald-400" />
                                        </div>
                                        <p className="text-white font-bold">Hazır!</p>
                                        <p className="text-gray-400 text-sm mt-1">{aiMenuResult.categories.reduce((a,c)=>a+c.products.length,0)} ürün, {aiMenuResult.categories.length} kategori{Object.keys(aiMenuImageResults).length>0&&`, ${Object.keys(aiMenuImageResults).length} resim`} oluşturuldu</p>
                                    </div>
                                    {Object.keys(aiMenuImageResults).length > 0 && (
                                        <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-hidden">
                                            {Object.entries(aiMenuImageResults).map(([k,url]) => <img key={k} src={url} alt="" className="w-full h-16 object-cover rounded-lg border border-gray-700" />)}
                                        </div>
                                    )}
                                    {aiMenuImportDone ? (
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                                            <p className="text-emerald-400 font-semibold">✓ Menü yayınlandı!</p>
                                            <button onClick={() => setShowAiMenuModal(false)} className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium">Kapat</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={handleAiMenuImport} disabled={aiMenuImporting} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                                                {aiMenuImporting ? <><Loader2 size={15} className="animate-spin" />Yayınlanıyor...</> : "✓ Menüyü Yayınla"}
                                            </button>
                                            <button onClick={() => setAiMenuStep(2)} className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">Geri</button>
                                        </div>
                                    )}
                                    {aiMenuError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{aiMenuError}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* Product Modal — Right Drawer */}
            {showModal && (
                <div className="fixed inset-0 z-50" onClick={() => setShowModal(false)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40" style={{ backdropFilter: 'blur(2px)' }} />
                    {/* Drawer */}
                    <div
                        className="absolute top-0 right-0 bottom-0 w-[30%] min-w-[340px] bg-gray-900 border-l border-gray-800 flex flex-col overflow-hidden"
                        style={{ animation: 'slideInRight 0.25s ease-out' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
                            {showAiStep ? (
                                <button onClick={() => setShowAiStep(false)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                    <ChevronLeft size={18} /><span className="text-sm font-medium">Geri</span>
                                </button>
                            ) : (
                                <h2 className="text-base font-bold text-white">{editProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
                            )}
                            {showAiStep ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center"><Sparkles size={13} className="text-violet-400" /></div>
                                    <span className="text-sm font-bold text-white">AI Görsel Üret</span>
                                </div>
                            ) : (
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white"><X size={18} /></button>
                            )}
                        </div>
                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {showAiStep ? (
                        <div className="space-y-4">
                            {form.name && (
                                <div className="px-3 py-2 bg-gray-800/60 rounded-xl text-xs text-gray-400">
                                    🍽️ <span className="text-gray-300 font-medium">{form.name}</span>
                                    {form.description && <span className="text-gray-500"> — {form.description.substring(0, 60)}{form.description.length > 60 ? '...' : ''}</span>}
                                </div>
                            )}
                            {/* Ürün Görseli */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs text-gray-400">Ürün Görseli <span className="text-gray-600">(isteğe bağlı)</span></label>
                                    {aiImageProduct && <button onClick={() => { setAiImageProduct(null); setAiImageProductPreview(""); }} className="text-[11px] text-red-400 hover:text-red-300">Kaldır</button>}
                                </div>
                                {aiImageProductPreview ? (
                                    <div className="relative h-44 rounded-xl overflow-hidden border border-gray-700">
                                        <img src={aiImageProductPreview} alt="Ürün" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><span className="text-[11px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full">{aiImageProduct?.name}</span></div>
                                    </div>
                                ) : (
                                    <button onClick={() => aiImageProductRef.current?.click()} className="w-full h-28 border border-dashed border-gray-700 rounded-xl flex items-center justify-center gap-2 text-xs text-gray-500 hover:border-violet-500/50 hover:text-gray-400 transition-colors">
                                        <Upload size={14} /> Ürün fotoğrafı yükle
                                    </button>
                                )}
                                <input ref={aiImageProductRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; setAiImageProduct(f); const r = new FileReader(); r.onload = ev => setAiImageProductPreview(ev.target?.result as string); r.readAsDataURL(f); e.target.value = ""; }} />
                            </div>
                            {/* Arka Plan */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs text-gray-400">Arka Plan <span className="text-gray-600">(isteğe bağlı)</span></label>
                                    {aiImageBg && <button onClick={() => { setAiImageBg(null); setAiImageBgPreview(""); }} className="text-[11px] text-red-400 hover:text-red-300">Kaldır</button>}
                                </div>
                                {aiImageBgPreview ? (
                                    <div className="relative h-44 rounded-xl overflow-hidden border border-gray-700">
                                        <img src={aiImageBgPreview} alt="Arka plan" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><span className="text-[11px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full">{aiImageBg?.name}</span></div>
                                    </div>
                                ) : (
                                    <button onClick={() => aiImageBgRef.current?.click()} className="w-full h-28 border border-dashed border-gray-700 rounded-xl flex items-center justify-center gap-2 text-xs text-gray-500 hover:border-violet-500/50 hover:text-gray-400 transition-colors">
                                        <Upload size={14} /> Arka plan yükle
                                    </button>
                                )}
                                <input ref={aiImageBgRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; setAiImageBg(f); const r = new FileReader(); r.onload = ev => setAiImageBgPreview(ev.target?.result as string); r.readAsDataURL(f); e.target.value = ""; }} />
                                {aiImageProduct && aiImageBg && <p className="text-[10px] text-violet-400 mt-1">✨ Composite mod aktif</p>}
                            </div>
                            {/* Talimat */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1.5 block">Talimat <span className="text-gray-600">(boş bırakırsan otomatik)</span></label>
                                <textarea value={aiImagePrompt} onChange={e => setAiImagePrompt(e.target.value)} placeholder="Örn: Beyaz tabakta, modern sunum" rows={2} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none" />
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {["Profesyonel sunum", "Rustik ahşap masa", "Koyu lüks tema"].map(s => (
                                        <button key={s} onClick={() => setAiImagePrompt(s)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-[11px] transition-colors">{s}</button>
                                    ))}
                                </div>
                            </div>
                            {aiImageError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{aiImageError}</div>}
                            {aiImageResult ? (
                                <div>
                                    <img
                                        src={aiImageResult}
                                        alt="AI Generated"
                                        className="w-full h-56 object-cover rounded-xl border border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setLightboxSrc(aiImageResult)}
                                    />
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={applyAiImage} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">✓ Bu Görseli Kullan</button>
                                        <button onClick={() => { setAiImageResult(""); handleAiImageGenerate(); }} className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors">Yeniden Üret</button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAiImageGenerate}
                                    disabled={aiImageLoading || aiImageCooldown || (!aiImagePrompt.trim() && !aiImageBg)}
                                    className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white' }}
                                >
                                    {aiImageLoading ? (<><Loader2 size={16} className="animate-spin" />Üretiliyor...</>) : (<><Sparkles size={16} />Görsel Üret (5 Kredi)</>)}
                                </button>
                            )}
                        </div>
                        ) : (
                        <>
                            <div><label className="text-xs text-gray-400 mb-1 block">Ürün Adı *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div>
                            <div><label className="text-xs text-gray-400 mb-1 block">Açıklama</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 resize-none" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs text-gray-400 mb-1 block">Fiyat (₺) *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div>
                                <div><label className="text-xs text-gray-400 mb-1 block">İndirimli Fiyat</label><input type="number" value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500" /></div>
                            </div>
                            <div><label className="text-xs text-gray-400 mb-1 block">Kategori *</label><select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500">{categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>

                            {/* Medya — Tek Alan */}
                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Medya</label>
                                {/* Show existing media */}
                                {form.image && (
                                    <div className="relative group mb-2">
                                        <img
                                            src={normalizeUrl(form.image)}
                                            alt=""
                                            className="w-full h-48 object-cover rounded-xl border border-gray-700"
                                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                                        />
                                        <button onClick={removeImage} className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} className="text-white" /></button>
                                    </div>
                                )}
                                {form.video && (
                                    <div className="relative group mb-2">
                                        <video
                                            src={normalizeUrl(form.video)}
                                            className="w-full h-48 object-cover rounded-xl border border-gray-700"
                                            ref={(el) => { if (el) { el.setAttribute('muted', ''); el.setAttribute('playsinline', ''); el.muted = true; } }}
                                            autoPlay muted loop playsInline
                                        />
                                        <button onClick={removeVideo} className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500/90 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} className="text-white" /></button>
                                    </div>
                                )}
                                {/* Upload zone — only if no media */}
                                {!form.image && !form.video && (
                                    <div
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (!f) return; if (f.type.startsWith('video/')) handleVideoUpload(f); else handleFileUpload(f); }}
                                        onClick={() => mediaInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-700 hover:border-emerald-500/50 rounded-xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                                    >
                                        {uploading || videoUploading ? (
                                            <><div className="w-full px-4"><div className="w-full bg-gray-700 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${uploading ? uploadProgress : videoUploadProgress}%` }} /></div></div><p className="text-[10px] text-gray-500">{videoUploading ? (videoStatus || `%${videoUploadProgress}`) : `%${uploadProgress}`}</p></>
                                        ) : (
                                            <><Upload size={20} className="text-gray-600" /><p className="text-xs text-gray-500">Resim veya Video Yükle</p><p className="text-[10px] text-gray-600">Sürükle bırak veya tıkla</p></>
                                        )}
                                    </div>
                                )}
                                <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.type.startsWith('video/')) handleVideoUpload(f); else handleFileUpload(f); e.target.value = ""; }} />
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
                                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); e.target.value = ""; }} />
                                {/* AI Görsel Üret */}
                                <button type="button" onClick={() => { setAiImageResult(""); setAiImageError(""); setAiImagePrompt(""); setAiImageBg(null); setAiImageBgPreview(""); setAiImageProduct(null); setAiImageProductPreview(""); setShowAiStep(true); }} className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all">
                                    <Sparkles size={13} /> AI ile Görsel Üret (5 Kredi)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs text-gray-400 mb-1 block">Hazırlama Süresi</label><input value={form.prepTime} onChange={e => setForm({ ...form, prepTime: e.target.value })} placeholder="15-20 dk" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" /></div>
                                <div><label className="text-xs text-gray-400 mb-1 block">Kalori</label><input value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} placeholder="650 kcal" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500" /></div>
                            </div>

                            {/* İçindekiler */}
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">İçindekiler <span className="text-gray-600">(virgülle ayır)</span></label>
                                <textarea value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} rows={2} placeholder="Domates, soğan, zeytinyagı, kıyma..." className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none" />
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} className="accent-emerald-500" /><span className="text-sm text-gray-300">Popüler</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-emerald-500" /><span className="text-sm text-gray-300">Aktif</span></label>
                            </div>
                        </>
                        )}
                        </div>{/* end scrollable body */}
                        {/* Sticky footer — only in form mode */}
                        {!showAiStep && (
                        <div className="px-5 py-4 border-t border-gray-800 flex-shrink-0">
                            <button onClick={handleSave} disabled={saving || !form.name || !form.price || !form.categoryId} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">{saving ? 'Kaydediliyor...' : editProduct ? 'Güncelle' : 'Ekle'}</button>
                        </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxSrc && (
                <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxSrc(null)}>
                    <img src={lightboxSrc} alt="Önizleme" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
                    <button onClick={() => setLightboxSrc(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"><X size={20} /></button>
                </div>
            )}

            {/* AI Image Generation Modal — LEGACY (kept for body scroll lock compat) */}
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

                        {/* Ürün Görseli Yükleme */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs text-gray-400">Ürün Görseli <span className="text-gray-600">(isteğe bağlı)</span></label>
                                {aiImageProduct && (
                                    <button onClick={() => { setAiImageProduct(null); setAiImageProductPreview(""); }} className="text-[11px] text-red-400 hover:text-red-300 transition-colors">Kaldır</button>
                                )}
                            </div>
                            {aiImageProductPreview ? (
                                <div className="relative h-20 rounded-xl overflow-hidden border border-gray-700">
                                    <img src={aiImageProductPreview} alt="Ürün" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <span className="text-[11px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full">{aiImageProduct?.name}</span>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => aiImageProductRef.current?.click()} className="w-full h-16 border border-dashed border-gray-700 rounded-xl flex items-center justify-center gap-2 text-xs text-gray-500 hover:border-violet-500/50 hover:text-gray-400 transition-colors">
                                    <Upload size={14} /> Ürün fotoğrafı yükle (JPG, PNG)
                                </button>
                            )}
                            <input ref={aiImageProductRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setAiImageProduct(file);
                                const reader = new FileReader();
                                reader.onload = ev => setAiImageProductPreview(ev.target?.result as string);
                                reader.readAsDataURL(file);
                                e.target.value = "";
                            }} />
                            {aiImageProduct && aiImageBg && (
                                <p className="text-[10px] text-violet-400 mt-1">✨ Ürün görseli + arka plan → Composite mod aktif</p>
                            )}
                        </div>

                        {/* Arka Plan Yükleme */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs text-gray-400">Arka Plan <span className="text-gray-600">(isteğe bağlı)</span></label>
                                {aiImageBg && (
                                    <button onClick={() => { setAiImageBg(null); setAiImageBgPreview(""); }} className="text-[11px] text-red-400 hover:text-red-300 transition-colors">Kaldır</button>
                                )}
                            </div>
                            {aiImageBgPreview ? (
                                <div className="relative h-20 rounded-xl overflow-hidden border border-gray-700">
                                    <img src={aiImageBgPreview} alt="Arka plan" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <span className="text-[11px] text-white/70 bg-black/50 px-2 py-0.5 rounded-full">{aiImageBg?.name}</span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => aiImageBgRef.current?.click()}
                                    className="w-full h-16 border border-dashed border-gray-700 rounded-xl flex items-center justify-center gap-2 text-xs text-gray-500 hover:border-violet-500/50 hover:text-gray-400 transition-colors"
                                >
                                    <Upload size={14} />
                                    Arka plan görseli yükle (JPG, PNG)
                                </button>
                            )}
                            <input
                                ref={aiImageBgRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setAiImageBg(file);
                                    const reader = new FileReader();
                                    reader.onload = ev => setAiImageBgPreview(ev.target?.result as string);
                                    reader.readAsDataURL(file);
                                    e.target.value = "";
                                }}
                            />
                            {aiImageBg && (
                                <p className="text-[10px] text-violet-400 mt-1">✨ Gemini 2.0 ile arka plan üzerine görsel üretilecek</p>
                            )}
                        </div>

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
                                disabled={aiImageLoading || aiImageCooldown || (!aiImagePrompt.trim() && !aiImageBg)}
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
