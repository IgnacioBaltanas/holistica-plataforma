import { ShoppingBag, Users, BookOpen, CalendarDays, DollarSign, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    ventasMes,
    pedidosPendientes,
    totalClientes,
    cursosPublicados,
    eventosActivos,
    ticketsAbiertos,
    pedidosRecientes,
  ] = await Promise.all([
    prisma.pedido.aggregate({
      where: { estadoPago: "CONFIRMADO", paidAt: { gte: startOfMonth } },
      _sum: { monto: true },
    }),
    prisma.pedido.count({ where: { estadoPago: "PENDIENTE" } }),
    prisma.usuario.count({ where: { role: "CLIENTE" } }),
    prisma.seccion.count({ where: { estado: "PUBLICADO" } }),
    prisma.evento.count({ where: { estado: { in: ["ABIERTO", "AGOTADO"] } } }),
    prisma.ticket.count({ where: { estado: { in: ["ABIERTO", "EN_REVISION"] } } }),
    prisma.pedido.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        cliente: { select: { nombre: true } },
        seccion: { select: { nombre: true } },
      },
    }),
  ]);

  const totalVentas = ventasMes._sum.monto ? Number(ventasMes._sum.monto) : 0;

  const stats = [
    { label: "Ventas del mes", value: `$${totalVentas.toLocaleString("es-AR")}`, icon: DollarSign, color: "text-green-600 bg-green-50", href: "/admin/pedidos" },
    { label: "Pagos pendientes", value: String(pedidosPendientes), icon: ShoppingBag, color: "text-amber-600 bg-amber-50", href: "/admin/pedidos?estado=PENDIENTE" },
    { label: "Clientes", value: String(totalClientes), icon: Users, color: "text-blue-600 bg-blue-50", href: "/admin/clientes" },
    { label: "Cursos publicados", value: String(cursosPublicados), icon: BookOpen, color: "text-purple-600 bg-purple-50", href: "/admin/secciones" },
    { label: "Eventos activos", value: String(eventosActivos), icon: CalendarDays, color: "text-rose-600 bg-rose-50", href: "/admin/eventos" },
    { label: "Tickets abiertos", value: String(ticketsAbiertos), icon: AlertCircle, color: "text-orange-600 bg-orange-50", href: "/admin/tickets" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Ultimos pedidos</h2>
        {pedidosRecientes.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay pedidos todavia.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {pedidosRecientes.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{p.cliente.nombre}</p>
                  <p className="text-xs text-gray-400">{p.seccion?.nombre || p.tipo}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    p.estadoPago === "CONFIRMADO" ? "bg-green-100 text-green-700"
                    : p.estadoPago === "PENDIENTE" ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                    {p.estadoPago}
                  </span>
                  {p.monto && (
                    <p className="text-sm font-bold mt-1">${Number(p.monto).toLocaleString("es-AR")}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
