import type { ArtKind } from '../shared/art/kinds';
import type { CategorySlug, PriceTier, Product } from './types';
import { DAY, HOUR } from '../lib/time';
import { createRng, hashString } from '../lib/random';

export interface ProductRow {
  name: string;
  cat: CategorySlug;
  art: ArtKind;
  unit: string;
  price: number;
  stock: number;
  rating: number;
  reviews: number;
  sold: number;
  sku?: string;
  cost?: number;
  old?: number;
  min?: number;
  tiers?: [number, number][];
  minOrder?: number;
  sup?: string;
  off?: boolean;
  fast?: boolean;
  group?: string;
  specs?: string;
  desc?: string;
}

const DESCRIPTIONS: Record<CategorySlug, string> = {
  'qab-qacaq':
    'Kafe, restoran, ofis və ev məclisləri üçün. Qida ilə təmas üçün yararlıdır, qablaşdırma möhürlü gəlir.',
  'ev-esyalari': 'Gündəlik istifadə üçün möhkəm material. Qutusunda zəmanət talonu ilə göndərilir.',
  qida: 'Təzə partiyadan göndərilir. Saxlama şərti: quru, sərin yerdə, birbaşa günəş şüasından uzaq.',
  teserrufat: 'Ev, ofis və obyektlərin təmizliyi üçün. Uşaqların əli çatmayan yerdə saxlayın.',
  tekstil: '100% pambıq və ya göstərilən tərkib. 40 dərəcədə yumaq tövsiyə olunur, rəngini vermir.',
  kosmetika: 'Dermatoloji yoxlanılıb. Son istifadə tarixi qutunun üzərində göstərilib.',
  elektrik: 'Standartlara uyğun sertifikatlı məhsul. Quraşdırmanı elektrik ustasına etdirin.',
  tikinti: 'Peşəkar və məişət işləri üçün. İstifadə qaydası qablaşdırmanın üzərindədir.',
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function defaultTiers(price: number): PriceTier[] {
  if (price < 1) {
    return [
      { min: 1, price },
      { min: 100, price: round2(price * 0.92) },
      { min: 1000, price: round2(price * 0.85) },
    ];
  }
  if (price < 6) {
    return [
      { min: 1, price },
      { min: 20, price: round2(price * 0.93) },
      { min: 100, price: round2(price * 0.87) },
    ];
  }
  if (price < 40) {
    return [
      { min: 1, price },
      { min: 10, price: round2(price * 0.94) },
    ];
  }
  return [{ min: 1, price }];
}

function parseSpecs(raw: string | undefined): [string, string][] {
  if (!raw) return [];
  return raw.split('|').map((pair) => {
    const [k, v] = pair.split(':');
    return [k.trim(), (v ?? '').trim()];
  });
}

export function buildProducts(
  sellerId: string,
  idPrefix: string,
  skuPrefix: string,
  rows: ProductRow[],
  now: number,
): Product[] {
  const rng = createRng(hashString(sellerId));
  return rows.map((row, i) => {
    const id = `${idPrefix}${String(i + 1).padStart(2, '0')}`;
    const ageDays = 3 + Math.floor(rng() * 70);
    const publishedAt = now - ageDays * DAY - Math.floor(rng() * 10) * HOUR;
    const minOrder = row.minOrder ?? 1;
    const specs: [string, string][] = [
      ...parseSpecs(row.specs),
      ['Satış vahidi', row.unit],
      ['Minimum sifariş', `${minOrder} ${row.unit}`],
    ];
    return {
      id,
      sellerId,
      name: row.name,
      sku: row.sku ?? `${skuPrefix}-${1000 + (i + 1) * 7}`,
      category: row.cat,
      art: row.art,
      unit: row.unit,
      price: row.price,
      oldPrice: row.old,
      cost: row.cost ?? round2(row.price * 0.62),
      tiers: row.tiers ? row.tiers.map(([min, price]) => ({ min, price })) : defaultTiers(row.price),
      minOrder,
      stock: row.stock,
      minStock: row.min ?? Math.max(5, Math.round(row.stock * 0.15)),
      supplierId: row.sup,
      published: !row.off,
      publishedAt: row.off ? undefined : publishedAt,
      rating: row.rating,
      reviewCount: row.reviews,
      soldCount: row.sold,
      fastDelivery: row.fast ?? true,
      group: row.group,
      specs,
      description: row.desc ?? `${row.name}. ${DESCRIPTIONS[row.cat]}`,
      createdAt: publishedAt - 2 * DAY,
    };
  });
}
