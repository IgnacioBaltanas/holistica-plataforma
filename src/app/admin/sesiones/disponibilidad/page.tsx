"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DIAS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

interface DiaConfig {
  diaSemana: number;
  activo: boolean;
  horaInicio: string;
  horaFin: string;
}

const DEFAULT_SCHEDULE: DiaConfig[] = DIAS.map((_, i) => ({
  diaSemana: i,
  activo: i >= 1 && i <= 5, // lunes a viernes
  horaInicio: "09:00",
  horaFin: "18:00",
}));

export default function DisponibilidadPage() {
  const router = useRouter();
  const [dias, setDias] = useState<DiaConfig[]>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/disponibilidad")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = DEFAULT_SCHEDULE.map((d) => {
            const existing = data.find((e: DiaConfig) => e.diaSemana === d.diaSemana);
            return existing
              ? { ...d, activo: true, horaInicio: existing.horaInicio, horaFin: existing.horaFin }
              : d;
          });
          // Mark days not in DB as inactive
          const activeDays = new Set(data.map((e: DiaConfig) => e.diaSemana));
          setDias(merged.map((d) => ({
            ...d,
            activo: activeDays.has(d.diaSemana),
          })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function updateDia(index: number, field: keyof DiaConfig, value: string | boolean) {
    setDias((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/disponibilidad", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dias }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/admin/sesiones"), 1000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/sesiones" className="text-gray-400 hover:text-gray-600 text-sm">
          &larr; Volver
        </Link>
        <h1 className="text-2xl font-bold">Disponibilidad semanal</h1>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Configura los dias y horarios en los que atendes. Los clientes solo podran agendar
        en los horarios que habilites.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {dias.map((dia, index) => (
          <div
            key={dia.diaSemana}
            className={`bg-white border rounded-xl p-4 flex items-center gap-4 transition-opacity ${
              dia.activo ? "border-gray-100" : "border-gray-50 opacity-50"
            }`}
          >
            <label className="flex items-center gap-3 min-w-[140px] cursor-pointer">
              <input
                type="checkbox"
                checked={dia.activo}
                onChange={(e) => updateDia(index, "activo", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="font-medium text-sm">{DIAS[dia.diaSemana]}</span>
            </label>

            {dia.activo && (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="time"
                  value={dia.horaInicio}
                  onChange={(e) => updateDia(index, "horaInicio", e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <span className="text-gray-400">a</span>
                <input
                  type="time"
                  value={dia.horaFin}
                  onChange={(e) => updateDia(index, "horaFin", e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar disponibilidad"}
          </button>
          {saved && <span className="text-green-600 text-sm">Guardado correctamente</span>}
        </div>
      </form>
    </div>
  );
}
