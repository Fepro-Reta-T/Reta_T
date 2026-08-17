"use client";

import { useEffect, useState } from "react";

export default function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      try {
        // Solo activar MSW en desarrollo y si la variable está configurada
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCKS !== 'false') {
          const { worker } = await import('@/mocks/browser');
          await worker.start({
            onUnhandledRequest: 'bypass',
          });
          console.log('🟢 MSW activado');
        } else {
          console.log('🔴 MSW desactivado');
        }
      } catch (error) {
        console.error('❌ Error al iniciar MSW:', error);
      } finally {
        setIsReady(true);
      }
    };

    initMSW();
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}