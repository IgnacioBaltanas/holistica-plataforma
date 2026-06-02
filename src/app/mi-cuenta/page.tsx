import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, ShoppingBag, Ticket, Calendar } from "lucide-react";

export const metadata = { title: "Mi cuenta" };

const MENU_ITEMS = [
  {
    href: "/mi-cuenta/cursos",
    icon: BookOpen,
    title: "Mis cursos",
    description: "Accede al contenido de los cursos que compraste.",
  },
  {
    href: "/mi-cuenta/pedidos",
    icon: ShoppingBag,
    title: "Mis pedidos",
    description: "Historial y estado de tus compras.",
  },
  {
    href: "/mi-cuenta/entradas",
    icon: Ticket,
    title: "Mis entradas",
    description: "Entradas QR para eventos presenciales.",
  },
  {
    href: "/mi-cuenta/sesiones",
    icon: Calendar,
    title: "Mis sesiones",
    description: "Sesiones agendadas y pasadas.",
  },
];

export default async function MiCuentaPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Hola, {session.nombre}</h1>
      <p className="text-gray-500 mb-8">Gestiona tu cuenta y accede a tu contenido.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow group"
          >
            <item.icon
              size={32}
              className="text-[var(--color-primary)] mb-3 group-hover:scale-110 transition-transform"
            />
            <h3 className="font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
