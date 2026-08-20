"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import WizardProgressBar from "./_components/WizardProgressBar";

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
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
    activeColor: "border-purple-600 ring-2 ring-purple-600/30 bg-purple-500/5",
  },
  {
    id: "varonil",
    titulo: "Varonil",
    descripcion: "Exclusivo para equipos y participantes varoniles",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
    activeColor: "border-blue-600 ring-2 ring-blue-600/30 bg-blue-500/5",
  },
  {
    id: "mixto",
    titulo: "Mixto",
    descripcion: "Equipos integrados por participantes varoniles y femeniles",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200",
    activeColor: "border-amber-600 ring-2 ring-amber-600/30 bg-amber-500/5",
  },
];

export default function NuevoTorneoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Referencias para auto-scroll fluido a cada tarjeta
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const step5Ref = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [loadingSports, setLoadingSports] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);

  // Paso activo (1, 2, 3, 4, 5)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario — Fase 1: solo datos básicos
  const [formData, setFormData] = useState({
    nombre: "",
    imagen_portada: "/Futbol 7.jpg",
    sport_id: "",
    categoria: "",
  });

  async function cargarSports() {
    try {
      const response = await apiClient.get<Sport[]>("/sports");
      setSports(response);
      if (response.length > 0) {
        setFormData((prev) => ({ ...prev, sport_id: response[0].id }));
      }
      setError(null);
    } catch (err) {
      console.error("Error al cargar deportes:", err);
      setError("No se pudieron cargar los deportes desde el servidor.");
    } finally {
      setLoadingSports(false);
    }
  }

  useEffect(() => {
    cargarSports();
    // Cargar borrador guardado si existe
    const draft = sessionStorage.getItem("torneo_wizard_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.paso1) {
          setFormData((prev) => ({ ...prev, ...parsed.paso1 }));
        }
      } catch {
        // borrador corrupto, ignorar
      }
    }
  }, []);

  // Función para cambiar de paso y hacer scroll automático hacia la tarjeta que se abre
  function irAlPaso(paso: number, ref?: React.RefObject<HTMLDivElement | null>) {
    setActiveStep(paso);
    setTimeout(() => {
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }

  // Obtener la imagen correspondiente a un deporte
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

  // Compresor cliente para portadas de torneo de cualquier tamaño (>3MB)
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

  function handleSiguiente(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim()) {
      setError("El nombre del torneo es obligatorio.");
      irAlPaso(1, step1Ref);
      return;
    }
    if (!formData.sport_id) {
      setError("Por favor selecciona un deporte.");
      irAlPaso(3, step3Ref);
      return;
    }
    if (!formData.categoria) {
      setError("Por favor selecciona una categoría.");
      irAlPaso(4, step4Ref);
      return;
    }

    // Guardar Fase 1 en sessionStorage y avanzar
    const draft = JSON.parse(sessionStorage.getItem("torneo_wizard_draft") || "{}");
    sessionStorage.setItem(
      "torneo_wizard_draft",
      JSON.stringify({
        ...draft,
        paso1: {
          nombre: formData.nombre,
          imagen_portada: formData.imagen_portada,
          sport_id: formData.sport_id,
          sport_nombre: sports.find((s) => s.id === formData.sport_id)?.nombre || "",
          categoria: formData.categoria,
        },
      })
    );
    router.push("/torneos/nuevo/formato");
  }

  const selectedSportObj = sports.find((s) => s.id === formData.sport_id);

  // Estados de completado para las palomitas (checkmarks)
  const isStep1Complete = formData.nombre.trim().length > 0 && activeStep > 1;
  const isStep2Complete = Boolean(formData.imagen_portada) && activeStep > 2;
  const isStep3Complete = Boolean(formData.sport_id) && activeStep > 3;
  const isStep4Complete = Boolean(formData.categoria) && activeStep > 4;

  if (loadingSports) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Enlace Volver */}
          <Link
            href="/torneos"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Volver a Torneos
          </Link>

          {/* Encabezado */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Crear Nuevo Torneo
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Completa las secciones para publicar tu torneo en la comunidad.
            </p>
          </div>

          {/* Banner de Previsualización Dinámica */}
          <div className="relative w-full h-52 sm:h-64 rounded-3xl overflow-hidden mb-8 border border-secondary shadow-xl group">
            <img
              src={formData.imagen_portada || "/Futbol 7.jpg"}
              alt="Vista previa de portada"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-widest font-bold text-primary-light bg-primary/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30">
                  Vista Previa
                </span>
                {selectedSportObj && (
                  <span className="text-xs uppercase tracking-widest font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    {selectedSportObj.nombre}
                  </span>
                )}
                {formData.categoria && (
                  <span className="text-xs uppercase tracking-widest font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 capitalize">
                    {formData.categoria}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md tracking-tight">
                {formData.nombre.trim() || "Nombre de tu Torneo"}
              </h2>
            </div>
          </div>

          {/* Formulario Acordeón Paso a Paso con Auto-Scroll */}
          <form onSubmit={handleSiguiente} className="space-y-4">

            {/* Barra de Progreso del Wizard */}
            <WizardProgressBar currentStep={1} />

            {/* PASO 1: NOMBRE */}
            <div
              ref={step1Ref}
              className="bg-card rounded-2xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(1, step1Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isStep1Complete
                        ? "bg-emerald-600 text-white"
                        : activeStep === 1
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep1Complete ? "✓" : "1"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Paso 1: Nombre del Torneo
                    </h3>
                    {activeStep !== 1 && formData.nombre.trim() && (
                      <p className="text-xs text-primary font-semibold mt-0.5">
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
                    className="text-xs font-semibold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 1 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Escribe el nombre oficial del torneo
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 border border-secondary rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-base transition-all placeholder:text-muted-foreground"
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
                      className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-light transition-colors disabled:opacity-50 text-sm"
                    >
                      Avanzar a Portada →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 2: IMAGEN DE PORTADA */}
            <div
              ref={step2Ref}
              className="bg-card rounded-2xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(2, step2Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isStep2Complete
                        ? "bg-emerald-600 text-white"
                        : activeStep === 2
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep2Complete ? "✓" : "2"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Paso 2: Imagen de Portada
                    </h3>
                    {activeStep !== 2 && (
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
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
                    className="text-xs font-semibold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 2 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-4">
                      Sube una imagen personalizada (acepta fotos &gt;3MB) o elige un diseño de nuestra galería.
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
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-secondary bg-background hover:bg-secondary/50 text-foreground font-semibold text-sm transition-colors shadow-sm"
                      >
                        Subir desde dispositivo
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm transition-colors shadow-sm"
                      >
                        Elegir de la Galería
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => irAlPaso(3, step3Ref)}
                      className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-light transition-colors text-sm"
                    >
                      Avanzar a Deporte →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 3: DEPORTE (Tarjetas Visuales Corregidas) */}
            <div
              ref={step3Ref}
              className="bg-card rounded-2xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(3, step3Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isStep3Complete
                        ? "bg-emerald-600 text-white"
                        : activeStep === 3
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep3Complete ? "✓" : "3"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Paso 3: Selecciona el Deporte
                    </h3>
                    {activeStep !== 3 && selectedSportObj && (
                      <p className="text-xs text-primary font-semibold mt-0.5 uppercase tracking-wider">
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
                    className="text-xs font-semibold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 3 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-4">
                      Haz clic sobre el deporte oficial en el que se competirá.
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
                              {sport.datos_adicionales?.default_team_size && (
                                <span className="text-[10px] text-white/80 font-medium block">
                                  {sport.datos_adicionales.default_team_size} vs {sport.datos_adicionales.default_team_size}
                                </span>
                              )}
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

            {/* PASO 4: CATEGORÍA */}
            <div
              ref={step4Ref}
              className="bg-card rounded-2xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(4, step4Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isStep4Complete
                        ? "bg-emerald-600 text-white"
                        : activeStep === 4
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep4Complete ? "✓" : "4"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Paso 4: Selecciona la Categoría
                    </h3>
                    {activeStep !== 4 && formData.categoria && (
                      <p className="text-xs text-primary font-semibold mt-0.5 capitalize">
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
                    className="text-xs font-semibold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 4 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-4">
                      Elige a quién está dirigida la inscripción en este torneo.
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
                              <span
                                className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-md border ${cat.badgeColor}`}
                              >
                                {cat.titulo}
                              </span>
                              {isSelected && (
                                <span className="text-xs font-bold text-primary">✓</span>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Botón: Siguiente Fase */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!formData.nombre.trim() || !formData.categoria || !formData.sport_id}
                className="w-full min-h-[52px] py-4 bg-primary hover:bg-primary-light text-primary-foreground rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Siguiente: Formato del Torneo →
              </button>
              <p className="text-center text-[11px] text-muted-foreground mt-2.5">
                Paso 1 de 3 — Después configurarás el formato e invitarás equipos.
              </p>
            </div>
          </form>
        </div>

        {/* Modal de Galería Predefinida */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <h3 className="text-lg font-extrabold text-foreground">
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

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}