import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { MockOrdersInterceptor } from './mock-orders.interceptor';
import { OrdersApi } from './orders-api.service';

describe('Order workspace', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [FormsModule, HttpClientModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: MockOrdersInterceptor, multi: true }]
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('shows the seeded summary and filters orders by customer', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.summary')?.textContent).toContain('$243.49');
    expect(element.querySelectorAll('tbody th').length).toBe(3);

    fixture.componentInstance.search = 'bob';
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody th').length).toBe(1);
    expect(element.querySelector('tbody')?.textContent).toContain('bob');
  });

  it('shows each current status in its selector and restores it after a failed update', () => {
    const element: HTMLElement = fixture.nativeElement;
    const selectors = Array.from(element.querySelectorAll<HTMLSelectElement>('tbody select'));
    expect(selectors.map((select) => select.value)).toEqual(['COMPLETED', 'PROCESSING', 'PENDING']);

    spyOn(TestBed.inject(OrdersApi), 'updateStatus').and.returnValue(throwError(() => new Error('offline')));
    selectors[0].value = 'PROCESSING';
    selectors[0].dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    expect(selectors[0].value).toBe('COMPLETED');
    expect(element.querySelector('.activity')?.textContent).toContain('Status update failed');
  });

  it('validates and creates an order through the dialog', async () => {
    const element: HTMLElement = fixture.nativeElement;
    const dialog = element.querySelector('dialog')!;
    const open = element.querySelector<HTMLButtonElement>('.button-primary')!;
    open.click();
    fixture.detectChanges();
    expect(dialog.open).toBeTrue();

    const form = dialog.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(dialog.querySelector('#customer-error')?.textContent).toContain('Enter a customer');
    expect(document.activeElement?.id).toBe('new-customer');

    const customer = dialog.querySelector<HTMLInputElement>('#new-customer')!;
    const amount = dialog.querySelector<HTMLInputElement>('#new-amount')!;
    customer.value = 'carol';
    customer.dispatchEvent(new Event('input', { bubbles: true }));
    amount.value = '25.50';
    amount.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(dialog.open).toBeFalse();
    expect(element.querySelector('tbody')?.textContent).toContain('carol');
    expect(element.querySelector('.activity')?.textContent).toContain('Order #4 created');
  });
});
