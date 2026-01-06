// Tipos de contenido del acordeón
export type AccordionContentType =
  | 'consulta-sin-trabajo'
  | 'consulta-con-trabajo'
  | 'sesion-calendario'
  | 'retoque-calendario'
  | 'mantenimiento-calendario'
  | 'last-minute'
  | 'consulta'
  | 'sesion'
  | 'retoque'
  | 'mantenimiento';

export interface ServiceOption {
  id: string;
  label: string;
  contentType: AccordionContentType;
  description?: string;
  extraDescription?: string;
  priceLabel?: string;
  priceValue?: string;
  priceEffective?: string;
  depositLabel?: string;
  depositValue?: string;
  promoText?: string;
  footerNote?: string;
  footerNote2?: string;
  cuotasText?: string;
  serviceId?: string; // ID del servicio en el backend
  employeeId?: string; // ID del empleado en el backend
  serviceDuration?: number; // Duración del servicio en minutos
}
