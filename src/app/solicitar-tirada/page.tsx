"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const TIPOS_TIRADA = [
  { value: "tarot_general", label: "Tarot - Tirada general" },
  { value: "tarot_amor", label: "Tarot - Amor y relaciones" },
  { value: "tarot_trabajo", label: "Tarot - Trabajo y proyectos" },
  { value: "tarot_espiritual", label: "Tarot - Crecimiento espiritual" },
  { value: "tarot_personalizada", label: "Tarot - Consulta personalizada" },
];

export default function SolicitarTiradaPage() {
  const router = useRouter();
  const [tipoTirada, setTipoTirada] = useState("");
  const [consulta, setConsulta] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pedidos/tirada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoTirada, consulta, fechaNacimiento, notas }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          router.push("/login?redirect=/solicitar-tirada");
          return;
        }
        throw new Error(data.error || "Error enviando solicitud");
      }

      const data = await res.json();
      router.push(`/mi-cuenta/tiradas/${data.pedidoId}?nueva=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error enviando solicitud");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Solicitar tirada personalizada</h1>
      <p className="text-gray-500 mb-8">
        Completa el formulario con tu consulta y recibiras un video/audio personalizado
        con la tirada y su interpretacion.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-100 rounded-xl p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de tirada *
          </label>
          <select
            required
            value={tipoTirada}
            onChange={(e) => setTipoTirada(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            <option value="">Selecciona un tipo...</option>
            {TIPOS_TIRADA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tu consulta *
          </label>
          <textarea
            required
            rows={5}
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            placeholder="Describe tu situacion o pregunta. Cuanto mas detalle, mejor sera la tirada."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Opcional. Ayuda a personalizar la lectura.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas adicionales
          </label>
          <textarea
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            placeholder="Algo mas que quieras agregar (opcional)"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            Te contactaremos para coordinar el pago antes de preparar tu tirada.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
}
