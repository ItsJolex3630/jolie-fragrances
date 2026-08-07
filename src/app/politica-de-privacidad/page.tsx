import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Jolie Fragrances",
  description: "Política de privacidad y protección de datos.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <main className="container mx-auto px-4 py-24 md:py-32 max-w-4xl min-h-screen">
      <h1 className="text-3xl md:text-5xl font-playfair font-bold text-[#d4af37] mb-8">
        Política de Privacidad
      </h1>
      
      <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-[#d4af37]">
        <p className="lead text-lg mb-8">
          En Jolie Fragrances respetamos tu privacidad y nos comprometemos a proteger los datos personales que compartes con nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          1. Información que recopilamos
        </h2>
        <p className="mb-4">
          Recopilamos información personal que nos proporcionas directamente, como tu nombre, dirección de correo electrónico, dirección de envío y detalles de pago, cuando realizas una compra, te registras en una cuenta o te comunicas con nosotros.
        </p>
        <p className="mb-4">
          Si te registras utilizando proveedores de terceros (como Google), recibimos tu información de perfil público (nombre, foto y correo).
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          2. Uso de la información
        </h2>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-300">
          <li>Procesar y gestionar tus pedidos y pagos.</li>
          <li>Comunicarnos contigo respecto a tus compras o para soporte técnico.</li>
          <li>Enviarte actualizaciones, promociones y noticias si has consentido recibirlas.</li>
          <li>Mejorar nuestra tienda, servicios y experiencia de usuario.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          3. Protección de tus datos
        </h2>
        <p className="mb-4">
          Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra el acceso no autorizado, la alteración, divulgación o destrucción. 
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          4. Derechos del usuario
        </h2>
        <p className="mb-4">
          Tienes el derecho de acceder, rectificar o solicitar la eliminación de tus datos personales en cualquier momento. Para ejercer estos derechos, por favor contáctanos en <strong>joelmedina2009@gmail.com</strong>.
        </p>
      </div>
    </main>
  );
}
