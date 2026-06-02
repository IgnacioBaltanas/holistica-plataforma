import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";

export const metadata = { title: "Clientes" };

export default async function ClientesAdminPage() {
  const clientes = await prisma.usuario.findMany({
    where: { role: "CLIENTE" },
    include: {
      _count: { select: { pedidos: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <span className="text-sm text-gray-500">{clientes.length} registrados</span>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-16">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm">No hay clientes registrados.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Pais</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Canal</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Pedidos</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{c.email}</td>
                    <td className="px-4 py-3 text-gray-500">{c.pais || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs uppercase">{c.canalPreferido || "web"}</td>
                    <td className="px-4 py-3 font-medium">{c._count.pedidos}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {c.createdAt.toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
