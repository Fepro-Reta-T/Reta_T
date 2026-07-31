import type { Metadata } from "next";
import "./globals.css";
import { MSWProvider } from "../components/MSWProvider";

export const metadata: Metadata = {
  title: "Reta_T — Panel de administración",
  description: "Organización y gestión de torneos deportivos locales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <MSWProvider>{children}</MSWProvider>
      </body>
    </html>
  );
}
