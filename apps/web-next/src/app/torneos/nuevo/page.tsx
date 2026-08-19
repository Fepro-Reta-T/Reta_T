"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { torneosApi, equiposApi, inscripcionesApi, apiClient } from "@/lib/api";
import type { Equipo, FormatoTorneo } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";

interface Sport {
  id: string;
  nombre: string;
  datos_adicionales?: {
    icon?: string;
    default_team_size?: number;
    scoring_type?: string;
  };
}

const GALERIA_PREDEFINIDA = [
  { id: "fut7", nombre: "Fútbol 7 / Cancha", url: "/Futbol 7.jpg" },
  { id: "futbol", nombre: "Fútbol Estadio", url: "/Futbol.jpg" },
  { id: "basket", nombre: "Basketball Court", url: "/Basket.jpg" },
  { id: "volley", nombre: "Voleibol Arena", url: "/Volley.jpg" },
];

const CATEGORIAS_CONFIG = [
  {
    id: "femenil",
    titulo: "Femenil",
    descripcion: "Exclusivo para equipos y participantes femeniles",
    badgeClass: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    activeColor: "border-pink-500 ring-2 ring-pink-500/30 bg-pink-500/10",
  },
  {
    id: "varonil",
    titulo: "Varonil",
    descripcion: "Exclusivo para equipos y participantes varoniles",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    activeColor: "border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/10",
  },
  {
    id: "mixto",
    titulo: "Mixto",
    descripcion: "Equipos integrados por participantes varoniles y femeniles",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    activeColor: "border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/10",
  },
];

const FORMATOS_CONFIG = [
  {
    id: "liga" as FormatoTorneo,
    titulo: "Liga Regular",
    subtitulo: "Todos contra Todos (Round Robin)",
    descripcion: "Todos los equipos se enfrentan en tabla general por acumulación de puntos.",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  {
    id: "eliminacion_directa" as FormatoTorneo,
    titulo: "Eliminación Directa",
    subtitulo: "Knockout / Cuadro de Llaves",
    descripcion: "Enfrentamientos directos donde el equipo perdedor queda eliminado inmediatamente.",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    id: "liga_playoffs" as FormatoTorneo,
    titulo: "Liga con Playoffs",
    subtitulo: "Fase Regular + Liguilla Final",
    descripcion: "Fase regular de liga donde los mejores clasificados avanzan al cuadro final de liguilla.",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
];

function getCategoryBadgeClass(categoria: string) {
  const cat = (categoria || "").toLowerCase();
  if (cat.includes("varonil")) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (cat.includes("femenil")) return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  if (cat.includes("mixto")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  return "bg-amber-500/15 text-amber-400 border-amber-500/30";
}

export default function NuevoTorneoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll refs para cada sección
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const step5Ref = useRef<HTMLDivElement>(null);
  const step6Ref = useRef<HTMLDivElement>(null);
  const step7Ref = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [loadingSports, setLoadingSports] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([]);

  // Fase Activa (1: Datos Básicos, 2: Estructura de Competencia, 3: Invitar Equipos)
  const [faseActiva, setFaseActiva] = useState<1 | 2 | 3>(1);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    imagen_portada: "/Futbol 7.jpg",
    sport_id: "",
    categoria: "",
    // Estructura de Competencia
    tipo_formato: "liga" as FormatoTorneo,
    ida_y_vuelta: false,
    clasificados_playoffs: 4,
    formato_playoffs: "partido_unico" as "partido_unico" | "ida_y_vuelta",
    tercer_lugar: true,
    reglas: "",
    // Equipos Pre-seleccionados para Inscribir (Fase 3)
    equipos_seleccionados_ids: [] as string[],
  });

  async function cargarDatosIniciales() {
    try {
      const [sportsData, equiposData] = await Promise.all([
        apiClient.get<Sport[]>("/sports"),
        equiposApi.listar().catch(() => []),
      ]);
      setSports(sportsData);
      setEquiposDisponibles(equiposData);
      if (sportsData.length > 0) {
        setFormData((prev) => ({ ...prev, sport_id: sportsData[0].id }));
      }
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      setError("No se pudieron cargar los datos necesarios del servidor.");
    } finally {
      setLoadingSports(false);
    }
  }

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  function irAlPaso(paso: number, ref?: React.RefObject<HTMLDivElement | null>) {
    setActiveStep(paso);
    if (paso <= 4) setFaseActiva(1);
    else if (paso <= 6) setFaseActiva(2);
    else setFaseActiva(3);

    setTimeout(() => {
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }

  function getDeporteImagen(sport: Sport): string {
    if (sport.datos_adicionales?.icon) {
      return `/${sport.datos_adicionales.icon}`;
    }
    const n = sport.nombre.toLowerCase();
    if (n.includes("7")) return "/Futbol 7.jpg";
    if (n.includes("basket")) return "/Basket.jpg";
    if (n.includes("volley") || n.includes("volei")) return "/Volley.jpg";
    return "/Futbol.jpg";
  }

  function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
          resolve(canvas.toDataURL(mimeType, quality));
        };
        img.onerror = () => reject(new Error("Error al procesar la imagen"));
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file, 1200, 0.85);
      setFormData((prev) => ({ ...prev, imagen_portada: compressedDataUrl }));
    } catch (err) {
      console.error("Error al procesar imagen de portada:", err);
      alert("No se pudo cargar la imagen. Intenta con otro archivo.");
    }
  }

  function toggleEquipoSeleccionado(equipoId: string) {
    setFormData((prev) => {
      const existe = prev.equipos_seleccionados_ids.includes(equipoId);
      return {
        ...prev,
        equipos_seleccionados_ids: existe
          ? prev.equipos_seleccionados_ids.filter((id) => id !== equipoId)
          : [...prev.equipos_seleccionados_ids, equipoId],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      setError("Debes iniciar sesión para crear un torneo.");
      setLoading(false);
      return;
    }

    if (!formData.nombre.trim()) {
      setError("El nombre del torneo es obligatorio.");
      irAlPaso(1, step1Ref);
      setLoading(false);
      return;
    }

    if (!formData.sport_id) {
      setError("Por favor selecciona un deporte.");
      irAlPaso(3, step3Ref);
      setLoading(false);
      return;
    }

    if (!formData.categoria) {
      setError("Por favor selecciona una categoría.");
      irAlPaso(4, step4Ref);
      setLoading(false);
      return;
    }

    try {
      const torneoCreado = await torneosApi.crear({
        nombre: formData.nombre,
        categoria: formData.categoria,
        sport_id: formData.sport_id,
        datos_adicionales: {
          imagen_portada: formData.imagen_portada,
          reglas: formData.reglas,
          estructura: {
            tipo_formato: formData.tipo_formato,
            ida_y_vuelta: formData.ida_y_vuelta,
            clasificados_playoffs: formData.clasificados_playoffs,
            formato_playoffs: formData.formato_playoffs,
            tercer_lugar: formData.tercer_lugar,
          },
        },
      });

      // Si se pre-seleccionaron equipos en la Fase 3, los inscribimos automáticamente
      if (torneoCreado?.id && formData.equipos_seleccionados_ids.length > 0) {
        await Promise.allSettled(
          formData.equipos_seleccionados_ids.map((eqId) =>
            inscripcionesApi.inscribir(torneoCreado.id, eqId)
          )
        );
      }

      router.push(`/torneos/${torneoCreado.id}`);
    } catch (err: any) {
      const msg = err?.message || err?.detail || "Error al crear el torneo";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const selectedSportObj = sports.find((s) => s.id === formData.sport_id);

  // Estados de completado para palomitas (checkmarks)
  const isStep1Complete = formData.nombre.trim().length > 0;
  const isStep2Complete = Boolean(formData.imagen_portada);
  const isStep3Complete = Boolean(formData.sport_id);
  const isStep4Complete = Boolean(formData.categoria);
  const isStep5Complete = Boolean(formData.tipo_formato);

  if (loadingSports) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 font-sans">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          
          {/* Enlace Volver */}
          <Link
            href="/torneos"
            className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver a Torneos
          </Link>

          {/* Encabezado Principal */}
          <div className="bg-card rounded-3xl p-6 border border-secondary shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Crear Nuevo Torneo
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Configura tu competencia en 3 fases intuitivas para publicarla en tu comunidad.
            </p>

            {/* Barra de Fases (1: Datos Básicos, 2: Estructura, 3: Invitar Equipos) */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-secondary">
              <button
                type="button"
                onClick={() => irAlPaso(1, step1Ref)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  faseActiva === 1
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background text-muted-foreground border-secondary hover:border-primary/50"
                }`}
              >
                <span className="text-[10px] uppercase font-extrabold block opacity-80">Fase 1</span>
                <span className="text-xs font-black truncate block">Datos Básicos</span>
              </button>

              <button
                type="button"
                onClick={() => irAlPaso(5, step5Ref)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  faseActiva === 2
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background text-muted-foreground border-secondary hover:border-primary/50"
                }`}
              >
                <span className="text-[10px] uppercase font-extrabold block opacity-80">Fase 2</span>
                <span className="text-xs font-black truncate block">Estructura</span>
              </button>

              <button
                type="button"
                onClick={() => irAlPaso(7, step7Ref)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  faseActiva === 3
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background text-muted-foreground border-secondary hover:border-primary/50"
                }`}
              >
                <span className="text-[10px] uppercase font-extrabold block opacity-80">Fase 3</span>
                <span className="text-xs font-black truncate block">Invitar Equipos</span>
              </button>
            </div>
          </div>

          {/* Banner de Previsualización Dinámica */}
          <div className="relative w-full h-52 sm:h-64 rounded-3xl overflow-hidden border border-secondary shadow-xl group bg-card">
            <img
              src={formData.imagen_portada || "/Futbol 7.jpg"}
              alt="Vista previa de portada"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/75 via-45% to-black/30 flex flex-col justify-end p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-widest font-extrabold text-primary-light bg-primary/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30">
                  Previsualización
                </span>
                {selectedSportObj && (
                  <span className="text-xs uppercase tracking-widest font-extrabold text-foreground bg-card/80 backdrop-blur-md px-3 py-1 rounded-full border border-secondary">
                    {selectedSportObj.nombre}
                  </span>
                )}
                {formData.categoria && (
                  <span className={`text-xs uppercase tracking-widest font-extrabold backdrop-blur-md px-3 py-1 rounded-full border capitalize ${getCategoryBadgeClass(formData.categoria)}`}>
                    {formData.categoria}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground drop-shadow-sm tracking-tight">
                {formData.nombre.trim() || "Nombre de tu Torneo"}
              </h2>
            </div>
          </div>

          {/* Formulario Acordeón en 3 Fases */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ========================================================================= */}
            {/* FASE 1: DATOS BÁSICOS DEL TORNEO */}
            {/* ========================================================================= */}
            
            {/* PASO 1: NOMBRE */}
            <div
              ref={step1Ref}
              className="bg-card rounded-3xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(1, step1Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                      isStep1Complete
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : activeStep === 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep1Complete ? "✓" : "1"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Paso 1: Nombre del Torneo
                    </h3>
                    {activeStep !== 1 && formData.nombre.trim() && (
                      <p className="text-xs text-primary font-bold mt-0.5">
                        {formData.nombre}
                      </p>
                    )}
                  </div>
                </div>

                {activeStep !== 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      irAlPaso(1, step1Ref);
                    }}
                    className="text-xs font-bold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 1 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
                      Nombre Oficial
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 border border-secondary rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all placeholder:text-muted-foreground"
                      required
                      placeholder="Ej: Liga Nocturna de Verano 2026"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!formData.nombre.trim()}
                      onClick={() => irAlPaso(2, step2Ref)}
                      className="min-h-[44px] px-6 py-2.5 bg-primary text-primary-foreground font-extrabold rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50 text-xs uppercase tracking-wider shadow"
                    >
                      Siguiente: Portada →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 2: IMAGEN DE PORTADA */}
            <div
              ref={step2Ref}
              className="bg-card rounded-3xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(2, step2Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                      isStep2Complete
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : activeStep === 2
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep2Complete ? "✓" : "2"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Paso 2: Imagen de Portada
                    </h3>
                    {activeStep !== 2 && (
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                        Imagen seleccionada
                      </p>
                    )}
                  </div>
                </div>

                {activeStep !== 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      irAlPaso(2, step2Ref);
                    }}
                    className="text-xs font-bold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 2 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-4">
                      Sube una imagen personalizada o elige un diseño de la galería.
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-secondary bg-background hover:bg-secondary/50 text-foreground font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Subir desde dispositivo
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Elegir de Galería
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => irAlPaso(3, step3Ref)}
                      className="min-h-[44px] px-6 py-2.5 bg-primary text-primary-foreground font-extrabold rounded-xl hover:bg-primary-light transition-colors text-xs uppercase tracking-wider shadow"
                    >
                      Siguiente: Deporte →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 3: DEPORTE */}
            <div
              ref={step3Ref}
              className="bg-card rounded-3xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(3, step3Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                      isStep3Complete
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : activeStep === 3
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep3Complete ? "✓" : "3"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Paso 3: Deporte Oficial
                    </h3>
                    {activeStep !== 3 && selectedSportObj && (
                      <p className="text-xs text-primary font-bold mt-0.5 uppercase tracking-wider">
                        {selectedSportObj.nombre}
                      </p>
                    )}
                  </div>
                </div>

                {activeStep !== 3 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      irAlPaso(3, step3Ref);
                    }}
                    className="text-xs font-bold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 3 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-4">
                      Selecciona la disciplina deportiva del torneo.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {sports.map((sport) => {
                        const isSelected = formData.sport_id === sport.id;
                        const imgSrc = getDeporteImagen(sport);

                        return (
                          <button
                            key={sport.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, sport_id: sport.id });
                              irAlPaso(4, step4Ref);
                            }}
                            className={`group relative h-36 rounded-2xl overflow-hidden border-2 text-left transition-all p-3 flex flex-col justify-end ${
                              isSelected
                                ? "border-primary ring-2 ring-primary/40 scale-[1.02] shadow-lg"
                                : "border-secondary hover:border-primary/50"
                            }`}
                          >
                            <img
                              src={imgSrc}
                              alt={sport.nombre}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                            <div className="relative z-10">
                              <span className="text-xs font-black uppercase text-white tracking-wider block drop-shadow">
                                {sport.nombre}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
                                ✓
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 4: CATEGORÍA (CON CÓDIGO DE COLOR OBLIGATORIO) */}
            <div
              ref={step4Ref}
              className="bg-card rounded-3xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(4, step4Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                      isStep4Complete
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : activeStep === 4
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep4Complete ? "✓" : "4"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Paso 4: Categoría y Rama
                    </h3>
                    {activeStep !== 4 && formData.categoria && (
                      <p className="text-xs text-primary font-bold mt-0.5 capitalize">
                        {formData.categoria}
                      </p>
                    )}
                  </div>
                </div>

                {activeStep !== 4 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      irAlPaso(4, step4Ref);
                    }}
                    className="text-xs font-bold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 4 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-4">
                      Selecciona la rama de participación oficial.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {CATEGORIAS_CONFIG.map((cat) => {
                        const isSelected = formData.categoria === cat.id;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, categoria: cat.id });
                              irAlPaso(5, step5Ref);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                              isSelected
                                ? cat.activeColor + " shadow-md"
                                : "border-secondary bg-background hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${cat.badgeClass}`}>
                                {cat.titulo}
                              </span>
                              {isSelected && (
                                <span className="text-xs font-extrabold text-primary">✓</span>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                              {cat.descripcion}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* FASE 2: ESTRUCTURA DE COMPETENCIA (FORMATO, IDA/VUELTA, PLAYOFFS) */}
            {/* ========================================================================= */}

            {/* PASO 5: FORMATO DE COMPETENCIA */}
            <div
              ref={step5Ref}
              className="bg-card rounded-3xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(5, step5Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                      isStep5Complete
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : activeStep === 5
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep5Complete ? "✓" : "5"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Paso 5: Formato del Torneo (Fase 2)
                    </h3>
                    {activeStep !== 5 && (
                      <p className="text-xs text-primary font-bold mt-0.5 uppercase tracking-wider">
                        {FORMATOS_CONFIG.find((f) => f.id === formData.tipo_formato)?.titulo}
                      </p>
                    )}
                  </div>
                </div>

                {activeStep !== 5 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      irAlPaso(5, step5Ref);
                    }}
                    className="text-xs font-bold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 5 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-5 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-4">
                      Elige el sistema de competencia para determinar los enfrentamientos y al campeón.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {FORMATOS_CONFIG.map((formato) => {
                        const isSelected = formData.tipo_formato === formato.id;

                        return (
                          <button
                            key={formato.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, tipo_formato: formato.id });
                            }}
                            className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                              isSelected
                                ? "border-primary ring-2 ring-primary/40 bg-primary/10 shadow-lg"
                                : "border-secondary bg-background hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${formato.badgeClass}`}>
                                {formato.titulo}
                              </span>
                              {isSelected && (
                                <span className="text-xs font-black text-primary">✓</span>
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold text-foreground text-sm">
                                {formato.subtitulo}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {formato.descripcion}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AJUSTES ESPECÍFICOS SEGÚN EL FORMATO SELECCIONADO */}
                  <div className="p-4 rounded-2xl border border-secondary bg-background space-y-4">
                    <h4 className="text-xs font-black uppercase text-foreground tracking-wider border-b border-secondary pb-2">
                      Configuración de {FORMATOS_CONFIG.find((f) => f.id === formData.tipo_formato)?.titulo}
                    </h4>

                    {/* Ajustes para Liga Regular */}
                    {formData.tipo_formato === "liga" && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-foreground">
                          Modalidad de Enfrentamientos
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, ida_y_vuelta: false })}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                              !formData.ida_y_vuelta
                                ? "bg-primary text-primary-foreground border-primary shadow"
                                : "bg-card text-muted-foreground border-secondary"
                            }`}
                          >
                            Ida Única (1 partido por rival)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, ida_y_vuelta: true })}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                              formData.ida_y_vuelta
                                ? "bg-primary text-primary-foreground border-primary shadow"
                                : "bg-card text-muted-foreground border-secondary"
                            }`}
                          >
                            Ida y Vuelta (2 partidos por rival)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Ajustes para Eliminación Directa */}
                    {formData.tipo_formato === "eliminacion_directa" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-2">
                            Formato de Llaves
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, formato_playoffs: "partido_unico" })}
                              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                formData.formato_playoffs === "partido_unico"
                                  ? "bg-primary text-primary-foreground border-primary shadow"
                                  : "bg-card text-muted-foreground border-secondary"
                              }`}
                            >
                              Partido Único (Muerte Súbita)
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, formato_playoffs: "ida_y_vuelta" })}
                              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                formData.formato_playoffs === "ida_y_vuelta"
                                  ? "bg-primary text-primary-foreground border-primary shadow"
                                  : "bg-card text-muted-foreground border-secondary"
                              }`}
                            >
                              Serie Ida y Vuelta
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-secondary">
                          <span className="text-xs font-bold text-foreground">
                            Definir Partido por 3er y 4to Lugar
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, tercer_lugar: !formData.tercer_lugar })}
                            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                              formData.tercer_lugar
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-card text-muted-foreground border-secondary"
                            }`}
                          >
                            {formData.tercer_lugar ? "Sí (Incluir)" : "No (Solo Final)"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Ajustes para Liga + Playoffs */}
                    {formData.tipo_formato === "liga_playoffs" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-2">
                            Equipos que Clasifican a Liguilla
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, clasificados_playoffs: 4 })}
                              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                formData.clasificados_playoffs === 4
                                  ? "bg-primary text-primary-foreground border-primary shadow"
                                  : "bg-card text-muted-foreground border-secondary"
                              }`}
                            >
                              Top 4 (Semifinales Directas)
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, clasificados_playoffs: 8 })}
                              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                formData.clasificados_playoffs === 8
                                  ? "bg-primary text-primary-foreground border-primary shadow"
                                  : "bg-card text-muted-foreground border-secondary"
                              }`}
                            >
                              Top 8 (Cuartos de Final)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-foreground mb-2">
                            Formato de la Liguilla
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, formato_playoffs: "partido_unico" })}
                              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                formData.formato_playoffs === "partido_unico"
                                  ? "bg-primary text-primary-foreground border-primary shadow"
                                  : "bg-card text-muted-foreground border-secondary"
                              }`}
                            >
                              Partido Único en Liguilla
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, formato_playoffs: "ida_y_vuelta" })}
                              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                formData.formato_playoffs === "ida_y_vuelta"
                                  ? "bg-primary text-primary-foreground border-primary shadow"
                                  : "bg-card text-muted-foreground border-secondary"
                              }`}
                            >
                              Ida y Vuelta en Liguilla
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => irAlPaso(6, step6Ref)}
                      className="min-h-[44px] px-6 py-2.5 bg-primary text-primary-foreground font-extrabold rounded-xl hover:bg-primary-light transition-colors text-xs uppercase tracking-wider shadow"
                    >
                      Siguiente: Reglas →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 6: REGLAS Y DETALLES */}
            <div
              ref={step6Ref}
              className="bg-card rounded-3xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(6, step6Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                      formData.reglas.trim()
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : activeStep === 6
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {formData.reglas.trim() ? "✓" : "6"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Paso 6: Reglas y Premiación
                    </h3>
                    {activeStep !== 6 && formData.reglas.trim() && (
                      <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate max-w-xs">
                        {formData.reglas}
                      </p>
                    )}
                  </div>
                </div>

                {activeStep !== 6 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      irAlPaso(6, step6Ref);
                    }}
                    className="text-xs font-bold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 6 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
                      Reglamento Oficial y Premios (Opcional)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.reglas}
                      onChange={(e) => setFormData({ ...formData, reglas: e.target.value })}
                      className="w-full px-4 py-3 border border-secondary rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-xs transition-all placeholder:text-muted-foreground resize-none"
                      placeholder="Ej: Marcadores oficiales registrados por arbitraje. Premios: $5,000 MXN al 1er lugar + trofeo."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => irAlPaso(7, step7Ref)}
                      className="min-h-[44px] px-6 py-2.5 bg-primary text-primary-foreground font-extrabold rounded-xl hover:bg-primary-light transition-colors text-xs uppercase tracking-wider shadow"
                    >
                      Avanzar a Fase 3: Invitar Equipos →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* FASE 3: INVITAR Y SUMAR EQUIPOS */}
            {/* ========================================================================= */}

            {/* PASO 7: INVITAR Y PRE-SELECCIONAR EQUIPOS */}
            <div
              ref={step7Ref}
              className="bg-card rounded-3xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(7, step7Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                      formData.equipos_seleccionados_ids.length > 0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : activeStep === 7
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {formData.equipos_seleccionados_ids.length > 0 ? "✓" : "7"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      Paso 7: Invitar Equipos (Fase 3)
                    </h3>
                    {formData.equipos_seleccionados_ids.length > 0 && (
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">
                        {formData.equipos_seleccionados_ids.length} equipos pre-seleccionados
                      </p>
                    )}
                  </div>
                </div>

                {activeStep !== 7 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      irAlPaso(7, step7Ref);
                    }}
                    className="text-xs font-bold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 7 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-4">
                      Selecciona clubes ya registrados para sumarlos inmediatamente a la liguilla al publicar.
                    </p>

                    {equiposDisponibles.length === 0 ? (
                      <div className="bg-background rounded-2xl border border-secondary p-4 text-center text-xs text-muted-foreground">
                        No hay otros equipos registrados aún en la plataforma. Podrás invitar clubes mediante el enlace público de inscripción después de crear el torneo.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                        {equiposDisponibles.map((eq) => {
                          const isSelected = formData.equipos_seleccionados_ids.includes(eq.id);
                          const clubColor = eq.color || "#991b1b";

                          return (
                            <button
                              key={eq.id}
                              type="button"
                              onClick={() => toggleEquipoSeleccionado(eq.id)}
                              className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-sm"
                                  : "border-secondary bg-background hover:border-primary/50"
                              }`}
                            >
                              <div className="flex items-center gap-3 truncate">
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs flex-shrink-0"
                                  style={{ backgroundColor: clubColor }}
                                >
                                  {eq.nombre.charAt(0)}
                                </div>
                                <div className="truncate">
                                  <h4 className="font-bold text-foreground text-xs truncate">
                                    {eq.nombre}
                                  </h4>
                                  <span className="text-[10px] text-muted-foreground uppercase">
                                    {eq.datos_adicionales?.tipo_equipo || "Club"}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-secondary"
                                }`}
                              >
                                {isSelected ? "✓" : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs text-red-600 font-bold">
                {error}
              </div>
            )}

            {/* Botón Final Publicar Torneo */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !formData.nombre.trim() || !formData.categoria || !formData.sport_id}
                className="w-full min-h-[52px] py-4 bg-primary hover:bg-primary-light text-primary-foreground rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Publicando Torneo..." : "Publicar Torneo Oficial"}
              </button>
            </div>
          </form>
        </div>

        {/* Modal de Galería Predefinida */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <h3 className="text-base font-black text-foreground">
                  Seleccionar Imagen de Galería
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                {GALERIA_PREDEFINIDA.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, imagen_portada: img.url }));
                      setModalOpen(false);
                    }}
                    className={`group relative h-28 rounded-2xl overflow-hidden border-2 transition-all text-left ${
                      formData.imagen_portada === img.url
                        ? "border-primary ring-2 ring-primary/40 scale-[1.02]"
                        : "border-transparent hover:border-secondary"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 p-2 flex items-end">
                      <span className="text-xs font-bold text-white truncate drop-shadow">
                        {img.nombre}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}