import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildSeed } from '../data/seed';
import type { DataState, Order, OrderStatus } from '../data/types';
interface StoreState extends DataState {
  placeOrder: (order: Order) => void;
  updateProductStock: (productId: string, delta: number) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}
export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...buildSeed(),
      placeOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateProductStock: (id, delta) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
          ),
        })),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? { ...o, status, timeline: [...o.timeline, { status, at: Date.now() }] }
              : o,
          ),
        })),
    }),
    { name: 'vendora-v2-storage' },
  ),
);
let receiving = false;
const channel =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('vendora-sync') : null;
if (channel)
  channel.onmessage = (event) => {
    if (event.data?.type !== 'SYNC') return;
    receiving = true;
    useStore.setState(event.data.state);
    receiving = false;
  };
useStore.subscribe((state) => {
  if (receiving || !channel) return;
  const { seededOn, sellers, products, orders, logs, customers, suppliers, purchases } = state;
  channel.postMessage({
    type: 'SYNC',
    state: { seededOn, sellers, products, orders, logs, customers, suppliers, purchases },
  });
});
