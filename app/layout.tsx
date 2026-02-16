import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QRlex",
  description: "Modern QR Menu System",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${plusJakartaSans.variable} antialiased font-sans bg-gray-50 text-gray-900`}
      >
        {children}
        <div id="google_translate_element" style={{ display: 'none' }} />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'tr',
                autoDisplay: false
              }, 'google_translate_element');
            }`}
        </Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
