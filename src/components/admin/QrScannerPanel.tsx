"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, CameraOff, CheckCircle, XCircle, RotateCcw, Keyboard } from "lucide-react";

type ValidationResult = {
  ok: boolean;
  message: string;
  nombre?: string;
  evento?: string;
} | null;

export default function QrScannerPanel() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ValidationResult>(null);
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const validateCode = useCallback(async (code: string) => {
    setLoading(true);
    setResult(null);

    try {
      // Extract UUID from URL if the QR contains a full URL
      const uuid = code.includes("/validar/")
        ? code.split("/validar/").pop()!
        : code;

      const res = await fetch("/api/entradas/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: uuid }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ ok: false, message: "Error de conexion al validar" });
    } finally {
      setLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setResult(null);
    setManualMode(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanning(true);

      // Scan using BarcodeDetector API if available, otherwise prompt manual entry
      if ("BarcodeDetector" in window) {
        const detector = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector({
          formats: ["qr_code"],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState !== 4) return;

          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              stopCamera();
              await validateCode(codes[0].rawValue);
            }
          } catch {
            // Ignore detection errors
          }
        }, 300);
      }
    } catch {
      setResult({
        ok: false,
        message: "No se pudo acceder a la camara. Usa el modo manual.",
      });
      setManualMode(true);
    }
  }, [stopCamera, validateCode]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await validateCode(manualCode.trim());
    setManualCode("");
  };

  const reset = () => {
    stopCamera();
    setResult(null);
    setManualCode("");
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Result display */}
      {result && (
        <div
          className={`mb-6 rounded-xl p-8 text-center ${
            result.ok
              ? "bg-green-50 border-2 border-green-200"
              : "bg-red-50 border-2 border-red-200"
          }`}
        >
          {result.ok ? (
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          ) : (
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
          )}

          <p
            className={`text-xl font-bold mb-2 ${
              result.ok ? "text-green-700" : "text-red-700"
            }`}
          >
            {result.ok ? "Acceso permitido" : "Acceso denegado"}
          </p>

          <p className={`text-sm ${result.ok ? "text-green-600" : "text-red-600"}`}>
            {result.message}
          </p>

          {result.nombre && (
            <p className="mt-3 text-lg font-semibold text-gray-700">
              {result.nombre}
            </p>
          )}
          {result.evento && (
            <p className="text-sm text-gray-500">{result.evento}</p>
          )}

          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} />
            Escanear otro
          </button>
        </div>
      )}

      {/* Camera view */}
      {!result && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
            {scanning ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full aspect-square object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white/80 rounded-lg shadow-lg" />
                </div>
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-lg px-6 py-3 text-sm font-medium">
                      Validando...
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center bg-gray-50 gap-4 p-8">
                <Camera size={64} className="text-gray-300" />
                <p className="text-gray-400 text-sm text-center">
                  Presiona el boton para activar la camara y escanear un QR
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {scanning ? (
              <button
                onClick={stopCamera}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                <CameraOff size={18} />
                Detener camara
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                <Camera size={18} />
                Activar camara
              </button>
            )}

            <button
              onClick={() => {
                stopCamera();
                setManualMode(!manualMode);
                setResult(null);
              }}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              title="Ingresar codigo manualmente"
            >
              <Keyboard size={18} />
            </button>
          </div>

          {/* Manual entry */}
          {manualMode && (
            <form onSubmit={handleManualSubmit} className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Codigo de entrada (UUID)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="ej: 550e8400-e29b-41d4-a716-446655440000"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <button
                  type="submit"
                  disabled={loading || !manualCode.trim()}
                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
                >
                  {loading ? "..." : "Validar"}
                </button>
              </div>
            </form>
          )}

          {!("BarcodeDetector" in globalThis) && scanning && (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
              Tu navegador no soporta deteccion automatica de QR. Usa el modo
              manual o prueba con Chrome en Android.
            </p>
          )}
        </>
      )}
    </div>
  );
}
