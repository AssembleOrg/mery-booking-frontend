import type { Metadata, Viewport } from 'next';
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

// DIN Light - Body copy, descripciones, párrafos (300)
const dinLight = localFont({
  src: [
    { path: '../../public/fonts/DIN-Light.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/DIN-Light.woff', weight: '300', style: 'normal' },
    { path: '../../public/fonts/DIN-Light.ttf', weight: '300', style: 'normal' },
  ],
  variable: '--font-din-light',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

// DIN Regular - Formularios, labels, UI estándar (400)
const dinRegular = localFont({
  src: [
    { path: '../../public/fonts/DIN-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/DIN-Regular.woff', weight: '400', style: 'normal' },
    { path: '../../public/fonts/DIN-Regular.ttf', weight: '400', style: 'normal' },
  ],
  variable: '--font-din-regular',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

// DIN Medium - Navegación, botones, CTAs, énfasis (500)
const dinMedium = localFont({
  src: [
    { path: '../../public/fonts/DIN-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/DIN-Medium.woff', weight: '500', style: 'normal' },
    { path: '../../public/fonts/DIN-Medium.ttf', weight: '500', style: 'normal' },
  ],
  variable: '--font-din-medium',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Mery García - Cosmetic Tattoo',
  description: 'Portal de reservas online - Cosmetic Tattoo, Estilismo de Cejas y Paramedical Tattoo',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MG Booking',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f9bbc4',
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
        className={`${avantGardeMedium.variable} ${avantGardeButtons.variable} ${dinLight.variable} ${dinRegular.variable} ${dinMedium.variable}`}
        style={{ margin: 0 }}
        suppressHydrationWarning
      >
        <MantineProviderWrapper>{children}</MantineProviderWrapper>
      </body>
    </html>
  );
}
