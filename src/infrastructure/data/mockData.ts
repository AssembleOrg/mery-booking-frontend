import { Professional, Service } from '@/domain/entities';

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-001',
    name: 'Luna Staff',
    available: true,
    services: ['service-001', 'service-002', 'service-003'],
  },
  {
    id: 'prof-002',
    name: 'Rosario Staff',
    available: true,
    services: ['service-001', 'service-002', 'service-004', 'service-005'],
  },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 'service-001',
    name: 'Lash Refill',
    slug: 'lash-refill',
    price: 32000,
    priceBook: 25000,
    duration: 60,
    image: '/images/estilismo-cejas.webp',
  },
  {
    id: 'service-002',
    name: 'Modelado de cejas',
    slug: 'modelado-cejas',
    price: 18000,
    priceBook: 15000,
    duration: 45,
    image: '/images/estilismo-cejas.webp',
  },
  {
    id: 'service-003',
    name: 'Brow Refill',
    slug: 'brow-refill',
    price: 28000,
    priceBook: 22000,
    duration: 60,
    image: '/images/estilismo-cejas.webp',
  },
  {
    id: 'service-004',
    name: 'Laminado de cejas',
    slug: 'laminado-cejas',
    price: 35000,
    priceBook: 28000,
    duration: 90,
    image: '/images/estilismo-cejas.webp',
  },
  {
    id: 'service-005',
    name: 'Tinte de cejas',
    slug: 'tinte-cejas',
    price: 15000,
    priceBook: 12000,
    duration: 30,
    image: '/images/estilismo-cejas.webp',
  },
  {
    id: 'service-006',
    name: 'Combo Lash & Brow',
    slug: 'combo-lash-brow',
    price: 45000,
    priceBook: 38000,
    duration: 120,
    image: '/images/estilismo-cejas.webp',
  },
  {
    id: 'service-007',
    name: 'Asesoramiento de Estilismo de Cejas',
    slug: 'asesoramiento-cejas',
    price: 20000,
    priceBook: 18000,
    duration: 60,
    image: '/images/estilismo-cejas.webp',
  },
  {
    id: 'service-008',
    name: 'Microblading / Tattoo Cosmético - Consulta',
    slug: 'microblading-consulta',
    price: 25000,
    priceBook: 20000,
    duration: 60,
    image: '/images/estilismo-cejas.webp',
  },
  {
    id: 'service-009',
    name: 'Microblading / Tattoo Cosmético - Sesión',
    slug: 'microblading-sesion',
    price: 120000,
    priceBook: 100000,
    duration: 180,
    image: '/images/estilismo-cejas.webp',
  },
  {
    id: 'service-010',
    name: 'Paramedical Tattoo - Consulta',
    slug: 'paramedical-tattoo-consulta',
    price: 30000,
    priceBook: 25000,
    duration: 60,
    image: '/images/estilismo-cejas.webp',
  },
];

export const MOCK_LOCATION = 'Mery García Office';

