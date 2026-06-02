"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export default function NuevoArchivoPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("manual");
  const [precioArs, setPrecioArs] = useState("");
  const [precioUsd, setPrecioUsd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Selecciona un archivo"); return; }
    setLoading(true); setError("");

    try {
      // Upload file
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "productos");
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) { setError("Error al subir archivo"); return; }
      const { ruta } = await uploadRes.json();

      // Create product
      const res = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre || file.name, descripcion, tipo, precioArs, precioUsd, rutaStorage: ruta }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      router.push("/admin/archivos");
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Publicar archivo para venta</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
          <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[var(--color-primary)] transition-colors">
            <Upload size={24} className="text-gray-400" />
            <span className="text-sm text-gray-500">{file ? file.name : "Seleccionar archivo..."}</span>
            <input type="file" className="hidden" onChange={(e) => { setFile(e.target.files?.[0] || null); if (!nombre && e.target.files?.[0]) setNombre(e.target.files[0].name.replace(/\.[^.]+$/, "")); }} />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
            <option value="manual">Manual / PDF</option>
            <option value="foto">Foto / Imagen</option>
            <option value="video">Video</option>
            <option value="pack">Pack</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio ARS</label>
            <input type="number" value={precioArs} onChange={(e) => setPrecioArs(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio USD</label>
            <input type="number" value={precioUsd} onChange={(e) => setPrecioUsd(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-50">
          {loading ? "Subiendo..." : "Publicar archivo"}
        </button>
      </form>
    </div>
  );
}
