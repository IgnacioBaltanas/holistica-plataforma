import { prisma } from "@/lib/prisma";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import PublicarArchivoBtn from "@/components/admin/PublicarArchivoBtn";

export const metadata = { title: "Archivos para venta" };

export default async function ArchivosAdminPage() {
  const productos = await prisma.productoArchivo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Archivos para venta</h1>
        <Link
          href="/admin/archivos/nuevo"
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <Plus size={18} /> Publicar archivo
        </Link>
      </div>

      {productos.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-16">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm mb-4">No hay archivos publicados para venta.</p>
          <Link href="/admin/archivos/nuevo" className="text-[var(--color-primary)] hover:underline text-sm">
            Publicar el primer archivo
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Tipo</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Precio</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ventas</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.nombre}</td>
                    <td className="px-4 py-3 text-xs uppercase text-gray-500">{p.tipo}</td>
                    <td className="px-4 py-3">{p.precioArs ? `$${Number(p.precioArs).toLocaleString("es-AR")}` : "-"}</td>
                    <td className="px-4 py-3">{p.totalVentas}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${p.estado === "DISPONIBLE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PublicarArchivoBtn id={p.id} estado={p.estado} />
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
