export const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED'] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];
export type StatusFilter = OrderStatus | 'ALL';
export type OrderSort = 'newest' | 'oldest' | 'amount-high' | 'amount-low';

export interface Order {
  id: number;
  customer: string;
  amount: number;
  createdAt: string;
  status: OrderStatus;
}

export interface CreateOrder {
  customer: string;
  amount: number;
}

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.some((status) => status === value);
}
