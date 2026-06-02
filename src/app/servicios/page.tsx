import Link from "next/link";
import { Calendar, Video, MessageCircle, Heart } from "lucide-react";

export const metadata = { title: "Servicios" };

const SERVICIOS = [
  {
    icon: Heart,
    titulo: "Tarot - Tirada Personalizada",
    descripcion: "Sesion individual de tarot con tirada personalizada segun tu consulta.",
    modalidad: "Virtual o presencial",
    duracion: "60 min",
    precio: "$8.000 ARS",
  },
  {
    icon: Calendar,
    titulo: "Meditacion Guiada",
    descripcion: "Sesion de meditacion guiada adaptada a tus necesidades.",
    modalidad: "Virtual o presencial",
    duracion: "45 min",
    precio: "$6.000 ARS",
  },
  {
    icon: MessageCircle,
    titulo: "Coaching Personal",
    descripcion: "Sesion de coaching para clarificar objetivos y superar bloqueos.",
    modalidad: "Virtual",
    duracion: "60 min",
    precio: "$10.000 ARS",
  },
  {
    icon: Video,
    titulo: "Tirada de Tarot en Video",
    descripcion:
      "Tirada personalizada grabada en video con explicacion detallada. Recibis el video en 48hs.",
    modalidad: "Contenido a pedido",
    duracion: "15-20 min de video",
    precio: "$5.000 ARS",
  },
];

export default function ServiciosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Servicios</h1>
      <p className="text-gray-500 mb-8">
        Sesiones personalizadas y contenido a pedido.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICIOS.map((servicio) => (
          <div
            key={servicio.titulo}
            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <servicio.icon size={32} className="text-[var(--color-primary)] mb-4" />
            <h3 className="text-lg font-semibold mb-2">{servicio.titulo}</h3>
            <p className="text-sm text-gray-500 mb-4">{servicio.descripcion}</p>

            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
              <span className="bg-gray-50 px-2 py-1 rounded">{servicio.modalidad}</span>
              <span className="bg-gray-50 px-2 py-1 rounded">{servicio.duracion}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[var(--color-primary)]">
                {servicio.precio}
              </span>
              <Link
                href="/contacto"
                className="text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Consultar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
