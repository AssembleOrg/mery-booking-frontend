'use client';

import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let publicClientInstance: AxiosInstance | null = null;

function createPublicClient(): AxiosInstance {
  if (publicClientInstance) {
    return publicClientInstance;
  }

  publicClientInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // No agregar token de autenticación - este cliente es para endpoints públicos

  return publicClientInstance;
}

// Crear un objeto con getter para lazy initialization
const publicApiClientProxy = {} as AxiosInstance;

// Usar Proxy para interceptar todas las llamadas
const handler: ProxyHandler<AxiosInstance> = {
  get(_target, prop) {
    const client = createPublicClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
};

// Default export para compatibilidad con código existente
export default new Proxy(publicApiClientProxy, handler);


