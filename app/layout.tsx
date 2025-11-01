import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nola God Level - Restaurant Analytics API",
  description: "Backend API com arquitetura em camadas para análise de dados de restaurantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
