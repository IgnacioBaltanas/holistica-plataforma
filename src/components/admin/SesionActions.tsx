"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  sesionId: string;
  estado: string;
  meetLink: string | null;
}

export default function SesionActions({ sesionId, estado, meetLink }: Props) {
  const router = useRouter();
  const [link, setLink] = useState(meetLink || "");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateSesion(data: Record<string, string>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sesiones/${sesionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (estado !== "CONFIRMADA") return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showLinkInput ? (
        <div className="flex items-center gap-1">
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="border border-gray-200 rounded px-2 py-1 text-xs w-48"
          />
          <button
            onClick={() => updateSesion({ meetLink: link })}
            disabled={loading}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowLinkInput(true)}
          className="text-xs text-blue-600 hover:underline"
        >
          {meetLink ? "Editar link" : "+ Meet link"}
        </button>
      )}
      <button
        onClick={() => updateSesion({ estado: "COMPLETADA" })}
        disabled={loading}
        className="text-xs text-green-600 hover:underline disabled:opacity-50"
      >
        Completar
      </button>
      <button
        onClick={() => {
          if (confirm("Cancelar esta sesion?")) updateSesion({ estado: "CANCELADA" });
        }}
        disabled={loading}
        className="text-xs text-red-500 hover:underline disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
}
