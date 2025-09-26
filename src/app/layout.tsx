import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header"; // Importar Header

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Semillero Digital Dashboard",
  description: "Un complemento para Google Classroom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Header /> {/* Añadir Header aquí */}
        <main>{children}</main>
      </body>
    </html>
  );
}
