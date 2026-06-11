import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Taller SaaS — Gestión de talleres mecánicos",
  description:
    "Plataforma de gestión y automatización para talleres mecánicos en México: recepción por WhatsApp, diagnóstico con IA, cotización de refacciones y facturación CFDI 4.0.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B192C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
