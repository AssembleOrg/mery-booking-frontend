import { Service } from '../entities';

export interface ServiceRepository {
  getAll(): Promise<Service[]>;
  getBySlug(slug: string): Promise<Service | null>;
}

