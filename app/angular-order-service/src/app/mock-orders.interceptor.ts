import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { CreateOrder, isOrderStatus } from './order';
import { OrderStore } from './order-store.service';

const BASE = '/api/orders';

function isCreateOrder(body: unknown): body is CreateOrder {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  const input = body as Record<string, unknown>;
  return typeof input['customer'] === 'string'
    && input['customer'].trim().length > 0
    && typeof input['amount'] === 'number'
    && Number.isFinite(input['amount'])
    && input['amount'] >= 0.01;
}

@Injectable()
export class MockOrdersInterceptor implements HttpInterceptor {
  constructor(private store: OrderStore) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const url = new URL(request.urlWithParams, 'http://localhost');
    const path = url.pathname;
    if (path !== BASE && !path.startsWith(`${BASE}/`)) {
      return next.handle(request);
    }

    if (path === BASE) {
      if (request.method === 'GET') {
        return this.respond(200, this.store.list());
      }
      if (request.method === 'POST') {
        if (!isCreateOrder(request.body)) {
          return this.fail(400, 'Customer is required and amount must be at least 0.01.');
        }
        return this.respond(201, this.store.create(request.body));
      }
      return this.fail(405, 'Method not allowed.');
    }

    const totalMatch = path.match(/^\/api\/orders\/customer\/([^/]+)\/total$/);
    if (totalMatch && request.method === 'GET') {
      let customer: string;
      try {
        customer = decodeURIComponent(totalMatch[1]);
      } catch (error) {
        if (error instanceof URIError) {
          return this.fail(400, 'Customer name is not valid.');
        }
        throw error;
      }
      return this.respond(200, this.store.totalForCustomer(customer));
    }

    const statusMatch = path.match(/^\/api\/orders\/(\d+)\/status$/);
    if (statusMatch && request.method === 'PATCH') {
      const status = url.searchParams.get('status');
      if (!status || !isOrderStatus(status)) {
        return this.fail(400, 'Unknown order status.');
      }
      const updated = this.store.updateStatus(Number(statusMatch[1]), status);
      return updated ? this.respond(200, updated) : this.fail(404, 'Order not found.');
    }

    const orderMatch = path.match(/^\/api\/orders\/(\d+)$/);
    if (orderMatch && request.method === 'GET') {
      const order = this.store.find(Number(orderMatch[1]));
      return order ? this.respond(200, order) : this.fail(404, 'Order not found.');
    }
    return this.fail(404, 'Endpoint not found.');
  }

  private respond(status: number, body: unknown): Observable<HttpEvent<unknown>> {
    return of(new HttpResponse({ status, body }));
  }

  private fail(status: number, message: string): Observable<HttpEvent<unknown>> {
    return throwError(() => new HttpErrorResponse({ status, error: { message }, statusText: message }));
  }
}
