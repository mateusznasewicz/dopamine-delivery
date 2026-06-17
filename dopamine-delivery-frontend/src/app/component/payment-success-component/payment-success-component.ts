import { Component, inject, OnInit } from '@angular/core';
import { CartStateService } from '../../service/cart-state-service';

@Component({
  selector: 'app-payment-success-component',
  imports: [],
  templateUrl: './payment-success-component.html',
  styleUrl: './payment-success-component.css',
})
export class PaymentSuccessComponent implements OnInit{
  cartStateService = inject(CartStateService);

  ngOnInit() {
    this.cartStateService.clearCart();
  }
}
