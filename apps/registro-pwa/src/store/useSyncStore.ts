import { create } from 'zustand';

// Simulamos la cola de sincronización.
// En el futuro, aquí se implementará la conexión real con IndexedDB.
interface SyncState {
  pendingEvents: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  setPendingEvents: (count: number) => void;
  startSync: () => void;
  finishSync: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  pendingEvents: 0,
  isSyncing: false,
  lastSyncTime: null,

  setPendingEvents: (count) => set({ pendingEvents: count }),
  
  startSync: () => set({ isSyncing: true }),

  finishSync: () => set({ 
    isSyncing: false, 
    pendingEvents: 0, 
    lastSyncTime: new Date().toISOString() 
  }),
}));