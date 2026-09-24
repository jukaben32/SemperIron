// Migración: crea la tabla "leads" en Neon.
// Uso: npm run migrate  (necesita DATABASE_URL_UNPOOLED o DATABASE_URL en .env.local)

import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "fs";

// Carga .env.local manualmente (sin dependencias extra)
const envPath = new URL("../.env.local", import.meta.url);
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL en .env.local");
  process.exit(1);
}

// Para migraciones usamos la conexión directa (sin pooler), como recomienda Neon
const sql = neon(url);

const statements = [
  `CREATE TABLE IF NOT EXISTS leads (
    id             SERIAL PRIMARY KEY,
    name           TEXT NOT NULL,
    phone          TEXT NOT NULL,
    email          TEXT,
    zone           TEXT,
    project_type   TEXT,
    preferred_date TEXT,
    message        TEXT,
    status         TEXT NOT NULL DEFAULT 'nuevo'
                   CHECK (status IN ('nuevo', 'contactado', 'ganado', 'perdido')),
    source         TEXT NOT NULL DEFAULT 'widget',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC)`
];

for (const statement of statements) {
  await sql(statement);
  console.log("OK:", statement.split("\n")[0].slice(0, 60));
}

// Verifica que la tabla quedó creada con sus columnas
const rows = await sql(
  `SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'leads' ORDER BY ordinal_position`
);
console.log("\nColumnas de la tabla leads:");
console.table(rows);
console.log("Migración completada.");