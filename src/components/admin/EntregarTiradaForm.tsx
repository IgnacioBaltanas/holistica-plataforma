"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export default function EntregarTiradaForm({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Selecciona un archivo para enviar");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mensaje", mensaje);

      const res = await fetch(`/api/admin/tiradas/${pedidoId}/entregar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error entregando tirada");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error entregando tirada");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <h2 className="font-semibold mb-4">Entregar contenido</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo (video, audio, PDF) *
          </label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[var(--color-primary)] transition-colors">
            <Upload size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              {file ? file.name : "Seleccionar archivo..."}
            </span>
            <input
              type="file"
              className="hidden"
              accept="video/*,audio/*,.pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {file && (
            <p className="text-xs text-gray-400 mt-1">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje para el cliente
          </label>
          <textarea
            rows={3}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
            placeholder="Mensaje que acompana la entrega (opcional)"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-primary)] text-white py-2.5 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Entregar al cliente"}
        </button>
      </form>
    </div>
  );
}
