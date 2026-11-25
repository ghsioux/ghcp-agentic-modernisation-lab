import { Injectable } from '@angular/core';
import { CreateOrder, Order, OrderStatus } from './order';

@Injectable({ providedIn: 'root' })
export class OrderStore {
  private orders: Order[] = [
    { id: 1, customer: 'alice', amount: 120.5, createdAt: '2024-01-01T10:00:00.000Z', status: 'PENDING' },
    { id: 2, customer: 'alice', amount: 80, createdAt: '2024-01-02T10:00:00.000Z', status: 'PROCESSING' },
    { id: 3, customer: 'bob', amount: 42.99, createdAt: '2024-01-03T10:00:00.000Z', status: 'COMPLETED' }
  ];
  private nextId = 4;

  list(): Order[] {
    return this.orders.map((order) => ({ ...order }));
  }

  find(id: number): Order | undefined {
    const order = this.orders.find((item) => item.id === id);
    return order ? { ...order } : undefined;
  }

  totalForCustomer(customer: string): number {
    return this.orders
      .filter((order) => order.customer === customer)
      .reduce((total, order) => total + order.amount, 0);
  }

  create(input: CreateOrder): Order {
    const order: Order = {
      id: this.nextId++,
      customer: input.customer,
      amount: input.amount,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    this.orders.push(order);
    return { ...order };
  }

  updateStatus(id: number, status: OrderStatus): Order | undefined {
    const order = this.orders.find((item) => item.id === id);
    if (!order) {
      return undefined;
    }
    order.status = status;
    return { ...order };
  }
}
