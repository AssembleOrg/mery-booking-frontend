import { CATEGORY_IDS } from './constants';
import type { AccordionContentType } from '@/infrastructure/types/services';

export interface DepositServiceLike {
  name: string;
  categoryId?: string;
  duration: number;
  price: number;
}

export const DEPOSIT_AMOUNTS_ARS = {
  ESTILISMO_SINGLE: 30000,
  ESTILISMO_MULTI: 50000,
  COSMETIC_DEFAULT: 150000,
  LIP_BLUSH_SESSION_OR_MAINTENANCE: 200000,
  LIP_BLUSH_RETOQUE: 150000,
  LIP_CAMOUFLAGE: 200000,
  LAST_MINUTE: 150000,
  SCALP: 150000,
} as const;

export interface DepositContext {
  serviceKey?: string;
  contentType?: AccordionContentType;
  optionLabel?: string;
}

export function calculateDepositAmount(
  service: DepositServiceLike | undefined,
  ctx: DepositContext = {}
): number {
  if (!service) return 0;

  const price = Number(service.price);
  if (!Number.isFinite(price) || price <= 0) return 0;

  if (service.categoryId === CATEGORY_IDS.ESTILISMO_CEJAS) {
    const isMultiService = service.name.includes('+');
    const deposit = isMultiService
      ? DEPOSIT_AMOUNTS_ARS.ESTILISMO_MULTI
      : DEPOSIT_AMOUNTS_ARS.ESTILISMO_SINGLE;
    return Math.min(price, deposit);
  }

  const optionLabelLower = (ctx.optionLabel ?? '').toLowerCase();

  if (ctx.contentType === 'last-minute' || optionLabelLower.includes('last minute booking')) {
    return Math.min(price, DEPOSIT_AMOUNTS_ARS.LAST_MINUTE);
  }

  const serviceKey = (ctx.serviceKey ?? '').toLowerCase();

  if (serviceKey === 'nanoblading') {
    if (
      ctx.contentType === 'sesion-calendario' ||
      ctx.contentType === 'retoque-calendario' ||
      ctx.contentType === 'mantenimiento-calendario'
    ) {
      return Math.min(price, DEPOSIT_AMOUNTS_ARS.COSMETIC_DEFAULT);
    }
  }

  if (serviceKey === 'lashes-line') {
    if (
      ctx.contentType === 'sesion-calendario' ||
      ctx.contentType === 'retoque-calendario' ||
      ctx.contentType === 'mantenimiento-calendario'
    ) {
      return Math.min(price, DEPOSIT_AMOUNTS_ARS.COSMETIC_DEFAULT);
    }
  }

  if (serviceKey === 'lip-camouflage') {
    if (
      ctx.contentType === 'sesion-calendario' ||
      ctx.contentType === 'retoque-calendario' ||
      ctx.contentType === 'mantenimiento-calendario'
    ) {
      return Math.min(price, DEPOSIT_AMOUNTS_ARS.LIP_CAMOUFLAGE);
    }
  }

  if (serviceKey === 'lip-blush') {
    if (ctx.contentType === 'retoque-calendario') {
      return Math.min(price, DEPOSIT_AMOUNTS_ARS.LIP_BLUSH_RETOQUE);
    }
    if (
      ctx.contentType === 'sesion-calendario' ||
      ctx.contentType === 'mantenimiento-calendario'
    ) {
      return Math.min(price, DEPOSIT_AMOUNTS_ARS.LIP_BLUSH_SESSION_OR_MAINTENANCE);
    }
  }

  const serviceNameLower = service.name.toLowerCase();
  if (serviceNameLower.includes('scalp')) {
    return Math.min(price, DEPOSIT_AMOUNTS_ARS.SCALP);
  }

  const duration = service.duration;
  if (duration >= 120) {
    return Math.min(price, 150000);
  }

  return Math.min(price, 100000);
}

export function formatArs(amount: number): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(rounded);
}
