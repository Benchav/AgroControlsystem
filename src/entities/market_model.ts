export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  status: MarketStatus;
  category: MarketCategory;
  imageUrl?: string[];
}

export type MarketStatus = 'disponible' | 'no disponible' | 'pendiente';

export type MarketCategory = 'parcelas' | 'alimentos' | 'animales';