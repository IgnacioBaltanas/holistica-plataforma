"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Package, Layout, FileText } from "lucide-react";

const TEMPLATES = [
  { value: "CURSO", label: "Curso con modulos", icon: BookOpen, desc: "Videos, PDFs y ejercicios organizados en modulos" },
  { value: "TALLER", label: "Taller en vivo", icon: Sparkles, desc: "Evento presencial con fecha, lugar y cupo" },
  { value: "PACK", label: "Pack de recursos", icon: Package, desc: "Galeria de archivos descargables" },
  { value: "LANDING", label: "Landing de servicio", icon: FileText, desc: "Descripcion del servicio con boton de compra" },
  { value: "LIBRE", label: "Pagina libre", icon: Layout, desc: "Diseña la pagina desde cero" },
];

export default function NuevaSeccionPage() {
  const router = useRouter();
  const [template, setTemplate] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioArs, setPrecioArs] = useState("");
  const [precioUsd, setPrecioUsd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!template || !nombre) { setError("Elegí un template y un nombre"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/secciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, template, descripcion, precioArs, precioUsd }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/admin/secciones/${data.id}`);
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Nueva seccion</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        {/* Template selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de seccion</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTemplate(t.value)}
                className={`border rounded-xl p-4 text-left transition-colors ${
                  template === t.value
                    ? "border-[var(--color-primary)] bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <t.icon size={24} className="text-[var(--color-primary)] mb-2" />
                <p className="font-medium text-sm">{t.label}</p>
                <p className="text-xs text-gray-400">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Ej: Tarot Nivel 1"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
            placeholder="Breve descripcion del contenido..."
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio ARS</label>
            <input
              type="number"
              value={precioArs}
              onChange={(e) => setPrecioArs(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="15000"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio USD</label>
            <input
              type="number"
              value={precioUsd}
              onChange={(e) => setPrecioUsd(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="15"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear seccion y continuar al editor"}
        </button>
      </form>
    </div>
  );
}
