import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contrasena son requeridos" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !(await verifyPassword(password, usuario.passwordHash))) {
      return NextResponse.json(
        { error: "Email o contrasena incorrectos" },
        { status: 401 }
      );
    }

    await createSession({
      userId: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      role: usuario.role,
    });

    return NextResponse.json({
      ok: true,
      role: usuario.role,
      nombre: usuario.nombre,
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
