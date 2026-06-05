"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Video } from "lucide-react";

interface Slot {
  horaInicio: string;
  horaFin: string;
}

export default function AgendarPage() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const router = useRouter();

  const [fecha, setFecha] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalidad, setModalidad] = useState("virtual");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [servicio] = useState("tarot"); // TODO: derive from pedido

  // Fetch available slots when date changes
  useEffect(() => {
    if (!fecha) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSelectedSlot(null);

    fetch(`/api/sesiones/disponibles?fecha=${fecha}&servicio=${servicio}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [fecha, servicio]);

  // Min date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Selecciona un horario");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/sesiones/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId,
          fecha,
          horaInicio: selectedSlot.horaInicio,
          modalidad,
          notas,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error agendando sesion");
      }

      router.push("/mi-cuenta/sesiones?agendada=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error agendando sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Agendar sesion</h1>
      <p className="text-gray-500 mb-8">
        Elegir dia, horario y modalidad para tu sesion.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date picker */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-[var(--color-primary)]" />
            <h2 className="font-semibold">Fecha</h2>
          </div>
          <input
            type="date"
            required
            min={minDate}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {/* Time slots */}
        {fecha && (
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-[var(--color-primary)]" />
              <h2 className="font-semibold">Horario disponible</h2>
            </div>

            {loadingSlots ? (
              <p className="text-sm text-gray-400">Buscando horarios...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-400">
                No hay horarios disponibles para esta fecha. Proba otro dia.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.horaInicio}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSlot?.horaInicio === slot.horaInicio
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-purple-50 hover:text-[var(--color-primary)]"
                    }`}
                  >
                    {slot.horaInicio}
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <p className="text-xs text-gray-400 mt-3">
                Sesion de {selectedSlot.horaInicio} a {selectedSlot.horaFin}
              </p>
            )}
          </div>
        )}

        {/* Modality */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Modalidad</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setModalidad("virtual")}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                modalidad === "virtual"
                  ? "border-[var(--color-primary)] bg-purple-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <Video size={20} className={modalidad === "virtual" ? "text-[var(--color-primary)]" : "text-gray-400"} />
              <div className="text-left">
                <p className="font-medium text-sm">Virtual</p>
                <p className="text-xs text-gray-400">Google Meet</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setModalidad("presencial")}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                modalidad === "presencial"
                  ? "border-[var(--color-primary)] bg-purple-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <MapPin size={20} className={modalidad === "presencial" ? "text-[var(--color-primary)]" : "text-gray-400"} />
              <div className="text-left">
                <p className="font-medium text-sm">Presencial</p>
                <p className="text-xs text-gray-400">Consultorio</p>
              </div>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-semibold mb-3">Notas (opcional)</h2>
          <textarea
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            placeholder="Algo que quieras que sepamos antes de la sesion"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !selectedSlot}
          className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
        >
          {loading ? "Agendando..." : "Confirmar sesion"}
        </button>
      </form>
    </div>
  );
}
