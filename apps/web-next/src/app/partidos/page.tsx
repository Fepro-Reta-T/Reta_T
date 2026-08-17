"use client";

import Link from "next/link";
import AppLayout from "@/components/AppLayout";

export default function PartidosPage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Partidos</h1>
            <p className="text-muted-foreground text-sm mt-1">Gestiona y programa los partidos de tus torneos</p>
          </div>
          <Link
            href="/partidos/nuevo"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary-light transition-colors"
          >
            + Nuevo Partido
          </Link>
        </div>

        {/* Placeholder */}
        <div className="bg-card border border-dashed border-secondary rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Sin partidos programados</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Crea un torneo primero y luego programa los partidos entre los equipos inscritos.
          </p>
          <Link href="/torneos/nuevo" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary-light transition-colors">
            Crear Torneo
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
