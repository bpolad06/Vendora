
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingCart, 
  Users, 
  Truck, 
  BarChart3, 
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { useStore } from '../store/useStore';

const navItems = [
  { id: 'dashboard', label: 'Panel', icon: LayoutDashboard, path: '/erp' },
  { id: 'products', label: 'Məhsullar', icon: Package, path: '/erp/products' },
  { id: 'inventory', label: 'Anbar', icon: Boxes, path: '/erp/inventory' },
  { id: 'orders', label: 'Sifarişlər', icon: ShoppingCart, path: '/erp/orders' },
  { id: 'customers', label: 'Müştərilər', icon: Users, path: '/erp/customers' },
  { id: 'suppliers', label: 'Təchizatçılar', icon: Truck, path: '/erp/suppliers' },
  { id: 'reports', label: 'Hesabatlar', icon: BarChart3, path: '/erp/reports' },
  { id: 'settings', label: 'Ayarlar', icon: Settings, path: '/erp/settings' },
];

export default function SellerLayout() {
  const location = useLocation();
  const store = useStore();
  
  // Hardcode Vuqar for the demo
  const vuqar = store.sellers.find(s => s.name.includes('Vüqar')) || store.sellers[0];

  return (
    <div className="min-h-screen bg-canvas flex font-sans text-ink selection:bg-brand/20">
      
      {/* Sidebar */}
      <aside className="w-60 bg-surface border-r border-line flex flex-col fixed inset-y-0 z-30">
        <div className="h-14 flex items-center px-4 border-b border-line shrink-0">
          <div className="w-6 h-6 bg-brand rounded flex items-center justify-center text-surface font-bold text-xs mr-2">V</div>
          <span className="font-semibold tracking-tight">Vendora Biznes</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/erp' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.id} 
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive 
                    ? 'bg-brand/10 text-brand font-medium' 
                    : 'text-ink-light hover:bg-canvas hover:text-ink'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-brand' : 'text-ink-light'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-line shrink-0">
          <Link to="/" className="text-xs text-brand hover:underline flex items-center gap-1">
            <span>← Marketə qayıt</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 pl-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-14 bg-surface border-b border-line flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="font-medium text-sm">
            {vuqar?.name} <span className="text-ink-light font-normal mx-1">·</span> <span className="text-ink-light font-normal">{vuqar?.address}</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative group">
              <Search size={18} className="text-ink-light group-hover:text-ink transition-colors cursor-pointer" />
              {/* Shortcut hint */}
              <div className="absolute top-1/2 -translate-y-1/2 right-6 hidden group-hover:flex items-center gap-1">
                 <kbd className="bg-canvas border border-line rounded px-1.5 py-0.5 text-[10px] font-mono text-ink-light">/</kbd>
              </div>
            </div>
            
            <button className="relative text-ink-light hover:text-ink transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full border border-surface"></span>
            </button>
            
            <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-medium cursor-pointer ring-1 ring-brand/20">
              VM
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
