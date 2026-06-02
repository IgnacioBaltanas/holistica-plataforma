import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, CalendarDays, MapPin, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await prisma.evento.findUnique({ where: { id }, select: { nombre: true } });
  return { title: e ? `Evento: ${e.nombre}` : "Evento" };
}

export default async function EventoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      seccion: { select: { nombre: true } },
      entradas: {
        include: { cliente: { select: { nombre: true, email: true } } },
        orderBy: { fechaCompra: "desc" },
      },
    },
  });

  if (!evento) notFound();

  const totalEntradas = evento.entradas.filter((e) => e.estado !== "CANCELADA").length;
  const asistidos = evento.entradas.filter((e) => e.estado === "ASISTIDO").length;
  const noAsistidos = evento.entradas.filter((e) => e.estado === "VALIDA").length;
  const canceladas = evento.entradas.filter((e) => e.estado === "CANCELADA").length;

  return (
    <div>
      <Link href="/admin/eventos"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--color-primary)] mb-6">
        <ArrowLeft size={16} /> Eventos
      </Link>

      <h1 className="text-2xl font-bold mb-1">{evento.nombre}</h1>
      <p className="text-sm text-gray-400 mb-6">{evento.seccion.nombre}</p>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <CalendarDays size={20} className="mx-auto text-gray-400 mb-1" />
          <p className="text-sm font-medium">
            {new Date(evento.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "UTC" })}
          </p>
          <p className="text-xs text-gray-400">{evento.horaInicio}hs</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <Users size={20} className="mx-auto text-blue-500 mb-1" />
          <p className="text-sm font-medium">{totalEntradas}/{evento.cupoMaximo}</p>
          <p className="text-xs text-gray-400">Entradas</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <CheckCircle size={20} className="mx-auto text-green-500 mb-1" />
          <p className="text-sm font-medium">{asistidos}</p>
          <p className="text-xs text-gray-400">Asistieron</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center">
          <Clock size={20} className="mx-auto text-amber-500 mb-1" />
          <p className="text-sm font-medium">{noAsistidos}</p>
          <p className="text-xs text-gray-400">Sin asistir</p>
        </div>
      </div>

      {evento.lugar && (
        <p className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <MapPin size={16} /> {evento.lugar}
        </p>
      )}

      {/* Attendance list */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-sm">Lista de asistencia</h2>
        </div>
        {evento.entradas.length === 0 ? (
          <p className="text-gray-400 text-sm p-6 text-center">No hay entradas vendidas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b border-gray-50">
                <th className="px-4 py-2 font-medium text-gray-500">Nombre</th>
                <th className="px-4 py-2 font-medium text-gray-500">Email</th>
                <th className="px-4 py-2 font-medium text-gray-500">Estado</th>
                <th className="px-4 py-2 font-medium text-gray-500">Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {evento.entradas.map((entrada) => (
                <tr key={entrada.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{entrada.cliente.nombre}</td>
                  <td className="px-4 py-2 text-gray-500">{entrada.cliente.email}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
                      entrada.estado === "ASISTIDO" ? "bg-green-100 text-green-700"
                      : entrada.estado === "CANCELADA" ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-700"
                    }`}>
                      {entrada.estado === "ASISTIDO" && <CheckCircle size={10} />}
                      {entrada.estado === "CANCELADA" && <XCircle size={10} />}
                      {entrada.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400">
                    {entrada.fechaAsistencia
                      ? entrada.fechaAsistencia.toLocaleString("es-AR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {canceladas > 0 && (
        <p className="text-xs text-gray-400 mt-3">{canceladas} entrada(s) cancelada(s)</p>
      )}
    </div>
  );
}
