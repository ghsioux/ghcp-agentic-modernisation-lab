import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOrder, Order, OrderStatus } from './order';

const BASE = '/api/orders';

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  constructor(private http: HttpClient) {}

  list(): Observable<Order[]> {
    return this.http.get<Order[]>(BASE);
  }

  get(id: number): Observable<Order> {
    return this.http.get<Order>(`${BASE}/${id}`);
  }

  create(input: CreateOrder): Observable<Order> {
    return this.http.post<Order>(BASE, input);
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${BASE}/${id}/status`, null, { params: { status } });
  }

  totalForCustomer(customer: string): Observable<number> {
    return this.http.get<number>(`${BASE}/customer/${encodeURIComponent(customer)}/total`);
  }
}
