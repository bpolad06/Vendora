
import { Outlet, Link } from 'react-router-dom';
import { Search, ShoppingCart, MapPin } from 'lucide-react';

import { CATEGORIES } from '../data/categories';

export default function MarketLayout() {

  // Simplified cart count
  const cartCount = 0; 

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans text-ink">
      {/* Top Banner */}
      <div className="bg-brand text-surface text-xs py-1.5 px-4 flex justify-between items-center">
        <span>Sədərəkdən topdan və pərakəndə alış-veriş</span>
        <div className="flex items-center space-x-4">
          <Link to="/erp" className="hover:text-accent transition-colors">Satıcı Paneli</Link>
          <span>Müştəri xidmətləri: *9944</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-surface border-b border-line sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo-mark.png" alt="Vendora Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-ink">Vendora</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl flex relative">
            <input 
              type="text" 
              placeholder="Məhsul, satıcı və ya kateqoriya axtar..." 
              className="w-full h-10 pl-4 pr-10 border border-line rounded-md bg-canvas focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
            <button className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-ink-light hover:text-brand">
              <Search size={18} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-6 shrink-0">
            <div className="flex items-center gap-1.5 text-sm cursor-pointer hover:text-brand">
              <MapPin size={18} className="text-ink-light" />
              <span>Bakı</span>
            </div>
            
            <Link to="/cart" className="flex items-center gap-2 group">
              <div className="relative">
                <ShoppingCart size={22} className="text-ink group-hover:text-brand transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand text-surface text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">Səbət</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Category Strip */}
      <div className="bg-surface border-b border-line">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center space-x-6 text-sm text-ink-light overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <Link key={c.slug} to={`/c/${c.slug}`} className="hover:text-brand whitespace-nowrap">{c.name}</Link>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* Simple Footer */}
      <footer className="bg-surface border-t border-line py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-sm text-ink-light flex justify-between">
          <p>&copy; {new Date().getFullYear()} Vendora. Bütün hüquqlar qorunur.</p>
          <p>Sədərək Ticarət Mərkəzi</p>
        </div>
      </footer>
    </div>
  );
}
