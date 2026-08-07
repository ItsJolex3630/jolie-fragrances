import Link from "next/link";
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] border-t border-gray-800 text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-xl font-playfair font-bold text-white mb-4">Jolie Fragrances</h3>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">
              Tu consultora de perfumes premium. Autenticidad, elegancia y exclusividad en cada gota.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] transition-colors">
                <FaInstagram size={24} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] transition-colors">
                <FaTiktok size={24} />
              </a>
              <a href="https://wa.me/message/" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] transition-colors">
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Enlaces Útiles</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#d4af37] transition-colors">Inicio</Link>
              </li>
              <li>
                <Link href="/?category=arabes" className="hover:text-[#d4af37] transition-colors">Catálogo</Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-[#d4af37] transition-colors">Mi Cuenta</Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/aviso-legal" className="hover:text-[#d4af37] transition-colors">Aviso Legal</Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones" className="hover:text-[#d4af37] transition-colors">Términos y Condiciones</Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className="hover:text-[#d4af37] transition-colors">Política de Privacidad</Link>
              </li>
              <li>
                <Link href="/politica-de-cookies" className="hover:text-[#d4af37] transition-colors">Política de Cookies</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Jolie Fragrances. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
