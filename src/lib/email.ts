import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const from = process.env.RESEND_FROM || "Holistica <noreply@holistica.com>";

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const resend = getResend();
  if (!resend) {
    console.log(`[EMAIL] (no configurado) To: ${to}, Subject: ${subject}`);
    return;
  }

  await resend.emails.send({
    from,
    to,
    subject,
    html,
    attachments,
  });
}

export async function sendQREmail({
  to,
  nombre,
  evento,
  fecha,
  lugar,
  qrBuffer,
}: {
  to: string;
  nombre: string;
  evento: string;
  fecha: string;
  lugar: string;
  qrBuffer: Buffer;
}) {
  await sendEmail({
    to,
    subject: `Tu entrada para ${evento}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Hola ${nombre}!</h2>
        <p>Tu entrada para <strong>${evento}</strong> esta confirmada.</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Lugar:</strong> ${lugar}</p>
        <p>Adjuntamos tu codigo QR. Mostralo en la puerta del evento para ingresar.</p>
        <p style="color: #666; font-size: 12px;">Cada QR es unico y solo puede usarse una vez.</p>
        <br/>
        <p style="color: #999; font-size: 11px;">Holistica - Bienestar y Crecimiento Personal</p>
      </div>
    `,
    attachments: [{ filename: "entrada-qr.png", content: qrBuffer }],
  });
}

export async function sendAdminPaymentAlert({
  clienteNombre,
  clienteEmail,
  producto,
  monto,
  moneda,
  metodoPago,
  pedidoId,
}: {
  clienteNombre: string;
  clienteEmail: string;
  producto: string;
  monto: number;
  moneda: string;
  metodoPago: string;
  pedidoId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.log(`[EMAIL] (ADMIN_EMAIL no configurado) Alerta pago pendiente: pedido ${pedidoId}`);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const confirmUrl = `${baseUrl}/admin/pedidos/${pedidoId}/confirmar`;

  await sendEmail({
    to: adminEmail,
    subject: `Nuevo pago pendiente - ${clienteNombre} - ${producto}`,
    html: `
      <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Nuevo pago recibido</h2>
        <p>Un cliente envio un comprobante de pago que necesita tu confirmacion.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280; width: 140px;">Cliente</td>
            <td style="padding: 8px 0; font-weight: 600;">${clienteNombre}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Email</td>
            <td style="padding: 8px 0;">${clienteEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Producto</td>
            <td style="padding: 8px 0; font-weight: 600;">${producto}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Monto</td>
            <td style="padding: 8px 0; font-weight: 600;">$${monto.toLocaleString("es-AR")} ${moneda}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Metodo</td>
            <td style="padding: 8px 0; text-transform: uppercase;">${metodoPago}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Pedido</td>
            <td style="padding: 8px 0; font-family: monospace;">#${pedidoId.slice(0, 8)}</td>
          </tr>
        </table>

        <p style="margin-bottom: 24px;">Revisa el comprobante y confirma el pago desde el siguiente enlace:</p>

        <a href="${confirmUrl}"
          style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none;">
          Revisar y confirmar pago
        </a>

        <p style="color: #9ca3af; font-size: 11px; margin-top: 32px;">
          Este email fue enviado automaticamente. No respondas a este mensaje.
        </p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail({
  to,
  nombre,
  producto,
  pedidoId,
}: {
  to: string;
  nombre: string;
  producto: string;
  pedidoId: string;
}) {
  await sendEmail({
    to,
    subject: `Pago confirmado - ${producto}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Pago confirmado!</h2>
        <p>Hola ${nombre},</p>
        <p>Confirmamos tu pago para <strong>${producto}</strong>.</p>
        <p>Pedido: #${pedidoId.slice(0, 8)}</p>
        <p>Ya podes acceder a tu contenido desde tu cuenta.</p>
        <br/>
        <p style="color: #999; font-size: 11px;">Holistica - Bienestar y Crecimiento Personal</p>
      </div>
    `,
  });
}
