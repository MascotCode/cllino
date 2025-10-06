/**
 * Environment configuration for external services.
 * Values are loaded from process.env at build time.
 */

/**
 * Enable live geocoding with Google Places/Geocoding APIs.
 * Set EXPO_PUBLIC_GEO_LIVE=1 to use real APIs, or 0 for mock data.
 */
export const GEO_LIVE = process.env.EXPO_PUBLIC_GEO_LIVE === '1';

/**
 * Google Maps API key for Places API, Geocoding API, and Maps SDKs.
 * Required when GEO_LIVE is enabled.
 */
export const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';
