import "./globals.css";
import type { Metadata } from "next";
import MSWProvider from "@/components/MSWProvider";

export const metadata: Metadata = {
  title: "Reta-T",
  description: "Plataforma de gestión deportiva amateur",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
        <MSWProvider>{children}</MSWProvider>
      </body>
    </html>
  );
}