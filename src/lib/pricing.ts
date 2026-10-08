import type { PriceTier, Product, Seller } from '../data/types';

export function tierIndexFor(tiers: PriceTier[], qty: number): number {
  let idx = -1;
  tiers.forEach((t, i) => {
    if (qty >= t.min && (idx === -1 || t.min > tiers[idx].min)) idx = i;
  });
  return idx;
}

export function unitPriceFor(product: Pick<Product, 'tiers' | 'price'>, qty: number): number {
  if (!product.tiers.length) return product.price;
  const index = tierIndexFor(product.tiers, qty);
  return index === -1 ? product.price : product.tiers[index].price;
}

export function tierRangeLabel(tiers: PriceTier[], i: number, unit = 'əd.'): string {
  const next = tiers[i + 1];
  const from = tiers[i].min;
  return next ? `${from}–${next.min - 1} ${unit}` : `${from}+ ${unit}`;
}

export function lowestPrice(product: Pick<Product, 'tiers' | 'price'>): number {
  return product.tiers.length ? Math.min(...product.tiers.map((t) => t.price)) : product.price;
}

export function shippingFor(
  seller: Pick<Seller, 'freeShippingFrom' | 'shippingFee'>,
  subtotal: number,
): number {
  return subtotal >= seller.freeShippingFrom ? 0 : seller.shippingFee;
}

export function marginPercent(price: number, cost: number): number {
  if (price <= 0) return 0;
  return ((price - cost) / price) * 100;
}

export function discountPercent(price: number, oldPrice?: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
