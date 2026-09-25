import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { NavbarServer } from "@/components/layout/NavbarServer";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LocalFix | Trusted Local Services Near You",
    template: "%s | LocalFix",
  },
  description:
    "Find trusted electricians, plumbers, AC technicians and local service providers in Villukuri, Thuckalay and Marthandam.",
  openGraph: {
    title: "LocalFix | Trusted Local Services Near You",
    description:
      "Find trusted electricians, plumbers, AC technicians and local service providers in Villukuri, Thuckalay and Marthandam.",
    url: siteUrl,
    siteName: "LocalFix",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <ToastProvider>
          <NavbarServer />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
