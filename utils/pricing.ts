// Pricing system with floor, soft cap, and fat-finger guard
// Follows the specification: hard min, soft cap "Typical up to...", absolute cap confirm

import {
  CAR_SIZE_SURCHARGES,
  SERVICE_PRICING,
  type CarSize,
  type ServiceId,
} from '@/constants/pricing';

export type { CarSize, ServiceId } from '@/constants/pricing';

export interface PricingInputs {
  serviceId: ServiceId;
  carSize: CarSize;
  vehicleCount: number; // ≥1
  distanceKm?: number; // optional for future; safe default 0
}

export interface PricingBreakdown {
  baseFloorPerCar: number;
  sizeAdjPerCar: number;
  distanceAdjPerCar: number;
  minTotal: number;        // hard floor for total
  typicalMaxTotal: number; // soft cap for total (advisory)
  absMaxTotal: number;     // fat-finger guard; confirm if exceeded
  fairTotal: number;       // default "Fair" starting point
}

// Helper to round to nearest 5
export const roundTo5 = (n: number): number => {
  return Math.round(n / 5) * 5;
};

export const computePricing = (inputs: PricingInputs): PricingBreakdown => {
  const { serviceId, carSize, vehicleCount, distanceKm = 0 } = inputs;
  
  // Get base price for service
  const serviceConfig = SERVICE_PRICING[serviceId] ?? SERVICE_PRICING.basic;
  const baseFloorPerCar = serviceConfig.price;
  
  // Get size adjustment
  const sizeAdjPerCar = CAR_SIZE_SURCHARGES[carSize] ?? 0;
  
  // Distance adjustment (placeholder for future)
  const distanceAdjPerCar = 0; // placeholder
  
  // Calculate totals
  const perCarCost = baseFloorPerCar + sizeAdjPerCar + distanceAdjPerCar;
  const minTotal = perCarCost * vehicleCount;
  
  // Apply multipliers and round to 5
  const typicalMaxTotal = roundTo5(minTotal * 1.4); // 40% above min
  const absMaxTotal = roundTo5(minTotal * 3);       // 3× min (fat-finger safety)
  const fairTotal = roundTo5(minTotal * 1.1);       // default 10% above floor
  
  return {
    baseFloorPerCar,
    sizeAdjPerCar,
    distanceAdjPerCar,
    minTotal,
    typicalMaxTotal,
    absMaxTotal,
    fairTotal,
  };
};

export const coerceWithinCaps = (
  current: number,
  breakdown: PricingBreakdown,
  direction: 'inc' | 'dec'
): number => {
  if (direction === 'dec' && current < breakdown.minTotal) {
    return breakdown.minTotal;
  }
  if (direction === 'inc' && current > breakdown.absMaxTotal) {
    return breakdown.absMaxTotal;
  }
  return current;
};
