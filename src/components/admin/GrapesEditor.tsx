"use client";

import { useEffect, useRef, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import grapesjs, { Editor } from "grapesjs";

interface GrapesEditorProps {
  initialHtml: string;
  initialCss: string;
  initialData: Record<string, unknown> | null;
  onSave: (html: string, css: string, data: Record<string, unknown>) => Promise<void>;
}

export default function GrapesEditor({ initialHtml, initialCss, initialData, onSave }: GrapesEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: "70vh",
      width: "auto",
      storageManager: false,
      panels: { defaults: [] },
      blockManager: {
        appendTo: "#grapes-blocks",
        blocks: [
          {
            id: "section",
            label: "Seccion",
            category: "Estructura",
            content: '<section class="py-12 px-4"><div class="max-w-4xl mx-auto"><h2>Titulo de seccion</h2><p>Contenido aqui...</p></div></section>',
          },
          {
            id: "text",
            label: "Texto",
            category: "Basico",
            content: '<p class="mb-4">Escribe tu texto aqui...</p>',
          },
          {
            id: "heading",
            label: "Titulo",
            category: "Basico",
            content: '<h2 class="text-2xl font-bold mb-4">Titulo</h2>',
          },
          {
            id: "image",
            label: "Imagen",
            category: "Basico",
            content: { type: "image" },
          },
          {
            id: "button",
            label: "Boton",
            category: "Basico",
            content: '<a href="#" class="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700">Boton</a>',
          },
          {
            id: "divider",
            label: "Separador",
            category: "Basico",
            content: '<hr class="my-8 border-gray-200" />',
          },
          {
            id: "hero",
            label: "Hero",
            category: "Secciones",
            content: `<section class="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-20 px-4 text-center">
              <h1 class="text-4xl font-bold mb-4">Titulo principal</h1>
              <p class="text-lg text-purple-100 max-w-2xl mx-auto mb-8">Descripcion del contenido o servicio que ofreces.</p>
              <a href="#" class="inline-block bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold">Comenzar</a>
            </section>`,
          },
          {
            id: "features",
            label: "Caracteristicas",
            category: "Secciones",
            content: `<section class="py-16 px-4"><div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="text-center"><h3 class="text-lg font-semibold mb-2">Beneficio 1</h3><p class="text-gray-500">Descripcion del beneficio.</p></div>
              <div class="text-center"><h3 class="text-lg font-semibold mb-2">Beneficio 2</h3><p class="text-gray-500">Descripcion del beneficio.</p></div>
              <div class="text-center"><h3 class="text-lg font-semibold mb-2">Beneficio 3</h3><p class="text-gray-500">Descripcion del beneficio.</p></div>
            </div></section>`,
          },
          {
            id: "testimonial",
            label: "Testimonio",
            category: "Secciones",
            content: `<section class="bg-gray-50 py-12 px-4"><blockquote class="max-w-2xl mx-auto text-center">
              <p class="text-lg text-gray-600 italic mb-4">"Una experiencia transformadora que cambio mi perspectiva."</p>
              <cite class="text-sm text-gray-500 not-italic">— Nombre de la persona</cite>
            </blockquote></section>`,
          },
          {
            id: "video",
            label: "Video",
            category: "Media",
            content: '<div class="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 my-4"><p>Video embebido</p></div>',
          },
          {
            id: "list",
            label: "Lista",
            category: "Basico",
            content: '<ul class="list-disc pl-6 space-y-2 mb-4"><li>Elemento 1</li><li>Elemento 2</li><li>Elemento 3</li></ul>',
          },
        ],
      },
      styleManager: {
        appendTo: "#grapes-styles",
        sectors: [
          { name: "Dimension", open: false, properties: ["width", "height", "min-height", "padding", "margin"] },
          { name: "Tipografia", open: false, properties: ["font-size", "font-weight", "color", "text-align", "line-height"] },
          { name: "Fondo", open: false, properties: ["background-color", "background-image"] },
          { name: "Borde", open: false, properties: ["border-radius", "border"] },
        ],
      },
      layerManager: { appendTo: "#grapes-layers" },
    });

    // Load content
    if (initialData && typeof initialData === "object" && "pages" in initialData) {
      editor.loadProjectData(initialData as Parameters<typeof editor.loadProjectData>[0]);
    } else if (initialHtml) {
      editor.setComponents(initialHtml);
      if (initialCss) editor.setStyle(initialCss);
    }

    editorRef.current = editor;
    setReady(true);

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!editorRef.current) return;
    setSaving(true);
    const editor = editorRef.current;
    const html = editor.getHtml();
    const css = editor.getCss() || "";
    const data = editor.getProjectData();
    await onSave(html, css, data as unknown as Record<string, unknown>);
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">Arrastra bloques al canvas para diseñar la pagina.</p>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Guardando..." : "Guardar diseño"}
        </button>
      </div>

      <div className="flex gap-4 border border-gray-200 rounded-xl overflow-hidden bg-white" style={{ height: "72vh" }}>
        {/* Sidebar */}
        <div className="w-56 border-r border-gray-200 overflow-y-auto shrink-0">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">Bloques</h3>
          </div>
          <div id="grapes-blocks" />
          <div className="p-3 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Estilos</h3>
            <div id="grapes-styles" />
          </div>
          <div className="p-3 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Capas</h3>
            <div id="grapes-layers" />
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <div ref={containerRef} className={`h-full ${!ready ? "flex items-center justify-center" : ""}`}>
            {!ready && <Loader2 size={32} className="animate-spin text-gray-300" />}
          </div>
        </div>
      </div>
    </div>
  );
}
