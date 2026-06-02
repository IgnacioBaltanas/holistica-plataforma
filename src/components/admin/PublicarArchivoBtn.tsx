"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function PublicarArchivoBtn({ id, estado }: { id: string; estado: string }) {
  const router = useRouter();

  async function toggle() {
    const nuevoEstado = estado === "DISPONIBLE" ? "RETIRADO" : "DISPONIBLE";
    await fetch(`/api/admin/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    router.refresh();
  }

  return (
    <button onClick={toggle}
      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg ${
        estado === "DISPONIBLE"
          ? "text-amber-600 hover:bg-amber-50"
          : "text-green-600 hover:bg-green-50"
      }`}>
      {estado === "DISPONIBLE" ? <><EyeOff size={12} /> Retirar</> : <><Eye size={12} /> Publicar</>}
    </button>
  );
}
