import { Order, OrderSort, StatusFilter } from './order';

export interface OrderFilters {
  search: string;
  status: StatusFilter;
  sort: OrderSort;
}

export interface OrderSummary {
  totalOrders: number;
  activeOrders: number;
  totalValue: number;
  averageValue: number;
}

export function visibleOrders(orders: Order[], filters: OrderFilters): Order[] {
  const query = filters.search.trim().toLowerCase();
  const visible = orders.filter((order) => {
    const matchesSearch = !query
      || order.customer.toLowerCase().includes(query)
      || String(order.id) === query;
    return matchesSearch && (filters.status === 'ALL' || order.status === filters.status);
  });

  return visible.sort((left, right) => {
    switch (filters.sort) {
      case 'oldest':
        return Date.parse(left.createdAt) - Date.parse(right.createdAt);
      case 'amount-high':
        return right.amount - left.amount;
      case 'amount-low':
        return left.amount - right.amount;
      default:
        return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    }
  });
}

export function summarizeOrders(orders: Order[]): OrderSummary {
  const totalValue = orders.reduce((total, order) => total + order.amount, 0);
  return {
    totalOrders: orders.length,
    activeOrders: orders.filter((order) => order.status !== 'COMPLETED').length,
    totalValue,
    averageValue: orders.length ? totalValue / orders.length : 0
  };
}
