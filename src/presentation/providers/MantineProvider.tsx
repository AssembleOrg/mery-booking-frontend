'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ReactNode } from 'react';
import { AuthProvider } from '@/presentation/contexts';

const theme = createTheme({
  fontFamily: 'var(--font-avant-garde), sans-serif',
  primaryColor: 'pink',
  colors: {
    pink: [
      '#fef5f7',
      '#fce9ed',
      '#f9d0d8',
      '#f9bbc4',
      '#f7a3af',
      '#f58b9a',
      '#f37385',
      '#ed516a',
      '#e73f58',
      '#e02d45',
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
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <AuthProvider>
        {children}
      </AuthProvider>
    </MantineProvider>
  );
}

