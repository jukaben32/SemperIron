// Guardado local de los últimos documentos generados (presupuesto / cotización / factura).
// Se guardan en el navegador (localStorage), así se pueden abrir y editar sin empezar de cero.

import type { CustomerInfo, DocItem, DocType } from "./DocumentGenerator";

const STORAGE_KEY = "semper_recent_docs";
const DOC_TYPE_KEYS: DocType[] = ["estimate", "quote", "invoice"];

// Cantidad máxima de documentos que se recuerdan
export const MAX_SAVED_DOCS = 3;

// Un documento guardado: lo necesario para volver a llenar el formulario
export interface SavedDoc {
  id: string;
  number: string;
  docType: DocType;
  customer: CustomerInfo;
  items: DocItem[];
  notes: string;
  savedAt: string; // fecha ISO del último guardado
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const asString = (v: unknown): string => (typeof v === "string" ? v : "");
const asNumber = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

// Convierte un dato leído del navegador en un documento válido (o null si está dañado)
function parseSavedDoc(raw: unknown): SavedDoc | null {
  if (!isRecord(raw) || !isRecord(raw.customer) || !Array.isArray(raw.items)) return null;
  const docType = DOC_TYPE_KEYS.find((k) => k === raw.docType);
  const id = asString(raw.id);
  if (!docType || !id) return null;

  const items: DocItem[] = raw.items.filter(isRecord).map((it, i) => ({
    id: asNumber(it.id) || Date.now() + i,
    description: asString(it.description),
    qty: asNumber(it.qty),
    unit: asString(it.unit) || "unit",
    price: asNumber(it.price),
    tax: it.tax !== false
  }));

  return {
    id,
    number: asString(raw.number),
    docType,
    customer: {
      fullName: asString(raw.customer.fullName),
      phone: asString(raw.customer.phone),
      email: asString(raw.customer.email),
      address: asString(raw.customer.address)
    },
    items,
    notes: asString(raw.notes),
    savedAt: asString(raw.savedAt)
  };
}

// Lee los documentos guardados (si el navegador no permite guardar, devuelve lista vacía)
export function loadSavedDocs(): SavedDoc[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseSavedDoc)
      .filter((d): d is SavedDoc => d !== null)
      .slice(0, MAX_SAVED_DOCS);
  } catch {
    return [];
  }
}

// Guarda la lista de documentos; devuelve false si el navegador no lo permitió
export function persistSavedDocs(docs: SavedDoc[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs.slice(0, MAX_SAVED_DOCS)));
    return true;
  } catch {
    return false;
  }
}
