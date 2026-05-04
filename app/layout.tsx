import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Nova Recover — Recuperá ventas perdidas en TiendaNube",
  description: "Sistema automatizado de recuperación de carritos abandonados para tiendas TiendaNube. Conectá tu tienda, activá el sistema y recuperá ventas en piloto automático.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#F1F5F9] antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
