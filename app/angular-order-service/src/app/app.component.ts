import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { isOrderStatus, Order, OrderSort, ORDER_STATUSES, StatusFilter } from './order';
import { OrderSummary, summarizeOrders, visibleOrders } from './order-view';
import { OrdersApi } from './orders-api.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  @ViewChild('createDialog') createDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('customerInput') customerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('amountInput') amountInput!: ElementRef<HTMLInputElement>;

  readonly statuses = ORDER_STATUSES;
  orders: Order[] = [];
  loading = true;
  loadError = '';
  activity = '';
  lastUpdated: Date | null = null;
  search = '';
  status: StatusFilter = 'ALL';
  sort: OrderSort = 'newest';
  updatingId: number | null = null;
  totalCustomer = 'alice';
  totalResult: { customer: string; value: number } | null = null;
  totalError = '';
  totalLoading = false;
  newCustomer = '';
  newAmount: number | null = null;
  createAttempted = false;
  createError = '';
  submitting = false;

  constructor(private api: OrdersApi) {}

  ngOnInit(): void {
    this.refresh();
  }

  get visible(): Order[] {
    return visibleOrders(this.orders, {
      search: this.search,
      status: this.status,
      sort: this.sort
    });
  }

  get summary(): OrderSummary {
    return summarizeOrders(this.orders);
  }

  get filtersActive(): boolean {
    return Boolean(this.search) || this.status !== 'ALL' || this.sort !== 'newest';
  }

  get customerInvalid(): boolean {
    return this.createAttempted && !this.newCustomer.trim();
  }

  get amountInvalid(): boolean {
    return this.createAttempted
      && (this.newAmount === null || !Number.isFinite(this.newAmount) || this.newAmount < 0.01);
  }

  refresh(announce = false): void {
    this.loadError = '';
    this.loading = this.orders.length === 0;
    this.api.list().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.lastUpdated = new Date();
        this.loading = false;
        if (announce) {
          this.activity = 'Orders refreshed.';
        }
      },
      error: (error: unknown) => {
        this.loading = false;
        this.loadError = this.errorMessage(error);
        this.activity = `Refresh failed: ${this.loadError}`;
      }
    });
  }

  clearFilters(): void {
    this.search = '';
    this.status = 'ALL';
    this.sort = 'newest';
  }

  openCreate(): void {
    this.newCustomer = '';
    this.newAmount = null;
    this.createAttempted = false;
    this.createError = '';
    this.createDialog.nativeElement.showModal();
  }

  closeCreate(): void {
    this.createDialog.nativeElement.close();
  }

  createOrder(): void {
    this.createAttempted = true;
    this.createError = '';
    if (this.customerInvalid) {
      this.customerInput.nativeElement.focus();
      return;
    }
    if (this.amountInvalid || this.newAmount === null) {
      this.amountInput.nativeElement.focus();
      return;
    }

    this.submitting = true;
    this.api.create({ customer: this.newCustomer.trim(), amount: this.newAmount }).subscribe({
      next: (order) => {
        this.orders = [...this.orders, order];
        this.lastUpdated = new Date();
        this.submitting = false;
        this.closeCreate();
        this.activity = `Order #${order.id} created for ${order.customer}.`;
      },
      error: (error: unknown) => {
        this.submitting = false;
        this.createError = this.errorMessage(error);
      }
    });
  }

  changeStatus(order: Order, status: string, control: NgModel): void {
    if (!isOrderStatus(status)) {
      control.control.setValue(order.status, { emitEvent: false });
      this.activity = 'Status update failed: unknown order status.';
      return;
    }
    if (status === order.status) {
      return;
    }

    this.updatingId = order.id;
    this.api.updateStatus(order.id, status).subscribe({
      next: (updated) => {
        this.orders = this.orders.map((item) => item.id === updated.id ? updated : item);
        this.lastUpdated = new Date();
        this.updatingId = null;
        this.activity = `Order #${order.id} moved to ${status.toLowerCase()}.`;
      },
      error: (error: unknown) => {
        control.control.setValue(order.status, { emitEvent: false });
        this.updatingId = null;
        this.activity = `Status update failed: ${this.errorMessage(error)}`;
      }
    });
  }

  lookupTotal(): void {
    const customer = this.totalCustomer.trim();
    this.totalResult = null;
    if (!customer) {
      this.totalError = 'Enter a customer name.';
      return;
    }

    this.totalLoading = true;
    this.totalError = '';
    this.api.totalForCustomer(customer).subscribe({
      next: (value) => {
        this.totalResult = { customer, value };
        this.totalLoading = false;
      },
      error: (error: unknown) => {
        this.totalError = this.errorMessage(error);
        this.totalLoading = false;
      }
    });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body: unknown = error.error;
      if (typeof body === 'object' && body !== null && 'message' in body
          && typeof body.message === 'string') {
        return body.message;
      }
      return `Request failed (${error.status}).`;
    }
    return 'An unexpected error occurred.';
  }
}
