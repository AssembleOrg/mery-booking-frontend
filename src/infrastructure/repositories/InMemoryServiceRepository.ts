import { Service } from '@/domain/entities';
import { ServiceRepository } from '@/domain/repositories';

export class InMemoryServiceRepository implements ServiceRepository {
  private services: Service[] = [
    {
      id: '1',
      name: 'Cosmetic Tattoo',
      description: 'Servicios de tatuaje cosmético profesional',
      slug: 'cosmetic-tattoo',
    },
    {
      id: '2',
      name: 'Estilismo de Cejas',
      description: 'Diseño y estilismo profesional de cejas',
      slug: 'eyebrow-styling',
    },
    {
      id: '3',
      name: 'Paramedical Tattoo',
      description: 'Tatuaje paramédico especializado',
      slug: 'paramedical-tattoo',
    },
  ];

  async getAll(): Promise<Service[]> {
    return this.services;
  }

  async getBySlug(slug: string): Promise<Service | null> {
    return this.services.find((service) => service.slug === slug) || null;
  }
}

