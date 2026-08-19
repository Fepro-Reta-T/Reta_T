"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { equiposApi, apiClient } from "@/lib/api";
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

const COLORES_PREDEFINIDOS = [
  { id: "rojo", nombre: "Rojo Vino", hex: "#991b1b" },
  { id: "azul", nombre: "Azul Marino", hex: "#1e3a8a" },
  { id: "verde", nombre: "Verde Esmeralda", hex: "#065f46" },
  { id: "dorado", nombre: "Dorado", hex: "#d97706" },
  { id: "negro", nombre: "Negro Mate", hex: "#18181b" },
  { id: "blanco", nombre: "Blanco Mármol", hex: "#f4f4f5" },
  { id: "naranja", nombre: "Naranja Fuego", hex: "#c2410c" },
  { id: "purpura", nombre: "Púrpura", hex: "#6b21a8" },
];

const RAMAS_CONFIG = [
  {
    id: "varonil",
    titulo: "Varonil",
    descripcion: "Exclusivo para integrantes varoniles",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
    activeColor: "border-blue-600 ring-2 ring-blue-600/30 bg-blue-500/5",
  },
  {
    id: "femenil",
    titulo: "Femenil",
    descripcion: "Exclusivo para integrantes femeniles",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
    activeColor: "border-purple-600 ring-2 ring-purple-600/30 bg-purple-500/5",
  },
  {
    id: "mixto",
    titulo: "Mixto",
    descripcion: "Integrado por participantes varoniles y femeniles",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200",
    activeColor: "border-amber-600 ring-2 ring-amber-600/30 bg-amber-500/5",
  },
];

export default function NuevoEquipoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Referencias para auto-scroll fluido entre tarjetas
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

  // Formulario de equipo
  const [formData, setFormData] = useState({
    nombre: "",
    logo_url: "",
    color: "#991b1b",
    tipo_equipo: "varonil",
    sport_id: "",
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
  }, []);

  function irAlPaso(paso: number, ref?: React.RefObject<HTMLDivElement | null>) {
    setActiveStep(paso);
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

  // Compresor de imágenes cliente para soportar fotos grandes de >3MB conservando transparencia PNG
  function compressImage(file: File, maxWidth = 800, quality = 0.85): Promise<string> {
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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Soporta cualquier tamaño de imagen (incluso >3MB) procesándola en el cliente
      const compressedDataUrl = await compressImage(file, 800, 0.85);
      setFormData((prev) => ({ ...prev, logo_url: compressedDataUrl }));
    } catch (err) {
      console.error("Error al procesar logo:", err);
      alert("No se pudo cargar la imagen. Intenta con otro archivo.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user?.id) {
      setError("Debes iniciar sesión para registrar un equipo.");
      setLoading(false);
      return;
    }

    if (!formData.nombre.trim()) {
      setError("El nombre del equipo es obligatorio.");
      irAlPaso(1, step1Ref);
      setLoading(false);
      return;
    }

    if (!formData.sport_id) {
      setError("Por favor selecciona un deporte.");
      irAlPaso(5, step5Ref);
      setLoading(false);
      return;
    }

    try {
      await equiposApi.crear({
        nombre: formData.nombre,
        color: formData.color,
        logo_url: formData.logo_url || undefined,
        organizer_id: user.id,
        datos_adicionales: {
          tipo_equipo: formData.tipo_equipo,
          sport_id: formData.sport_id,
          sport_nombre: selectedSportObj?.nombre || "Fútbol",
          creador_id: user.id,
          creador_email: user.email,
        },
      });
      router.push("/equipos");
    } catch (err: any) {
      const msg = err?.message || err?.detail || "Error al crear el equipo";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const selectedSportObj = sports.find((s) => s.id === formData.sport_id);

  // Estados de completado para las palomitas (checkmarks)
  const isStep1Complete = formData.nombre.trim().length > 0 && activeStep > 1;
  const isStep2Complete = activeStep > 2;
  const isStep3Complete = Boolean(formData.color) && activeStep > 3;
  const isStep4Complete = Boolean(formData.tipo_equipo) && activeStep > 4;
  const isStep5Complete = Boolean(formData.sport_id);

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
      <div className="min-h-screen bg-background pb-24 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Volver */}
          <Link
            href="/equipos"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            ← Volver a Equipos
          </Link>

          {/* Encabezado */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Registrar Nuevo Equipo
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Crea la identidad oficial de tu club deportivo en 5 pasos.
            </p>
          </div>

          {/* Hero Banner de Vista Previa del Club */}
          <div className="relative w-full h-52 sm:h-60 rounded-3xl overflow-hidden mb-8 border border-secondary shadow-xl transition-all">
            {/* Fondo con degradado del color elegido */}
            <div
              className="absolute inset-0 transition-colors duration-500 opacity-90"
              style={{
                background: `linear-gradient(135deg, ${formData.color} 0%, #09090b 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <div className="relative z-10 h-full p-6 flex items-center gap-6">
              {/* Escudo Emblemático en PNG Nativo (Sin recorte circular forzado) */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0 p-1">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Escudo del Equipo"
                    className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-2xl border-2 border-white/30 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: formData.color }}
                  >
                    <span
                      className="text-3xl font-black uppercase"
                      style={{ color: formData.color === "#f4f4f5" ? "#18181b" : "#ffffff" }}
                    >
                      {formData.nombre.trim() ? formData.nombre.trim().charAt(0) : "C"}
                    </span>
                  </div>
                )}
              </div>

              {/* Info del Club en Hero */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-extrabold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 capitalize">
                    {formData.tipo_equipo}
                  </span>
                  {selectedSportObj && (
                    <span className="text-xs uppercase tracking-widest font-extrabold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      {selectedSportObj.nombre}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md tracking-tight leading-tight">
                  {formData.nombre.trim() || "Nombre de tu Club"}
                </h2>

                <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                  <span
                    className="w-3 h-3 rounded-full border border-white/40"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span>Color Oficial: {formData.color}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario Acordeón Paso a Paso */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* PASO 1: NOMBRE DEL EQUIPO */}
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
                      Paso 1: Nombre del Equipo
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
                      Escribe el nombre del club o equipo
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 border border-secondary rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-base transition-all placeholder:text-muted-foreground"
                      required
                      placeholder="Ej: Rayos de Puebla FC"
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
                      Avanzar a Escudo →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 2: ESCUDO / LOGO EN PNG */}
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
                      Paso 2: Escudo / Logo del Club (PNG)
                    </h3>
                    {activeStep !== 2 && (
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {formData.logo_url ? "Escudo subido" : "Sin escudo asignado (se usará inicial)"}
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
                      Sube la imagen del escudo en PNG o JPG (acepta fotos de alta calidad &gt;3MB).
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 px-4 rounded-xl border border-secondary bg-background hover:bg-secondary/50 text-foreground font-semibold text-sm transition-colors shadow-sm text-center"
                      >
                        Subir Imagen (PNG / JPG)
                      </button>

                      {formData.logo_url && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logo_url: "" })}
                          className="text-xs font-semibold text-red-500 hover:underline px-3 py-2"
                        >
                          Remover Escudo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => irAlPaso(3, step3Ref)}
                      className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-light transition-colors text-sm"
                    >
                      Avanzar a Color →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 3: COLOR DEL EQUIPO */}
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
                      Paso 3: Color Oficial del Club
                    </h3>
                    {activeStep !== 3 && formData.color && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: formData.color }}
                        />
                        <span className="text-xs text-primary font-semibold">
                          {formData.color}
                        </span>
                      </div>
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
                      Selecciona un color de la paleta principal o ingresa un código HEX personalizado.
                    </p>

                    {/* Muestras de la Paleta */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-4">
                      {COLORES_PREDEFINIDOS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: c.hex })}
                          className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center ${
                            formData.color.toLowerCase() === c.hex.toLowerCase()
                              ? "border-primary ring-2 ring-primary/40 scale-105 shadow-md"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.nombre}
                        >
                          {formData.color.toLowerCase() === c.hex.toLowerCase() && (
                            <span
                              className="text-xs font-bold"
                              style={{ color: c.hex === "#f4f4f5" ? "#18181b" : "#ffffff" }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Input Libre HEX */}
                    <div className="flex items-center gap-3 bg-background p-3 rounded-xl border border-secondary">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase">
                          Código HEX Personalizado
                        </label>
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-full bg-transparent font-mono text-sm font-bold text-foreground focus:outline-none"
                          placeholder="#991b1b"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => irAlPaso(4, step4Ref)}
                      className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-light transition-colors text-sm"
                    >
                      Avanzar a Rama →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 4: TIPO DE EQUIPO (RAMA) */}
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
                      Paso 4: Tipo de Equipo (Rama)
                    </h3>
                    {activeStep !== 4 && formData.tipo_equipo && (
                      <p className="text-xs text-primary font-semibold mt-0.5 capitalize">
                        {formData.tipo_equipo}
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
                      Selecciona la modalidad de integrantes del club.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {RAMAS_CONFIG.map((rama) => {
                        const isSelected = formData.tipo_equipo === rama.id;

                        return (
                          <button
                            key={rama.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, tipo_equipo: rama.id });
                              irAlPaso(5, step5Ref);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                              isSelected
                                ? rama.activeColor + " shadow-md"
                                : "border-secondary bg-background hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-md border ${rama.badgeColor}`}
                              >
                                {rama.titulo}
                              </span>
                              {isSelected && (
                                <span className="text-xs font-bold text-primary">✓</span>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {rama.descripcion}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 5: DEPORTE (Tarjetas Visuales) */}
            <div
              ref={step5Ref}
              className="bg-card rounded-2xl border border-secondary overflow-hidden shadow-sm transition-all duration-300"
            >
              <div
                onClick={() => irAlPaso(5, step5Ref)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isStep5Complete
                        ? "bg-emerald-600 text-white"
                        : activeStep === 5
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isStep5Complete ? "✓" : "5"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">
                      Paso 5: Deporte del Equipo
                    </h3>
                    {activeStep !== 5 && selectedSportObj && (
                      <p className="text-xs text-primary font-semibold mt-0.5 uppercase tracking-wider">
                        {selectedSportObj.nombre}
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
                    className="text-xs font-semibold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10"
                  >
                    Editar
                  </button>
                )}
              </div>

              {activeStep === 5 && (
                <div className="p-5 pt-0 border-t border-secondary/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="pt-3">
                    <p className="text-xs text-muted-foreground mb-4">
                      Selecciona la disciplina principal en la que competirá este club.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {sports.map((sport) => {
                        const isSelected = formData.sport_id === sport.id;
                        const imgSrc = getDeporteImagen(sport);

                        return (
                          <button
                            key={sport.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, sport_id: sport.id })}
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Botón Final Crear Equipo */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !formData.nombre.trim() || !formData.sport_id}
                className="w-full py-4 bg-primary hover:bg-primary-light text-primary-foreground rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? "Registrando Equipo..." : "Registrar Equipo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}