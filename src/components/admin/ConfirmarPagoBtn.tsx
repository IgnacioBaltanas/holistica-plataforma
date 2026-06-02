"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

export default function ConfirmarPagoBtn({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function confirmar() {
    if (!confirm("Confirmar pago de este pedido?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}/confirmar`, { method: "POST" });
      if (res.ok) router.refresh();
      else alert("Error al confirmar");
    } catch {
      alert("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={confirmar}
      disabled={loading}
      className="flex items-center gap-1 text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
      Confirmar
    </button>
  );
}
