export function getEstilismoListPriceArs(serviceName: string): number | null {
  const name = serviceName.toLowerCase();
  const plusCount = (name.match(/\+/g) ?? []).length;
  const serviceCount = plusCount > 0 ? plusCount + 1 : 1;

  if (serviceCount === 2) return 77000;
  if (serviceCount === 3) return 117000;

  if (name.includes('lash refill')) return 36000;
  if (name.includes('tinte de cejas')) return 36000;
  if (name.includes('tinte de pestañas') || name.includes('tinte de pestanas'))
    return 36000;

  if (name.includes('laminado')) return 44000;
  if (name.includes('modelado')) return 44000;
  if (name.includes('refill')) return 44000;

  return null;
}

export function formatArs(amount: number): string {
  return `AR$ ${amount.toLocaleString('es-AR')}`;
}
