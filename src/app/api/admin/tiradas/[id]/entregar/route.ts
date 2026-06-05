import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const pedido = await prisma.pedido.findUnique({
      where: { id, tipo: "TIRADA" },
      include: { cliente: { select: { nombre: true, email: true } } },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.estadoEntrega === "ENTREGADO") {
      return NextResponse.json({ error: "Ya fue entregado" }, { status: 409 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mensaje = formData.get("mensaje") as string || "";

    if (!file) {
      return NextResponse.json({ error: "Debes subir un archivo" }, { status: 400 });
    }

    // Save file
    const uploadsDir = path.join(process.cwd(), "uploads", "tiradas", id);
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const archivoRuta = `/api/admin/files/tiradas/${id}/${filename}`;

    // Update pedido
    await prisma.pedido.update({
      where: { id },
      data: {
        estadoEntrega: "ENTREGADO",
        deliveredAt: new Date(),
        archivoRespuesta: archivoRuta,
        mensajeRespuesta: mensaje || null,
      },
    });

    // Notify client via email
    if (pedido.cliente.email) {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      try {
        await sendEmail({
          to: pedido.cliente.email,
          subject: "Tu tirada personalizada esta lista!",
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Tu tirada esta lista!</h2>
              <p>Hola ${pedido.cliente.nombre},</p>
              <p>Tu tirada personalizada ya esta disponible para ver.</p>
              ${mensaje ? `<p><strong>Mensaje:</strong> ${mensaje.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</p>` : ""}
              <a href="${baseUrl}/mi-cuenta/tiradas/${id}"
                style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 16px;">
                Ver mi tirada
              </a>
              <br/><br/>
              <p style="color: #999; font-size: 11px;">Holistica - Bienestar y Crecimiento Personal</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error(`[entregar tirada] Error enviando email para pedido ${id}:`, emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error entregando tirada:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
