import { Component, computed, effect, inject, signal } from '@angular/core';
import { RestaurantStateService } from '../../service/restaurant-state-service';
import { Router } from '@angular/router';
import { CartStateService } from '../../service/cart-state-service';
import { CartIconComponent } from '../cart-icon-component/cart-icon-component';

@Component({
  selector: 'app-restaurant-menu-component',
  imports: [CartIconComponent],
  templateUrl: './restaurant-menu-component.html',
  styleUrl: './restaurant-menu-component.css',
})
export class RestaurantMenuComponent {

  restaurantStateService = inject(RestaurantStateService)
  cartStateService = inject(CartStateService);
  router = inject(Router);

  menu = this.restaurantStateService.menu;
  menuCategories = computed(() => Object.entries(this.menu()));
  
  goBack() {
    this.router.navigate(['/dashboard', 'restaurants']); 
  }
}
