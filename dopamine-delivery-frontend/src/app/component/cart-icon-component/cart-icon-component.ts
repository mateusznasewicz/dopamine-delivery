import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartStateService } from '../../service/cart-state-service';

@Component({
  selector: 'app-cart-icon-component',
  imports: [],
  templateUrl: './cart-icon-component.html',
  styleUrl: './cart-icon-component.css',
})
export class CartIconComponent {
  
  cartStateService = inject(CartStateService);
  router = inject(Router);
  isAnimate = signal(false);
  cartCount = computed(() => this.cartStateService.cart().length )

  constructor() {
    effect(() => {
      const count = this.cartCount();
      if (count > 0) {
        this.isAnimate.set(true);

        setTimeout(() => {
          this.isAnimate.set(false);
        }, 300);
      }
    });
  }
  
  openCart() {
    this.router.navigate(['/dashboard', 'payment']);
  }
}
