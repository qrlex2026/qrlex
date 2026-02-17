"use client";
import { useState, useEffect } from "react";
import { Star, Trash2, ThumbsUp } from "lucide-react";
import { useSession } from "@/lib/useSession";

interface Review { id: string; authorName: string; rating: number; comment: string | null; helpfulCount: number; createdAt: string; }

export default function PanelReviews() {
    const { restaurantId, loading: sessionLoading } = useSession();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!restaurantId) return;
        fetch(`/api/admin/reviews?restaurantId=${restaurantId}`)
            .then((r) => r.json())
            .then((data) => { setReviews(data); setLoading(false); });
    }, [restaurantId]);

    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0";
    const deleteReview = async (id: string) => {
        if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
        await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
        setReviews((prev) => prev.filter((r) => r.id !== id));
    };
    const renderStars = (rating: number) => (<div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => (<Star key={s} size={14} className={s <= rating ? "text-amber-400" : "text-gray-700"} fill={s <= rating ? "currentColor" : "none"} />))}</div>);

    if (sessionLoading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-white">Yorumlar</h1><p className="text-sm text-gray-400 mt-1">{reviews.length} yorum</p></div>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><Star size={18} className="text-amber-400" fill="currentColor" /><span className="text-2xl font-bold text-white">{avgRating}</span></div><p className="text-xs text-gray-500">Ortalama Puan</p></div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4"><div className="flex items-center gap-2 mb-1"><ThumbsUp size={18} className="text-emerald-400" /><span className="text-2xl font-bold text-white">{reviews.reduce((sum, r) => sum + r.helpfulCount, 0)}</span></div><p className="text-xs text-gray-500">Faydalı İşareti</p></div>
            </div>
            {loading ? (<div className="text-center py-20 text-gray-500">Yükleniyor...</div>) : (
                <div className="space-y-3">{reviews.map((review) => (
                    <div key={review.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold text-white">{review.authorName}</span>{renderStars(review.rating)}</div>
                                {review.comment && <p className="text-sm text-gray-400 mt-2">{review.comment}</p>}
                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-600"><span>{new Date(review.createdAt).toLocaleDateString("tr-TR")}</span><span className="flex items-center gap-1"><ThumbsUp size={12} /> {review.helpfulCount}</span></div>
                            </div>
                            <button onClick={() => deleteReview(review.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"><Trash2 size={16} className="text-red-400" /></button>
                        </div>
                    </div>
                ))}</div>
            )}
        </div>
    );
}
