
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { formatAZN } from '../lib/format';
import { Store, Star, Coffee, Utensils, Trash, Package, Droplet, Lightbulb, PenTool, Circle, Disc, ShoppingBag } from 'lucide-react';
import { Product } from '../data/types';

function ProductImage({ art }: { art: string }) {
  let Icon = Package;
  if (art.includes('cup') || art.includes('armudu') || art.includes('tea')) Icon = Coffee;
  else if (art.includes('plate') || art.includes('pan')) Icon = Disc;
  else if (art.includes('fork') || art.includes('spoon')) Icon = Utensils;
  else if (art.includes('trash') || art.includes('sack')) Icon = Trash;
  else if (art.includes('detergent') || art.includes('soap') || art.includes('cream') || art.includes('oil')) Icon = Droplet;
  else if (art.includes('bulb') || art.includes('socket') || art.includes('cable')) Icon = Lightbulb;
  else if (art.includes('paint') || art.includes('drill')) Icon = PenTool;
  else if (art.includes('towel') || art.includes('carpet')) Icon = ShoppingBag;
  else if (art.includes('container') || art.includes('box')) Icon = Package;
  else if (art.includes('foil') || art.includes('stretch') || art.includes('tape')) Icon = Circle;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-brand/5 text-brand/40">
      <Icon size={48} strokeWidth={1} />
    </div>
  );
}

export default function MarketHome() {
  const store = useStore();
  
  // Only show published products
  const publishedProducts = store.products.filter(p => p.published);

  const newArrivals = publishedProducts.slice(0, 8);
  const bestSellers = publishedProducts.slice(8, 16);
  const wholesaleFocus = publishedProducts.filter(p => p.tiers && p.tiers.length > 0).slice(0, 8);

  return (
    <div className="space-y-12 pb-12">
      
      {/* Sədərəkdən Topdan */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Store className="text-brand" />
            Sədərəkdən Topdan
          </h2>
          <Link to="/search?type=wholesale" className="text-sm font-medium text-brand hover:underline">Hamısına bax →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wholesaleFocus.map(p => <ProductCard key={p.id} product={p} store={store} />)}
        </div>
      </section>

      {/* Ən çox satılanlar */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink">Ən çox satılanlar</h2>
          <Link to="/search?sort=popular" className="text-sm font-medium text-brand hover:underline">Hamısına bax →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {bestSellers.map(p => <ProductCard key={p.id} product={p} store={store} />)}
        </div>
      </section>

      {/* Yeni gələnlər */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink">Yeni gələnlər</h2>
          <Link to="/search?sort=new" className="text-sm font-medium text-brand hover:underline">Hamısına bax →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {newArrivals.map(p => <ProductCard key={p.id} product={p} store={store} />)}
        </div>
      </section>

    </div>
  );
}

function ProductCard({ product, store }: { product: Product, store: ReturnType<typeof useStore.getState> }) {
  const seller = store.sellers.find((s) => s.id === product.sellerId);
  const minPrice = product.tiers?.[product.tiers.length - 1]?.price || product.price;
  const isWholesale = product.tiers?.length > 0;

  return (
    <Link to={`/p/${product.id}`} className="group bg-surface border border-line rounded-lg overflow-hidden hover:border-brand/50 hover:shadow-md transition-all flex flex-col">
      <div className="aspect-[4/5] bg-canvas relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <ProductImage art={product.art} />
        )}
        {isWholesale && (
          <div className="absolute top-2 left-2 bg-brand text-surface text-[10px] font-bold px-2 py-0.5 rounded">
            TOPDAN
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        <div className="text-[11px] text-ink-light mb-1 flex items-center gap-1 line-clamp-1">
          <Store size={10} />
          {seller?.name} <span className="mx-0.5">•</span> <Star size={10} className="text-amber fill-amber" /> {seller?.rating}
        </div>
        
        <h3 className="font-medium text-sm text-ink line-clamp-2 mb-2 group-hover:text-brand transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto">
          {isWholesale ? (
            <div className="flex items-end gap-1.5">
              <span className="text-lg font-bold text-ink">{formatAZN(minPrice)}</span>
              <span className="text-xs text-ink-light mb-1">-dan</span>
            </div>
          ) : (
            <div className="text-lg font-bold text-ink">{formatAZN(product.price)}</div>
          )}
          
          {product.minOrder > 1 && (
            <div className="text-[10px] text-ink-light mt-1">
              Min. sifariş: {product.minOrder} ədəd
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
