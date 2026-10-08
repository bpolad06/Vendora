import type { Product } from '../data/types';

const ART_PHOTOS = new Set([
  'plate',
  'fork',
  'pan',
  'armudu',
  'napkin',
  'oil',
  'jar',
  'sack',
  'bottle',
  'soap',
  'cream',
  'bulb',
]);
export const productImage = (
  p: Pick<Product, 'image' | 'category'> & Partial<Pick<Product, 'art'>>,
) =>
  p.image ||
  (p.art
    ? '/products/' + p.art + (ART_PHOTOS.has(p.art) ? '.webp' : '.svg')
    : '/products/' + p.category + '.jpg');
export const imageFallback = '/product-placeholder.svg';
