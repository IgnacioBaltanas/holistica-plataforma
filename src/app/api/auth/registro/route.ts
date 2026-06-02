import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, password } = await request.json();

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, email y contrasena son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contrasena debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash: await hashPassword(password),
        role: "CLIENTE",
      },
    });

    await createSession({
      userId: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      role: usuario.role,
    });

    return NextResponse.json({ ok: true, role: usuario.role }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
