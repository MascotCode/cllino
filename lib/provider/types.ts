import { z } from 'zod';

export const ProviderProfile = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  isOnline: z.boolean().default(false),
});

export const Invite = z.object({
  id: z.string(),
  jobId: z.string(),
  customerName: z.string(),
  approxAddress: z.string(), // exact address revealed only after accept
  etaMinutes: z.number(),
  price: z.number(),
  rating: z.number().min(0).max(5),
  ttlMs: z.number(),
  createdAt: z.number(),
});

export const ActiveJob = z.object({
  id: z.string(),
  customerName: z.string(),
  exactAddress: z.string(),
  price: z.number(),
  status: z
    .enum(['assigned', 'enroute', 'working', 'complete'])
    .default('assigned'),
  startedAt: z.number(),
});

export const Earnings = z.object({
  id: z.string(),
  jobId: z.string(),
  customerName: z.string(),
  price: z.number(),
  rating: z.number().optional(),
  chips: z.array(z.string()).default([]),
  completedAt: z.number(),
  cashReceived: z.boolean(),
});

export type TProviderProfile = z.infer<typeof ProviderProfile>;
export type TInvite = z.infer<typeof Invite>;
export type TActiveJob = z.infer<typeof ActiveJob>;
export type TEarnings = z.infer<typeof Earnings>;


