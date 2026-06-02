import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  // Create admin/operadora user
  const adminEmail = "admin@holistica.com";
  const existing = await prisma.usuario.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    await prisma.usuario.create({
      data: {
        nombre: "Administradora",
        email: adminEmail,
        passwordHash: await bcrypt.hash("admin123", 12),
        role: "ADMIN",
      },
    });
    console.log(`Usuario admin creado: ${adminEmail} / admin123`);
  } else {
    console.log(`Usuario admin ya existe: ${adminEmail}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
