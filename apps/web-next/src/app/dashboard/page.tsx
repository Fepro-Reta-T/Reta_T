"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { canchasApi, equiposApi, torneosApi } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    canchas: 0,
    equipos: 0,
    torneos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isInvitado, setIsInvitado] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInvitado(localStorage.getItem('invitado') === 'true');
    }
    cargarStats();
  }, []);

  async function cargarStats() {
    try {
      const [canchas, equipos, torneos] = await Promise.all([
        canchasApi.listar(),
        equiposApi.listar(),
        torneosApi.listar(),
      ]);
      setStats({
        canchas: canchas.length,
        equipos: equipos.length,
        torneos: torneos.length,
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      title: "Canchas",
      count: stats.canchas,
      link: "/canchas",
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Equipos",
      count: stats.equipos,
      link: "/equipos",
      color: "bg-green-50 border-green-200",
    },
    {
      title: "Torneos",
      count: stats.torneos,
      link: "/torneos",
      color: "bg-purple-50 border-purple-200",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Bienvenido a tu panel de control</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.link}
              className={`${card.color} border rounded-xl p-6 hover:shadow-lg transition-shadow`}
            >
              <div className="text-4xl mb-2">{card.title.split(" ")[0]}</div>
              <h3 className="text-lg font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-foreground mt-2">
                {card.count}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Ver todos →</p>
            </Link>
          ))}
        </div>

        {!isInvitado ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/canchas/nueva"
              className="bg-primary hover:bg-primary-light text-primary-foreground text-center py-3 rounded-lg transition-colors"
            >
              + Nueva Cancha
            </Link>
            <Link
              href="/equipos/nuevo"
              className="bg-primary hover:bg-primary-light text-primary-foreground text-center py-3 rounded-lg transition-colors"
            >
              + Nuevo Equipo
            </Link>
            <Link
              href="/torneos/nuevo"
              className="bg-primary hover:bg-primary-light text-primary-foreground text-center py-3 rounded-lg transition-colors"
            >
              + Nuevo Torneo
            </Link>
          </div>
        ) : (
          <div className="mt-8 p-6 rounded-xl border border-secondary bg-secondary/10 text-center space-y-3">
            <p className="text-muted-foreground text-sm">
              Estás explorando en modo **Invitado**. Inicia sesión o regístrate para poder crear y administrar torneos, equipos y canchas.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login" className="text-primary hover:underline font-bold text-sm">
                Iniciar Sesión
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/" className="text-primary hover:underline font-bold text-sm">
                Crear Cuenta
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}