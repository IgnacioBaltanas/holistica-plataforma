"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CreditCard, Globe, Loader2, CheckCircle } from "lucide-react";

interface CheckoutFormProps {
  pedidoId: string;
  monto: number;
  moneda: string;
}

type MetodoPago = "transferencia" | "mercadopago" | "prex";

export default function CheckoutForm({ pedidoId, monto, moneda }: CheckoutFormProps) {
  const router = useRouter();
  const [metodo, setMetodo] = useState<MetodoPago>("transferencia");
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if ((metodo === "transferencia" || metodo === "prex") && !comprobante) {
      setError("Adjunta el comprobante de pago");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("pedidoId", pedidoId);
      formData.append("metodo", metodo);
      if (comprobante) formData.append("comprobante", comprobante);

      const res = await fetch("/api/pedidos/pago", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Error al procesar"); return; }

      if (metodo === "mercadopago" && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      setEnviado(true);
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-green-700 mb-2">Comprobante enviado</h3>
        <p className="text-sm text-green-600 mb-6">
          Recibimos tu comprobante. Te notificaremos cuando confirmemos el pago
          y tendras acceso a tu contenido.
        </p>
        <button onClick={() => router.push("/mi-cuenta/pedidos")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
          Ver mis pedidos
        </button>
      </div>
    );
  }

  const metodos: { key: MetodoPago; icon: typeof Upload; label: string; desc: string }[] = [
    { key: "transferencia", icon: Upload, label: "Transferencia bancaria", desc: "Argentina - CBU/CVU/alias" },
    { key: "mercadopago", icon: CreditCard, label: "Mercado Pago", desc: "Tarjeta, QR o saldo MP" },
    { key: "prex", icon: Globe, label: "Prex", desc: "Pagos desde el exterior" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

      {/* Method selection */}
      <div>
        <h3 className="font-semibold mb-3">Metodo de pago</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {metodos.map((m) => (
            <button key={m.key} type="button" onClick={() => setMetodo(m.key)}
              className={`border rounded-xl p-4 text-left transition-colors ${
                metodo === m.key ? "border-[var(--color-primary)] bg-purple-50" : "border-gray-200 hover:border-gray-300"
              }`}>
              <m.icon size={24} className="text-[var(--color-primary)] mb-2" />
              <p className="font-medium text-sm">{m.label}</p>
              <p className="text-xs text-gray-400">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Transfer details */}
      {metodo === "transferencia" && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Datos para transferir</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-gray-500">CBU:</span> <span className="font-mono">0000000000000000000000</span></p>
              <p><span className="text-gray-500">Alias:</span> <span className="font-mono">HOLISTICA.PAGOS</span></p>
              <p><span className="text-gray-500">Titular:</span> Nombre Titular</p>
              <p><span className="text-gray-500">Monto:</span> <span className="font-bold">${monto.toLocaleString("es-AR")} {moneda}</span></p>
            </div>
          </div>
          <FileUpload onFile={setComprobante} label="Comprobante de transferencia" />
        </div>
      )}

      {/* Mercado Pago */}
      {metodo === "mercadopago" && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <p className="text-sm text-blue-700">
            Al hacer click en &quot;Pagar&quot; seras redirigido a Mercado Pago para completar el pago.
            El acceso se habilita automaticamente al confirmar.
          </p>
        </div>
      )}

      {/* Prex */}
      {metodo === "prex" && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Datos para pago via Prex</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-gray-500">Usuario Prex:</span> <span className="font-mono">holistica.pagos</span></p>
              <p><span className="text-gray-500">Nombre:</span> Nombre Titular</p>
              <p><span className="text-gray-500">Monto:</span> <span className="font-bold">${monto.toLocaleString("es-AR")} {moneda}</span></p>
              <p className="text-xs text-gray-400 mt-2">
                Realiza el envio desde tu app Prex y subi el comprobante abajo.
              </p>
            </div>
          </div>
          <FileUpload onFile={setComprobante} label="Comprobante de pago Prex" />
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? <><Loader2 size={18} className="animate-spin" /> Procesando...</>
          : metodo === "mercadopago" ? "Pagar con Mercado Pago"
          : "Enviar comprobante"}
      </button>
    </form>
  );
}

function FileUpload({ onFile, label }: { onFile: (f: File | null) => void; label: string }) {
  const [name, setName] = useState("");
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="file" accept="image/*,.pdf"
        onChange={(e) => { const f = e.target.files?.[0] || null; onFile(f); setName(f?.name || ""); }}
        className="w-full text-sm border border-gray-200 rounded-lg p-2 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-purple-50 file:text-[var(--color-primary)] hover:file:bg-purple-100" />
      {name && <p className="text-xs text-gray-400 mt-1">{name}</p>}
    </div>
  );
}
