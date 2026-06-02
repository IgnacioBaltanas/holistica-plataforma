import QrScannerPanel from "@/components/admin/QrScannerPanel";

export const metadata = { title: "Lector QR" };

export default function QrAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Lector QR</h1>
      <p className="text-gray-500 text-sm mb-6">
        Escanea el codigo QR de la entrada del asistente para validar su acceso al evento.
      </p>

      <QrScannerPanel />
    </div>
  );
}
