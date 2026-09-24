'use client';

// Generador de documentos (presupuesto / cotización / factura) que vive en el panel
// de administración de Semper Iron. Permite llenar los datos del cliente y las líneas
// de trabajo, ver el total en vivo, bajar el documento como PDF (imprimir/guardar) y
// enviarlo por WhatsApp directamente al teléfono del cliente.

import { useState, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Flame, MessageCircle, Plus, Printer, Receipt, Trash2 } from "lucide-react";

// Estilos de la tabla del documento imprimible (PDF)
const printTh = { padding: "8px 10px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#334155", textTransform: "uppercase", letterSpacing: "1px", fontSize: "11px", textAlign: "left" as const };
const printTd = { padding: "10px", border: "1px solid #e2e8f0", color: "#0f172a", verticalAlign: "top" as const };

// Datos de la empresa que aparecen en el encabezado del documento
const COMPANY = {
  name: "Semper Iron Design",
  phone: "(809) 256-3749",
  email: "dispatch@semperirondesign.com",
  address: "Calle Consuelo #32, Sector Jhon Fitzgerald Kennedy, San Pedro de Macorís, República Dominicana",
  tagline: "AWS D1.1 Certified • OSHA 30 • Fully Insured"
};

// Datos bancarios para cobro (método de pago habitual del soldador)
const BANK = {
  bank: "Banreservas",
  accountNumber: "9605023620",
  accountName: "Milton Rafael Semper Ortiz",
  identification: "023-0102370-7"
};

// Tipos de documento: presupuesto, cotización y factura. Cada uno adapta
// el título del encabezado, el prefijo del número, los impuestos y los términos.
const DOC_TYPES = {
  estimate: {
    label: "Cost Estimate",
    title: "COST ESTIMATE",
    numberPrefix: "EST",
    validity: "This cost estimate is valid for 15 days from the date above. Final charges may vary with on-site conditions, material prices, and power access.",
    payTerms: "Advance: 50% deposit to schedule the job. Balance due upon completion.",
    footer: "Estimates are non-binding and become a fixed quotation only after written acceptance."
  },
  quote: {
    label: "Quotation",
    title: "QUOTATION",
    numberPrefix: "QTE",
    validity: "This quotation is valid for 30 days from the date above. Changes to scope, material, or site conditions may adjust the quoted price.",
    payTerms: "Advance: 50% deposit to confirm the job and order materials. Balance due on completion.",
    footer: "Work is authorized upon confirmation of accepted terms. Labor warranty covers workmanship only."
  },
  invoice: {
    label: "Invoice",
    title: "INVOICE",
    numberPrefix: "INV",
    validity: "Please remit payment within 15 days of the invoice date. Late payments are subject to a 1.5% monthly service charge.",
    payTerms: "Advance paid at booking was deducted from this balance. Payment due within 15 days.",
    footer: "Thank you for your business. Mobile dispatch (809) 256-3749."
  }
} as const;

type DocType = keyof typeof DOC_TYPES;

// Datos del cliente del documento
interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

// Una línea de trabajo del documento (descripción, cantidad, unidad y precio)
interface DocItem {
  id: number;
  description: string;
  qty: number;
  unit: string;
  price: number;
}

// Resultado final del documento generado (con su desglose de subtotal e impuestos)
interface DocResult {
  type: DocType;
  number: string;
  date: string;
  dueDate: string | null;
  customer: CustomerInfo;
  items: DocItem[];
  description: string;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

// Formatea un número como moneda en dólares
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// Genera un número de documento único según su prefijo: EST-2026-4821, QTE-2026-7731 o INV-2026-9044
const generateDocNumber = (prefix: string) => {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `${prefix}-${year}-${seq}`;
};

export default function DocumentGenerator() {
  const [docType, setDocType] = useState<DocType>("estimate");
  const [docItems, setDocItems] = useState<DocItem[]>([{ id: Date.now(), description: "", qty: 1, unit: "hr", price: 0 }]);
  const [taxRate, setTaxRate] = useState(8);
  const [docResult, setDocResult] = useState<DocResult | null>(null);
  const [warn, setWarn] = useState("");
  const [customer, setCustomer] = useState<CustomerInfo>({ fullName: "", phone: "", email: "", address: "" });
  const [notes, setNotes] = useState("");

  // Añade, elimina o actualiza líneas de ítems del documento
  const addDocItem = () => setDocItems([...docItems, { id: Date.now(), description: "", qty: 1, unit: "hr", price: 0 }]);
  const removeDocItem = (id: number) => setDocItems(docItems.length > 1 ? docItems.filter((it) => it.id !== id) : docItems);
  const updateDocItem = (id: number, field: string, value: string | number) =>
    setDocItems(docItems.map((it) => (it.id === id ? ({ ...it, [field]: value } as DocItem) : it)));

  // Total en vivo de las líneas (y del impuesto si es factura)
  const itemsTotal = docItems.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const itemsTax = (Number(taxRate) || 0) / 100 * itemsTotal;
  const grandTotal = docType === "invoice" ? itemsTotal + itemsTax : itemsTotal;

  // Genera el documento final (presupuesto, cotización o factura) con su desglose
  const handleDocSubmit = (e: FormEvent) => {
    e.preventDefault();
    setWarn("");
    const validItems = docItems.filter((it) => it.description.trim());
    const subtotal = validItems.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const useTax = docType === "invoice";
    const tax = useTax ? subtotal * (Number(taxRate) || 0) / 100 : 0;
    const meta = DOC_TYPES[docType];
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const due = new Date(today);
    due.setDate(due.getDate() + 15);
    const dueStr = due.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    setDocResult({
      type: docType,
      number: generateDocNumber(meta.numberPrefix),
      date: dateStr,
      dueDate: useTax ? dueStr : null,
      customer: { ...customer },
      items: validItems,
      description: notes,
      taxRate: useTax ? Number(taxRate) : 0,
      subtotal,
      tax,
      total: subtotal + tax
    });
  };

  // Envía por WhatsApp un resumen legible del documento al teléfono del cliente
  const sendViaWhatsApp = () => {
    if (!docResult) return;
    const d = docResult;
    const meta = DOC_TYPES[d.type];
    const digits = (d.customer.phone || "").replace(/[^0-9]/g, "");
    if (!digits) {
      setWarn("Escribe el teléfono del cliente en el formulario para poder enviarle el documento por WhatsApp.");
      return;
    }
    const lines = d.items.map((it) => `• ${it.description} — ${it.qty} ${it.unit} x ${money(it.price)} = ${money(it.qty * it.price)}`);
    const msg = [
      `*${meta.title} #${d.number}* - ${COMPANY.name}`,
      `Date: ${d.date}`,
      d.dueDate ? `Due: ${d.dueDate}` : "",
      "",
      `*Client:* ${d.customer.fullName}`,
      `*Phone:* ${d.customer.phone}`,
      d.customer.address ? `*Site:* ${d.customer.address}` : "",
      d.customer.email ? `*Email:* ${d.customer.email}` : "",
      "",
      ...lines,
      "",
      d.type === "invoice" ? `*Subtotal: ${money(d.subtotal)}*` : "",
      d.type === "invoice" ? `*Tax (${d.taxRate}%): ${money(d.tax)}*` : "",
      `*TOTAL: ${money(d.total)}*`,
      "",
      `*Payment:* ${BANK.bank} — Account ${BANK.accountNumber}`,
      `Name: ${BANK.accountName} (Cédula ${BANK.identification})`,
      meta.payTerms
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Actualiza un campo del formulario del cliente
  const setCust = (key: keyof CustomerInfo) => (e: ChangeEvent<HTMLInputElement>) =>
    setCustomer({ ...customer, [key]: e.target.value });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
      {docResult ? (
        /* Vista previa del documento generado + acciones (descargar/enviar) */
        <div className="space-y-5">
          <div className="mb-2">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-amber-500">
              <Receipt className="mr-1 inline h-3.5 w-3.5" />Documento generado
            </span>
            <h3 className="text-2xl font-black uppercase text-white">{DOC_TYPES[docResult.type].title}</h3>
            <p className="mt-1 text-xs text-slate-400">
              #{docResult.number} • {docResult.date}
              {docResult.dueDate ? ` • Vence: ${docResult.dueDate}` : ""} — preparado para {docResult.customer.fullName}
            </p>
          </div>

          {/* Tabla con los encabezados solicitados */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <div className="grid grid-cols-[1fr_3.5rem_4rem_4rem] sm:grid-cols-[1fr_4.5rem_5.5rem_5.5rem] gap-3 border-b border-slate-800 bg-slate-900 px-3 py-2 text-[10px] sm:px-5 font-black uppercase tracking-widest text-slate-500">
              <span>Line Item</span>
              <span className="text-right">Cantidad</span>
              <span className="text-right">Precio</span>
              <span className="text-right">Total</span>
            </div>
            <div className="divide-y divide-slate-800 text-sm">
              {docResult.items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_3.5rem_4rem_4rem] sm:grid-cols-[1fr_4.5rem_5.5rem_5.5rem] items-center gap-3 px-3 py-3 sm:px-5">
                  <span className="pr-2 text-slate-300">{it.description}</span>
                  <span className="text-right text-slate-400">{it.qty} {it.unit}</span>
                  <span className="text-right text-slate-400">{money(it.price)}</span>
                  <span className="text-right font-semibold text-white">{money(it.qty * it.price)}</span>
                </div>
              ))}
              {docResult.type === "invoice" && (
                <>
                  <div className="grid grid-cols-[1fr_3.5rem_4rem_4rem] sm:grid-cols-[1fr_4.5rem_5.5rem_5.5rem] gap-3 px-3 py-3 sm:px-5">
                    <span className="col-span-3 pr-4 text-slate-400">Subtotal</span>
                    <span className="shrink-0 text-right font-semibold text-white">{money(docResult.subtotal)}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_3.5rem_4rem_4rem] sm:grid-cols-[1fr_4.5rem_5.5rem_5.5rem] gap-3 px-3 py-3 sm:px-5">
                    <span className="col-span-3 pr-4 text-slate-400">Tax ({docResult.taxRate}%)</span>
                    <span className="shrink-0 text-right font-semibold text-white">{money(docResult.tax)}</span>
                  </div>
                </>
              )}
              <div className="grid grid-cols-[1fr_3.5rem_4rem_4rem] sm:grid-cols-[1fr_4.5rem_5.5rem_5.5rem] items-center gap-3 bg-amber-500/10 px-3 py-4 sm:px-5">
                <span className="col-span-3 font-black uppercase tracking-wide text-white">
                  {docResult.type === "invoice" ? "Amount Due" : "Document Total"}
                </span>
                <span className="text-right text-xl font-black text-amber-400">{money(docResult.total)}</span>
              </div>
            </div>
          </div>

          {/* Datos de pago: banco, cuenta y cédula */}
          <div className="overflow-hidden rounded-xl border border-amber-500/30 bg-slate-950">
            <div className="border-b border-amber-500/20 bg-amber-500/5 px-5 py-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">Payment — Bank Transfer / Deposit</span>
            </div>
            <div className="space-y-1 px-5 py-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Bank</span>
                <span className="font-semibold text-white">{BANK.bank}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Account #</span>
                <span className="font-semibold text-white">{BANK.accountNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Name</span>
                <span className="font-semibold text-white">{BANK.accountName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">ID (Cédula)</span>
                <span className="font-semibold text-white">{BANK.identification}</span>
              </div>
            </div>
          </div>

          {warn && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{warn}</p>
          )}

          <p className="text-xs leading-relaxed text-slate-500">
            Baja el documento como PDF (botón "Download PDF" abre el diálogo de imprimir:
            elige "Guardar como PDF"). El botón de WhatsApp lo envía al teléfono del cliente escrito arriba.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-sm font-black text-slate-950 transition-colors hover:from-amber-400 hover:to-orange-500"
            >
              <Printer className="h-4 w-4" />
              Descargar PDF
            </button>
            <button
              onClick={sendViaWhatsApp}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-black text-white transition-colors hover:bg-green-500"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar por WhatsApp
            </button>
          </div>

          <button
            onClick={() => { setDocResult(null); setWarn(""); }}
            className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al formulario
          </button>
        </div>
      ) : (
        /* Formulario del documento */
        <div>
          <div className="mb-6">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-amber-500">Business Document Generator</span>
            <h3 className="text-2xl font-black uppercase text-white">Estimate • Quote • Invoice</h3>
            <p className="mt-1 text-xs text-slate-400">Crea aquí el documento profesional para tu cliente.</p>
          </div>

          <form onSubmit={handleDocSubmit} className="space-y-4">
            {/* Tipo de documento */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-300">Document Type</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(Object.keys(DOC_TYPES) as DocType[]).map((key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setDocType(key)}
                    className={`rounded-xl border px-3 py-3 text-[11px] font-bold uppercase tracking-wide transition-all ${
                      docType === key
                        ? "border-amber-500 bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {DOC_TYPES[key].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Datos del cliente */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre del cliente"
                  value={customer.fullName}
                  onChange={setCust("fullName")}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-300">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="(809) 000-0000"
                  value={customer.phone}
                  onChange={setCust("phone")}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-300">Email (for delivery)</label>
              <input
                type="email"
                placeholder="correo@cliente.com"
                value={customer.email}
                onChange={setCust("email")}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-300">Site Location / Address *</label>
              <input
                type="text"
                required
                placeholder="Dirección del trabajo"
                value={customer.address}
                onChange={setCust("address")}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Líneas de ítems */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-300">Line Items</label>
              {/* Encabezados de las columnas del documento (ocultos en móvil) */}
              <div className="mb-1 hidden items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 sm:flex">
                <span className="flex-1">Line Item</span>
                <span className="w-40">Cantidad</span>
                <span className="w-24 text-right">Precio</span>
                <span className="w-24 text-right">Total</span>
                <span className="w-9" />
              </div>
              <div className="space-y-2">
                {docItems.map((item, idx) => (
                  // En móvil cada línea se apila verticalmente para que no se desborde
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:flex-row sm:items-center sm:gap-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0"
                  >
                    <input
                      value={item.description}
                      onChange={(e) => updateDocItem(item.id, "description", e.target.value)}
                      placeholder={`Item ${idx + 1} description (e.g. Structural beam weld)`}
                      className="min-w-0 w-full flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      {/* Cantidad + unidad */}
                      <div className="flex flex-1 flex-col gap-1 sm:w-40 sm:flex-none sm:flex-row sm:items-center sm:gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 sm:hidden">Cantidad</span>
                        <div className="flex flex-1 gap-1">
                          <input
                            type="number" min={0} step={1}
                            value={item.qty}
                            onChange={(e) => updateDocItem(item.id, "qty", e.target.value === "" ? 0 : Number(e.target.value))}
                            className="w-14 rounded-lg border border-slate-800 bg-slate-950 px-2 py-2.5 text-center text-sm text-white focus:border-amber-500 focus:outline-none sm:w-16"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => updateDocItem(item.id, "unit", e.target.value)}
                            className="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-950 px-2 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                          >
                            <option value="hr">hr</option>
                            <option value="job">job</option>
                            <option value="ft">ft</option>
                            <option value="lb">lb</option>
                            <option value="unit">unit</option>
                            <option value="flat">flat</option>
                          </select>
                        </div>
                      </div>
                      {/* Precio */}
                      <div className="flex flex-1 flex-col gap-1 sm:w-24 sm:flex-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 sm:hidden">Precio</span>
                        <input
                          type="number" min={0} step={0.01}
                          value={item.price}
                          onChange={(e) => updateDocItem(item.id, "price", e.target.value === "" ? 0 : Number(e.target.value))}
                          placeholder="Precio"
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-2.5 text-right text-sm text-white focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      {/* Total de la línea */}
                      <div className="flex w-20 flex-col gap-1 sm:w-24 sm:flex-none">
                        <span className="text-[10px] font-black uppercase tracking-widest text-right text-slate-500 sm:hidden">Total</span>
                        <span className="truncate text-right text-sm font-semibold text-amber-400">
                          {money((Number(item.qty) || 0) * (Number(item.price) || 0))}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocItem(item.id)}
                        disabled={docItems.length === 1}
                        className="w-9 shrink-0 self-center rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-red-400 disabled:opacity-30"
                        title="Eliminar línea"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addDocItem}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 transition-colors hover:text-amber-300"
              >
                <Plus className="h-4 w-4" /> Añadir línea
              </button>
            </div>

            {/* Impuestos (solo factura) */}
            {docType === "invoice" && (
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-300">Tax Rate (%)</label>
                <input
                  type="number" min={0} max={30} step={0.1}
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}

            {/* Total en vivo */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{money(itemsTotal)}</span>
              </div>
              {docType === "invoice" && (
                <div className="flex justify-between text-slate-400">
                  <span>Tax ({taxRate}%)</span>
                  <span className="font-semibold text-white">{money(itemsTax)}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t border-slate-800 pt-2 font-bold text-slate-300">
                <span className="uppercase tracking-wide">{docType === "invoice" ? "Amount Due" : "Document Total"}</span>
                <span className="text-amber-400">{money(grandTotal)}</span>
              </div>
            </div>

            {/* Datos de pago: banco, cuenta y cédula */}
            <div className="space-y-1 rounded-xl border border-amber-500/30 bg-slate-950 p-4 text-xs">
              <div className="mb-1 text-[11px] font-black uppercase tracking-widest text-amber-400">Payment — Bank Transfer / Deposit</div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">{BANK.bank} · Account</span>
                <span className="font-bold text-white">{BANK.accountNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Name</span>
                <span className="font-semibold text-white">{BANK.accountName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">ID (Cédula)</span>
                <span className="font-semibold text-white">{BANK.identification}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-300">Job Description / Notes (Opciónal)</label>
              <textarea
                rows={2}
                placeholder="Alcance, especificaciones del metal, condiciones de acceso, notas de pago..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {warn && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{warn}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl transition-all hover:from-amber-400 hover:to-orange-500"
            >
              Generar {DOC_TYPES[docType].label}
            </button>
          </form>
        </div>
      )}

      {/* Documento imprimible: solo se muestra al imprimir/guardar como PDF.
          Se pinta al final del <body> con un portal para que imprima limpio
          (sin el resto del panel oscuro). */}
      {docResult &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="doc-print-doc"
            className="hidden print:block"
            style={{ background: "#ffffff", color: "#0f172a", fontFamily: "Arial, Helvetica, sans-serif", padding: "36px 42px" }}
          >
            {/* Cabecera de la empresa */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #f59e0b", paddingBottom: "16px", marginBottom: "22px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "#f59e0b", color: "#0f172a", fontWeight: 900, borderRadius: "8px", padding: "8px", display: "flex" }}>
                    <Flame style={{ width: 22, height: 22 }} />
                  </div>
                  <span style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "-0.5px" }}>
                    SEMPER<span style={{ color: "#f59e0b" }}>IRON</span> DESIGN
                  </span>
                </div>
                <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "#64748b", marginTop: "4px" }}>
                  Mobile Welding & Fabrication
                </p>
              </div>
              <div style={{ textAlign: "right", fontSize: "12px", color: "#334155", lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700 }}>Mobile Dispatch {COMPANY.phone}</div>
                <div>{COMPANY.email}</div>
                <div>{COMPANY.address}</div>
                <div>{COMPANY.tagline}</div>
              </div>
            </div>

            {/* Título del documento y numeración */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "18px" }}>
              <div>
                <h1 style={{ fontSize: "20px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px" }}>
                  {DOC_TYPES[docResult.type].title}
                </h1>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
                  {DOC_TYPES[docResult.type].label} — On-Site Welding & Metal Fabrication
                </div>
              </div>
              <div style={{ fontSize: "12px", textAlign: "right", lineHeight: 1.7 }}>
                <div><strong>{DOC_TYPES[docResult.type].numberPrefix}:</strong> {docResult.number}</div>
                <div><strong>Date:</strong> {docResult.date}</div>
                {docResult.dueDate && <div><strong>Due:</strong> {docResult.dueDate}</div>}
              </div>
            </div>

            {/* Datos del cliente */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px 16px", marginBottom: "20px", fontSize: "13px", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", color: "#64748b", marginBottom: "6px" }}>Prepared For</div>
              <div><strong>{docResult.customer.fullName}</strong>{docResult.customer.email ? ` — ${docResult.customer.email}` : ""}</div>
              <div>Phone: {docResult.customer.phone}</div>
              <div>Job Site: {docResult.customer.address}</div>
            </div>

            {/* Tabla de líneas de ítems */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "18px" }}>
              <thead>
                <tr>
                  <th style={printTh}>Line Item</th>
                  <th style={{ ...printTh, textAlign: "right" }}>Cantidad</th>
                  <th style={{ ...printTh, textAlign: "right" }}>Precio</th>
                  <th style={{ ...printTh, textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {docResult.items.map((it, i) => (
                  <tr key={i}>
                    <td style={printTd}>
                      <div style={{ fontWeight: 700 }}>{it.description}</div>
                    </td>
                    <td style={{ ...printTd, textAlign: "right" }}>{it.qty} {it.unit}</td>
                    <td style={{ ...printTd, textAlign: "right" }}>{money(it.price)}</td>
                    <td style={{ ...printTd, textAlign: "right", fontWeight: 700 }}>{money(it.qty * it.price)}</td>
                  </tr>
                ))}
                {docResult.type === "invoice" && (
                  <>
                    <tr>
                      <td style={{ ...printTd, textAlign: "right", fontWeight: 600, borderTop: "1px solid #e2e8f0" }} colSpan={3}>Subtotal</td>
                      <td style={{ ...printTd, textAlign: "right", fontWeight: 700, borderTop: "1px solid #e2e8f0" }}>{money(docResult.subtotal)}</td>
                    </tr>
                    <tr>
                      <td style={{ ...printTd, textAlign: "right", fontWeight: 600 }} colSpan={3}>Tax ({docResult.taxRate}%)</td>
                      <td style={{ ...printTd, textAlign: "right", fontWeight: 700 }}>{money(docResult.tax)}</td>
                    </tr>
                  </>
                )}
                <tr>
                  <td style={{ ...printTd, borderTop: "2px solid #f59e0b", fontWeight: 900, fontSize: "14px" }} colSpan={3}>
                    {docResult.type === "invoice" ? "Amount Due" : "Document Total"}
                  </td>
                  <td style={{ ...printTd, borderTop: "2px solid #f59e0b", textAlign: "right", fontSize: "18px", fontWeight: 900 }}>{money(docResult.total)}</td>
                </tr>
              </tbody>
            </table>

            {/* Notas del trabajo */}
            {docResult.description && (
              <div style={{ fontSize: "12px", color: "#334155", marginBottom: "16px", lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", marginBottom: "4px" }}>Job Notes</div>
                <div>{docResult.description}</div>
              </div>
            )}

            {/* Datos de pago */}
            <div style={{ border: "1px solid #f59e0b", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", background: "#fffbeb" }}>
              <div style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px", color: "#92400e", marginBottom: "8px" }}>Payment — Bank Transfer / Deposit</div>
              <div style={{ fontSize: "13px", lineHeight: 1.8, color: "#0f172a" }}>
                <div><strong>Bank:</strong> {BANK.bank} &nbsp;·&nbsp; <strong>Account #:</strong> {BANK.accountNumber}</div>
                <div><strong>Name:</strong> {BANK.accountName}</div>
                <div><strong>ID (Cédula):</strong> {BANK.identification}</div>
                <div style={{ color: "#92400e", fontWeight: 600, fontSize: "12px", marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed #f59e0b" }}>
                  {DOC_TYPES[docResult.type].payTerms} Include the {DOC_TYPES[docResult.type].numberPrefix} number as payment reference.
                </div>
              </div>
            </div>

            {/* Términos */}
            <div style={{ borderTop: "2px solid #f59e0b", paddingTop: "12px", fontSize: "11px", color: "#64748b", lineHeight: 1.7 }}>
              <strong style={{ color: "#334155" }}>Terms:</strong> {DOC_TYPES[docResult.type].validity}
              <div style={{ marginTop: "30px", textAlign: "center", fontWeight: 700, color: "#0f172a", letterSpacing: "2px" }}>
                — {COMPANY.name} —
              </div>
              <div style={{ textAlign: "center", marginTop: "4px" }}>
                {DOC_TYPES[docResult.type].footer}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}