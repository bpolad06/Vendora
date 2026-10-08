import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface CartState {
  carts: Record<string, Record<string, number>>;
  setQty: (owner: string, id: string, qty: number) => void;
  clear: (owner: string) => void;
}
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      carts: {},
      setQty: (owner, id, qty) =>
        set((s) => {
          const cart = { ...(s.carts[owner] || {}) };
          if (qty <= 0) delete cart[id];
          else cart[id] = qty;
          return { carts: { ...s.carts, [owner]: cart } };
        }),
      clear: (owner) => set((s) => ({ carts: { ...s.carts, [owner]: {} } })),
    }),
    { name: 'vendora-carts-v1' },
  ),
);
