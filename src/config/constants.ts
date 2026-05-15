// IDs de empleados
export const EMPLOYEE_IDS = {
  STAFF_CONSULTAS: '2d283dc6-6940-46fc-9166-eb6b17b8cc0f',
  MERY_GARCIA: '8eda28e3-a122-4eb6-8673-356333558d78',
} as const;

// IDs de categorías
export const CATEGORY_IDS = {
  TATTOO_COSMETICO: '9a39b2f8-0d4a-4bca-bc93-b4b5d6cf2d11',
  ESTILISMO_CEJAS: '316f01a6-ef73-4b05-a322-8da598ba50aa',
  AUTOSTYLING: '0e476605-64c0-483a-8ee2-a7e34e62a31e',
  PARAMEDICAL_TATTOO: '45422e67-102b-4565-9192-ef4047e16f48',
  EPITESIS_CAP: '7cfbc1e8-8eb2-41cc-a8de-a3b0ecce30c4',
} as const;

// Mapeo categoryId → ruta de la página pública
export const CATEGORY_PAGE_MAP: Record<string, string> = {
  [CATEGORY_IDS.TATTOO_COSMETICO]: '/tattoo-cosmetico',
  [CATEGORY_IDS.ESTILISMO_CEJAS]: '/estilismo-de-cejas',
  [CATEGORY_IDS.AUTOSTYLING]: '/autostyling',
  [CATEGORY_IDS.PARAMEDICAL_TATTOO]: '/paramedical-tattoo',
  [CATEGORY_IDS.EPITESIS_CAP]: '/epitesis-cap',
};

// IDs de servicios especiales (addons combo)
export const SERVICE_IDS = {
  TINTE_PESTANAS: 'b7ef8acb-6f1c-4967-9d14-2a854e4beada',
} as const;

// Combo offer config: cuando profesional == MERY_GARCIA y el servicio NO es tinte,
// se ofrece agregar tinte de pestañas como addon (no ocupa slot, se cobra full price)
export const COMBO_TINTE_OFFER = {
  serviceId: SERVICE_IDS.TINTE_PESTANAS,
  serviceName: 'Tinte de Pestañas',
  price: 30000,
  durationMin: 30,
} as const;
