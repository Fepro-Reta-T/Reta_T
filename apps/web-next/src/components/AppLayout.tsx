"use client";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        {/* Spacer para el sidebar en desktop */}
        <div className="hidden md:block w-20 shrink-0" />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
