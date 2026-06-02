import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "OPERADORA" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { ok: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const { codigo } = await request.json();

    if (!codigo) {
      return NextResponse.json(
        { ok: false, message: "Codigo no proporcionado" },
        { status: 400 }
      );
    }

    const entrada = await prisma.entrada.findUnique({
      where: { codigoQr: codigo },
      include: {
        evento: true,
        cliente: { select: { nombre: true, email: true } },
      },
    });

    if (!entrada) {
      return NextResponse.json({
        ok: false,
        message: "Codigo invalido - No se encontro ninguna entrada con este codigo",
      });
    }

    if (entrada.estado === "CANCELADA") {
      return NextResponse.json({
        ok: false,
        message: "Esta entrada fue cancelada",
        nombre: entrada.cliente.nombre,
        evento: entrada.evento.nombre,
      });
    }

    if (entrada.estado === "ASISTIDO") {
      return NextResponse.json({
        ok: false,
        message: `Entrada ya utilizada el ${entrada.fechaAsistencia?.toLocaleDateString("es-AR")}`,
        nombre: entrada.cliente.nombre,
        evento: entrada.evento.nombre,
      });
    }

    // Mark as attended
    await prisma.entrada.update({
      where: { id: entrada.id },
      data: {
        estado: "ASISTIDO",
        fechaAsistencia: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Bienvenido/a",
      nombre: entrada.cliente.nombre,
      evento: entrada.evento.nombre,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
