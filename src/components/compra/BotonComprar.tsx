"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";

interface BotonComprarProps {
  seccionId: string;
  tipo: string;
  nombre: string;
}

export default function BotonComprar({ seccionId, tipo, nombre }: BotonComprarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComprar() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seccionId, tipo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear el pedido");
        return;
      }

      router.push(`/checkout/${data.pedidoId}`);
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleComprar}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ShoppingCart size={18} />
        )}
        {loading ? "Procesando..." : `Comprar ${nombre}`}
      </button>
      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
