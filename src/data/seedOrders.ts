import type { Customer, Order, OrderEvent, OrderSource, OrderStatus, PaymentMethod, Product } from './types';
import { HERO_PRODUCT_ID } from './catalogVuqar';
import { VUQAR_ID } from './sellers';
import { WALK_IN } from './people';
import { createRng, intBetween, pick, type Rng } from '../lib/random';
import { DAY, HOUR, MINUTE, startOfDayMs } from '../lib/time';
import { unitPriceFor } from '../lib/pricing';

const PER_WEEKDAY = [2, 3, 4, 4, 4, 6, 6];
const HERO_WEEKDAY_WEIGHT = [0.7, 0.9, 1, 1, 1, 1.25, 1.3];
export const HERO_SOLD_LAST_13_DAYS = 9600;

interface Draft {
  at: number;
  day: number;
  source: OrderSource;
  items: Map<string, number>;
  customer?: Customer;
}

export function orderNumber(seq: number, at: number): string {
  const yy = String(new Date(at).getFullYear()).slice(2);
  return `VND-${yy}-${String(seq).padStart(5, '0')}`;
}

function timeInDay(rng: Rng, day: number, today0: number, now: number): number | null {
  const start = today0 - day * DAY;
  const lo = start + 9 * HOUR;
  let hi = start + 19.5 * HOUR;
  if (day === 0) hi = Math.min(hi, now - 4 * MINUTE);
  if (hi <= lo) return null;
  return Math.floor(lo + rng() * (hi - lo));
}

function pickWeighted(rng: Rng, pool: Product[]): Product {
  const total = pool.reduce((s, p) => s + Math.sqrt(p.soldCount + 50), 0);
  let roll = rng() * total;
  for (const p of pool) {
    roll -= Math.sqrt(p.soldCount + 50);
    if (roll <= 0) return p;
  }
  return pool[pool.length - 1];
}

function qtyFor(rng: Rng, p: Product, source: OrderSource): number {
  let qty: number;
  if (p.price < 2 && p.unit === 'ədəd') {
    const steps = source === 'B2B' ? [300, 500, 1000, 1500] : source === 'Kassa' ? [50, 100, 200] : [50, 100, 150, 300];
    qty = pick(rng, steps);
  } else if (p.price < 8) {
    qty = source === 'B2B' ? intBetween(rng, 20, 60) : source === 'Kassa' ? intBetween(rng, 2, 15) : intBetween(rng, 1, 8);
  } else {
    qty = source === 'B2B' ? intBetween(rng, 8, 25) : intBetween(rng, 1, 4);
  }
  return Math.max(qty, p.minOrder);
}

function chooseCustomer(rng: Rng, customers: Customer[], source: OrderSource): Customer | undefined {
  if (source === 'Kassa' && rng() < 0.7) return undefined;
  const pool =
    source === 'B2B'
      ? customers.filter((c) => c.tag !== 'Pərakəndə')
      : source === 'Marketplace'
        ? customers.filter((c) => c.tag === 'Pərakəndə' || c.tag === 'Kafe')
        : customers;
  return pick(rng, pool);
}

function buildDrafts(rng: Rng, products: Product[], customers: Customer[], now: number): Draft[] {
  const today0 = startOfDayMs(now);
  const pool = products.filter((p) => p.id !== HERO_PRODUCT_ID);
  const marketPool = pool.filter((p) => p.published);
  const drafts: Draft[] = [];

  for (let day = 29; day >= 0; day--) {
    const weekday = new Date(today0 - day * DAY).getDay();
    const count = PER_WEEKDAY[weekday] + (rng() < 0.3 ? 1 : 0);
    const marketShare = day < 10 ? 0.3 + (10 - day) * 0.035 : 0.22;
    for (let k = 0; k < count; k++) {
      const at = timeInDay(rng, day, today0, now);
      if (at === null) continue;
      const roll = rng();
      const source: OrderSource = roll < marketShare ? 'Marketplace' : roll < marketShare + 0.2 ? 'B2B' : 'Kassa';
      const items = new Map<string, number>();
      const lines = rng() < 0.5 ? 1 : rng() < 0.7 ? 2 : 3;
      for (let l = 0; l < lines; l++) {
        const p = pickWeighted(rng, source === 'Marketplace' ? marketPool : pool);
        items.set(p.id, (items.get(p.id) ?? 0) + qtyFor(rng, p, source));
      }
      drafts.push({ at, day, source, items, customer: chooseCustomer(rng, customers, source) });
    }
  }
  return drafts;
}

function addHeroSales(rng: Rng, drafts: Draft[], now: number): void {
  const today0 = startOfDayMs(now);
  const days = Array.from({ length: 13 }, (_, d) => d);
  const weights = days.map((d) => HERO_WEEKDAY_WEIGHT[new Date(today0 - d * DAY).getDay()]);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const targets = weights.map((w) => Math.round((HERO_SOLD_LAST_13_DAYS * w) / weightSum / 50) * 50);
  targets[12] += HERO_SOLD_LAST_13_DAYS - targets.reduce((a, b) => a + b, 0);

  const assign = (day: number, target: number, sizes: number[]): number => {
    let remaining = target;
    const candidates = drafts.filter((d) => d.day === day && d.source !== 'Marketplace');
    let i = 0;
    while (remaining > 0) {
      let draft = candidates[i % Math.max(1, candidates.length)];
      if (!draft || (i >= candidates.length && rng() < 0.5)) {
        const at = timeInDay(rng, day, today0, now);
        if (at === null) return remaining;
        draft = { at, day, source: 'Kassa', items: new Map() };
        drafts.push(draft);
        candidates.push(draft);
      }
      const chunk = Math.min(remaining, pick(rng, draft.source === 'B2B' ? [500, 800, 1000] : sizes));
      draft.items.set(HERO_PRODUCT_ID, (draft.items.get(HERO_PRODUCT_ID) ?? 0) + chunk);
      remaining -= chunk;
      i++;
    }
    return 0;
  };

  let carry = 0;
  targets.forEach((target, day) => {
    carry = assign(day, target + carry, [150, 200, 300, 400]);
  });
  for (let day = 15; day < 30; day++) assign(day, pick(rng, [200, 300, 400]), [100, 150, 200]);
}

function statusFor(rng: Rng, d: Draft, now: number): OrderStatus {
  if (d.source === 'Kassa') return 'Çatdırıldı';
  if (d.day === 0) return now - d.at > 3 * HOUR ? 'Hazırlanır' : 'Yeni';
  if (d.day === 1) return rng() < 0.6 ? 'Göndərildi' : 'Hazırlanır';
  return 'Çatdırıldı';
}

function timelineFor(status: OrderStatus, at: number, now: number): OrderEvent[] {
  const flow: OrderStatus[] = ['Yeni', 'Hazırlanır', 'Göndərildi', 'Çatdırıldı'];
  const offsets = [0, 35 * MINUTE, 5 * HOUR, 26 * HOUR];
  if (status === 'Ləğv edildi') {
    return [
      { status: 'Yeni', at },
      { status: 'Ləğv edildi', at: Math.min(now, at + 50 * MINUTE) },
    ];
  }
  const last = flow.indexOf(status);
  return flow.slice(0, last + 1).map((s, i) => ({ status: s, at: Math.min(now - (last - i) * MINUTE, at + offsets[i]) }));
}

function paymentFor(rng: Rng, source: OrderSource): PaymentMethod {
  if (source === 'B2B') return 'Faktura ilə';
  if (source === 'Kassa') return rng() < 0.8 ? 'Nağd' : 'Kartla';
  return rng() < 0.7 ? 'Kartla' : 'Nağd';
}

export function generateOrders(products: Product[], customers: Customer[], now: number): Order[] {
  const rng = createRng(20261008);
  const byId = new Map(products.map((p) => [p.id, p]));
  const drafts = buildDrafts(rng, products, customers, now);
  addHeroSales(rng, drafts, now);
  drafts.sort((a, b) => a.at - b.at);

  const firstSeq = 8731 - drafts.length;
  const orders = drafts.map((d, i): Order => {
    const items = [...d.items.entries()].map(([productId, qty]) => {
      const p = byId.get(productId)!;
      return { productId, name: p.name, sku: p.sku, qty, unitPrice: unitPriceFor(p, qty), unitCost: p.cost };
    });
    const subtotal = Math.round(items.reduce((s, it) => s + it.qty * it.unitPrice, 0) * 100) / 100;
    const shipping = d.source === 'Marketplace' && subtotal < 50 ? 4 : 0;
    const status = statusFor(rng, d, now);
    const payment = paymentFor(rng, d.source);
    const c = d.customer;
    return {
      id: `o${firstSeq + i}`,
      number: orderNumber(firstSeq + i, d.at),
      sellerId: VUQAR_ID,
      source: d.source,
      status,
      customerId: c?.id,
      customerName: c ? (c.company ?? c.name) : WALK_IN,
      phone: c?.phone ?? '',
      city: c?.city ?? 'Bakı',
      address: c?.address ?? 'Sədərək, B-blok 214',
      delivery: d.source === 'Kassa' ? 'Özün götür' : 'Kuryer',
      payment,
      paid: d.source === 'Kassa' || payment !== 'Nağd' || status === 'Çatdırıldı',
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      createdAt: d.at,
      timeline: timelineFor(status, d.at, now),
    };
  });

  const older = orders.filter((o) => o.source === 'Marketplace' && now - o.createdAt > 4 * DAY);
  [3, 11, 19].forEach((i) => {
    const o = older[i];
    if (!o || o.items.some((it) => it.productId === HERO_PRODUCT_ID)) return;
    o.status = 'Ləğv edildi';
    o.paid = false;
    o.timeline = timelineFor('Ləğv edildi', o.createdAt, now);
  });

  const shirvan = customers.find((c) => c.id === 'c03');
  const unpaid = orders.find((o) => o.source === 'B2B' && now - o.createdAt > 3 * DAY && now - o.createdAt < 9 * DAY);
  if (unpaid && shirvan) {
    Object.assign(unpaid, {
      customerId: shirvan.id,
      customerName: shirvan.company,
      phone: shirvan.phone,
      city: shirvan.city,
      address: shirvan.address,
      paid: false,
      dueAt: unpaid.createdAt + 2 * DAY,
    });
  }
  return orders.reverse();
}
