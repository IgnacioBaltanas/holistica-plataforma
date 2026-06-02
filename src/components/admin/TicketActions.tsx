"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, Loader2 } from "lucide-react";

export default function TicketActions({ ticketId, estadoActual }: { ticketId: string; estadoActual: string }) {
  const router = useRouter();
  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAction(estado: string) {
    setLoading(true);
    await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, respuesta: respuesta || undefined }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <textarea
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
        placeholder="Escribir respuesta..."
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />
      <div className="flex gap-2">
        {estadoActual === "ABIERTO" && (
          <button onClick={() => handleAction("EN_REVISION")} disabled={loading}
            className="flex items-center gap-1 text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 disabled:opacity-50">
            {loading ? <Loader2 size={12} className="animate-spin" /> : null}
            Marcar en revision
          </button>
        )}
        <button onClick={() => handleAction("RESUELTO")} disabled={loading}
          className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
          Resolver
        </button>
        {respuesta && (
          <button onClick={() => handleAction(estadoActual)} disabled={loading}
            className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            <Send size={12} /> Solo responder
          </button>
        )}
      </div>
    </div>
  );
}
