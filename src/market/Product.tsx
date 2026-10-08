import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatAZN, formatNumber } from '../lib/format';
import { Store, Star, MapPin, Truck, ShieldCheck, ChevronRight, ShoppingCart, Info } from 'lucide-react';
import { Button } from '../shared/ui/Button';

export default function MarketProduct() {
  const { id } = useParams<{ id: string }>();
  const store = useStore();
  
  const product = store.products.find(p => p.id === id);
  const [qty, setQty] = useState(product?.minOrder || 1);

  if (!product) return <div className="p-12 text-center text-ink-light">Məhsul tapılmadı.</div>;

  const seller = store.sellers.find(s => s.id === product.sellerId);
  
  // Calculate active price based on tiers
  let currentPrice = product.price;
  let activeTierIndex = -1;
  
  if (product.tiers && product.tiers.length > 0) {
    // Tiers should be sorted by min ascending
    const sortedTiers = [...product.tiers].sort((a, b) => a.min - b.min);
    
    // Find the highest tier that matches the current qty
    for (let i = sortedTiers.length - 1; i >= 0; i--) {
      if (qty >= sortedTiers[i].min) {
        currentPrice = sortedTiers[i].price;
        activeTierIndex = i;
        break;
      }
    }
  }

  const stockClass = product.stock > 100 ? 'text-success' : product.stock > 0 ? 'text-amber' : 'text-danger';

  // Find competitors
  const competitors = store.products
    .filter(p => p.category === product.category && p.id !== product.id && p.published)
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-ink-light">
        <Link to="/" className="hover:text-brand">Ana səhifə</Link>
        <ChevronRight size={12} />
        <Link to={`/c/${product.category}`} className="hover:text-brand">Kateqoriya</Link>
        <ChevronRight size={12} />
        <span className="text-ink truncate">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Gallery (Placeholder) */}
        <div className="w-full lg:w-1/3 shrink-0 space-y-4">
          <div className="aspect-square bg-surface border border-line rounded-lg overflow-hidden flex items-center justify-center relative">
            <img src={product.image || `https://source.unsplash.com/500x500/?${product.art},product`} alt={product.name} className="w-full h-full object-cover" />
            {product.tiers && product.tiers.length > 0 && (
              <div className="absolute top-3 left-3 bg-brand text-surface text-xs font-bold px-3 py-1 rounded">
                TOPDAN SATIŞ
              </div>
            )}
          </div>
        </div>

        {/* Center: Details */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-2xl font-medium text-ink leading-tight mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-ink-light">SKU: <span className="font-mono">{product.sku}</span></span>
              <div className="flex items-center gap-1 text-amber">
                <Star size={14} className="fill-amber" />
                <Star size={14} className="fill-amber" />
                <Star size={14} className="fill-amber" />
                <Star size={14} className="fill-amber" />
                <Star size={14} className="text-line" />
                <span className="text-ink-light ml-1">(12 rəy)</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface border border-line rounded-lg space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-sm text-ink-light mb-1">Cari qiymət</div>
                <div className="text-3xl font-bold text-ink">{formatAZN(currentPrice)}</div>
              </div>
              <div className={`text-sm font-medium ${stockClass}`}>
                Anbarda: {formatNumber(product.stock)} {product.unit || 'ədəd'}
              </div>
            </div>

            {product.tiers && product.tiers.length > 0 && (
              <div className="mt-4 border border-line rounded-md overflow-hidden bg-canvas">
                <div className="grid grid-cols-3 bg-surface border-b border-line text-xs font-medium text-ink-light">
                  <div className="p-2 text-center border-r border-line">Miqdar</div>
                  <div className="p-2 text-center border-r border-line">Qiymət</div>
                  <div className="p-2 text-center">Fərq</div>
                </div>
                <div className="flex bg-canvas">
                  {/* Pərakəndə tier */}
                  <div className={`flex-1 flex flex-col text-center p-3 border-r border-line transition-colors ${activeTierIndex === -1 && qty < product.tiers[0].min ? 'bg-brand/10 ring-1 ring-inset ring-brand' : ''}`}>
                    <span className="text-xs text-ink-light mb-1">Pərakəndə (1+)</span>
                    <span className="font-medium text-ink">{formatAZN(product.price)}</span>
                  </div>
                  {product.tiers.map((tier, idx) => {
                    const nextTier = product.tiers[idx + 1];
                    const label = nextTier ? `${tier.min} - ${nextTier.min - 1}` : `${tier.min}+`;
                    const isActive = activeTierIndex === idx;
                    const savings = ((product.price - tier.price) / product.price) * 100;
                    return (
                      <div key={idx} className={`flex-1 flex flex-col text-center p-3 border-r last:border-0 border-line transition-colors ${isActive ? 'bg-brand/10 ring-1 ring-inset ring-brand' : ''}`}>
                        <span className="text-xs text-ink-light mb-1">{label} əd.</span>
                        <span className="font-medium text-ink">{formatAZN(tier.price)}</span>
                        {savings > 0 && <span className="text-[10px] text-success mt-0.5">-{savings.toFixed(0)}%</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-line space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium w-16">Miqdar:</span>
                <div className="flex items-center">
                  <button 
                    onClick={() => setQty(Math.max(product.minOrder || 1, qty - 1))}
                    className="w-10 h-10 border border-line rounded-l bg-surface hover:bg-canvas flex items-center justify-center text-ink-light"
                  >-</button>
                  <input 
                    type="number" 
                    value={qty} 
                    onChange={e => setQty(Number(e.target.value) || 1)}
                    className="w-20 h-10 border-y border-line text-center font-medium focus:outline-none focus:ring-1 focus:ring-brand z-10"
                  />
                  <button 
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-10 h-10 border border-line rounded-r bg-surface hover:bg-canvas flex items-center justify-center text-ink-light"
                  >+</button>
                </div>
                
                {/* Quick Add Buttons for Wholesale */}
                {product.tiers && product.tiers.length > 0 && (
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => setQty(100)} className="px-3 py-1.5 text-xs border border-line rounded hover:bg-canvas hover:border-brand transition-colors">+100</button>
                    <button onClick={() => setQty(500)} className="px-3 py-1.5 text-xs border border-line rounded hover:bg-canvas hover:border-brand transition-colors">+500</button>
                  </div>
                )}
              </div>

              {product.minOrder > 1 && qty < product.minOrder && (
                <div className="text-xs text-danger flex items-center gap-1 mt-1">
                  <Info size={12} /> Minimum sifariş miqdarı {product.minOrder} ədəddir.
                </div>
              )}

              <div className="text-sm text-ink-light flex justify-between pt-2">
                <span>Ümumi məbləğ:</span>
                <span className="text-lg font-bold text-ink">{formatAZN(currentPrice * qty)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1 flex items-center justify-center gap-2" size="lg">
                <ShoppingCart size={18} />
                Səbətə at
              </Button>
              <Button variant="secondary" className="flex-1" size="lg">
                İndi al
              </Button>
            </div>
          </div>
          
          <div className="prose prose-sm prose-zinc text-ink-light">
            <h3 className="text-ink font-medium">Məhsul haqqında</h3>
            <p>{product.description}</p>
          </div>
        </div>

        {/* Right: Seller & Logistics */}
        <div className="w-full lg:w-[300px] shrink-0 space-y-4">
          <div className="bg-surface border border-line rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-canvas rounded border border-line flex items-center justify-center text-ink-light">
                <Store size={24} />
              </div>
              <div>
                <Link to={`/s/${seller?.id}`} className="font-medium text-ink hover:text-brand hover:underline line-clamp-1">{seller?.name}</Link>
                <div className="text-xs text-ink-light flex items-center gap-1 mt-0.5">
                  <Star size={12} className="text-amber fill-amber" /> {seller?.rating} (240 rəy)
                </div>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-ink-light">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>{seller?.address || seller?.city}</span>
              </div>
              <div className="flex items-start gap-2 text-ink-light">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-success" />
                <span>Təsdiqlənmiş satıcı ({seller?.since}-dan)</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-5" size="sm">
              Satıcının mağazasına keç
            </Button>
          </div>

          <div className="bg-surface border border-line rounded-lg p-5 space-y-4">
            <h3 className="font-medium text-sm text-ink mb-2">Çatdırılma və Ödəniş</h3>
            <div className="flex items-start gap-3 text-sm">
              <Truck size={18} className="text-brand shrink-0" />
              <div>
                <span className="font-medium text-ink block">Kuryerlə çatdırılma</span>
                <span className="text-xs text-ink-light">Bakı daxili: 1-2 iş günü, 5.00 ₼-dan</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Store size={18} className="text-brand shrink-0" />
              <div>
                <span className="font-medium text-ink block">Özün götür</span>
                <span className="text-xs text-ink-light">Sədərək TM, B-blok 214. Pulsuz.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitors Comparison */}
      {competitors.length > 0 && (
        <div className="pt-12 border-t border-line mt-12">
          <h2 className="text-xl font-bold text-ink mb-6">Başqa satıcılarda müqayisə et</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {competitors.map(comp => {
              const compSeller = store.sellers.find(s => s.id === comp.sellerId);
              return (
                <div key={comp.id} className="bg-surface border border-line rounded-lg p-4 flex gap-4">
                  <div className="w-20 h-20 bg-canvas rounded overflow-hidden shrink-0">
                    <img src={comp.image || `https://source.unsplash.com/150x150/?${comp.art},product`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <Link to={`/p/${comp.id}`} className="font-medium text-sm text-ink hover:text-brand line-clamp-2 mb-1">{comp.name}</Link>
                    <div className="text-xs text-ink-light flex items-center gap-1 mb-2">
                      <Store size={10} /> {compSeller?.name}
                    </div>
                    <div className="mt-auto flex justify-between items-end">
                      <span className="font-bold text-ink">{formatAZN(comp.price)}</span>
                      {comp.tiers && comp.tiers.length > 0 && (
                        <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded">Topdan var</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
