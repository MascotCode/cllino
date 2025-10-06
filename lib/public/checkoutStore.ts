import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export type AddressWithCoords = {
  label: string;
  lat?: number;
  lng?: number;
};

export type ProviderSummary = {
  id: string;
  name: string;
  eta?: string;
  distance?: string;
  car?: string;
  price?: string;
  rating?: string;
};

type CheckoutDetails = {
  service: Service | null;
  addons: Addon[];
  address: string | null;
  addressCoords: AddressWithCoords | null;
  vehicle: Vehicle | null;
  time: TimeInfo | null;
  payment: string;
  selectedProvider: ProviderSummary | null;
};

export type CheckoutState = CheckoutDetails & {
  rehydrated: boolean;
  setOrder: (payload: Partial<CheckoutDetails>) => void;
  clearOrder: () => void;
  setSelectedProvider: (payload: ProviderSummary) => void;
  clearSelectedProvider: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      service: null,
      addons: [],
      address: null,
      addressCoords: null,
      vehicle: null,
      time: null,
      payment: DEFAULT_PAYMENT,
      rehydrated: false,
      selectedProvider: null,
      setOrder: (payload) =>
        set((state) => ({
          service: payload.service ?? state.service,
          addons: payload.addons ?? state.addons,
          address: payload.address ?? state.address,
          addressCoords: payload.addressCoords ?? state.addressCoords,
          vehicle: payload.vehicle ?? state.vehicle,
          time: payload.time ?? state.time,
          payment: payload.payment ?? state.payment ?? DEFAULT_PAYMENT,
          selectedProvider:
            payload.selectedProvider ?? state.selectedProvider,
        })),
      clearOrder: () =>
        set(() => ({
          service: null,
          addons: [],
          address: null,
          addressCoords: null,
          vehicle: null,
          time: null,
          payment: DEFAULT_PAYMENT,
          selectedProvider: null,
        })),
      setSelectedProvider: (payload) =>
        set(() => ({
          selectedProvider: payload,
        })),
      clearSelectedProvider: () =>
        set(() => ({
          selectedProvider: null,
        })),
    }),
    {
      name: 'cllino.checkout.v1',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.rehydrated = true;
        }
      },
    }
  )
);

export const calcTotal = (
  state: Pick<CheckoutState, 'service' | 'addons'>
): number => {
  const servicePrice = state.service?.price ?? 0;
  const addonsTotal = state.addons.reduce(
    (sum, addon) => sum + (addon.price ?? 0),
    0
  );

  return servicePrice + addonsTotal;
};
