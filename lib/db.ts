import { neon } from "@neondatabase/serverless";

// Tipo de la función de consulta: recibe SQL y parámetros, devuelve filas
type SqlFn = (query: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

let cached: SqlFn | null = null;

// Devuelve un cliente a la base de datos (se crea una sola vez y se reutiliza)
export function db(): SqlFn {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("Falta DATABASE_URL en las variables de entorno");
    }
    cached = neon(url) as unknown as SqlFn;
  }
  return cached;
}