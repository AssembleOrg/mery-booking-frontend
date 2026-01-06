'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ReactNode } from 'react';
import { AuthProvider } from '@/presentation/contexts';
import { QueryProvider } from './QueryProvider';

const theme = createTheme({
  fontFamily: 'var(--font-avant-garde), sans-serif',
  primaryColor: 'pink',
  colors: {
    pink: [
      '#FBE8EA',  // 0-1: muy claro (fondos)
      '#FBE8EA',
      '#F7CBCB',  // 2-3: claro (UI primario)
      '#F7CBCB',
      '#EBA2A8',  // 4-9: medio-oscuro (hovers, activos)
      '#EBA2A8',
      '#EBA2A8',
      '#EBA2A8',
      '#EBA2A8',
      '#EBA2A8',
    ],
  },
  defaultRadius: 'md',
});

interface MantineProviderWrapperProps {
  children: ReactNode;
}

export function MantineProviderWrapper({
  children,
}: MantineProviderWrapperProps) {
  return (
    <QueryProvider>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" zIndex={1000} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </MantineProvider>
    </QueryProvider>
  );
}

