import { Component, computed, inject } from '@angular/core';
import { CartStateService } from '../../service/cart-state-service';
import { CartItem } from '../../model/cart-item';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService } from '../../service/payment-service';

@Component({
  selector: 'app-payment-component',
  imports: [CurrencyPipe],
  templateUrl: './payment-component.html',
  styleUrl: './payment-component.css',
})
export class PaymentComponent {

  router = inject(Router);
  cartStateService = inject(CartStateService);
  paymentService = inject(PaymentService);
  cart = this.cartStateService.cart;

  cartItems = computed<CartItem[]>(() => {
    const currentCart = this.cart();
    const groups = new Map<string, CartItem>();

    currentCart.forEach(item => {
      const existing = groups.get(item.name);
      if(existing){
        existing.quantity += 1;
        existing.price += item.price;
      } else {
        groups.set(item.name, {
          name: item.name,
          quantity: 1,
          price: item.price
        })
      }

    });

    return Array.from(groups.values());
  });

  totalAmount = computed<number>(() => {
    return this.cart().reduce((sum, item) => sum + item.price, 0);
  });

  goBack() {
    this.router.navigate(['/dashboard', 'menu']);
  }

  proceedToPayment() {
    this.paymentService.proceedToPayment(this.cartItems());
  }

  removeItem(itemName: string) {
    const currentCart = this.cart();
    const index = currentCart.findIndex(item => item.name === itemName);
    
    if (index !== -1) {
      const updatedCart = [...currentCart];
      updatedCart.splice(index, 1);
      
      this.cartStateService.setCart(updatedCart);
    }
  }
}
