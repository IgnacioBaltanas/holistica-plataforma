import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar } from "lucide-react";
import SesionActions from "@/components/admin/SesionActions";

export const metadata = { title: "Sesiones - Admin" };

const ESTADO_STYLE: Record<string, string> = {
  CONFIRMADA: "bg-blue-100 text-blue-700",
  COMPLETADA: "bg-green-100 text-green-700",
  CANCELADA: "bg-red-100 text-red-700",
  NO_ASISTIO: "bg-gray-100 text-gray-600",
};

export default async function SesionesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;

  const where: Record<string, unknown> = {};
  if (estado) where.estado = estado;

  const [sesiones, disponibilidad] = await Promise.all([
    prisma.sesionAgendada.findMany({
      where,
      include: {
        cliente: { select: { nombre: true, email: true } },
      },
      orderBy: { fecha: "asc" },
      take: 100,
    }),
    prisma.disponibilidad.findMany({ orderBy: { diaSemana: "asc" } }),
  ]);

  const DIAS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sesiones</h1>
        <div className="flex gap-2">
          <a href="/admin/sesiones" className={`px-3 py-1.5 rounded-lg text-sm ${!estado ? "bg-[var(--color-primary)] text-white" : "bg-white border border-gray-200"}`}>Todas</a>
          <a href="/admin/sesiones?estado=CONFIRMADA" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "CONFIRMADA" ? "bg-blue-500 text-white" : "bg-white border border-gray-200"}`}>Proximas</a>
          <a href="/admin/sesiones?estado=COMPLETADA" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "COMPLETADA" ? "bg-green-500 text-white" : "bg-white border border-gray-200"}`}>Completadas</a>
        </div>
      </div>

      {/* Availability schedule */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Disponibilidad semanal</h2>
          <Link
            href="/admin/sesiones/disponibilidad"
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            Configurar
          </Link>
        </div>
        {disponibilidad.length === 0 ? (
          <p className="text-sm text-gray-400">
            No hay horarios configurados.{" "}
            <Link href="/admin/sesiones/disponibilidad" className="text-[var(--color-primary)] hover:underline">
              Configura tu disponibilidad
            </Link>{" "}
            para que los clientes puedan agendar.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {disponibilidad.map((d) => (
              <span key={d.id} className="bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-lg">
                {DIAS[d.diaSemana]} {d.horaInicio} - {d.horaFin}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sessions list */}
      {sesiones.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-16">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm">No hay sesiones {estado ? `con estado ${estado}` : ""}.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Horario</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Servicio</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Modalidad</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sesiones.map((sesion) => {
                  const estadoStyle = ESTADO_STYLE[sesion.estado] || "bg-gray-100";
                  const fechaStr = new Date(sesion.fecha).toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  });

                  return (
                    <tr key={sesion.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{fechaStr}</td>
                      <td className="px-4 py-3">{sesion.horaInicio} - {sesion.horaFin}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{sesion.cliente.nombre}</p>
                        <p className="text-xs text-gray-400">{sesion.cliente.email}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{sesion.tipoServicio}</td>
                      <td className="px-4 py-3 capitalize">{sesion.modalidad}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${estadoStyle}`}>
                          {sesion.estado.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <SesionActions
                          sesionId={sesion.id}
                          estado={sesion.estado}
                          meetLink={sesion.meetLink}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
