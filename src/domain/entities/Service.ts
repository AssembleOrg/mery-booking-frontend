export interface Service {
  id: string; // uuid
  name: string;
  slug: string;
  price: number;
  priceBook: number;
  duration: number; // Duración en minutos
  image?: string; // URL de la imagen del servicio
}
