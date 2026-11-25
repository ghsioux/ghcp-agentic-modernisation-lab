import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockOrdersInterceptor } from './mock-orders.interceptor';
import { Order } from './order';
import { OrdersApi } from './orders-api.service';

describe('Order API simulator', () => {
  let api: OrdersApi;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: MockOrdersInterceptor, multi: true }]
    });
    api = TestBed.inject(OrdersApi);
    http = TestBed.inject(HttpClient);
  });

  it('lists seeded orders and calculates exact customer totals', async () => {
    const orders = await firstValueFrom(api.list());

    expect(orders.map((order) => [order.customer, order.amount, order.status])).toEqual([
      ['alice', 120.5, 'PENDING'],
      ['alice', 80, 'PROCESSING'],
      ['bob', 42.99, 'COMPLETED']
    ]);
    expect(await firstValueFrom(api.get(1))).toEqual(orders[0]);
    expect(await firstValueFrom(api.totalForCustomer('alice'))).toBe(200.5);
    expect(await firstValueFrom(api.totalForCustomer('Alice'))).toBe(0);
    expect(await firstValueFrom(api.totalForCustomer('nobody'))).toBe(0);
  });

  it('creates pending orders and updates their status', async () => {
    const response = await firstValueFrom(http.post<Order>('/api/orders', {
      customer: 'Ann & Co',
      amount: 99.99,
      status: 'COMPLETED'
    }, { observe: 'response' }));

    expect(response.status).toBe(201);
    expect(response.body?.status).toBe('PENDING');
    expect(response.body?.createdAt).toBeTruthy();
    expect(await firstValueFrom(api.totalForCustomer('Ann & Co'))).toBe(99.99);
    const updated = await firstValueFrom(api.updateStatus(response.body!.id, 'PROCESSING'));
    expect(updated.status).toBe('PROCESSING');
    expect((await firstValueFrom(api.get(updated.id))).status).toBe('PROCESSING');
  });

  it('rejects invalid input and missing orders with HTTP errors', async () => {
    await expectAsync(firstValueFrom(api.create({ customer: '   ', amount: 10 })))
      .toBeRejectedWith(jasmine.objectContaining({ status: 400 }));
    await expectAsync(firstValueFrom(api.create({ customer: 'carol', amount: 0 })))
      .toBeRejectedWith(jasmine.objectContaining({ status: 400 }));
    await expectAsync(firstValueFrom(api.get(999)))
      .toBeRejectedWith(jasmine.objectContaining({ status: 404 }));
    await expectAsync(firstValueFrom(api.updateStatus(999, 'COMPLETED')))
      .toBeRejectedWith(jasmine.objectContaining({ status: 404 }));
    await expectAsync(firstValueFrom(http.patch('/api/orders/1/status?status=UNKNOWN', null)))
      .toBeRejectedWith(jasmine.objectContaining({ status: 400 }));
    await expectAsync(firstValueFrom(http.get('/api/orders/customer/%ZZ/total')))
      .toBeRejectedWith(jasmine.objectContaining({ status: 400 }));
  });

  it('returns copies rather than exposing the in-memory store', async () => {
    const first = await firstValueFrom(api.get(1));
    first.customer = 'changed';

    expect((await firstValueFrom(api.get(1))).customer).toBe('alice');
  });
});
