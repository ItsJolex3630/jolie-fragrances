import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies | Jolie Fragrances",
  description: "Información sobre el uso de cookies en nuestra tienda.",
};

export default function PoliticaCookiesPage() {
  return (
    <main className="container mx-auto px-4 py-24 md:py-32 max-w-4xl min-h-screen">
      <h1 className="text-3xl md:text-5xl font-playfair font-bold text-[#d4af37] mb-8">
        Política de Cookies
      </h1>
      
      <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-[#d4af37]">
        <p className="lead text-lg mb-8">
          Esta Política de Cookies explica qué son las cookies, cómo las usamos en Jolie Fragrances, y cuáles son tus opciones al respecto.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          1. ¿Qué son las cookies?
        </h2>
        <p className="mb-4">
          Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo (ordenador, tablet, smartphone) cuando los visitas. Se utilizan ampliamente para que los sitios web funcionen de manera eficiente y para proporcionar información a los propietarios del sitio.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          2. ¿Cómo usamos las cookies?
        </h2>
        <p className="mb-4">
          Utilizamos cookies para los siguientes propósitos:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-300">
          <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio, como el acceso a áreas seguras o el funcionamiento del carrito de compras. No se pueden desactivar en nuestros sistemas.</li>
          <li><strong>Cookies de Rendimiento:</strong> Nos permiten contar las visitas y fuentes de tráfico para poder evaluar y mejorar el rendimiento de nuestro sitio.</li>
          <li><strong>Cookies de Preferencias:</strong> Permiten al sitio web recordar información que cambia la forma en que el sitio se comporta o se ve, como tu idioma preferido o la región en la que te encuentras (ej. moneda seleccionada).</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          3. Controlar las cookies
        </h2>
        <p className="mb-4">
          Puedes controlar y/o eliminar las cookies según desees. Puedes eliminar todas las cookies que ya están en tu ordenador y puedes configurar la mayoría de los navegadores para que no acepten cookies. Sin embargo, si haces esto, es posible que tengas que ajustar manualmente algunas preferencias cada vez que visites un sitio y que algunos servicios y funcionalidades no funcionen.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          4. Más Información
        </h2>
        <p className="mb-4">
          Para más información sobre el uso de cookies y cómo ejercer tus derechos de privacidad, por favor lee nuestra <Link href="/politica-de-privacidad" className="underline hover:text-white transition-colors">Política de Privacidad</Link>.
        </p>
      </div>
    </main>
  );
}
