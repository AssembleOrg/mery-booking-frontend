import { Service } from '@/domain/entities';
import { ServiceRepository } from '@/domain/repositories';

export class InMemoryServiceRepository implements ServiceRepository {
  private services: Service[] = [
    {
      id: '1',
      name: 'Cosmetic Tattoo',
      slug: 'tattoo-cosmetico',
      price: 0,
      priceBook: 0,
      duration: 60,
    },
    {
      id: '2',
      name: 'Estilismo de Cejas',
      slug: 'eyebrow-styling',
      price: 0,
      priceBook: 0,
      duration: 60,
    },
    {
      id: '3',
      name: 'Paramedical Tattoo',
      slug: 'paramedical-tattoo',
      price: 0,
      priceBook: 0,
      duration: 60,
    },
  ];

  async getAll(): Promise<Service[]> {
    return this.services;
  }

  async getBySlug(slug: string): Promise<Service | null> {
    return this.services.find((service) => service.slug === slug) || null;
  }
}

