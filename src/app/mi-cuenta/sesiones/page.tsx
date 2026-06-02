import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar } from "lucide-react";

export const metadata = { title: "Mis sesiones" };

export default async function MisSesionesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sesiones = await prisma.pedido.findMany({
    where: {
      clienteId: session.userId,
      tipo: "SESION",
      estadoPago: "CONFIRMADO",
    },
    include: {
      seccion: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-6">Mis sesiones</h1>

      {sesiones.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">No tenes sesiones agendadas.</p>
          <a href="/servicios" className="text-[var(--color-primary)] hover:underline text-sm">
            Ver servicios disponibles
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {sesiones.map((sesion) => (
            <div
              key={sesion.id}
              className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">{sesion.seccion?.nombre || "Sesion"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {sesion.createdAt.toLocaleDateString("es-AR")} &middot;{" "}
                  {sesion.estadoEntrega}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  sesion.estadoEntrega === "AGENDADO"
                    ? "bg-purple-100 text-purple-700"
                    : sesion.estadoEntrega === "ENTREGADO"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {sesion.estadoEntrega}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
