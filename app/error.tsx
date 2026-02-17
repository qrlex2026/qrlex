"use client";

import Link from "next/link";
import { QrCode, Home, RefreshCw } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-dvh bg-gray-950 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/20">
                    <QrCode size={36} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Bir Hata Oluştu</h1>
                <p className="text-gray-500 text-sm mb-8">
                    Sayfa yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/25"
                    >
                        <RefreshCw size={16} />
                        Tekrar Dene
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-all"
                    >
                        <Home size={16} />
                        Ana Sayfa
                    </Link>
                </div>
            </div>
        </div>
    );
}
