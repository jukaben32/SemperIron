import type { Metadata } from "next";
import "./globals.css";

// Metadatos que usará Google y las redes sociales
export const metadata: Metadata = {
  title: "Semper Iron Design — Soldadura Móvil",
  description: "Soldadura móvil certificada AWS D1.1: reparaciones, estructuras y herrería a domicilio. Cotizaciones y presupuestos en minutos."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}