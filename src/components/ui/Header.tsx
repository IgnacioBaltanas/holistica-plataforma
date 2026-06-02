"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";

interface HeaderProps {
  session: {
    nombre: string;
    role: string;
  } | null;
}

const NAV_LINKS = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/servicios", label: "Servicios" },
  { href: "/eventos", label: "Eventos" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header({ session }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[var(--color-primary)]">
              Holistica
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-[var(--color-primary)] transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                {(session.role === "OPERADORA" || session.role === "ADMIN") && (
                  <Link
                    href="/admin"
                    className="text-sm text-[var(--color-primary)] font-medium hover:underline"
                  >
                    Panel Admin
                  </Link>
                )}
                <Link
                  href="/mi-cuenta"
                  className="flex items-center gap-2 text-gray-600 hover:text-[var(--color-primary)]"
                >
                  <User size={18} />
                  <span className="text-sm">{session.nombre}</span>
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Cerrar sesion"
                  >
                    <LogOut size={18} />
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-[var(--color-primary)] font-medium"
                >
                  Iniciar sesion
                </Link>
                <Link
                  href="/registro"
                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-medium"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2 pt-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2 py-2 text-gray-600 hover:text-[var(--color-primary)] font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" />
              {session ? (
                <>
                  <Link
                    href="/mi-cuenta"
                    className="px-2 py-2 text-gray-600 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mi cuenta
                  </Link>
                  {(session.role === "OPERADORA" || session.role === "ADMIN") && (
                    <Link
                      href="/admin"
                      className="px-2 py-2 text-[var(--color-primary)] font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      Panel Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-2 py-2 text-gray-600 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Iniciar sesion
                  </Link>
                  <Link
                    href="/registro"
                    className="px-2 py-2 text-[var(--color-primary)] font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
