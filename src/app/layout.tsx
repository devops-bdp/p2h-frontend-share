import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://p2h-muara-pahu.vercel.app"
  ),
  applicationName: "P2H MP",
  title: {
    default: "P2H MP - Sistem Pelaksanaan Pemeriksaan Harian",
    template: "%s | P2H MP",
  },
  description:
    "Aplikasi Pelaksanaan Pemeriksaan Harian (P2H) armada kendaraan support dan alat berat PT Batara Dharma Persada Site Muara Pahu.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/logo-navbar-transparant1.png", type: "image/png" },
    ],
    shortcut: "/logo-navbar-transparant1.png",
    apple: [
      { url: "/logo-navbar-transparant1.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "P2H MP",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "P2H MP - Sistem Pemeriksaan Harian Fleet",
    description:
      "Portal P2H Fleet & Alat Berat PT Batara Dharma Persada Site Muara Pahu",
    images: [{ url: "/logo-navbar-transparant1.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="P2H MP" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo-navbar-transparant1.png" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
