'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Flame, LogOut, RefreshCw, Trash2, Inbox, FileText, Sparkles } from "lucide-react";
import DocumentGenerator from "../components/DocumentGenerator";

// Estados y colores de los leads
const STATUSES = [
  { key: "nuevo", label: "Nuevo", color: "bg-sky-500/15 text-sky-300 border-sky-500/40" },
  { key: "contactado", label: "Contactado", color: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  { key: "ganado", label: "Ganado", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  { key: "perdido", label: "Perdido", color: "bg-rose-500/15 text-rose-300 border-rose-500/40" }
];

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  zone: string | null;
  project_type: string | null;
  preferred_date: string | null;
  message: string | null;
  status: string;
  source: string | null;
  created_at: string;
}

// Texto de ayuda: instrucciones listas para pegar en Gemini y calcular materiales
const GEMINI_PROMPT = `Eres un maestro soldador y fabricador de estructuras metálicas. Te voy a dar una tarea/trabajo de soldadura (y quizás una foto del lugar). Quiero que calcules los materiales necesarios:
- Vigas H, barras cuadradas, perfiles, tubos o planchas (cantidad en pies o metros)
- Libras de varillas/electrodos para soldar
- Cortes, herramientas y consejos de seguridad
Si te subo una foto, describe el trabajo y estima las cantidades.`;

// Panel de administración: lista de leads con cambios de estado
export default function AdminDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"leads" | "docs" | "gemini">("leads");
  const [copied, setCopied] = useState(false);

  // 1) Verifica la sesión; 2) carga los leads
  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me");
        if (me.status === 401) {
          router.replace("/admin/login");
          return;
        }
        await loadLeads();
      } catch {
        setError("No se pudo conectar con el servidor.");
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadLeads() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads");
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      setLeads(data.leads ?? []);
    } catch {
      setError("No se pudieron cargar los leads.");
    } finally {
      setLoading(false);
    }
  }

  // Cambia el estado de un lead vía PATCH y refresca la lista
  async function changeStatus(lead: Lead, status: string) {
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      await loadLeads();
    } catch {
      setError("No se pudo cambiar el estado.");
    }
  }

  // Elimina un lead con confirmación
  async function removeLead(lead: Lead) {
    if (!confirm(`¿Eliminar el lead de ${lead.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
      await loadLeads();
    } catch {
      setError("No se pudo eliminar el lead.");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  // Leads según el filtro activo
  const visible = useMemo(() => {
    if (!leads) return [];
    return filter === "todos" ? leads : leads.filter((l) => l.status === filter);
  }, [leads, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: leads?.length ?? 0 };
    for (const s of STATUSES) c[s.key] = 0;
    for (const l of leads ?? []) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  function formatDate(value: string) {
    return new Date(value).toLocaleString("es-DO", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  // Etiqueta legible para el tipo de proyecto
  function projectLabel(value: string | null) {
    const map: Record<string, string> = {
      reparacion: "Reparación en sitio",
      reja: "Rejas",
      porton: "Portón",
      estructura: "Estructura metálica",
      escalera: "Escalera o baranda",
      estimate: "Presupuesto",
      quote: "Cotización",
      invoice: "Factura",
      otro: "Otro"
    };
    return (value && map[value]) || value || "—";
  }

  // Copia la instrucción de ayuda para Gemini al portapapeles
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(GEMINI_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin soporte de portapapeles: se ignora
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 print:hidden">
      {/* Barra superior */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <Flame className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wide">Semper Iron</h1>
              <p className="text-[11px] text-slate-400">Panel de control</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadLeads}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-amber-500 hover:text-amber-400"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refrescar
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-rose-500 hover:text-rose-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Pestañas: solicitudes de visita, generador de documentos y Gemini */}
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 pt-6">
        <button
          onClick={() => setTab("leads")}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            tab === "leads"
              ? "border-amber-500 bg-amber-500/10 text-amber-300"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
          }`}
        >
          <Inbox className="h-4 w-4" />
          Solicitudes
        </button>
        <button
          onClick={() => setTab("docs")}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            tab === "docs"
              ? "border-amber-500 bg-amber-500/10 text-amber-300"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
          }`}
        >
          <FileText className="h-4 w-4" />
          Documentos
        </button>
        <button
          onClick={() => setTab("gemini")}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            tab === "gemini"
              ? "border-amber-500 bg-amber-500/10 text-amber-300"
              : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Gemini
        </button>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "docs" ? (
          <DocumentGenerator />
        ) : tab === "gemini" ? (
          <section className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-amber-500/40 bg-slate-900 p-5 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                  <Sparkles className="h-6 w-6 text-slate-950" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-100">
                    Calculador de materiales con Gemini
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Cuando te llegue un trabajo, abre Gemini para calcular cuántos <span className="font-semibold text-slate-200">pies o metros</span> de material necesitas
                    (vigas&nbsp;H, barras cuadradas, perfiles, tubos, etc.), cuántas{" "}
                    <span className="font-semibold text-slate-200">libras de varillas</span> para soldar, y para pedir diseños.
                    Puedes <span className="font-semibold text-slate-200">subir fotos del lugar de trabajo</span> y Gemini te ayuda con el análisis.
                  </p>
                  <a
                    href="https://gemini.google.com/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3.5 text-sm font-black uppercase tracking-wide text-slate-950 shadow-lg shadow-orange-500/20 transition hover:from-amber-400 hover:to-orange-500 sm:w-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir Gemini
                  </a>
                  <p className="mt-2 text-xs text-slate-500">
                    Se abre en una pestaña nueva. Inicia sesión con tu cuenta de Google para usarlo.
                  </p>
                </div>
              </div>

              {/* Instrucciones listas para copiar */}
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Sugerencia de instrucciones para pegar en Gemini
                  </h3>
                  <button
                    type="button"
                    onClick={copyPrompt}
                    className="rounded-lg border border-amber-500/50 px-3 py-1.5 text-xs font-bold text-amber-400 transition hover:bg-amber-500/10"
                  >
                    {copied ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={GEMINI_PROMPT}
                  rows={6}
                  className="mt-3 w-full resize-none rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm leading-relaxed text-slate-300 outline-none"
                />
              </div>
            </div>
          </section>
        ) : (
          <>
        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
        )}

        {/* Contadores por estado */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[{ key: "todos", label: "Todos" }, ...STATUSES].map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                filter === s.key
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-slate-800 bg-slate-900 hover:border-slate-600"
              }`}
            >
              <div className="text-2xl font-black">{counts[s.key] ?? 0}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {s.label}
              </div>
            </button>
          ))}
        </section>

        {/* Lista de leads */}
        <section className="mt-6">
          {loading ? (
            <p className="py-16 text-center text-sm text-slate-500">Cargando leads...</p>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Inbox className="h-10 w-10 text-slate-700" />
              <p className="text-sm text-slate-500">
                No hay leads {filter !== "todos" ? `en estado "${filter}"` : "aún"}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((lead) => {
                const statusMeta = STATUSES.find((s) => s.key === lead.status) ?? STATUSES[0];
                return (
                  <article
                    key={lead.id}
                    className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate font-bold text-slate-100">{lead.name}</h2>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{formatDate(lead.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={lead.status}
                          onChange={(e) => changeStatus(lead, e.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-400"
                        >
                          {STATUSES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeLead(lead)}
                          title="Eliminar lead"
                          className="rounded-lg border border-slate-700 p-1.5 text-slate-500 hover:border-rose-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-1.5 text-sm text-slate-300 sm:grid-cols-2">
                      <p>
                        <span className="text-slate-500">Tel: </span>
                        <a href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`} className="text-amber-400 hover:underline">
                          {lead.phone}
                        </a>
                      </p>
                      {lead.email && (
                        <p className="truncate">
                          <span className="text-slate-500">Email: </span>
                          <a href={`mailto:${lead.email}`} className="text-amber-400 hover:underline">
                            {lead.email}
                          </a>
                        </p>
                      )}
                      {lead.zone && (
                        <p>
                          <span className="text-slate-500">Zona: </span>
                          {lead.zone}
                        </p>
                      )}
                      {lead.project_type && (
                        <p>
                          <span className="text-slate-500">Trabajo: </span>
                          {projectLabel(lead.project_type)}
                        </p>
                      )}
                      {lead.preferred_date && (
                        <p>
                          <span className="text-slate-500">Día preferido: </span>
                          {lead.preferred_date}
                        </p>
                      )}
                      {lead.source && (
                        <p>
                          <span className="text-slate-500">Origen: </span>
                          {lead.source === "widget" ? "Widget visita" : lead.source === "form-cotizacion" ? "Form. cotización" : lead.source}
                        </p>
                      )}
                    </div>

                    {lead.message && (
                      <p className="mt-3 rounded-lg bg-slate-800/60 px-3 py-2 text-sm text-slate-300">
                        {lead.message}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
          </>
        )}
      </main>
    </div>
  );
}