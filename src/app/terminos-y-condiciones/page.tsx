import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Jolie Fragrances",
  description: "Términos y condiciones de compra en Jolie Fragrances.",
};

export default function TerminosYCondicionesPage() {
  return (
    <main className="container mx-auto px-4 py-24 md:py-32 max-w-4xl min-h-screen">
      <h1 className="text-3xl md:text-5xl font-playfair font-bold text-[#d4af37] mb-8">
        Términos y Condiciones
      </h1>
      
      <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-[#d4af37]">
        <p className="lead text-lg mb-8">
          Las presentes condiciones regulan y son aplicables a todas las ventas realizadas desde la tienda online de Jolie Fragrances.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          1. Proceso de Compra
        </h2>
        <p className="mb-4">
          Para realizar una compra, el usuario debe añadir los productos deseados al carrito y seguir los pasos del proceso de pago. Al completar la compra, el usuario acepta de manera expresa los presentes Términos y Condiciones.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          2. Precios e Impuestos
        </h2>
        <p className="mb-4">
          Los precios indicados en pantalla están en la moneda estipulada y son los vigentes, salvo error tipográfico. Nos reservamos el derecho a modificar los precios en cualquier momento sin previo aviso.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          3. Envíos y Entregas
        </h2>
        <p className="mb-4">
          Realizamos envíos a todo el territorio nacional a través de la agencia de envíos de confianza elegida por el cliente (MRW, ZOOM, etc.). Los envíos se realizan bajo la modalidad de "cobro en destino", por lo que el cliente es responsable de pagar el importe del envío directamente a la agencia al retirar o recibir el paquete.
        </p>
        <p className="mb-4">
          Para efectuar el envío, el cliente debe proporcionar de antemano todos los datos requeridos por la agencia de preferencia. Desde Jolie Fragrances nos encargamos y garantizamos que el producto es embalado y entregado a la agencia en las mejores y más óptimas condiciones posibles. Cualquier problema, daño o irregularidad que ocurra durante el trayecto, y que no estuviera presente antes de nuestro monitoreo de estado previo al envío, será coordinado para efectuar el reclamo correspondiente directamente con la agencia de envíos seleccionada.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          4. Política de Devoluciones y Garantías
        </h2>
        <p className="mb-4">
          Debido a la naturaleza de nuestros productos (cosméticos de uso personal), <strong>no se aceptan devoluciones por inconformidad o arrepentimiento</strong>. Una vez que el producto es utilizado o su empaque es abierto, pierde por completo su valor de venta para nuestra empresa. Todos nuestros productos se entregan totalmente sellados de fábrica.
        </p>
        <p className="mb-4">
          <strong>Garantía por Defectos de Fábrica:</strong> La única excepción para reclamos es que el producto presente defectos comprobables de fabricación (por ejemplo: el atomizador no funciona, la botella está rota dentro de su empaque sellado). En estos casos excepcionales, el responsable de Jolie Fragrances se hará cargo de solucionar el problema directamente. El cliente deberá reportarlo inmediatamente el mismo día de la recepción al correo <strong>joelmedina2009@gmail.com</strong>, anexando evidencia fotográfica o en video del problema.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-800 pb-2">
          5. Legislación Aplicable
        </h2>
        <p className="mb-4">
          Las presentes condiciones se rigen por la legislación local aplicable. Cualquier controversia surgida de la interpretación o ejecución que pudieran surgir, las partes se someten a los juzgados y tribunales correspondientes al domicilio social de la tienda.
        </p>
      </div>
    </main>
  );
}
