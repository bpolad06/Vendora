import type { Category, CategorySlug } from './types';

export const CATEGORIES: Category[] = [
  { slug: 'qab-qacaq', name: 'Qab-qacaq', art: 'cup', commission: 8 },
  { slug: 'ev-esyalari', name: 'Ev əşyaları', art: 'kettle', commission: 10 },
  { slug: 'qida', name: 'Qida', art: 'tea', commission: 7 },
  { slug: 'teserrufat', name: 'Təsərrüfat malları', art: 'detergent', commission: 8 },
  { slug: 'tekstil', name: 'Tekstil', art: 'towel', commission: 12 },
  { slug: 'kosmetika', name: 'Kosmetika', art: 'cream', commission: 12 },
  { slug: 'elektrik', name: 'Elektrik', art: 'bulb', commission: 9 },
  { slug: 'tikinti', name: 'Tikinti', art: 'paint', commission: 6 },
];

const bySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: CategorySlug | string): Category | undefined {
  return bySlug.get(slug as CategorySlug);
}

export const CITIES = ['Bakı', 'Sumqayıt', 'Gəncə', 'Xırdalan', 'Şəki', 'Lənkəran'] as const;
export type City = (typeof CITIES)[number];
