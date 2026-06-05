"use client";

import { Mail, MessageCircle, Send } from "lucide-react";
import { useState, FormEvent } from "react";

export default function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, mensaje }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error enviando mensaje");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error enviando mensaje");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Contacto</h1>
      <p className="text-gray-500 mb-8">
        Escribinos por cualquiera de estos canales o completa el formulario.
      </p>

      {/* Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <a
          href="mailto:soporte@holistica.com"
          className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <Mail size={28} className="text-[var(--color-primary)]" />
          <span className="font-medium">Email</span>
          <span className="text-xs text-gray-400">soporte@holistica.com</span>
        </a>
        <a
          href="https://t.me/holistica_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <Send size={28} className="text-[var(--color-primary)]" />
          <span className="font-medium">Telegram</span>
          <span className="text-xs text-gray-400">@holistica_bot</span>
        </a>
        <a
          href="https://instagram.com/holistica"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <MessageCircle size={28} className="text-[var(--color-primary)]" />
          <span className="font-medium">Instagram</span>
          <span className="text-xs text-gray-400">@holistica</span>
        </a>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Enviar mensaje</h2>

        {sent ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">&#10003;</div>
            <p className="text-lg font-medium text-green-700">Mensaje enviado</p>
            <p className="text-gray-500 text-sm mt-1">
              Te responderemos a la brevedad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                rows={5}
                required
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                placeholder="En que podemos ayudarte?"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
