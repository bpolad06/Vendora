import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/Card';
import { formatAZN, formatNumber } from '../lib/format';
import { TrendingUp, Package, AlertCircle, ShoppingBag } from 'lucide-react';

export default function SellerDashboard() {
  const store = useStore();
  
  // Basic stats logic
  // Assume today is Date.now(), filter orders... (for MVP we'll just mock aggregated numbers from store)
  const todaySales = 1250.40;
  const todayOrders = 18;
  const marketShare = 45.2; // %
  const totalStockValue = useMemo(() => {
    return store.products.reduce((acc, p) => acc + (p.stock * p.cost), 0);
  }, [store.products]);

  // Activity Feed (just use recent orders or logs)
  const recentLogs = useStore(state => state.logs.slice(0, 5));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium text-ink">Panel</h1>
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Bugünkü satış" 
          value={formatAZN(todaySales)} 
          delta="+12.4% dünənə görə" 
          trend="up"
          icon={<TrendingUp size={18} />}
        />
        <StatCard 
          title="Sifarişlər" 
          value={todayOrders.toString()} 
          delta="+2 dünənə görə" 
          trend="up"
          icon={<ShoppingBag size={18} />}
        />
        <StatCard 
          title="Marketplace payı" 
          value={`${marketShare}%`} 
          delta="+5.1% keçən həftəyə görə" 
          trend="up"
          icon={<Package size={18} />}
        />
        <StatCard 
          title="Stok dəyəri" 
          value={formatAZN(totalStockValue)} 
          delta="-1.2% keçən aya görə" 
          trend="down"
          icon={<BoxesIcon size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-96 flex flex-col">
            <CardHeader>
              <CardTitle>Satış dinamikası (Son 30 gün)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center border-t border-line text-ink-light bg-surface">
              {/* Add Recharts here in next iteration */}
              <div className="text-center">
                <BarChartPlaceholder />
                <p className="mt-4 text-sm">Qrafik yüklənir...</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card className="border-amber/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber flex items-center gap-2">
                <AlertCircle size={16} />
                Diqqət tələb edir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-amber/5 rounded-md border border-amber/10 text-sm">
                <span className="font-medium">250 ml stəkan</span> — mövcud tempdə 7 günə bitəcək.
              </div>
              <div className="p-3 bg-danger/5 rounded-md border border-danger/10 text-sm">
                <span className="font-medium">Gəncə filialı</span> — 420 ₼ ödəniş gecikir.
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Son aktivlik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs.map((log, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${log.qty > 0 ? 'bg-brand' : 'bg-danger'}`} />
                    <div>
                      <p className="text-ink line-clamp-2">
                        {log.type} · <span className="font-medium">{log.productId.split('-')[0]}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`font-medium ${log.qty > 0 ? 'text-brand' : 'text-danger'}`}>
                          {log.qty > 0 ? '+' : ''}{formatNumber(log.qty)}
                        </span>
                        <span className="text-ink-light text-xs">{new Date(log.at).toLocaleTimeString('az-AZ', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}

function StatCard({ title, value, delta, trend, icon }: { title: string, value: string, delta: string, trend: 'up'|'down', icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-ink-light mb-2">
          <span className="text-sm font-medium">{title}</span>
          <div className="text-brand">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-ink mb-1">{value}</div>
        <div className={`text-xs ${trend === 'up' ? 'text-brand' : 'text-danger'}`}>
          {delta}
        </div>
      </CardContent>
    </Card>
  );
}

function BoxesIcon({size}: {size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  );
}

function BarChartPlaceholder() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 mx-auto">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  );
}
