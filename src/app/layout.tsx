import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProviderWrapper } from '@/presentation/providers';
import { ColorSchemeScript } from '@mantine/core';

// Fuente principal para la web (Medium .otf)
const avantGardeMedium = localFont({
  src: '../../public/fonts/AvantGardeLT-Medium.otf',
  variable: '--font-avant-garde',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

// Fuente para botones de home (.ttf)
const avantGardeButtons = localFont({
  src: '../../public/fonts/avantg.ttf',
  variable: '--font-avant-garde-buttons',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

// Fuente para dropdowns (Poppins ExtraLight)
const poppinsExtraLight = localFont({
  src: '../../public/fonts/Poppins-ExtraLight.ttf',
  variable: '--font-poppins-extralight',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Mery García - Cosmetic Tattoo',
  description: 'Portal de reservas online - Cosmetic Tattoo, Estilismo de Cejas y Paramedical Tattoo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body 
        className={`${avantGardeMedium.variable} ${avantGardeButtons.variable} ${poppinsExtraLight.variable}`} 
        style={{ margin: 0 }}
        suppressHydrationWarning
      >
        <MantineProviderWrapper>{children}</MantineProviderWrapper>
      </body>
    </html>
  );
}
