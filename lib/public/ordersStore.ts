import { create } from 'zustand';

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
  addActive: (order: PublicOrder) => void;
  completeOrder: (id: string) => void;
  findById: (id: string) => PublicOrder | undefined;
  removeAll: () => void;
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  active: [],
  completed: [],
  addActive: (order) =>
    set((state) => {
      const nextOrder: PublicOrder = { ...order, status: 'active', completedAt: undefined };
      const dedupedActive = state.active.filter((existing) => existing.id !== nextOrder.id);
      const dedupedCompleted = state.completed.filter((existing) => existing.id !== nextOrder.id);

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
        completed: [completedOrder, ...state.completed.filter((o) => o.id !== id)],
      };
    }),
  findById: (id) => {
    const { active, completed } = get();
    return active.find((order) => order.id === id) ?? completed.find((order) => order.id === id);
  },
  removeAll: () => set({ active: [], completed: [] }),
}));
