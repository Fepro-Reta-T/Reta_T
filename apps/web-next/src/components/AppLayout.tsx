"use client";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { Role } from "@reta-t/types";

const ORGANIZER_ROLES: Role[] = [Role.ORGANIZER, Role.MATCH_MANAGER, Role.ADMIN];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const isInvitado = localStorage.getItem("invitado") === "true";
    if (isInvitado) return;

    authApi.me().then((user) => {
      if (ORGANIZER_ROLES.includes(user.role)) {
        setShowNav(true);
      }
    }).catch(() => {
      // sin sesión, no mostramos nav
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      {showNav ? (
        <div className="flex flex-1">
          {/* Spacer para el sidebar en desktop */}
          <div className="hidden md:block w-20 shrink-0" />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      ) : (
        <main className="flex-1">
          {children}
        </main>
      )}
      {showNav && <BottomNav />}
    </div>
  );
}
