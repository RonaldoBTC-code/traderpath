import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraderPath — Aprende Trading Jugando",
  description:
    "Videojuego educativo de trading financiero. Aprende análisis técnico, gestión de riesgo y psicología del trading con capital virtual.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-tp-base text-tp-text antialiased font-body">
        {children}
      </body>
    </html>
  );
}
