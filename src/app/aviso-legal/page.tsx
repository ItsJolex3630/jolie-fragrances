import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal | Jolie Fragrances",
  description: "Información legal y datos de la empresa.",
};

export default function AvisoLegalPage() {
  return (
    <main className="container mx-auto px-4 py-24 md:py-32 max-w-4xl min-h-screen">
      <h1 className="text-3xl md:text-5xl font-playfair font-bold text-[#d4af37] mb-8">
        Aviso Legal
      </h1>
      
      <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-[#d4af37] prose-a:no-underline hover:prose-a:underline">
        <p className="lead text-lg mb-8">
          En cumplimiento con el deber de información recogido en las normativas vigentes sobre Servicios de la Sociedad de la Información y de Comercio Electrónico, se reflejan a continuación los siguientes datos:
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          1. Datos de la empresa
        </h2>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-300">
          <li><strong>Nombre Comercial:</strong> Jolie Fragrances</li>
          <li><strong>Responsable (Persona Física):</strong> Joel Medina</li>
          <li><strong>Documento de Identidad (C.I.):</strong> V-33482163</li>
          <li><strong>Ubicación:</strong> Guataparo, Valencia, Estado Carabobo, C.P. 2001, Venezuela (Tienda exclusivamente online).</li>
          <li><strong>Correo Electrónico de Contacto:</strong> joelmedina2009@gmail.com</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          2. Objeto
        </h2>
        <p className="mb-4">
          El prestador, responsable del sitio web, pone a disposición de los usuarios el presente documento con el que pretende dar cumplimiento a las obligaciones legales, así como informar a todos los usuarios del sitio web respecto a cuáles son las condiciones de uso del mismo.
        </p>
        <p className="mb-4">
          Toda persona que acceda a este sitio web asume el papel de usuario, comprometiéndose a la observancia y cumplimiento riguroso de las disposiciones aquí dispuestas, así como a cualquier otra disposición legal que fuera de aplicación.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          3. Responsabilidad
        </h2>
        <p className="mb-4">
          El prestador se exime de cualquier tipo de responsabilidad derivada de la información publicada en su sitio web, siempre que esta información haya sido manipulada o introducida por un tercero ajeno al mismo.
        </p>
      </div>
    </main>
  );
}
