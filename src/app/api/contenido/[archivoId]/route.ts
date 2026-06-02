import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ archivoId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { archivoId } = await params;

    const archivo = await prisma.archivoModulo.findUnique({
      where: { id: archivoId },
      include: {
        modulo: {
          include: {
            seccion: { select: { id: true } },
          },
        },
      },
    });

    if (!archivo) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

    // Verify user has purchased this course
    const pedido = await prisma.pedido.findFirst({
      where: {
        clienteId: session.userId,
        seccionId: archivo.modulo.seccion.id,
        estadoPago: "CONFIRMADO",
      },
    });

    if (!pedido) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Serve file
    const filePath = path.join(process.cwd(), archivo.rutaStorage);

    try {
      const fileBuffer = await readFile(filePath);

      const ext = path.extname(archivo.rutaStorage).toLowerCase();
      const mimeTypes: Record<string, string> = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".pdf": "application/pdf",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
      };

      const contentType = mimeTypes[ext] || "application/octet-stream";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${archivo.nombre}${ext}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch {
      return NextResponse.json({ error: "Archivo no disponible" }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
