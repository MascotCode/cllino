import { create } from 'zustand';

export type Service = {
  id: string;
  title: string;
  price: number;
  durationMin: number;
};

export type Addon = {
  id: string;
  label: string;
  price?: number;
};

export type Vehicle = {
  makeModel: string;
  plate: string;
};

export type TimeInfo = {
  whenLabel?: string;
  slotStart?: string;
  slotEnd?: string;
  fallbackLabel?: string;
};

const DEFAULT_PAYMENT = 'Cash on completion';

export type CheckoutState = {
  service: Service | null;
  addons: Addon[];
  address: string | null;
  vehicle: Vehicle | null;
  time: TimeInfo | null;
  payment: string;
  setOrder: (payload: Partial<CheckoutState>) => void;
  clearOrder: () => void;
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  service: null,
  addons: [],
  address: null,
  vehicle: null,
  time: null,
  payment: DEFAULT_PAYMENT,
  setOrder: (payload) =>
    set((state) => ({
      service: payload.service ?? state.service,
      addons: payload.addons ?? state.addons,
      address: payload.address ?? state.address,
      vehicle: payload.vehicle ?? state.vehicle,
      time: payload.time ?? state.time,
      payment: payload.payment ?? state.payment ?? DEFAULT_PAYMENT,
    })),
  clearOrder: () =>
    set(() => ({
      service: null,
      addons: [],
      address: null,
      vehicle: null,
      time: null,
      payment: DEFAULT_PAYMENT,
    })),
}));

export const calcTotal = (state: Pick<CheckoutState, 'service' | 'addons'>): number => {
  const servicePrice = state.service?.price ?? 0;
  const addonsTotal = state.addons.reduce((sum, addon) => sum + (addon.price ?? 0), 0);

  return servicePrice + addonsTotal;
};
