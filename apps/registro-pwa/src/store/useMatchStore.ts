import { create } from 'zustand';

// Definimos el tipo de un evento de partido (gol, tarjeta, etc.)
export interface MatchEventLocal {
  id: string;
  client_timestamp: string; // Event Sourcing: la hora real en el teléfono del árbitro
  event_type: 'GOL' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA' | 'ASISTENCIA';
  teamId: 'local' | 'visitante';
  playerName?: string;
  minute: number;
}

interface MatchState {
  matchId: string | null;
  isActive: boolean;
  homeScore: number;
  awayScore: number;
  currentMinute: number;
  events: MatchEventLocal[];
  
  startMatch: (matchId: string) => void;
  stopMatch: () => void;
  addEvent: (event: Omit<MatchEventLocal, 'id' | 'client_timestamp'>) => void;
  incrementMinute: () => void;
  resetMatch: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matchId: null,
  isActive: false,
  homeScore: 0,
  awayScore: 0,
  currentMinute: 0,
  events: [],

  startMatch: (matchId) => set({ matchId, isActive: true, currentMinute: 0, events: [] }),
  
  stopMatch: () => set({ isActive: false }),

  addEvent: (event) => {
    const newEvent: MatchEventLocal = {
      ...event,
      id: crypto.randomUUID(), // ID único local para evitar duplicados al sincronizar
      client_timestamp: new Date().toISOString(), // El corazón de Event Sourcing
    };

    const isGoal = event.event_type === 'GOL';
    set((state) => ({
      events: [...state.events, newEvent],
      homeScore: isGoal && event.teamId === 'local' ? state.homeScore + 1 : state.homeScore,
      awayScore: isGoal && event.teamId === 'visitante' ? state.awayScore + 1 : state.awayScore,
    }));
  },

  incrementMinute: () => set((state) => ({ currentMinute: state.currentMinute + 1 })),

  resetMatch: () => set({ matchId: null, isActive: false, homeScore: 0, awayScore: 0, currentMinute: 0, events: [] }),
}));