#!/bin/bash
# =============================================================================
# HOLISTICA - Script de setup inicial
# Ejecutar una sola vez para preparar el proyecto.
# Uso: bash setup.sh
# =============================================================================

set -e

echo ""
echo "================================================"
echo "  HOLISTICA - Setup inicial"
echo "================================================"
echo ""

# --- 1. Verificar Node.js ---
echo "[1/6] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no esta instalado. Instalar v20+ desde https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "       Node.js $NODE_VERSION OK"

# --- 2. Verificar .env ---
echo "[2/6] Verificando .env..."
if [ ! -f .env ]; then
    echo "       .env no encontrado, copiando .env.example..."
    cp .env.example .env
    echo "       IMPORTANTE: Edita .env con tus datos antes de continuar."
    echo "       Minimo necesario: DATABASE_URL con tu PostgreSQL."
    echo ""
    read -p "       Presiona Enter cuando hayas editado .env..."
fi
echo "       .env OK"

# --- 3. Instalar dependencias ---
echo "[3/6] Instalando dependencias..."
npm install
echo "       Dependencias OK"

# --- 4. Generar Prisma client ---
echo "[4/6] Generando Prisma client..."
npx prisma generate
echo "       Prisma client OK"

# --- 5. Crear tablas en PostgreSQL ---
echo "[5/6] Creando tablas en la base de datos..."
echo "       (Asegurate de que PostgreSQL este corriendo y la BD exista)"
npx prisma db push
echo "       Tablas creadas OK"

# --- 6. Seed: crear usuario admin ---
echo "[6/6] Creando usuario administrador..."
npx tsx prisma/seed.ts
echo ""

# --- Listo ---
echo "================================================"
echo "  Setup completado!"
echo "================================================"
echo ""
echo "  Usuario admin: admin@holistica.com"
echo "  Contrasena:    admin123"
echo "  (cambiar despues del primer login)"
echo ""
echo "  Para iniciar en desarrollo:"
echo "    npm run dev"
echo ""
echo "  Para build de produccion:"
echo "    npm run build"
echo "    npm start"
echo ""
echo "  Abrir: http://localhost:3000"
echo "  Admin: http://localhost:3000/admin"
echo "================================================"
