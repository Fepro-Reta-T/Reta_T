"use client";

import { useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";

export default function PartidosPage() {
  const [isInvitado] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("invitado") === "true";
    }
    return false;
  });

  const [currentUser] = useState<{ id?: string; role?: string } | null>(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {}
      }
    }
    return null;
  });

  const isOrganizer = !isInvitado && !!currentUser;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Partidos</h1>
            <p className="text-muted-foreground text-sm mt-1">Calendario de partidos y resultados</p>
          </div>
          {isOrganizer && !isInvitado && (
            <Link
              href="/partidos/nuevo"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary-light transition-colors"
            >
              + Nuevo Partido
            </Link>
          )}
        </div>

        {/* Placeholder Calendario */}
        <div className="bg-card border border-dashed border-secondary rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Sin partidos programados</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            {isOrganizer && !isInvitado 
              ? "Crea un torneo o programa los partidos directamente para la jornada." 
              : "Consulta aquí los próximos partidos cuando las ligas publiquen su rol de juegos."}
          </p>
          {isOrganizer && !isInvitado && (
            <Link href="/torneos/nuevo" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary-light transition-colors">
              Crear Torneo
            </Link>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
