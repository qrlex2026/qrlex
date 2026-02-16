"use client";

import { Star, ThumbsUp, Trash2, MessageCircle } from "lucide-react";

const REVIEWS = [
    { id: "r1", name: "Ahmet Y.", date: "2 gün önce", rating: 5, comment: "Truffle Mushroom burger gerçekten müthişti! Trüf sosunun yoğunluğu ve etin pişirme derecesi kusursuzdu.", helpful: 12 },
    { id: "r2", name: "Elif K.", date: "1 hafta önce", rating: 5, comment: "Ambiyans çok başarılı, personel çok ilgili. San Sebastian cheesecake hayatımda yediğim en iyisiydi!", helpful: 8 },
    { id: "r3", name: "Mehmet A.", date: "2 hafta önce", rating: 4, comment: "Yemekler lezzetli, fiyatlar biraz yüksek ama kalite göz önüne alındığında makul.", helpful: 5 },
    { id: "r4", name: "Zeynep D.", date: "3 hafta önce", rating: 5, comment: "Arkadaşlarla mükemmel bir akşam geçirdik. Ev yapımı limonata şiddetle tavsiye ederim!", helpful: 15 },
    { id: "r5", name: "Can B.", date: "1 ay önce", rating: 4, comment: "Burgerler çok iyi, özellikle BBQ Bacon. Servis biraz yavaştı ama yoğun saatlerdeydi.", helpful: 3 },
    { id: "r6", name: "Seda T.", date: "1 ay önce", rating: 3, comment: "Yemekler güzeldi fakat bekleme süresi uzundu. Mekan olarak çok şık.", helpful: 2 },
];

const average = 4.6;
const totalCount = 128;

export default function ReviewsPage() {
    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-white">Yorumlar</h1>
                <p className="text-sm text-gray-500">{totalCount} değerlendirme</p>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-amber-400">{average}</span>
                    </div>
                    <div>
                        <div className="flex gap-0.5 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={16}
                                    className={s <= Math.round(average) ? "text-amber-400 fill-amber-400" : "text-gray-700"}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">{totalCount} değerlendirme</p>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                        <MessageCircle size={24} className="text-violet-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">{REVIEWS.length}</p>
                        <p className="text-xs text-gray-500">Son yorumlar</p>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <ThumbsUp size={24} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">45</p>
                        <p className="text-xs text-gray-500">Faydalı bulma</p>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
                {REVIEWS.map((review) => (
                    <div key={review.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{review.name}</p>
                                    <p className="text-xs text-gray-500">{review.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            size={14}
                                            className={s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-700"}
                                        />
                                    ))}
                                </div>
                                <button className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed mb-3">{review.comment}</p>
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <ThumbsUp size={14} />
                            <span className="text-xs">{review.helpful} kişi faydalı buldu</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
