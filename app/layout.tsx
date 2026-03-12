import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InmoBot AI - Chatbot Inteligente para Inmobiliarias | Secretium",
  description: "Chatbot con IA para inmobiliarias. Atiende clientes 24/7, agenda visitas, responde preguntas sobre propiedades. Desde 79 EUR/mes.",
  keywords: "chatbot inmobiliaria, ia inmobiliaria, asistente virtual inmobiliaria, automatizacion inmobiliaria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
