import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getSession } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // QR images can be accessed by the owning client too
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const segments = (await params).path;
  const filePath = path.join(process.cwd(), "uploads", ...segments);

  // Prevent path traversal
  const resolved = path.resolve(filePath);
  const uploadsRoot = path.resolve(path.join(process.cwd(), "uploads"));
  if (!resolved.startsWith(uploadsRoot)) {
    return NextResponse.json({ error: "Ruta invalida" }, { status: 400 });
  }

  // Only admin can see comprobantes
  if (segments[0] === "comprobantes") {
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  try {
    const fileBuffer = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".mp4": "video/mp4",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
