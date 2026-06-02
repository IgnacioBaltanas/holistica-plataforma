import Link from "next/link";
import { BookOpen, Calendar, Sparkles, Video } from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Cursos Online",
    description:
      "Aprende a tu ritmo con cursos pregrabados de tarot, meditacion, terapia holistica y mindfulness.",
  },
  {
    icon: Calendar,
    title: "Sesiones Personalizadas",
    description:
      "Agenda sesiones virtuales o presenciales de tarot, meditacion, terapia holistica y coaching.",
  },
  {
    icon: Video,
    title: "Contenido a Pedido",
    description:
      "Solicita tiradas de tarot personalizadas grabadas en video con explicacion detallada.",
  },
  {
    icon: Sparkles,
    title: "Talleres y Eventos",
    description:
      "Participa de talleres presenciales y eventos especiales con cupo limitado.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Tu camino hacia el bienestar
          </h1>
          <p className="text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto mb-10">
            Descubri cursos, sesiones y eventos de tarot, meditacion, terapia
            holistica y mas. Todo en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogo"
              className="bg-white text-[var(--color-primary)] px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Ver catalogo
            </Link>
            <Link
              href="/servicios"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Conocer servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Que ofrecemos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <feature.icon
                size={40}
                className="text-[var(--color-primary)] mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Comenza tu transformacion hoy
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Registrate gratis y accede al catalogo completo de cursos, talleres
            y servicios.
          </p>
          <Link
            href="/registro"
            className="inline-block bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>
    </>
  );
}
