import { getSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.role !== "OPERADORA" && session.role !== "ADMIN")) {
    return null;
  }
  return session;
}
