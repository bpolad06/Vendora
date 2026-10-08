import type { InventoryLog, MovementType, Order, Product } from './types';
import { VUQAR_ID } from './sellers';
import { DAY, HOUR } from '../lib/time';

interface Movement {
  at: number;
  qty: number;
  type: MovementType;
  user: string;
  ref?: string;
}

const SALE_TYPE: Record<Order['source'], MovementType> = {
  Marketplace: 'Satış — Marketplace',
  Kassa: 'Satış — Kassa',
  B2B: 'Satış — B2B',
};

const SALE_USER: Record<Order['source'], string> = {
  Marketplace: 'Vendora',
  Kassa: 'Rəşad (satıcı)',
  B2B: 'Vüqar M.',
};

const MANUAL: Record<string, Movement[]> = {
  v03: [{ at: 6, qty: -2, type: 'Silinmə', user: 'Nicat (anbardar)', ref: 'Paket cırılıb' }],
  v07: [{ at: 11, qty: 10, type: 'Düzəliş', user: 'Nicat (anbardar)', ref: 'Sayım fərqi' }],
  v17: [{ at: 3, qty: -4, type: 'Silinmə', user: 'Nicat (anbardar)', ref: 'Nəmlənib' }],
  v09: [{ at: 15, qty: -6, type: 'Silinmə', user: 'Rəşad (satıcı)', ref: 'Vitrin nümunəsi' }],
  v31: [{ at: 8, qty: -20, type: 'Düzəliş', user: 'Vüqar M.', ref: 'Sayım fərqi' }],
};

function roundTo(n: number, step: number): number {
  return Math.max(step, Math.round(n / step) * step);
}

export function generateLogs(products: Product[], orders: Order[], now: number): InventoryLog[] {
  const movementsByProduct = new Map<string, Movement[]>();
  for (const o of orders) {
    if (o.status === 'Ləğv edildi') continue;
    for (const it of o.items) {
      const list = movementsByProduct.get(it.productId) ?? [];
      list.push({ at: o.createdAt, qty: -it.qty, type: SALE_TYPE[o.source], user: SALE_USER[o.source], ref: o.number });
      movementsByProduct.set(it.productId, list);
    }
  }

  const logs: InventoryLog[] = [];
  let receiptSeq = 412;

  for (const p of products) {
    if (p.sellerId !== VUQAR_ID) continue;
    const manual = (MANUAL[p.id] ?? []).map((m) => ({ ...m, at: now - m.at * DAY - 3 * HOUR }));
    const moves = [...(movementsByProduct.get(p.id) ?? []), ...manual].sort((a, b) => b.at - a.at);
    const cap = Math.max(p.minStock * 2.5, p.stock + p.minStock);
    const step = p.stock > 1000 || p.minStock > 300 ? 100 : 10;
    let running = p.stock;

    for (const m of moves) {
      logs.push({ id: `l-${p.id}-${logs.length}`, productId: p.id, sellerId: VUQAR_ID, type: m.type, qty: m.qty, balance: running, user: m.user, at: m.at, ref: m.ref });
      running -= m.qty;
      if (running > cap) {
        const receipt = roundTo(running - p.minStock * 0.5, step);
        logs.push({
          id: `l-${p.id}-${logs.length}`,
          productId: p.id,
          sellerId: VUQAR_ID,
          type: 'Mədaxil',
          qty: receipt,
          balance: running,
          user: 'Nicat (anbardar)',
          at: m.at - 2 * HOUR,
          ref: `QB-${receiptSeq++}`,
        });
        running -= receipt;
      }
    }

    if (running > 0) {
      const firstAt = moves.length ? moves[moves.length - 1].at - 6 * HOUR : now - 24 * DAY;
      logs.push({
        id: `l-${p.id}-${logs.length}`,
        productId: p.id,
        sellerId: VUQAR_ID,
        type: 'Mədaxil',
        qty: running,
        balance: running,
        user: 'Nicat (anbardar)',
        at: firstAt,
        ref: `QB-${receiptSeq++}`,
      });
    }
  }

  return logs.sort((a, b) => b.at - a.at);
}
