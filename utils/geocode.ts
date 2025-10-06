/**
 * Geocoding utilities for address search and reverse geocoding.
 * Supports both live Google Places/Geocoding APIs and mock data.
 * Toggle via EXPO_PUBLIC_GEO_LIVE environment variable.
 */

import { GEO_LIVE, GOOGLE_MAPS_KEY } from '@/constants/env';
import { Alert } from 'react-native';

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

// ===== Caching =====

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const searchCache = new Map<string, CacheEntry<GeocodedAddress[]>>();
const reverseCache = new Map<
  string,
  CacheEntry<{ title: string; subtitle?: string }>
>();

function getCachedSearch(query: string): GeocodedAddress[] | null {
  const entry = searchCache.get(query);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  if (entry) {
    searchCache.delete(query);
  }
  return null;
}

function setCachedSearch(query: string, data: GeocodedAddress[]): void {
  searchCache.set(query, { data, timestamp: Date.now() });
}

function getCachedReverse(
  lat: number,
  lng: number
): { title: string; subtitle?: string } | null {
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const entry = reverseCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  if (entry) {
    reverseCache.delete(key);
  }
  return null;
}

function setCachedReverse(
  lat: number,
  lng: number,
  data: { title: string; subtitle?: string }
): void {
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  reverseCache.set(key, { data, timestamp: Date.now() });
}

// ===== Live Google Places/Geocoding =====

let hasShownFallbackToast = false;

function showFallbackToast(): void {
  if (!hasShownFallbackToast) {
    hasShownFallbackToast = true;
    Alert.alert(
      'Using demo data',
      'Live geocoding unavailable. Using mock addresses for demo.'
    );
  }
}

/**
 * Search addresses using Google Places Autocomplete API.
 * Falls back to mock on error or missing API key.
 */
async function searchAddressesLive(query: string): Promise<GeocodedAddress[]> {
  // Check cache first
  const cached = getCachedSearch(query);
  if (cached) {
    return cached;
  }

  // Validate API key
  if (!GOOGLE_MAPS_KEY) {
    console.warn('Google Maps API key missing. Falling back to mock.');
    showFallbackToast();
    return searchAddressesMock(query);
  }

  try {
    // Use Google Places Autocomplete API
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&key=${GOOGLE_MAPS_KEY}&components=country:ma`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn('Google Places API error:', data.status, data.error_message);
      showFallbackToast();
      return searchAddressesMock(query);
    }

    // Parse predictions into GeocodedAddress format
    const results: GeocodedAddress[] = await Promise.all(
      (data.predictions || []).slice(0, 10).map(async (prediction: any) => {
        // Get place details to retrieve coordinates
        const placeId = prediction.place_id;
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_KEY}`;

        let lat: number | undefined;
        let lng: number | undefined;

        try {
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          if (
            detailsData.status === 'OK' &&
            detailsData.result?.geometry?.location
          ) {
            lat = detailsData.result.geometry.location.lat;
            lng = detailsData.result.geometry.location.lng;
          }
        } catch (err) {
          console.warn('Error fetching place details:', err);
        }

        // Split structured_formatting into title and subtitle
        const mainText =
          prediction.structured_formatting?.main_text || prediction.description;
        const secondaryText = prediction.structured_formatting?.secondary_text;

        return {
          id: placeId,
          title: mainText,
          subtitle: secondaryText,
          lat,
          lng,
        };
      })
    );

    // Cache and return
    setCachedSearch(query, results);
    return results;
  } catch (error) {
    console.warn('Google Places search error:', error);
    showFallbackToast();
    return searchAddressesMock(query);
  }
}

/**
 * Reverse geocode using Google Geocoding API.
 * Falls back to mock on error or missing API key.
 */
async function reverseGeocodeLive(
  lat: number,
  lng: number
): Promise<{ title: string; subtitle?: string }> {
  // Check cache first
  const cached = getCachedReverse(lat, lng);
  if (cached) {
    return cached;
  }

  // Validate API key
  if (!GOOGLE_MAPS_KEY) {
    console.warn('Google Maps API key missing. Falling back to mock.');
    showFallbackToast();
    return reverseGeocodeMock(lat, lng);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn(
        'Google Geocoding API error:',
        data.status,
        data.error_message
      );
      showFallbackToast();
      return reverseGeocodeMock(lat, lng);
    }

    if (!data.results || data.results.length === 0) {
      return {
        title: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        subtitle: 'Current location',
      };
    }

    // Parse first result
    const result = data.results[0];
    const addressComponents = result.address_components || [];

    // Extract meaningful parts
    const streetNumber = addressComponents.find((c: any) =>
      c.types.includes('street_number')
    )?.long_name;
    const route = addressComponents.find((c: any) =>
      c.types.includes('route')
    )?.long_name;
    const locality = addressComponents.find((c: any) =>
      c.types.includes('locality')
    )?.long_name;
    const country = addressComponents.find((c: any) =>
      c.types.includes('country')
    )?.long_name;

    // Build title (street address) and subtitle (city/country)
    const titleParts = [streetNumber, route].filter(Boolean);
    const title =
      titleParts.length > 0
        ? titleParts.join(' ')
        : result.formatted_address.split(',')[0];

    const subtitleParts = [locality, country].filter(Boolean);
    const subtitle =
      subtitleParts.length > 0 ? subtitleParts.join(', ') : undefined;

    const geocoded = { title, subtitle };

    // Cache and return
    setCachedReverse(lat, lng, geocoded);
    return geocoded;
  } catch (error) {
    console.warn('Google Geocoding error:', error);
    showFallbackToast();
    return reverseGeocodeMock(lat, lng);
  }
}

// ===== Mock implementations =====

/**
 * Search addresses by query string (mock implementation).
 * Filters mock addresses by title or subtitle match.
 *
 * @param query - Search query string
 * @returns Promise resolving to array of matching addresses
 */
async function searchAddressesMock(query: string): Promise<GeocodedAddress[]> {
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
async function reverseGeocodeMock(
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

// ===== Public API with Live/Mock Toggle =====

/**
 * Search addresses by query string.
 * Uses live Google Places API when GEO_LIVE=1, otherwise uses mock data.
 *
 * @param query - Search query string
 * @returns Promise resolving to array of matching addresses
 */
export async function searchAddresses(
  query: string
): Promise<GeocodedAddress[]> {
  if (GEO_LIVE) {
    return searchAddressesLive(query);
  }
  return searchAddressesMock(query);
}

/**
 * Reverse geocode coordinates to human-readable address.
 * Uses live Google Geocoding API when GEO_LIVE=1, otherwise uses mock data.
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise resolving to formatted address
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ title: string; subtitle?: string }> {
  if (GEO_LIVE) {
    return reverseGeocodeLive(lat, lng);
  }
  return reverseGeocodeMock(lat, lng);
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
