import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: { default: "Panel Admin", template: "%s | Admin" } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "OPERADORA" && session.role !== "ADMIN") {
    redirect("/mi-cuenta");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar nombre={session.nombre} role={session.role} />
      <div className="flex-1 bg-gray-50 p-6 lg:p-8 overflow-auto">
        {children}
      </div>
    </div>
  );
}
