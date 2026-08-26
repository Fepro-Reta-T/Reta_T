import { useMatchStore } from '../../store/useMatchStore';
import { useEventCapture } from './useEventCapture';

export default function MatchCaptureScreen() {
  const { homeScore, awayScore, currentMinute, startMatch, stopMatch } = useMatchStore();
  const { registerEvent, events, pendingEvents } = useEventCapture();

  // Si no hay partido activo, mostramos una pantalla simple para iniciarlo
  if (!useMatchStore.getState().isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-bold mb-4">Panel del Árbitro</h1>
        <p className="text-gray-400 mb-8 text-center">Conecta tu dispositivo y gestiona los eventos del partido en tiempo real.</p>
        <button 
          onClick={() => startMatch('demo-match-id')}
          className="bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-8 px-16 rounded-xl w-full shadow-lg active:scale-95 transition-transform"
        >
          INICIAR PARTIDO
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4 max-w-md mx-auto">
      {/* Header con marcador y cronómetro */}
      <div className="flex justify-between items-center mb-6 mt-4">
        <button onClick={stopMatch} className="text-sm text-gray-400 hover:text-white">Finalizar</button>
        <div className="text-4xl font-mono font-bold text-center">
          {homeScore} - {awayScore}
        </div>
        <div className="text-2xl font-mono text-gray-300">
          {currentMinute}'
        </div>
      </div>

      {/* Zona de Botones Gigantes (Minimalismo extremo) */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Botón de GOL */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => registerEvent('GOL', 'local')}
            className="bg-green-600 hover:bg-green-700 active:scale-95 transition-transform text-white text-4xl font-black py-10 rounded-2xl"
          >
            GOL LOCAL
          </button>
          <button 
            onClick={() => registerEvent('GOL', 'visitante')}
            className="bg-green-600 hover:bg-green-700 active:scale-95 transition-transform text-white text-4xl font-black py-10 rounded-2xl"
          >
            GOL VISITA
          </button>
        </div>

        {/* Botones de Tarjetas */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => registerEvent('TARJETA_AMARILLA', 'local')}
            className="bg-yellow-500 hover:bg-yellow-600 active:scale-95 transition-transform text-black text-2xl font-bold py-6 rounded-xl"
          >
            TARJETA LOCAL
          </button>
          <button 
            onClick={() => registerEvent('TARJETA_AMARILLA', 'visitante')}
            className="bg-yellow-500 hover:bg-yellow-600 active:scale-95 transition-transform text-black text-2xl font-bold py-6 rounded-xl"
          >
            TARJETA VISITA
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => registerEvent('TARJETA_ROJA', 'local')}
            className="bg-red-600 hover:bg-red-700 active:scale-95 transition-transform text-white text-2xl font-bold py-6 rounded-xl"
          >
            ROJA LOCAL
          </button>
          <button 
            onClick={() => registerEvent('TARJETA_ROJA', 'visitante')}
            className="bg-red-600 hover:bg-red-700 active:scale-95 transition-transform text-white text-2xl font-bold py-6 rounded-xl"
          >
            ROJA VISITA
          </button>
        </div>
      </div>

      {/* Footer con cola de sincronización */}
      <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-400">
        <p>Eventos registrados: {events.length}</p>
        <p>Pendientes por sincronizar: {pendingEvents}</p>
      </div>
    </div>
  );
}