import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import AuthProvider from "@/components/AuthProvider";
import ProfileModal from "@/components/ProfileModal";
import { CurrencyProvider } from "@/hooks/useCurrency";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jolie Fragrances | Consultora de Perfumes Premium",
  description:
    "Tu consultora de perfumes premium en Venezuela. Fragancias árabes de las mejores marcas: Armaf, Al Haramain, Lattafa y más. Asesoría personalizada.",
  keywords: [
    "perfumes",
    "fragancias",
    "Armaf",
    "Al Haramain",
    "Lattafa",
    "French Avenue",
    "Afnan",
    "Venezuela",
    "perfumes árabes",
    "niche perfumes",
    "Davidoff",
  ],
  authors: [{ name: "Jolie Fragrances" }],
  icons: {
    icon: "/jolie-favicon.png",
    apple: "/jolie-favicon.png",
  },
  openGraph: {
    title: "Jolie Fragrances | Consultora de Perfumes Premium",
    description:
      "Tu consultora de perfumes premium en Venezuela. Fragancias árabes de las mejores marcas.",
    type: "website",
  },
};

import VisitorTracker from "@/components/VisitorTracker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <ProfileModal />
              <VisitorTracker />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
