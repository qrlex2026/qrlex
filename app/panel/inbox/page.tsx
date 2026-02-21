"use client";

import { useState, useEffect } from "react";
import { Bell, MessageSquarePlus, Clock, Check, X, Trash2, Loader2, Send, ChevronDown, AlertCircle, Settings, CreditCard, Lightbulb, Inbox as InboxIcon } from "lucide-react";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    linkUrl: string | null;
    createdAt: string;
}

interface SupportTicket {
    id: string;
    subject: string;
    message: string;
    status: string;
    category: string;
    reply: string | null;
    createdAt: string;
    updatedAt: string;
}

const NOTIF_ICONS: Record<string, string> = { review: '⭐', reservation: '📅', payment: '💳', system: '🔔' };
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    general: { label: 'Genel', icon: <InboxIcon size={14} />, color: 'text-blue-500' },
    technical: { label: 'Teknik Destek', icon: <Settings size={14} />, color: 'text-violet-500' },
    billing: { label: 'Ödeme', icon: <CreditCard size={14} />, color: 'text-amber-500' },
    feature: { label: 'Özellik Talebi', icon: <Lightbulb size={14} />, color: 'text-emerald-500' },
};
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    open: { label: 'Açık', bg: 'bg-amber-50', text: 'text-amber-700' },
    answered: { label: 'Cevaplandı', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    closed: { label: 'Kapalı', bg: 'bg-gray-100', text: 'text-gray-500' },
};

export default function InboxPage() {
    const [activeTab, setActiveTab] = useState<'notifications' | 'support'>('notifications');

    // Notifications state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifFilter, setNotifFilter] = useState<string>('all');
    const [notifLoading, setNotifLoading] = useState(true);

    // Support state
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [ticketLoading, setTicketLoading] = useState(true);
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [newCategory, setNewCategory] = useState('general');
    const [submitting, setSubmitting] = useState(false);
    const [ticketFilter, setTicketFilter] = useState<string>('all');

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?limit=100');
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (err) { console.error(err); }
        finally { setNotifLoading(false); }
    };

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/support');
            const data = await res.json();
            setTickets(data);
        } catch (err) { console.error(err); }
        finally { setTicketLoading(false); }
    };

    useEffect(() => { fetchNotifications(); fetchTickets(); }, []);

    const markRead = async (id: string) => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        fetchNotifications();
    };

    const markAllRead = async () => {
        await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAllRead: true }),
        });
        fetchNotifications();
    };

    const deleteNotification = async (id: string) => {
        await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
        fetchNotifications();
    };

    const submitTicket = async () => {
        if (!newSubject.trim() || !newMessage.trim()) return;
        setSubmitting(true);
        try {
            await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: newSubject, message: newMessage, category: newCategory }),
            });
            setNewSubject('');
            setNewMessage('');
            setNewCategory('general');
            setShowNewTicket(false);
            fetchTickets();
        } catch (err) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const deleteTicket = async (id: string) => {
        if (!confirm('Bu talebi silmek istediğinize emin misiniz?')) return;
        await fetch(`/api/support?id=${id}`, { method: 'DELETE' });
        fetchTickets();
    };

    // Filtered notifications
    const filteredNotifs = notifFilter === 'all'
        ? notifications
        : notifFilter === 'unread'
            ? notifications.filter(n => !n.isRead)
            : notifications.filter(n => n.type === notifFilter);

    const filteredTickets = ticketFilter === 'all'
        ? tickets
        : tickets.filter(t => t.status === ticketFilter);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gelen Kutusu</h1>
                    <p className="text-sm text-gray-500 mt-1">Bildirimleriniz ve destek talepleriniz</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'notifications' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Bell size={16} /> Bildirimler
                    {unreadCount > 0 && (
                        <span className="ml-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('support')}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'support' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <MessageSquarePlus size={16} /> Destek Talepleri
                    {tickets.filter(t => t.status === 'open').length > 0 && (
                        <span className="ml-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{tickets.filter(t => t.status === 'open').length}</span>
                    )}
                </button>
            </div>

            {/* ===================== NOTIFICATIONS TAB ===================== */}
            {activeTab === 'notifications' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            {[
                                { key: 'all', label: 'Tümü' },
                                { key: 'unread', label: `Okunmamış (${unreadCount})` },
                                { key: 'review', label: '⭐ Yorum' },
                                { key: 'reservation', label: '📅 Rezervasyon' },
                                { key: 'payment', label: '💳 Ödeme' },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setNotifFilter(f.key)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${notifFilter === f.key
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                                Tümünü Okundu Yap
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {notifLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-gray-400" size={24} />
                            </div>
                        ) : filteredNotifs.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell size={32} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-sm text-gray-400">Bildirim bulunmuyor</p>
                            </div>
                        ) : (
                            filteredNotifs.map((n, idx) => (
                                <div
                                    key={n.id}
                                    className={`flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer group ${!n.isRead ? 'bg-blue-50/40' : 'hover:bg-gray-50'} ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                                    onClick={() => { if (!n.isRead) markRead(n.id); }}
                                >
                                    <span className="text-xl mt-0.5">{NOTIF_ICONS[n.type] || '🔔'}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">{n.title}</span>
                                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            <Clock size={12} className="inline mr-1" />
                                            {new Date(n.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ===================== SUPPORT TAB ===================== */}
            {activeTab === 'support' && (
                <div className="space-y-4">
                    {/* New Ticket Button + Filters */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {[
                                { key: 'all', label: 'Tümü' },
                                { key: 'open', label: 'Açık' },
                                { key: 'answered', label: 'Cevaplı' },
                                { key: 'closed', label: 'Kapalı' },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setTicketFilter(f.key)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${ticketFilter === f.key
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowNewTicket(!showNewTicket)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            <MessageSquarePlus size={16} /> Yeni Talep
                        </button>
                    </div>

                    {/* New Ticket Form */}
                    {showNewTicket && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Yeni Destek Talebi</h3>

                            {/* Category Selection */}
                            <p className="text-xs text-gray-500 mb-2 font-medium">Kategori</p>
                            <div className="flex gap-2 mb-4">
                                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        onClick={() => setNewCategory(key)}
                                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${newCategory === key
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cfg.icon} {cfg.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Konu *</p>
                                    <input
                                        type="text"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        placeholder="Talebinizin konusu"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Mesaj *</p>
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Sorununuzu veya talebinizi detaylı açıklayın..."
                                        rows={4}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNewTicket(false)}
                                    className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    disabled={!newSubject.trim() || !newMessage.trim() || submitting}
                                    onClick={submitTicket}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${newSubject.trim() && newMessage.trim() && !submitting
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    {submitting ? 'Gönderiliyor...' : 'Gönder'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tickets List */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {ticketLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-gray-400" size={24} />
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquarePlus size={32} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-sm text-gray-400">Destek talebi bulunmuyor</p>
                                <p className="text-xs text-gray-400 mt-1">Soru veya sorununuz için yeni talep oluşturabilirsiniz</p>
                            </div>
                        ) : (
                            filteredTickets.map((t, idx) => {
                                const cat = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.general;
                                const st = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
                                return (
                                    <div key={t.id} className={`px-5 py-4 group hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={cat.color}>{cat.icon}</span>
                                                <h4 className="text-sm font-semibold text-gray-900">{t.subject}</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                                            </div>
                                            <button
                                                onClick={() => deleteTicket(t.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{t.message}</p>
                                        {t.reply && (
                                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-2">
                                                <p className="text-xs font-semibold text-emerald-700 mb-1">📩 Destek Yanıtı</p>
                                                <p className="text-sm text-emerald-800">{t.reply}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(t.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            <span className={`flex items-center gap-1 ${cat.color}`}>{cat.icon} {cat.label}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
