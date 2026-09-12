import { EmployeeService } from '@/infrastructure/http';
import type { Employee, ServiceEntity, PublicServiceResponse } from '@/infrastructure/http';

type AnyService = ServiceEntity | PublicServiceResponse;

/**
 * Construye el mapa serviceId → empleados habilitados para los servicios visibles.
 *
 * Camino rápido: el endpoint público de servicios ya trae `employees` embebido
 * (0 requests extra). Fallback: si el backend todavía no expone el campo (o los
 * servicios vienen del endpoint autenticado), se consulta /employees/public por
 * servicio como antes.
 */
export async function resolveServiceEmployees(
  services: AnyService[],
  categoryId: string
): Promise<Map<string, Employee[]>> {
  const map = new Map<string, Employee[]>();
  const visible = services.filter((s) => s.showOnSite);
  if (visible.length === 0) return map;

  const hasEmbedded = visible.every((s) =>
    Array.isArray((s as PublicServiceResponse).employees)
  );

  if (hasEmbedded) {
    for (const s of visible) {
      const assigned = (s as PublicServiceResponse).employees ?? [];
      if (assigned.length > 0) map.set(s.id, assigned as Employee[]);
    }
    return map;
  }

  await Promise.all(
    visible.map(async (service) => {
      try {
        const assigned = await EmployeeService.getAllPublic(categoryId, service.id);
        if (assigned.length > 0) map.set(service.id, assigned as Employee[]);
      } catch (error) {
        console.error(`Error resolviendo empleados para servicio ${service.name}:`, error);
      }
    })
  );
  return map;
}
