"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem("cookie_consent");
    if (!hasConsented) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "true");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-[#1a1a1a] border border-gray-700 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto">
        <div className="flex-1 text-sm text-gray-300">
          <p>
            Utilizamos cookies propias y de terceros para mejorar tu experiencia en nuestra tienda, analizar nuestro tráfico y personalizar el contenido. 
            Al hacer clic en &quot;Aceptar&quot;, consientes el uso de TODAS las cookies. Puedes leer más sobre esto en nuestra{" "}
            <Link href="/politica-de-cookies" className="text-[#d4af37] hover:underline font-medium">
              Política de Cookies
            </Link>.
          </p>
        </div>
        <div className="flex gap-3 shrink-0 w-full md:w-auto">
          <Button 
            onClick={acceptCookies}
            className="w-full md:w-auto bg-[#d4af37] hover:bg-[#b08d2b] text-black font-semibold rounded-full px-8 py-2"
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
