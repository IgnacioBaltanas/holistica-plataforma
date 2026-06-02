"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmarPedidoPanel({
  pedidoId,
  pedidoCorto,
}: {
  pedidoId: string;
  pedidoCorto: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"initial" | "confirm" | "done">("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}/confirmar`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al confirmar");
        setStep("initial");
        return;
      }

      setStep("done");
    } catch {
      setError("Error de conexion");
      setStep("initial");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-green-700 mb-2">Pago confirmado</h3>
        <p className="text-sm text-green-600 mb-6">
          El pedido #{pedidoCorto} fue confirmado. El cliente ya tiene acceso a su contenido
          y recibio un email de confirmacion.
        </p>
        <button
          onClick={() => router.push("/admin/pedidos")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Volver a pedidos
        </button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
        <h3 className="text-lg font-semibold text-amber-700 mb-2">
          Estas segura que queres confirmar la transaccion #{pedidoCorto}?
        </h3>
        <p className="text-sm text-amber-600 mb-6">
          Esta accion otorgara acceso al contenido al cliente y le enviara un email
          de confirmacion. No se puede deshacer.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setStep("initial")}
            disabled={loading}
            className="bg-white border border-gray-200 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Confirmando...</>
            ) : (
              <><CheckCircle size={16} /> Si, confirmar pago</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}
      <button
        onClick={() => setStep("confirm")}
        className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle size={18} />
        Confirmar pago de este pedido
      </button>
    </div>
  );
}
