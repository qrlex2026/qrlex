"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Clock, Users, Phone, ChevronLeft, ChevronRight, Check, X, Trash2, Loader2 } from "lucide-react";

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

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const dayNames = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

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
        fetchReservations();
    };

    const deleteReservation = async (id: string) => {
        if (!confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/reservations?id=${id}`, { method: 'DELETE' });
        fetchReservations();
    };

    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
    const today = new Date();

    // Count reservations per day
    const reservationsByDay: Record<number, number> = {};
    reservations.forEach((r) => {
        const d = new Date(r.date);
        if (d.getMonth() === calendarMonth && d.getFullYear() === calendarYear) {
            const day = d.getDate();
            reservationsByDay[day] = (reservationsByDay[day] || 0) + 1;
        }
    });

    // Filter reservations for selected day
    const selectedDayReservations = selectedDay
        ? reservations.filter((r) => {
            const d = new Date(r.date);
            return d.getDate() === selectedDay && d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
        })
        : [];

    const statusColors: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    const statusLabels: Record<string, string> = {
        pending: 'Bekliyor',
        confirmed: 'Onaylı',
        cancelled: 'İptal',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Rezervasyonlar</h1>
                <p className="text-sm text-gray-500 mt-1">Gelen rezervasyonları takvim üzerinden yönetin</p>
            </div>

            {/* Calendar Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => {
                        if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
                        else setCalendarMonth(calendarMonth - 1);
                        setSelectedDay(null);
                    }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">{monthNames[calendarMonth]} {calendarYear}</h2>
                    <button onClick={() => {
                        if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
                        else setCalendarMonth(calendarMonth + 1);
                        setSelectedDay(null);
                    }} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map((d) => (
                        <div key={d} className="text-center text-xs text-gray-400 font-semibold py-1">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isToday = day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();
                        const isSelected = day === selectedDay;
                        const count = reservationsByDay[day] || 0;
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`relative w-full aspect-square rounded-xl text-sm font-medium flex flex-col items-center justify-center transition-all ${isSelected
                                    ? 'bg-gray-900 text-white shadow-lg'
                                    : isToday
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {day}
                                {count > 0 && (
                                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${isSelected ? 'bg-amber-400 text-gray-900' : 'bg-amber-500 text-white'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-gray-500">Bekleyen: <strong className="text-gray-900">{reservations.filter(r => r.status === 'pending').length}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-500">Onaylı: <strong className="text-gray-900">{reservations.filter(r => r.status === 'confirmed').length}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-gray-500">İptal: <strong className="text-gray-900">{reservations.filter(r => r.status === 'cancelled').length}</strong></span>
                    </div>
                </div>
            </div>

            {/* Reservations List for Selected Day */}
            {selectedDay && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        <CalendarDays size={18} className="inline mr-2 text-gray-400" />
                        {selectedDay} {monthNames[calendarMonth]} {calendarYear} — Rezervasyonlar
                    </h3>

                    {selectedDayReservations.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">Bu gün için rezervasyon bulunmuyor</p>
                    ) : (
                        <div className="space-y-3">
                            {selectedDayReservations.map((r) => (
                                <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{r.name}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><Clock size={14} /> {r.time}</span>
                                                <span className="flex items-center gap-1"><Users size={14} /> {r.guestCount} kişi</span>
                                                <span className="flex items-center gap-1"><Phone size={14} /> {r.phone}</span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[r.status] || ''}`}>
                                            {statusLabels[r.status] || r.status}
                                        </span>
                                    </div>
                                    {r.note && (
                                        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-2">💬 {r.note}</p>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        {r.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(r.id, 'confirmed')}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                                                >
                                                    <Check size={14} /> Onayla
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(r.id, 'cancelled')}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <X size={14} /> İptal
                                                </button>
                                            </>
                                        )}
                                        {r.status === 'cancelled' && (
                                            <button
                                                onClick={() => updateStatus(r.id, 'pending')}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                                            >
                                                Tekrar Beklet
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteReservation(r.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
                                        >
                                            <Trash2 size={14} /> Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
