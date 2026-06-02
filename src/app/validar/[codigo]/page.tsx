import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ValidarEntrada from "@/components/ValidarEntrada";

export const metadata = { title: "Validar entrada" };

export default async function ValidarPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const session = await getSession();

  // If admin/operadora, validate directly
  if (session && (session.role === "OPERADORA" || session.role === "ADMIN")) {
    return <ValidarEntrada codigo={codigo} />;
  }

  // If regular user or not logged in, redirect to login
  if (!session) {
    redirect(`/login?redirect=/validar/${codigo}`);
  }

  // Logged in but not admin
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-gray-500">Solo la operadora puede validar entradas.</p>
    </div>
  );
}
