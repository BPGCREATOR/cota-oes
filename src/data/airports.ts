import worldAirportsData from './worldAirports.json';

export interface WorldAirportItem {
  iata: string;
  name: string;
  city: string;
  country: string;
  countryEn?: string;
  searchable: string;
}

export const ALL_WORLD_AIRPORTS: WorldAirportItem[] = worldAirportsData as WorldAirportItem[];

// Normalização que remove acentos e converte para maiúsculas
export function stripAccents(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

// Retorna string formatada para exibição unificada
export function formatAirportDisplay(airport: WorldAirportItem): string {
  const location = airport.city || airport.name;
  return `${airport.iata} — ${location} (${airport.country})`;
}

// Verifica se uma string de aeroporto selecionado pertence ao Brasil
export function isAirportInBrazil(airportValue?: string): boolean {
  if (!airportValue) return true;
  const upper = airportValue.toUpperCase();
  return upper.includes('(BRASIL)') || upper.includes(' - BRASIL') || upper.endsWith('BRASIL');
}

// Determina automaticamente o âmbito do frete aéreo baseado na rota
export function detectFlightScope(
  origin?: string,
  destination?: string
): 'nacional' | 'internacional_importacao' | 'internacional_exportacao' | 'internacional_cross_trade' | 'internacional' {
  if (!origin || !destination) {
    if (origin && !isAirportInBrazil(origin)) return 'internacional_importacao';
    if (destination && !isAirportInBrazil(destination)) return 'internacional_exportacao';
    return 'nacional';
  }

  const originIsBr = isAirportInBrazil(origin);
  const destIsBr = isAirportInBrazil(destination);

  if (originIsBr && destIsBr) {
    return 'nacional';
  } else if (!originIsBr && destIsBr) {
    return 'internacional_importacao';
  } else if (originIsBr && !destIsBr) {
    return 'internacional_exportacao';
  } else {
    return 'internacional_cross_trade';
  }
}
