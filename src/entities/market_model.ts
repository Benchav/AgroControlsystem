export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  status: MarketStatus;
  category: MarketCategory;
  imageUrl?: string[];

  entityId: string; // ID de la parcela, del lote de alimentos o del animal real

  // datos para la subasta
  startingPrice: number;    // Precio base/inicial con el que arranca la subasta
  currentBid?: number;       // La puja más alta actual (inicialmente igual a startingPrice)
  highestBidderId?: string; // ID del usuario que va ganando la subasta
  bidCount: number;         // Contador de cuántas personas han ofertado

  // control de tiempo
  createdAt: string;        // Fecha de inicio de la subasta 
  endDate: string;          // Fecha y hora exacta en la que cierra la subasta

  // detalles del lote o producto ofertandose
  lotSize?: number;         // Cantidad de producto (Ej: 50)
  unit?: string;            // Unidad (Ej: "Cabezas" para animales, "Quintales" para alimentos, "Manzanas" para parcelas)
}

//disponible en caso de que se esta ofertando o ya empezo
//no disponible para cuando ya se termino la subasta
//pendiente para cuando se pauso o hubo algun inconveniente
export type MarketStatus = 'disponible' | 'no disponible' | 'pendiente';

export type MarketCategory = 'parcelas' | 'alimentos' | 'animales';