export const SERVICE_PRICING = {
  basic: { price: 15, duration: 30 },
  deep: { price: 35, duration: 90 },
  interior: { price: 25, duration: 60 },
  premium: { price: 55, duration: 120 },
} as const;

export type ServiceId = keyof typeof SERVICE_PRICING;

export const CAR_SIZE_SURCHARGES = {
  compact: 0,
  suv: 7,
  van: 12,
} as const;

export type CarSize = keyof typeof CAR_SIZE_SURCHARGES;
