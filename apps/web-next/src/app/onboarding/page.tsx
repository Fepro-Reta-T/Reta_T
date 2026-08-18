"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../../lib/api";
import { Role } from "@reta-t/types";

// Tipos locales
type VisualRole = "organizer" | "coach" | "player" | "referee" | "viewer";

interface RoleOption {
  id: VisualRole;
  title: string;
  description: string;
  icon: string; // Emoji temporal
}

const roleOptions: RoleOption[] = [
  { id: "organizer", title: "Organizador", description: "Creo y gestiono ligas y torneos", icon: "🏆" },
  { id: "coach", title: "Entrenador / Coach", description: "Dirijo un equipo", icon: "📋" },
  { id: "player", title: "Jugador", description: "Juego en un equipo", icon: "⚽" },
  { id: "referee", title: "Árbitro / Referee", description: "Registro los eventos de un partido", icon: "⏱️" },
  { id: "viewer", title: "Fan / Espectador", description: "Sigo a mis equipos y torneos favoritos", icon: "👀" },
];

interface SportOption {
  id: string;
  name: string;
  icon: string;
  image?: string;
}

const visualSports: SportOption[] = [
  { id: "futbol", name: "Fútbol", icon: "⚽", image: "/Futbol.jpg" },
  { id: "futbol7", name: "Fútbol 7", icon: "🏟️", image: "/Futbol 7.jpg" },
  { id: "basketball", name: "Basketball", icon: "🏀", image: "/Basket.jpg" },
  { id: "volleyball", name: "Voleibol", icon: "🏐", image: "/Volley.jpg" },
];

const visualTeams = [
  { id: "t1", name: "Los Cuervos FC", sport: "Fútbol" },
  { id: "t2", name: "Toros Neza", sport: "Fútbol 7" },
  { id: "t3", name: "Dream Team", sport: "Basketball" },
  { id: "t4", name: "Real Madrid", sport: "Fútbol" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Selecciones
  const [selectedRole, setSelectedRole] = useState<VisualRole | null>(null);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // Paso 1: Mapeo de rol visual a Role del backend
  const getBackendRole = (visual: VisualRole): { role: Role; is_coach: boolean } => {
    switch (visual) {
      case "organizer": return { role: Role.ORGANIZER, is_coach: false };
      case "referee": return { role: Role.MATCH_MANAGER, is_coach: false };
      case "viewer": return { role: Role.VIEWER, is_coach: false };
      case "coach": return { role: Role.PLAYER, is_coach: true };
      case "player":
      default: return { role: Role.PLAYER, is_coach: false };
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      let finalRole: Role = Role.PLAYER;
      let isCoach = false;

      if (selectedRole) {
        const mapped = getBackendRole(selectedRole);
        finalRole = mapped.role;
        isCoach = mapped.is_coach;
      }

      const updatedUser = await authApi.updateOnboarding({
        role: finalRole,
        datos_adicionales: {
          onboarding_completed: true,
          is_coach: isCoach,
          favorite_sports: selectedSports,
          favorite_teams: selectedTeams,
        },
      });
      localStorage.setItem("user", JSON.stringify(updatedUser));
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al guardar onboarding:", error);
      // Fallback seguro al dashboard
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Organizadores y Coaches no necesitan pasos de preferencias — van directo al dashboard
  const rolesQueOmiten = ["organizer", "coach"];
  const debeOmitirPreferencias = selectedRole !== null && rolesQueOmiten.includes(selectedRole);

  const nextStep = () => {
    if (step === 1 && debeOmitirPreferencias) {
      // Saltar pasos 2 y 3, finalizar directamente
      handleFinish();
    } else if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const toggleSport = (id: string) => {
    setSelectedSports(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleTeam = (id: string) => {
    setSelectedTeams(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card border border-secondary rounded-xl p-8 relative overflow-hidden shadow-xl">
        
        {/* ProgressBar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold text-foreground text-center mb-2">¡Bienvenido a Reta-T!</h1>
            <p className="text-muted-foreground text-center mb-8">¿Cómo planeas usar la plataforma?</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roleOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedRole(opt.id)}
                  className={`p-4 border rounded-xl text-left transition-all ${
                    selectedRole === opt.id 
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                      : "border-secondary hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <div className="text-3xl mb-2">{opt.icon}</div>
                  <h3 className="font-semibold text-foreground">{opt.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
                </button>
              ))}
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <button onClick={() => nextStep()} className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors">
                Saltar
              </button>
              <button 
                onClick={() => nextStep()}
                disabled={!selectedRole}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-bold text-foreground text-center mb-2">Tus deportes favoritos</h1>
            <p className="text-muted-foreground text-center mb-8">Selecciona los deportes que más te interesan para personalizar tu experiencia.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {visualSports.map((sport) => {
                const isSelected = selectedSports.includes(sport.id);
                return (
                  <button
                    key={sport.id}
                    onClick={() => toggleSport(sport.id)}
                    className={`relative group overflow-hidden h-36 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/50 scale-[1.02] shadow-lg shadow-primary/20"
                        : "border-secondary hover:border-primary/50 hover:scale-[1.01]"
                    }`}
                  >
                    {sport.image ? (
                      <>
                        <img
                          src={sport.image}
                          alt={sport.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div
                          className={`absolute inset-0 transition-opacity duration-300 ${
                            isSelected
                              ? "bg-gradient-to-t from-black/90 via-black/60 to-primary/40"
                              : "bg-gradient-to-t from-black/85 via-black/50 to-black/30 group-hover:from-black/70"
                          }`}
                        />
                      </>
                    ) : (
                      <div
                        className={`absolute inset-0 transition-colors ${
                          isSelected
                            ? "bg-gradient-to-br from-primary/30 to-secondary"
                            : "bg-secondary/40 group-hover:bg-secondary/70"
                        }`}
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center justify-center p-2 text-center">
                      <span className="font-bold text-white drop-shadow-md text-lg tracking-wide">
                        {sport.name}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 bg-primary text-white rounded-full p-1.5 shadow-md animate-in zoom-in-50 duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2 text-muted-foreground hover:text-foreground">
                Atrás
              </button>
              <div className="flex gap-4">
                <button onClick={() => nextStep()} className="px-6 py-2 text-muted-foreground hover:text-foreground">
                  Saltar
                </button>
                <button 
                  onClick={() => nextStep()}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-light"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-3xl font-bold text-foreground text-center mb-2">Equipos sugeridos</h1>
            <p className="text-muted-foreground text-center mb-8">Basado en tu zona y preferencias, te sugerimos seguir a estos equipos.</p>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {visualTeams.map((team) => (
                <div
                  key={team.id}
                  className="p-4 border border-secondary rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-xl">
                      🛡️
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">{team.sport}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTeam(team.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedTeams.includes(team.id)
                        ? "bg-secondary text-foreground"
                        : "bg-primary text-primary-foreground hover:bg-primary-light"
                    }`}
                  >
                    {selectedTeams.includes(team.id) ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-2 text-muted-foreground hover:text-foreground">
                Atrás
              </button>
              <div className="flex gap-4">
                <button onClick={handleFinish} disabled={loading} className="px-6 py-2 text-muted-foreground hover:text-foreground">
                  Saltar
                </button>
                <button 
                  onClick={handleFinish}
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-light disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Finalizar y Entrar"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
