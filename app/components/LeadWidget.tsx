'use client';

import { useState } from "react";
import { CheckCircle2, MessageSquare, Phone, Send, X } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50";

const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400";

// Widget flotante: formulario de solicitud de visita/cotización que crea un lead en la API
export default function LeadWidget() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    zone: "",
    projectType: "reparacion",
    preferredDate: "",
    message: ""
  });

  // Actualiza un campo del formulario
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Nombre y teléfono son obligatorios.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "widget" })
      });
      if (!res.ok) throw new Error("error");
      setSent(true);
    } catch {
      setError("No se pudo enviar. Inténtalo de nuevo o llámanos al (809) 256-3749.");
    } finally {
      setSending(false);
    }
  }

  function close() {
    setOpen(false);
    setSent(false);
    setError("");
  }

  return (
    <>
      {/* Botón flotante fijo en la esquina inferior derecha */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-950 shadow-xl shadow-amber-500/30 transition hover:bg-amber-400"
      >
        <MessageSquare className="h-5 w-5" />
        <span>Solicitar visita</span>
      </button>

      {/* Modal del formulario */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="mt-10 w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl">
            {sent ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-amber-400" />
                <h3 className="text-lg font-bold text-slate-100">¡Solicitud enviada!</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Te contactaremos pronto para coordinar la visita. Si es urgente, llámanos al
                  {" "}
                  <a className="font-semibold text-amber-400" href="tel:18092563749">
                    (809) 256-3749
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wide text-slate-100">
                      Solicitar visita
                    </h3>
                    <p className="text-xs text-slate-400">
                      Presupuesto y visita a domicilio sin compromiso.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className={labelCls}>Nombre *</label>
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Tu nombre"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Teléfono *</label>
                    <input
                      className={inputCls}
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="809-000-0000"
                      type="tel"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      className={inputCls}
                      value={form.email}
                      onChange={set("email")}
                      placeholder="tucorreo@ejemplo.com"
                      type="email"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Zona / Dirección</label>
                    <input
                      className={inputCls}
                      value={form.zone}
                      onChange={set("zone")}
                      placeholder="Barrio, municipio o referencia"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tipo de trabajo</label>
                    <select className={inputCls} value={form.projectType} onChange={set("projectType")}>
                      <option value="reparacion">Reparación / soldadura en sitio</option>
                      <option value="reja">Rejas y verjas</option>
                      <option value="porton">Portón metálico</option>
                      <option value="estructura">Estructura / soporte metálico</option>
                      <option value="escalera">Escalera o baranda</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Día preferido</label>
                    <input
                      className={inputCls}
                      value={form.preferredDate}
                      onChange={set("preferredDate")}
                      type="date"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Describe el trabajo</label>
                    <textarea
                      className={inputCls}
                      value={form.message}
                      onChange={set("message")}
                      placeholder="Cuéntanos qué necesitas soldar o fabricar..."
                      rows={3}
                      maxLength={2000}
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? "Enviando..." : "Enviar solicitud"}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3.5 w-3.5" />
                    Prefieres llamar?{" "}
                    <a href="tel:18092563749" className="font-semibold text-amber-400">
                      (809) 256-3749
                    </a>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}