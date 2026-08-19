import "./globals.css";
import type { Metadata } from "next";
import { Outfit, Poppins } from "next/font/google";
import MSWProvider from "@/components/MSWProvider";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

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
    <html lang="es" className={`h-full antialiased dark ${outfit.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.className} min-h-full flex flex-col bg-background text-foreground transition-colors duration-300`}
        suppressHydrationWarning
      >
        <MSWProvider>{children}</MSWProvider>
      </body>
    </html>
  );
}