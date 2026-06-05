const TEMPLATES: Record<string, string> = {
  CURSO: `
<section style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 80px 20px; text-align: center;">
  <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 16px;">{{nombre}}</h1>
  <p style="font-size: 1.1rem; opacity: 0.9; max-width: 600px; margin: 0 auto;">{{descripcion}}</p>
</section>

<section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 8px;">Sobre este curso</h2>
  <p style="color: #6b7280; margin-bottom: 32px;">Describe aqui el contenido, objetivos y para quien esta dirigido este curso.</p>

  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 16px;">Que vas a aprender</h2>
  <ul style="list-style: disc; padding-left: 24px; color: #374151; margin-bottom: 32px;">
    <li style="margin-bottom: 8px;">Primer tema o habilidad que se desarrolla</li>
    <li style="margin-bottom: 8px;">Segundo tema o habilidad</li>
    <li style="margin-bottom: 8px;">Tercer tema o habilidad</li>
    <li style="margin-bottom: 8px;">Cuarto tema o habilidad</li>
  </ul>

  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 16px;">Contenido del curso</h2>
  <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
    <div style="padding: 16px; border-bottom: 1px solid #f3f4f6;"><strong>Modulo 1</strong> — Introduccion y fundamentos</div>
    <div style="padding: 16px; border-bottom: 1px solid #f3f4f6;"><strong>Modulo 2</strong> — Desarrollo del tema principal</div>
    <div style="padding: 16px; border-bottom: 1px solid #f3f4f6;"><strong>Modulo 3</strong> — Practica y ejercicios</div>
    <div style="padding: 16px;"><strong>Modulo 4</strong> — Cierre e integracion</div>
  </div>
</section>

<section style="background: #f9fafb; padding: 48px 20px; text-align: center;">
  <blockquote style="max-width: 600px; margin: 0 auto; font-style: italic; color: #4b5563; font-size: 1.1rem;">
    "Una experiencia transformadora que me ayudo a conectar con mi esencia."
  </blockquote>
  <p style="color: #9ca3af; margin-top: 12px; font-size: 0.875rem;">— Testimonio de alumno/a</p>
</section>

<section style="padding: 48px 20px; text-align: center;">
  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 8px;">Comenza tu camino</h2>
  <p style="color: #6b7280; margin-bottom: 24px;">Acceso inmediato a todo el contenido despues del pago.</p>
  <a href="#" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none;">Comprar curso</a>
</section>`,

  TALLER: `
<section style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 80px 20px; text-align: center;">
  <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.75rem; opacity: 0.9; margin-bottom: 12px;">Evento presencial</p>
  <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 16px;">{{nombre}}</h1>
  <p style="font-size: 1.1rem; opacity: 0.9; max-width: 600px; margin: 0 auto;">{{descripcion}}</p>
</section>

<section style="padding: 48px 20px; max-width: 700px; margin: 0 auto;">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px;">
    <div style="background: #fef3c7; padding: 20px; border-radius: 12px; text-align: center;">
      <p style="font-weight: bold; font-size: 1.1rem;">Fecha</p>
      <p style="color: #92400e; font-size: 0.875rem;">Por definir</p>
    </div>
    <div style="background: #fef3c7; padding: 20px; border-radius: 12px; text-align: center;">
      <p style="font-weight: bold; font-size: 1.1rem;">Horario</p>
      <p style="color: #92400e; font-size: 0.875rem;">Por definir</p>
    </div>
    <div style="background: #fef3c7; padding: 20px; border-radius: 12px; text-align: center;">
      <p style="font-weight: bold; font-size: 1.1rem;">Lugar</p>
      <p style="color: #92400e; font-size: 0.875rem;">Por definir</p>
    </div>
  </div>

  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 12px;">Sobre el taller</h2>
  <p style="color: #6b7280; margin-bottom: 24px;">Describe la tematica del taller, que se va a trabajar y que se llevan los participantes.</p>

  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 12px;">Que incluye</h2>
  <ul style="list-style: disc; padding-left: 24px; color: #374151; margin-bottom: 32px;">
    <li style="margin-bottom: 8px;">Actividad o material incluido</li>
    <li style="margin-bottom: 8px;">Otra actividad o material</li>
    <li style="margin-bottom: 8px;">Detalle adicional</li>
  </ul>

  <div style="background: #fffbeb; border: 2px solid #fbbf24; border-radius: 12px; padding: 24px; text-align: center;">
    <p style="font-weight: bold; color: #92400e; margin-bottom: 4px;">Cupo limitado</p>
    <p style="color: #a16207; font-size: 0.875rem;">Las entradas se agotan rapido. Asegura tu lugar.</p>
  </div>
</section>

<section style="padding: 48px 20px; text-align: center; background: #f9fafb;">
  <a href="#" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none;">Reservar mi lugar</a>
</section>`,

  PACK: `
<section style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 80px 20px; text-align: center;">
  <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 16px;">{{nombre}}</h1>
  <p style="font-size: 1.1rem; opacity: 0.9; max-width: 600px; margin: 0 auto;">{{descripcion}}</p>
</section>

<section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 16px;">Que incluye este pack</h2>
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 40px;">
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
      <p style="font-weight: bold; margin-bottom: 4px;">Manual PDF</p>
      <p style="color: #6b7280; font-size: 0.875rem;">Guia completa para estudiar y practicar.</p>
    </div>
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
      <p style="font-weight: bold; margin-bottom: 4px;">Ejercicios</p>
      <p style="color: #6b7280; font-size: 0.875rem;">Actividades practicas para integrar lo aprendido.</p>
    </div>
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
      <p style="font-weight: bold; margin-bottom: 4px;">Imagenes de referencia</p>
      <p style="color: #6b7280; font-size: 0.875rem;">Material visual de apoyo.</p>
    </div>
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
      <p style="font-weight: bold; margin-bottom: 4px;">Audio guiado</p>
      <p style="color: #6b7280; font-size: 0.875rem;">Meditacion o practica en formato audio.</p>
    </div>
  </div>
</section>

<section style="padding: 48px 20px; text-align: center; background: #f0fdf4;">
  <p style="font-size: 1.5rem; font-weight: bold; color: #059669; margin-bottom: 16px;">Acceso inmediato</p>
  <a href="#" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none;">Obtener pack</a>
</section>`,

  LANDING: `
<section style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 80px 20px; text-align: center;">
  <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 16px;">{{nombre}}</h1>
  <p style="font-size: 1.1rem; opacity: 0.9; max-width: 600px; margin: 0 auto;">{{descripcion}}</p>
</section>

<section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px; text-align: center;">
    <div>
      <p style="font-size: 2rem; margin-bottom: 4px;">✨</p>
      <p style="font-weight: bold; margin-bottom: 4px;">Beneficio 1</p>
      <p style="color: #6b7280; font-size: 0.875rem;">Descripcion del beneficio.</p>
    </div>
    <div>
      <p style="font-size: 2rem; margin-bottom: 4px;">🌿</p>
      <p style="font-weight: bold; margin-bottom: 4px;">Beneficio 2</p>
      <p style="color: #6b7280; font-size: 0.875rem;">Descripcion del beneficio.</p>
    </div>
    <div>
      <p style="font-size: 2rem; margin-bottom: 4px;">💫</p>
      <p style="font-weight: bold; margin-bottom: 4px;">Beneficio 3</p>
      <p style="color: #6b7280; font-size: 0.875rem;">Descripcion del beneficio.</p>
    </div>
  </div>

  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 12px;">Como funciona</h2>
  <p style="color: #6b7280; margin-bottom: 32px;">Explica el proceso, la modalidad (virtual/presencial), duracion y que incluye la sesion.</p>
</section>

<section style="padding: 48px 20px; text-align: center; background: #f9fafb;">
  <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 16px;">Agenda tu sesion</h2>
  <a href="#" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none;">Reservar</a>
</section>`,

  LIBRE: "",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getTemplateHtml(template: string, nombre: string, descripcion: string): string {
  const html = TEMPLATES[template] || "";
  return html
    .replace(/\{\{nombre\}\}/g, escapeHtml(nombre || "Titulo"))
    .replace(/\{\{descripcion\}\}/g, escapeHtml(descripcion || "Descripcion del contenido."));
}
