"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { torneosApi, equiposApi } from "@/lib/api";
import type { Equipo } from "@reta-t/types";
import WizardProgressBar from "../_components/WizardProgressBar";

function getCategoryBadgeClass(categoria: string) {
  const cat = (categoria || "").toLowerCase();
  if (cat.includes("varonil")) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (cat.includes("femenil")) return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  if (cat.includes("mixto")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  return "bg-amber-500/15 text-amber-400 border-amber-500/30";
}

function FormatoResumen({ formato }: { formato: Record<string, any> }) {
  const LABELS: Record<string, string> = {
    liga: "Liga Regular",
    eliminacion: "Eliminación Directa",
    liga_playoffs: "Liga + Playoffs",
  };
  const LIGA_LABELS: Record<string, string> = {
    ida: "Solo Ida",
    ida_vuelta: "Ida y Vuelta",
  };
  const KO_LABELS: Record<string, string> = {
    partido_unico: "Partido Único",
    ida_vuelta_ko: "Ida y Vuelta",
  };

  return (
    <div className="flex flex-wrap gap-2 text-[10px]">
      {formato.tipo_formato && (
        <span className="px-2.5 py-1 rounded-full border bg-primary/10 text-primary border-primary/30 font-extrabold uppercase tracking-wider">
          {LABELS[formato.tipo_formato] ?? formato.tipo_formato}
        </span>
      )}
      {formato.modalidad_liga && (
        <span className="px-2.5 py-1 rounded-full border bg-secondary text-muted-foreground border-secondary font-semibold uppercase tracking-wider">
          {LIGA_LABELS[formato.modalidad_liga] ?? formato.modalidad_liga}
        </span>
      )}
      {formato.modalidad_ko && (
        <span className="px-2.5 py-1 rounded-full border bg-secondary text-muted-foreground border-secondary font-semibold uppercase tracking-wider">
          Liguilla: {KO_LABELS[formato.modalidad_ko] ?? formato.modalidad_ko}
        </span>
      )}
      {formato.tercer_lugar && (
        <span className="px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold uppercase tracking-wider">
          3er Lugar
        </span>
      )}
      {formato.clasificados_playoffs && (
        <span className="px-2.5 py-1 rounded-full border bg-secondary text-muted-foreground border-secondary font-semibold uppercase tracking-wider">
          Top {formato.clasificados_playoffs}
        </span>
      )}
    </div>
  );
}

export default function EquiposTorneoPage() {
  const router = useRouter();
  const [paso1, setPaso1] = useState<Record<string, string> | null>(null);
  const [paso2, setPaso2] = useState<Record<string, any> | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = sessionStorage.getItem("torneo_wizard_draft");
    if (!draft) { router.replace("/torneos/nuevo"); return; }
    const parsed = JSON.parse(draft);
    if (!parsed.paso1 || !parsed.paso2) { router.replace("/torneos/nuevo/formato"); return; }
    setPaso1(parsed.paso1);
    setPaso2(parsed.paso2);
  }, [router]);

  async function handlePublicar() {
    if (!paso1 || !paso2) return;

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      setError("Debes iniciar sesión para publicar un torneo.");
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      const res = await torneosApi.crear({
        nombre: paso1.nombre,
        categoria: paso1.categoria,
        sport_id: paso1.sport_id,
        max_equipos: paso2.num_equipos,
        datos_adicionales: {
          imagen_portada: paso1.imagen_portada,
          formato: paso2,
          equipo_ids: [],
          descripcion: paso1.descripcion ?? "",
          reglas: paso2.reglas ?? "",
          sport_nombre: paso1.sport_nombre,
        },
      });
      sessionStorage.removeItem("torneo_wizard_draft");
      router.push(`/torneos/${res.id}?created=true`); // Redirigir al dashboard con flag created
    } catch (err: any) {
      const msg = err?.message || err?.detail || "Error al crear el torneo";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setPublishing(false);
    }
  }

  if (!paso1 || !paso2) return null;

  const categoriaClass = getCategoryBadgeClass(paso1.categoria);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

          {/* Botones de navegación superior */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/torneos/nuevo/formato")}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-colors"
            >
              ← Regresar a Formato
            </button>
          </div>

          {/* Encabezado */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Confirmar y Publicar
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Revisa los detalles de tu torneo. Una vez publicado, podrás obtener el enlace mágico para invitar a los equipos a inscribirse.
            </p>
          </div>

          {/* Barra de Progreso */}
          <WizardProgressBar currentStep={3} />

          {/* Resumen del Torneo */}
          <div
            className="relative rounded-3xl overflow-hidden border border-secondary shadow-md"
            style={{ minHeight: "120px" }}
          >
            <img
              src={paso1.imagen_portada || "/Futbol 7.jpg"}
              alt={paso1.nombre}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/85 via-50% to-black/30" />
            <div className="relative z-10 p-5 pt-14 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${categoriaClass}`}>
                  {paso1.categoria}
                </span>
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {paso1.sport_nombre}
                </span>
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight">{paso1.nombre}</h2>
              <FormatoResumen formato={paso2} />
            </div>
          </div>

          {/* Detalles de Configuración */}
          <div className="bg-card border border-secondary rounded-3xl p-5 space-y-4 shadow-sm">
            <h3 className="font-black text-foreground text-sm uppercase tracking-wider mb-2 border-b border-secondary pb-2">
              Detalles de Configuración
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Límite de Equipos
                </span>
                <span className="block text-sm font-black text-primary mt-1">
                  {paso2.num_equipos ? `${paso2.num_equipos} Equipos Máximo` : "Sin Límite"}
                </span>
              </div>
            </div>

            {paso1.descripcion && (
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Descripción
                </span>
                <p className="text-xs text-foreground mt-1 line-clamp-3">
                  {paso1.descripcion}
                </p>
              </div>
            )}

            {paso2.reglas && (
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Reglas Adicionales
                </span>
                <p className="text-xs text-foreground mt-1 line-clamp-3">
                  {paso2.reglas}
                </p>
              </div>
            )}
          </div>

          {/* Explicación del nuevo flujo */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 shadow-sm">
            <h3 className="font-black text-primary text-sm uppercase tracking-wider mb-2">
              ¿Cómo invito a los equipos?
            </h3>
            <p className="text-xs text-primary/80 leading-relaxed">
              En esta nueva versión, ya no seleccionas los equipos manualmente aquí. En su lugar, al publicar el torneo, se generará un <strong>enlace mágico de invitación</strong> en tu panel de control. Podrás compartir ese enlace por WhatsApp o redes sociales para que los equipos se inscriban ellos mismos.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          {/* CTA: Publicar */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handlePublicar}
              disabled={publishing}
              className="w-full min-h-[52px] py-4 bg-primary hover:bg-primary-light text-primary-foreground rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {publishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publicando Torneo...
                </>
              ) : (
                "Publicar Torneo"
              )}
            </button>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
