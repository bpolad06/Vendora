
import { useStore } from '../store/useStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../shared/ui/Table';
import { Badge } from '../shared/ui/Badge';
import { formatAZN } from '../lib/format';
import { formatDate } from '../lib/time';
import { Search, Filter, Eye } from 'lucide-react';

export default function SellerOrders() {
  const store = useStore();
  const vuqarId = store.sellers.find(s => s.name.includes('Vüqar'))?.id || store.sellers[0].id;
  
  // Real app: filter by sellerId if we have multiple sellers, 
  // but for ERP view we assume we see orders FOR this seller.
  // We need to find orders that contain items from this seller.
  const orders = store.orders.filter(o => 
    o.items.some(i => store.products.find(p => p.id === i.productId)?.sellerId === vuqarId)
  ).slice(0, 50); // limit for demo

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-medium text-ink">Sifarişlər</h1>
      </div>

      <div className="bg-surface border border-line rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
              <input 
                type="text" 
                placeholder="Sifariş nömrəsi və ya müştəri..." 
                className="w-full h-9 pl-9 pr-4 text-sm border border-line rounded bg-canvas focus:outline-none focus:border-brand"
              />
            </div>
            <button className="h-9 px-3 border border-line rounded flex items-center gap-2 text-sm font-medium text-ink hover:bg-canvas transition-colors">
              <Filter size={16} />
              Filtrlər
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-canvas sticky top-0 z-10 shadow-[0_1px_0_0_var(--line)]">
              <TableRow>
                <TableHead>Sifariş nömrəsi</TableHead>
                <TableHead>Tarix</TableHead>
                <TableHead>Mənbə</TableHead>
                <TableHead>Müştəri</TableHead>
                <TableHead>Şəhər</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Məbləğ</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => {
                const customer = store.customers.find(c => c.id === order.customerId);
                return (
                  <TableRow key={order.id} className="group hover:bg-canvas transition-colors">
                    <TableCell className="font-mono text-sm text-ink">{order.number}</TableCell>
                    <TableCell className="text-sm text-ink-light">{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <SourceBadge source={order.source} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-ink">{customer?.name || order.customerName || 'Anonim'}</div>
                      <div className="text-xs text-ink-light">{customer?.phone || order.phone}</div>
                    </TableCell>
                    <TableCell className="text-sm text-ink-light">{order.city}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium text-ink">
                      {formatAZN(order.total)}
                    </TableCell>
                    <TableCell>
                      <button className="p-1.5 text-brand bg-brand/10 hover:bg-brand/20 rounded transition-colors opacity-0 group-hover:opacity-100">
                        <Eye size={16} />
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

function SourceBadge({ source }: { source: string }) {
  if (source === 'Marketplace') return <Badge variant="success" className="text-[10px]">Marketplace</Badge>;
  if (source === 'Kassa') return <Badge variant="neutral" className="text-[10px]">Kassa</Badge>;
  return <Badge variant="warning" className="text-[10px]">B2B</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'Yeni': return <Badge variant="warning" className="text-[10px]">Yeni</Badge>;
    case 'Hazırlanır': return <Badge variant="success" className="text-[10px] bg-brand/10 text-brand">Hazırlanır</Badge>;
    case 'Göndərildi': return <Badge variant="neutral" className="text-[10px]">Göndərildi</Badge>;
    case 'Çatdırıldı': return <Badge variant="success" className="text-[10px]">Çatdırıldı</Badge>;
    case 'Ləğv edildi': return <Badge variant="danger" className="text-[10px]">Ləğv edildi</Badge>;
    default: return <Badge variant="neutral" className="text-[10px]">{status}</Badge>;
  }
}
