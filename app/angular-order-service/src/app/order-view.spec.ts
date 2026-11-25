import { Order } from './order';
import { summarizeOrders, visibleOrders } from './order-view';

describe('order view', () => {
  const orders: Order[] = [
    { id: 1, customer: 'Alice', amount: 120.5, status: 'PENDING', createdAt: '2024-01-01T10:00:00Z' },
    { id: 2, customer: 'Bob', amount: 42.99, status: 'COMPLETED', createdAt: '2024-01-03T10:00:00Z' },
    { id: 3, customer: 'alice cooper', amount: 80, status: 'PROCESSING', createdAt: '2024-01-02T10:00:00Z' }
  ];

  it('searches customer names case-insensitively and order IDs exactly', () => {
    expect(visibleOrders(orders, { search: 'ALI', status: 'ALL', sort: 'newest' }).map((o) => o.id))
      .toEqual([3, 1]);
    expect(visibleOrders(orders, { search: '2', status: 'ALL', sort: 'newest' }).map((o) => o.id))
      .toEqual([2]);
  });

  it('combines status filters and sort modes without mutating the source', () => {
    expect(visibleOrders(orders, { search: '', status: 'PENDING', sort: 'newest' }).map((o) => o.id))
      .toEqual([1]);
    expect(visibleOrders(orders, { search: '', status: 'ALL', sort: 'oldest' }).map((o) => o.id))
      .toEqual([1, 3, 2]);
    expect(visibleOrders(orders, { search: '', status: 'ALL', sort: 'amount-high' }).map((o) => o.id))
      .toEqual([1, 3, 2]);
    expect(visibleOrders(orders, { search: '', status: 'ALL', sort: 'amount-low' }).map((o) => o.id))
      .toEqual([2, 3, 1]);
    expect(orders.map((o) => o.id)).toEqual([1, 2, 3]);
  });

  it('summarizes all loaded orders and handles an empty list', () => {
    expect(summarizeOrders(orders)).toEqual({
      totalOrders: 3,
      activeOrders: 2,
      totalValue: 243.49,
      averageValue: 243.49 / 3
    });
    expect(summarizeOrders([])).toEqual({
      totalOrders: 0,
      activeOrders: 0,
      totalValue: 0,
      averageValue: 0
    });
  });
});
