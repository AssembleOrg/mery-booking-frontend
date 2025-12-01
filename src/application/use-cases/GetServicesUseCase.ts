import { Service } from '@/domain/entities';
import { ServiceRepository } from '@/domain/repositories';

export class GetServicesUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(): Promise<Service[]> {
    return this.serviceRepository.getAll();
  }
}

