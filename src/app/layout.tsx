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

const metadataBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl ? new URL(metadataBaseUrl) : undefined,
  title: 'Mery García - Cosmetic Tattoo',
  description: 'Portal de reservas online - Cosmetic Tattoo, Estilismo de Cejas y Paramedical Tattoo',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Mery García Booking',
    title: 'Mery García - Cosmetic Tattoo',
    description: 'Portal de reservas online - Cosmetic Tattoo, Estilismo de Cejas y Paramedical Tattoo',
    images: [
      {
        url: '/og-image.png',
        width: 512,
        height: 512,
        alt: 'Mery García - Cosmetic Tattoo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mery García - Cosmetic Tattoo',
    description: 'Portal de reservas online - Cosmetic Tattoo, Estilismo de Cejas y Paramedical Tattoo',
    images: ['/og-image.png'],
  },
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
  viewportFit: 'cover',
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
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${avantGardeMedium.variable} ${poppinsExtraLight.variable} ${dinLight.variable} ${dinRegular.variable} ${dinMedium.variable}`}
        style={{ margin: 0 }}
        suppressHydrationWarning
      >
        <MantineProviderWrapper>{children}</MantineProviderWrapper>
      </body>
    </html>
  );
}
