'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      // Usamos import() dinámico para que no se incluya en el build de producción
      import('../mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass', // Evita warnings de requests no mockeados (como Next.js internos)
        }).then(() => {
          setIsReady(true);
        });
      });
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return null; // O un spinner mínimo mientras carga MSW
  }

  return <>{children}</>;
}
