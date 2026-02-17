import Link from "next/link";
import { QrCode, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-dvh bg-gray-950 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20">
                    <QrCode size={36} className="text-white" />
                </div>
                <h1 className="text-5xl font-bold text-white mb-3">404</h1>
                <h2 className="text-xl font-semibold text-gray-300 mb-2">Sayfa Bulunamadı</h2>
                <p className="text-gray-500 text-sm mb-8">
                    Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/25"
                >
                    <Home size={16} />
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
}
