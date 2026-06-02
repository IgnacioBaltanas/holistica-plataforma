@echo off
REM =============================================================================
REM HOLISTICA - Script de setup inicial (Windows)
REM Ejecutar una sola vez para preparar el proyecto.
REM Uso: setup.bat
REM =============================================================================

echo.
echo ================================================
echo   HOLISTICA - Setup inicial
echo ================================================
echo.

REM --- 1. Verificar Node.js ---
echo [1/6] Verificando Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado. Instalar v20+ desde https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo        Node.js %%i OK

REM --- 2. Verificar .env ---
echo [2/6] Verificando .env...
if not exist .env (
    echo        .env no encontrado, copiando .env.example...
    copy .env.example .env >nul
    echo        IMPORTANTE: Edita .env con tus datos antes de continuar.
    echo        Minimo necesario: DATABASE_URL con tu PostgreSQL.
    echo.
    pause
)
echo        .env OK

REM --- 3. Instalar dependencias ---
echo [3/6] Instalando dependencias...
call npm install
echo        Dependencias OK

REM --- 4. Generar Prisma client ---
echo [4/6] Generando Prisma client...
call npx prisma generate
echo        Prisma client OK

REM --- 5. Crear tablas ---
echo [5/6] Creando tablas en la base de datos...
echo        (Asegurate de que PostgreSQL este corriendo y la BD exista)
call npx prisma db push
echo        Tablas creadas OK

REM --- 6. Seed ---
echo [6/6] Creando usuario administrador...
call npx tsx prisma/seed.ts
echo.

REM --- Listo ---
echo ================================================
echo   Setup completado!
echo ================================================
echo.
echo   Usuario admin: admin@holistica.com
echo   Contrasena:    admin123
echo   (cambiar despues del primer login)
echo.
echo   Para iniciar en desarrollo:
echo     npm run dev
echo.
echo   Abrir: http://localhost:3000
echo   Admin: http://localhost:3000/admin
echo ================================================
echo.
pause
