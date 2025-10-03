import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'active' | 'completed';

export type PublicOrder = {
  id: string;
  status: OrderStatus;
  serviceTitle: string;
  price: number;
  durationMin: number;
  address: string;
  vehicle?: { makeModel?: string; plate?: string };
  whenLabel?: string;
  slotStart?: string;
  slotEnd?: string;
  createdAt: number;
  completedAt?: number;
};

type OrdersState = {
  active: PublicOrder[];
  completed: PublicOrder[];
  rehydrated: boolean;
  addActive: (order: PublicOrder) => void;
  completeOrder: (id: string) => void;
  findById: (id: string) => PublicOrder | undefined;
  removeAll: () => void;
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      active: [],
      completed: [],
      rehydrated: false,
      addActive: (order) =>
        set((state) => {
          const nextOrder: PublicOrder = {
            ...order,
            status: 'active',
            completedAt: undefined,
          };
          const dedupedActive = state.active.filter(
            (existing) => existing.id !== nextOrder.id
          );
          const dedupedCompleted = state.completed.filter(
            (existing) => existing.id !== nextOrder.id
          );

          return {
            active: [nextOrder, ...dedupedActive],
            completed: dedupedCompleted,
          };
        }),
      completeOrder: (id) =>
        set((state) => {
          const orderToComplete = state.active.find((o) => o.id === id);
          if (!orderToComplete) {
            return state;
          }

          const completedOrder: PublicOrder = {
            ...orderToComplete,
            status: 'completed',
            completedAt: Date.now(),
          };

          return {
            active: state.active.filter((o) => o.id !== id),
            completed: [
              completedOrder,
              ...state.completed.filter((o) => o.id !== id),
            ],
          };
        }),
      findById: (id) => {
        const { active, completed } = get();
        return (
          active.find((order) => order.id === id) ??
          completed.find((order) => order.id === id)
        );
      },
      removeAll: () => set({ active: [], completed: [] }),
    }),
    {
      name: 'cllino.orders.v1',
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
      partialize: (state) => ({
        active: state.active,
        completed: state.completed,
      }),
    }
  )
);
