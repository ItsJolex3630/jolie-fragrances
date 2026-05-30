import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Jolie Fragrances | Consultora de Perfumes Premium",
    description:
      "Tu consultora de perfumes premium en Venezuela. Fragancias árabes de las mejores marcas.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${cormorant.variable} ${inter.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
