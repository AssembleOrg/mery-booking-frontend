import { Client } from './Client';

export interface BuyIntention {
  professional: string; // Professional ID
  date: string; // ISO date string
  time: string; // HH:mm format
  location: string;
  client: Client;
  service: string; // Service ID
  price: number;
  deposit?: number; // Depósito/seña
}

