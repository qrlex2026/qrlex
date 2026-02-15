import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-black">
      <h1 className="text-5xl font-extrabold mb-8 tracking-tight">QRlex</h1>
      <p className="text-xl text-gray-600 mb-12 text-center max-w-lg">
        Yeni nesil QR menü sistemi ile restoranınızı dijitalleştirin.
      </p>
      <div className="flex gap-4">
        <Link
          href="/menu/demo-restaurant"
          className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl"
        >
          Demo Menüyü İncele
        </Link>
        <Link
          href="/dashboard"
          className="px-8 py-4 bg-gray-100 text-gray-900 rounded-full font-medium hover:bg-gray-200 transition"
        >
          Yönetim Paneli
        </Link>
      </div>
    </div>
  );
}
