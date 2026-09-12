'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
      refetchOnWindowFocus: false,
      // Reintentar solo errores de red / 5xx. Un 4xx (400/404) vuelve a fallar igual:
      // reintentarlo duplica requests sin beneficio.
      retry: (failureCount, error) => {
        if (failureCount >= 1) return false;
        const status = (error as { response?: { status?: number } })?.response?.status;
        return !(status && status >= 400 && status < 500);
      },
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}


