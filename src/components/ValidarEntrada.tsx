"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ValidarEntrada({ codigo }: { codigo: string }) {
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    nombre?: string;
    evento?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch("/api/entradas/validar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo }),
        });
        const data = await res.json();
        setResult(data);
      } catch {
        setResult({ ok: false, message: "Error de conexion" });
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, [codigo]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Loader2 size={48} className="mx-auto animate-spin text-[var(--color-primary)] mb-4" />
        <p className="text-gray-500">Validando entrada...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className={`rounded-xl p-10 text-center ${
        result.ok ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"
      }`}>
        {result.ok ? (
          <CheckCircle size={80} className="mx-auto text-green-500 mb-4" />
        ) : (
          <XCircle size={80} className="mx-auto text-red-500 mb-4" />
        )}

        <p className={`text-2xl font-bold mb-2 ${result.ok ? "text-green-700" : "text-red-700"}`}>
          {result.ok ? "Acceso permitido" : "Acceso denegado"}
        </p>
        <p className={`text-sm mb-4 ${result.ok ? "text-green-600" : "text-red-600"}`}>
          {result.message}
        </p>

        {result.nombre && <p className="text-xl font-semibold text-gray-700">{result.nombre}</p>}
        {result.evento && <p className="text-sm text-gray-500">{result.evento}</p>}

        <Link href="/admin/qr"
          className="inline-block mt-8 bg-white border border-gray-200 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          Escanear otro
        </Link>
      </div>
    </div>
  );
}
