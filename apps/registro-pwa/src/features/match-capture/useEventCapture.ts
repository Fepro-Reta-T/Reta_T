import { useCallback } from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import { useSyncStore } from '../../store/useSyncStore';

// Aquí definimos los tipos de eventos que se pueden registrar en la cancha
export type EventType = 'GOL' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA' | 'ASISTENCIA';
export type TeamSide = 'local' | 'visitante';

export const useEventCapture = () => {
  const addEvent = useMatchStore((state) => state.addEvent);
  const events = useMatchStore((state) => state.events);
  const currentMinute = useMatchStore((state) => state.currentMinute);
  
  const setPendingEvents = useSyncStore((state) => state.setPendingEvents);
  const pendingEvents = useSyncStore((state) => state.pendingEvents);

  // Función que se dispara cuando el árbitro toca un botón
  const registerEvent = useCallback(
    (event_type: EventType, teamId: TeamSide, playerName?: string) => {
      // Creamos el evento con la hora real (Event Sourcing)
      addEvent({
        event_type,
        teamId,
        playerName,
        minute: currentMinute,
      });

      // Actualizamos la cola de sincronización (simulamos que hay 1 evento más por subir)
      setPendingEvents(pendingEvents + 1);
    },
    [addEvent, currentMinute, pendingEvents, setPendingEvents]
  );

  // Retornamos también pendingEvents para que la pantalla pueda acceder a ella
  return { registerEvent, events, currentMinute, pendingEvents };
};