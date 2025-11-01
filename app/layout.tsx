import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nola Analytics - Restaurant Analytics Platform",
  description: "Analytics poderoso e flexível para restaurantes. Transforme dados em insights acionáveis.",
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
