import { Component, computed, inject } from '@angular/core';
import { RestaurantStateService } from '../../service/restaurant-state-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurant-menu-component',
  imports: [],
  templateUrl: './restaurant-menu-component.html',
  styleUrl: './restaurant-menu-component.css',
})
export class RestaurantMenuComponent {
  restaurantStateService = inject(RestaurantStateService)
  menu = this.restaurantStateService.menu;
  menuCategories = computed(() => {console.log(this.menu()); return Object.entries(this.menu());});
  router = inject(Router);
  
  goBack() {
    this.router.navigate(['/dashboard', 'restaurants']); 
  }
}
