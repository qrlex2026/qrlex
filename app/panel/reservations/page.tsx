"use client";

import { useState, useEffect, useMemo } from "react";
import { CalendarDays, Clock, Users, Phone, ChevronLeft, ChevronRight, Check, X, Trash2, Loader2, Search, Plus, Filter } from "lucide-react";

interface Reservation {
    id: string;
    name: string;
    phone: string;
    date: string;
    time: string;
    guestCount: number;
    note: string | null;
    status: string;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    pending: { label: 'Bekliyor', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    confirmed: { label: 'Onaylı', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    cancelled: { label: 'İptal', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500', border: 'border-red-200' },
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 10); // 10:00 - 22:00
const DAY_NAMES_SHORT = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];
const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDateShort(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

// Color palette for reservation cards
const CARD_COLORS = [
    { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-900' },
    { bg: 'bg-violet-50', border: 'border-l-violet-500', text: 'text-violet-900' },
    { bg: 'bg-emerald-50', border: 'border-l-emerald-500', text: 'text-emerald-900' },
    { bg: 'bg-amber-50', border: 'border-l-amber-500', text: 'text-amber-900' },
    { bg: 'bg-rose-50', border: 'border-l-rose-500', text: 'text-rose-900' },
    { bg: 'bg-cyan-50', border: 'border-l-cyan-500', text: 'text-cyan-900' },
    { bg: 'bg-orange-50', border: 'border-l-orange-500', text: 'text-orange-900' },
];

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    const fetchReservations = async () => {
        try {
            const res = await fetch('/api/reservations');
            const data = await res.json();
            setReservations(data);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReservations(); }, []);

    const updateStatus = async (id: string, status: string) => {
        await fetch('/api/reservations', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
        });
        setSelectedReservation(null);
        fetchReservations();
    };

    const deleteReservation = async (id: string) => {
        if (!confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/reservations?id=${id}`, { method: 'DELETE' });
        setSelectedReservation(null);
        fetchReservations();
    };

    // Generate week days
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [currentWeekStart]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Filter reservations for current week
    const weekReservations = useMemo(() => {
        return reservations.filter((r) => {
            const d = new Date(r.date);
            d.setHours(0, 0, 0, 0);
            const start = new Date(currentWeekStart);
            const end = new Date(currentWeekStart);
            end.setDate(end.getDate() + 7);
            return d >= start && d < end;
        });
    }, [reservations, currentWeekStart]);

    // Filter by tab
    const filteredReservations = useMemo(() => {
        let filtered = activeTab === 'all' ? weekReservations : weekReservations.filter(r => r.status === activeTab);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || r.phone.includes(q));
        }
        return filtered;
    }, [weekReservations, activeTab, searchQuery]);

    // Place reservation on calendar
    const getReservationsForCell = (day: Date, hour: number) => {
        return filteredReservations.filter((r) => {
            const d = new Date(r.date);
            const [h] = r.time.split(':').map(Number);
            return isSameDay(d, day) && h === hour;
        });
    };

    // Summary counts
    const counts = {
        all: weekReservations.length,
        pending: weekReservations.filter(r => r.status === 'pending').length,
        confirmed: weekReservations.filter(r => r.status === 'confirmed').length,
        cancelled: weekReservations.filter(r => r.status === 'cancelled').length,
    };

    // Top cards - next upcoming reservations
    const upcomingReservations = useMemo(() => {
        const now = new Date();
        return reservations
            .filter(r => r.status !== 'cancelled' && new Date(r.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 4);
    }, [reservations]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {MONTH_NAMES[today.getMonth()]} {String(today.getDate()).padStart(2, '0')}, {today.getFullYear()}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Bu hafta {weekReservations.length} rezervasyon, {counts.pending} onay bekliyor
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Today Button */}
                    <button
                        onClick={() => setCurrentWeekStart(getWeekStart(new Date()))}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Bugün
                    </button>

                    {/* Week Navigation */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                        <button
                            onClick={() => {
                                const prev = new Date(currentWeekStart);
                                prev.setDate(prev.getDate() - 7);
                                setCurrentWeekStart(prev);
                            }}
                            className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="px-3 text-sm font-medium text-gray-700 border-x border-gray-200">
                            {formatDateShort(currentWeekStart)} - {formatDateShort(weekEnd)} {MONTH_NAMES[weekEnd.getMonth()]}
                        </span>
                        <button
                            onClick={() => {
                                const next = new Date(currentWeekStart);
                                next.setDate(next.getDate() + 7);
                                setCurrentWeekStart(next);
                            }}
                            className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg w-40 outline-none focus:border-gray-400 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {([
                    { key: 'all' as const, label: 'Tümü' },
                    { key: 'pending' as const, label: `Bekleyen (${counts.pending})` },
                    { key: 'confirmed' as const, label: `Onaylı (${counts.confirmed})` },
                    { key: 'cancelled' as const, label: `İptal (${counts.cancelled})` },
                ]).map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Top Summary Cards */}
            {upcomingReservations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {upcomingReservations.map((r, idx) => {
                        const color = CARD_COLORS[idx % CARD_COLORS.length];
                        const d = new Date(r.date);
                        const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                        return (
                            <div
                                key={r.id}
                                onClick={() => setSelectedReservation(r)}
                                className={`${color.bg} rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-md transition-all group`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className={`font-semibold text-sm ${color.text}`}>{r.name}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} border ${sc.border}`}>{sc.label}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock size={12} />
                                    <span>{r.time}</span>
                                    <span>•</span>
                                    <span>{d.getDate()} {MONTH_NAMES[d.getMonth()]}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <Users size={12} />
                                    <span>{r.guestCount} kişi</span>
                                    <span>•</span>
                                    <Phone size={12} />
                                    <span>{r.phone}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Weekly Calendar Grid */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-gray-100">
                    <div className="py-3 px-2" /> {/* Time column spacer */}
                    {weekDays.map((day, i) => {
                        const isToday_ = isSameDay(day, new Date());
                        return (
                            <div key={i} className={`py-3 px-2 text-center border-l border-gray-100 ${isToday_ ? 'bg-emerald-50' : ''}`}>
                                <div className={`text-[11px] font-semibold tracking-wider ${isToday_ ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {formatDateShort(day)} {DAY_NAMES_SHORT[i]}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time grid */}
                <div className="max-h-[520px] overflow-y-auto">
                    {HOURS.map((hour) => (
                        <div key={hour} className="grid grid-cols-[70px_repeat(7,1fr)] min-h-[64px] border-b border-gray-50">
                            {/* Time label */}
                            <div className="py-2 px-3 text-right">
                                <span className="text-xs font-medium text-gray-400">{hour}:00</span>
                            </div>
                            {/* Day cells */}
                            {weekDays.map((day, dayIdx) => {
                                const cellReservations = getReservationsForCell(day, hour);
                                const isToday_ = isSameDay(day, new Date());
                                return (
                                    <div
                                        key={dayIdx}
                                        className={`border-l border-gray-100 py-1 px-1 min-h-[64px] ${isToday_ ? 'bg-emerald-50/30' : ''}`}
                                    >
                                        {cellReservations.map((r, rIdx) => {
                                            const color = CARD_COLORS[rIdx % CARD_COLORS.length];
                                            const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                                            return (
                                                <div
                                                    key={r.id}
                                                    onClick={() => setSelectedReservation(r)}
                                                    className={`${color.bg} border-l-[3px] ${color.border} rounded-md px-2 py-1.5 mb-1 cursor-pointer hover:shadow-sm transition-all text-[11px]`}
                                                >
                                                    <div className={`font-semibold ${color.text} truncate`}>{r.name}</div>
                                                    <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Clock size={10} /> {r.time}
                                                        <span className="mx-0.5">·</span>
                                                        <Users size={10} /> {r.guestCount}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Reservation Detail Modal */}
            {selectedReservation && (() => {
                const r = selectedReservation;
                const d = new Date(r.date);
                const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
                return (
                    <>
                        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedReservation(null)} />
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-[420px] max-w-[90vw] p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{r.name}</h3>
                                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${sc.bg} ${sc.text} border ${sc.border}`}>
                                        {sc.label}
                                    </span>
                                </div>
                                <button onClick={() => setSelectedReservation(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-3 mb-5">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <CalendarDays size={16} className="text-gray-400" />
                                    <span>{d.getDate()} {MONTH_NAMES[d.getMonth()]} {d.getFullYear()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>{r.time}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Users size={16} className="text-gray-400" />
                                    <span>{r.guestCount} kişi</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone size={16} className="text-gray-400" />
                                    <span>{r.phone}</span>
                                </div>
                                {r.note && (
                                    <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                                        💬 {r.note}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 border-t border-gray-100 pt-4">
                                {r.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => updateStatus(r.id, 'confirmed')}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                                        >
                                            <Check size={16} /> Onayla
                                        </button>
                                        <button
                                            onClick={() => updateStatus(r.id, 'cancelled')}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                        >
                                            <X size={16} /> İptal Et
                                        </button>
                                    </>
                                )}
                                {r.status === 'confirmed' && (
                                    <button
                                        onClick={() => updateStatus(r.id, 'cancelled')}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                    >
                                        <X size={16} /> İptal Et
                                    </button>
                                )}
                                {r.status === 'cancelled' && (
                                    <button
                                        onClick={() => updateStatus(r.id, 'pending')}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors"
                                    >
                                        Tekrar Beklet
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteReservation(r.id)}
                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                );
            })()}
        </div>
    );
}
