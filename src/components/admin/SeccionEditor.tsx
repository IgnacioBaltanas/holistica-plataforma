"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Eye, EyeOff, Trash2, Plus, Upload, X, GripVertical,
  Loader2, ArrowLeft, FileText, PlayCircle, Music, Image,
} from "lucide-react";
import dynamic from "next/dynamic";

const GrapesEditor = dynamic(() => import("./GrapesEditor"), { ssr: false });

interface ArchivoData { id: string; nombre: string; tipo: string; rutaStorage: string; orden: number }
interface ModuloData { id: string; nombre: string; descripcion: string; orden: number; archivos: ArchivoData[] }
interface SeccionData {
  id: string; nombre: string; slug: string; template: string;
  descripcion: string; imagenPortada: string;
  precioArs: string; precioUsd: string;
  contenidoHtml: string; contenidoCss: string;
  datosEditor: Record<string, unknown> | null;
  estado: string;
  modulos: ModuloData[];
  evento: { id: string; fecha: string; horaInicio: string; horaFin: string; lugar: string; cupoMaximo: number } | null;
}

const TIPO_ICON: Record<string, typeof FileText> = { video: PlayCircle, pdf: FileText, audio: Music, imagen: Image };

export default function SeccionEditor({ initial }: { initial: SeccionData }) {
  const router = useRouter();
  const [tab, setTab] = useState<"datos" | "modulos" | "editor">("datos");
  const [data, setData] = useState(initial);
  const [modulos, setModulos] = useState(initial.modulos);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [nuevoModulo, setNuevoModulo] = useState("");

  const save = useCallback(async (fields: Record<string, unknown>) => {
    setSaving(true); setMsg("");
    try {
      const res = await fetch(`/api/admin/secciones/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) setMsg("Guardado");
      else setMsg("Error al guardar");
    } catch { setMsg("Error de conexion"); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 2000); }
  }, [data.id]);

  async function handleSaveDatos(e: React.FormEvent) {
    e.preventDefault();
    await save({
      nombre: data.nombre, descripcion: data.descripcion,
      precioArs: data.precioArs, precioUsd: data.precioUsd,
      imagenPortada: data.imagenPortada,
    });
  }

  async function togglePublish() {
    const nuevoEstado = data.estado === "PUBLICADO" ? "BORRADOR" : "PUBLICADO";
    await save({ estado: nuevoEstado });
    setData({ ...data, estado: nuevoEstado });
  }

  async function handleDelete() {
    if (!confirm("Eliminar esta seccion? Esta accion no se puede deshacer.")) return;
    await fetch(`/api/admin/secciones/${data.id}`, { method: "DELETE" });
    router.push("/admin/secciones");
  }

  async function addModulo() {
    if (!nuevoModulo.trim()) return;
    const res = await fetch(`/api/admin/secciones/${data.id}/modulos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevoModulo }),
    });
    if (res.ok) {
      const m = await res.json();
      setModulos([...modulos, { ...m, descripcion: "", archivos: [] }]);
      setNuevoModulo("");
    }
  }

  async function deleteModulo(moduloId: string) {
    if (!confirm("Eliminar este modulo y sus archivos?")) return;
    await fetch(`/api/admin/modulos/${moduloId}`, { method: "DELETE" });
    setModulos(modulos.filter((m) => m.id !== moduloId));
  }

  async function uploadFile(moduloId: string, file: File) {
    const tipo = file.type.startsWith("video") ? "video"
      : file.type === "application/pdf" ? "pdf"
      : file.type.startsWith("audio") ? "audio" : "imagen";

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "contenido");

    const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!uploadRes.ok) return;
    const { ruta, nombre, tamano } = await uploadRes.json();

    const res = await fetch("/api/admin/archivos-modulo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduloId, nombre, tipo, rutaStorage: ruta, tamanoBytes: tamano }),
    });
    if (!res.ok) return;
    const { id } = await res.json();

    setModulos(modulos.map((m) =>
      m.id === moduloId
        ? { ...m, archivos: [...m.archivos, { id, nombre, tipo, rutaStorage: ruta, orden: m.archivos.length }] }
        : m
    ));
  }

  async function handleEditorSave(html: string, css: string, editorData: Record<string, unknown>) {
    await save({ contenidoHtml: html, contenidoCss: css, datosEditor: editorData });
    setData({ ...data, contenidoHtml: html, contenidoCss: css, datosEditor: editorData });
  }

  const TABS = [
    { key: "datos" as const, label: "Datos" },
    { key: "modulos" as const, label: "Modulos y archivos" },
    { key: "editor" as const, label: "Editor visual" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/secciones")} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{data.nombre}</h1>
            <p className="text-xs text-gray-400">/{data.slug} &middot; {data.template}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className="text-xs text-green-600">{msg}</span>}
          {saving && <Loader2 size={16} className="animate-spin text-gray-400" />}
          <button onClick={togglePublish}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium ${
              data.estado === "PUBLICADO"
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}>
            {data.estado === "PUBLICADO" ? <><EyeOff size={12} /> Despublicar</> : <><Eye size={12} /> Publicar</>}
          </button>
          <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700 p-1.5"><Trash2 size={16} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Datos */}
      {tab === "datos" && (
        <form onSubmit={handleSaveDatos} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={data.nombre} onChange={(e) => setData({ ...data, nombre: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea value={data.descripcion} onChange={(e) => setData({ ...data, descripcion: e.target.value })}
              rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL imagen portada</label>
            <input type="text" value={data.imagenPortada} onChange={(e) => setData({ ...data, imagenPortada: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio ARS</label>
              <input type="number" value={data.precioArs} onChange={(e) => setData({ ...data, precioArs: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio USD</label>
              <input type="number" value={data.precioUsd} onChange={(e) => setData({ ...data, precioUsd: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" min="0" step="0.01" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50">
            <Save size={16} /> Guardar datos
          </button>
        </form>
      )}

      {/* Tab: Modulos */}
      {tab === "modulos" && (
        <div className="space-y-4 max-w-2xl">
          {modulos.map((modulo) => (
            <div key={modulo.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-gray-300" />
                  <span className="font-medium text-sm">{modulo.nombre}</span>
                </div>
                <button onClick={() => deleteModulo(modulo.id)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
              </div>

              {/* Files */}
              <div className="p-4 space-y-2">
                {modulo.archivos.map((a) => {
                  const Icon = TIPO_ICON[a.tipo] || FileText;
                  return (
                    <div key={a.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <Icon size={16} className="text-[var(--color-primary)] shrink-0" />
                      <span className="flex-1 truncate">{a.nombre}</span>
                      <span className="text-xs text-gray-400 uppercase">{a.tipo}</span>
                    </div>
                  );
                })}

                <label className="flex items-center gap-2 text-sm text-[var(--color-primary)] cursor-pointer hover:underline px-3 py-2">
                  <Upload size={16} />
                  Subir archivo
                  <input type="file" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(modulo.id, f); e.target.value = ""; }}
                  />
                </label>
              </div>
            </div>
          ))}

          {/* Add module */}
          <div className="flex gap-2">
            <input type="text" value={nuevoModulo} onChange={(e) => setNuevoModulo(e.target.value)}
              placeholder="Nombre del nuevo modulo..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addModulo(); } }}
            />
            <button onClick={addModulo} disabled={!nuevoModulo.trim()}
              className="flex items-center gap-1 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50">
              <Plus size={16} /> Agregar
            </button>
          </div>
        </div>
      )}

      {/* Tab: Editor visual */}
      {tab === "editor" && (
        <GrapesEditor
          initialHtml={data.contenidoHtml}
          initialCss={data.contenidoCss}
          initialData={data.datosEditor}
          onSave={handleEditorSave}
        />
      )}
    </div>
  );
}
