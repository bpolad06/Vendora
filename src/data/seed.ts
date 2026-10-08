import type { DataState } from './types';
import { buildSellers, VUQAR_ID } from './sellers';
import { buildProducts } from './productBuilder';
import { VUQAR_ROWS } from './catalogVuqar';
import { MARKET_CATALOGS } from './catalogMarket';
import { buildCustomers, buildSuppliers } from './people';
import { generateOrders } from './seedOrders';
import { generateLogs } from './seedLogs';
import { dayKey } from '../lib/time';

export function buildSeed(now = Date.now()): DataState {
  const vuqarProducts = buildProducts(VUQAR_ID, 'v', 'VQ', VUQAR_ROWS, now);
  const marketProducts = MARKET_CATALOGS.flatMap((c) =>
    buildProducts(c.sellerId, c.idPrefix, c.skuPrefix, c.rows, now),
  );
  const customers = buildCustomers(now);
  const orders = generateOrders(vuqarProducts, customers, now);
  return {
    seededOn: dayKey(now),
    sellers: buildSellers(now),
    products: [...vuqarProducts, ...marketProducts],
    orders,
    logs: generateLogs(vuqarProducts, orders, now),
    customers,
    suppliers: buildSuppliers(now),
    purchases: [],
  };
}
