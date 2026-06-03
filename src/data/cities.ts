// §5.3 — 16 ciudades sede con coordenadas para el mapa-viaje
export interface HostCity {
  readonly name: string;
  readonly country: "MX" | "US" | "CA";
  readonly lat: number;
  readonly lng: number;
  readonly nx: number; // posición normalizada para SVG (0-1)
  readonly ny: number;
}

export const HOST_CITIES: readonly HostCity[] = [
  // México
  { name: "Ciudad de México",   country: "MX", lat: 19.4326, lng: -99.1332, nx: 0.42, ny: 0.92 },
  { name: "Guadalajara",        country: "MX", lat: 20.6597, lng: -103.3496, nx: 0.34, ny: 0.86 },
  { name: "Monterrey",          country: "MX", lat: 25.6866, lng: -100.3161, nx: 0.42, ny: 0.74 },
  // Canadá
  { name: "Toronto",            country: "CA", lat: 43.6532, lng: -79.3832,  nx: 0.78, ny: 0.34 },
  { name: "Vancouver",          country: "CA", lat: 49.2827, lng: -123.1207, nx: 0.18, ny: 0.22 },
  // EE.UU. (oeste a este)
  { name: "Seattle",            country: "US", lat: 47.6062, lng: -122.3321, nx: 0.20, ny: 0.30 },
  { name: "San Francisco Bay",  country: "US", lat: 37.7749, lng: -122.4194, nx: 0.18, ny: 0.50 },
  { name: "Los Ángeles",        country: "US", lat: 34.0522, lng: -118.2437, nx: 0.22, ny: 0.60 },
  { name: "Kansas City",        country: "US", lat: 39.0997, lng: -94.5786,  nx: 0.50, ny: 0.54 },
  { name: "Dallas",             country: "US", lat: 32.7767, lng: -96.7970,  nx: 0.50, ny: 0.66 },
  { name: "Houston",            country: "US", lat: 29.7604, lng: -95.3698,  nx: 0.52, ny: 0.74 },
  { name: "Atlanta",            country: "US", lat: 33.7490, lng: -84.3880,  nx: 0.68, ny: 0.62 },
  { name: "Miami",              country: "US", lat: 25.7617, lng: -80.1918,  nx: 0.74, ny: 0.78 },
  { name: "Boston",             country: "US", lat: 42.3601, lng: -71.0589,  nx: 0.82, ny: 0.38 },
  { name: "Nueva York / NJ",    country: "US", lat: 40.7128, lng: -74.0060,  nx: 0.80, ny: 0.44 },
  { name: "Filadelfia",         country: "US", lat: 39.9526, lng: -75.1652,  nx: 0.78, ny: 0.48 },
] as const;

export function getCity(name: string): HostCity | undefined {
  return HOST_CITIES.find((c) => c.name === name);
}
