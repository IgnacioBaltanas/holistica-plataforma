import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Holistica</h3>
            <p className="text-sm text-gray-400">
              Plataforma de contenido holistico y servicios de bienestar.
              Cursos, sesiones y eventos para tu crecimiento personal.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">Navegacion</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">
                  Catalogo
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="hover:text-white transition-colors">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="hover:text-white transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:soporte@holistica.com" className="hover:text-white transition-colors">
                  soporte@holistica.com
                </a>
              </li>
              <li>
                <a href="https://t.me/holistica_bot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Telegram
                </a>
              </li>
              <li>
                <a href="https://instagram.com/holistica" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Holistica. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
