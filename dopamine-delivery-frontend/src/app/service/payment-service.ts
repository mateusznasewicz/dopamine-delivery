import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CartItem } from '../model/cart-item';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  http = inject(HttpClient)

  proceedToPayment(cart: CartItem[]) {
    if (cart.length === 0) return;
    const endpoint = "/api/payment";
    const payload = {items: cart}
    
    this.http.post<{ sessionUrl: string }>(endpoint, payload)
      .subscribe(response => window.location.href = response.sessionUrl);
  }
}
