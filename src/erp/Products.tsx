import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../shared/ui/Table';
import { Badge } from '../shared/ui/Badge';
import { formatAZN, formatNumber } from '../lib/format';
import { Search, Filter, MoreHorizontal, Store, Globe } from 'lucide-react';
import { Product } from '../data/types';
import { CATEGORIES } from '../data/categories';

export default function SellerProducts() {
  const store = useStore();
  const [search, setSearch] = useState('');
  
  // Hardcoded Vuqar ID for demo (as he's the seller)
  const vuqarId = store.sellers.find(s => s.name.includes('Vüqar'))?.id || store.sellers[0].id;
  
  const products = store.products.filter(p => p.sellerId === vuqarId);
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const handleToggleMarketplace = (product: Product) => {
    const updated = { ...product, published: !product.published };
    useStore.setState(state => ({
      products: state.products.map(p => p.id === product.id ? updated : p)
    }));
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-medium text-ink">Məhsullar</h1>
        <button className="bg-brand text-surface px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-dark transition-colors">
          Yeni məhsul
        </button>
      </div>

      <div className="bg-surface border border-line rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
              <input 
                type="text" 
                placeholder="Ad və ya SKU ilə axtar..." 
                className="w-full h-9 pl-9 pr-4 text-sm border border-line rounded bg-canvas focus:outline-none focus:border-brand"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="h-9 px-3 border border-line rounded flex items-center gap-2 text-sm font-medium text-ink hover:bg-canvas transition-colors">
              <Filter size={16} />
              Filtrlər
            </button>
          </div>
          
          <div className="text-sm text-ink-light">
            Cəmi {filtered.length} məhsul
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-canvas sticky top-0 z-10 shadow-[0_1px_0_0_var(--line)]">
              <TableRow>
                <TableHead className="w-10 text-center">
                  <input type="checkbox" className="rounded border-line" />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Məhsul adı</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Kateqoriya</TableHead>
                <TableHead className="text-right">Alış / Satış</TableHead>
                <TableHead className="text-right">Marja</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-center">Marketplace</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(product => {
                const margin = ((product.price - product.cost) / product.price) * 100;
                
                let stockClass = "text-ink";
                if (product.stock === 0) stockClass = "text-danger font-medium";
                else if (product.stock < product.minStock) stockClass = "text-amber font-medium";

                return (
                  <TableRow key={product.id} className="group hover:bg-canvas transition-colors">
                    <TableCell className="text-center">
                      <input type="checkbox" className="rounded border-line" />
                    </TableCell>
                    <TableCell>
                      <div className="w-10 h-10 bg-canvas rounded border border-line flex items-center justify-center overflow-hidden">
                        <img src={product.image || `https://source.unsplash.com/100x100/?${product.art},product`} alt="" className="w-full h-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-ink">{product.name}</div>
                      <div className="text-xs text-ink-light mt-0.5 line-clamp-1">{product.description}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-ink-light">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="neutral" className="text-[10px] uppercase tracking-wide">
                        {CATEGORIES.find(c => c.slug === product.category)?.name || '...'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-xs text-ink-light line-through">{formatAZN(product.cost)}</div>
                      <div className="font-medium text-ink">{formatAZN(product.price)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-brand text-xs font-medium">{margin.toFixed(0)}%</span>
                    </TableCell>
                    <TableCell className={`text-right ${stockClass}`}>
                      {formatNumber(product.stock)}
                    </TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={() => handleToggleMarketplace(product)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          product.published 
                            ? 'bg-brand/10 text-brand ring-1 ring-brand/20' 
                            : 'bg-canvas text-ink-light ring-1 ring-line hover:text-ink'
                        }`}
                      >
                        {product.published ? (
                          <>
                            <Globe size={14} /> Aktiv
                          </>
                        ) : (
                          <>
                            <Store size={14} /> Kassa
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button className="p-1 text-ink-light hover:text-ink rounded hover:bg-line transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
