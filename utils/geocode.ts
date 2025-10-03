/**
 * Geocoding utilities for address search and reverse geocoding.
 * Mock implementation for MVP - replace with real geocoding service later.
 */

export type GeocodedAddress = {
  id: string;
  title: string;
  subtitle?: string;
  lat?: number;
  lng?: number;
};

// Mock address database for search
const MOCK_ADDRESSES: GeocodedAddress[] = [
  {
    id: 'addr-1',
    title: 'Boulevard Mohammed V',
    subtitle: 'Casablanca, Morocco',
    lat: 33.5731,
    lng: -7.5898,
  },
  {
    id: 'addr-2',
    title: 'Marina Shopping Center',
    subtitle: 'Boulevard de la Corniche, Casablanca',
    lat: 33.5951,
    lng: -7.6256,
  },
  {
    id: 'addr-3',
    title: 'Morocco Mall',
    subtitle: 'Boulevard de la Corniche, Casablanca',
    lat: 33.5888,
    lng: -7.6861,
  },
  {
    id: 'addr-4',
    title: 'Hassan II Mosque',
    subtitle: 'Boulevard Sidi Mohammed Ben Abdallah, Casablanca',
    lat: 33.6086,
    lng: -7.6331,
  },
  {
    id: 'addr-5',
    title: 'Twin Center',
    subtitle: 'Boulevard Zerktouni, Casablanca',
    lat: 33.5852,
    lng: -7.6298,
  },
  {
    id: 'addr-6',
    title: 'Ain Diab Beach',
    subtitle: "Boulevard de l'Océan Atlantique, Casablanca",
    lat: 33.5951,
    lng: -7.68,
  },
  {
    id: 'addr-7',
    title: 'Casa Port Train Station',
    subtitle: 'Rue Abderrahmane El Ghafiki, Casablanca',
    lat: 33.5979,
    lng: -7.6143,
  },
  {
    id: 'addr-8',
    title: 'Anfa Place',
    subtitle: 'Boulevard de la Corniche, Casablanca',
    lat: 33.582,
    lng: -7.652,
  },
];

/**
 * Search addresses by query string (mock implementation).
 * Filters mock addresses by title or subtitle match.
 *
 * @param query - Search query string
 * @returns Promise resolving to array of matching addresses
 */
export async function searchAddresses(
  query: string
): Promise<GeocodedAddress[]> {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 200)
  );

  if (!query || query.trim().length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const matches = MOCK_ADDRESSES.filter(
    (addr) =>
      addr.title.toLowerCase().includes(lowerQuery) ||
      addr.subtitle?.toLowerCase().includes(lowerQuery)
  );

  return matches;
}

/**
 * Reverse geocode coordinates to human-readable address (mock implementation).
 * Returns a formatted address based on coordinates.
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise resolving to formatted address
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ title: string; subtitle?: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Mock: find nearest address from our database
  let nearest = MOCK_ADDRESSES[0];
  let minDist = Number.MAX_VALUE;

  for (const addr of MOCK_ADDRESSES) {
    if (!addr.lat || !addr.lng) continue;
    const dist = Math.sqrt(
      Math.pow(addr.lat - lat, 2) + Math.pow(addr.lng - lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = addr;
    }
  }

  // If coordinates are far from any known address, return generic
  if (minDist > 0.05) {
    return {
      title: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      subtitle: 'Current location',
    };
  }

  return {
    title: nearest.title,
    subtitle: nearest.subtitle,
  };
}

/**
 * Get formatted address string for display.
 *
 * @param address - Geocoded address object
 * @returns Formatted string for display
 */
export function formatAddress(address: GeocodedAddress): string {
  if (address.subtitle) {
    return `${address.title}, ${address.subtitle}`;
  }
  return address.title;
}
