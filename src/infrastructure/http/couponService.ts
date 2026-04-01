'use client';

import apiClient from './apiClient';
import publicApiClient from './publicApiClient';

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: string | null;
  validTo: string | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  services: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponDto {
  code?: string;
  discountPercent: number;
  validFrom?: string;
  validTo?: string;
  maxUses?: number;
  serviceIds: string[];
  isActive?: boolean;
}

export interface UpdateCouponDto {
  code?: string;
  discountPercent?: number;
  validFrom?: string | null;
  validTo?: string | null;
  maxUses?: number | null;
  serviceIds?: string[];
  isActive?: boolean;
}

export interface ValidateCouponResponse {
  valid: boolean;
  discountPercent: number;
  couponCode: string;
  message?: string;
}

interface BackendResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

export class CouponService {
  private static readonly BASE_PATH = '/coupons';

  // --- Admin (authenticated) ---

  static async getAll(): Promise<Coupon[]> {
    const response = await apiClient.get<BackendResponse<Coupon[]>>(this.BASE_PATH);
    return response.data.data;
  }

  static async getById(id: string): Promise<Coupon> {
    const response = await apiClient.get<BackendResponse<Coupon>>(`${this.BASE_PATH}/${id}`);
    return response.data.data;
  }

  static async create(data: CreateCouponDto): Promise<Coupon> {
    const response = await apiClient.post<BackendResponse<Coupon>>(this.BASE_PATH, data);
    return response.data.data;
  }

  static async update(id: string, data: UpdateCouponDto): Promise<Coupon> {
    const response = await apiClient.patch<BackendResponse<Coupon>>(
      `${this.BASE_PATH}/${id}`,
      data,
    );
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  // --- Public (no auth) ---

  static async validateCoupon(code: string, serviceId: string): Promise<ValidateCouponResponse> {
    const response = await publicApiClient.post<BackendResponse<ValidateCouponResponse>>(
      `${this.BASE_PATH}/validate`,
      { code, serviceId },
    );
    return response.data.data;
  }
}
