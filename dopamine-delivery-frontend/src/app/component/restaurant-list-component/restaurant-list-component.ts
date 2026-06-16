import { Component, effect, inject, input, output} from '@angular/core';
import { Restaurant } from '../../model/restaurant';
import { DeliveryService } from '../../service/delivery-service';
import { NgStyle } from '@angular/common';
import { MenuService } from '../../service/menu-service';
import { RestaurantStateService } from '../../service/restaurant-state-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurant-list-component',
  imports: [NgStyle],
  templateUrl: './restaurant-list-component.html',
  styleUrl: './restaurant-list-component.css',
})
export class RestaurantListComponent{

  private deliveryService = inject(DeliveryService);
  private menuService = inject(MenuService);
  private router = inject(Router);
  private restaurantStateservice = inject(RestaurantStateService);
  restaurants = this.restaurantStateservice.restaurants;

  startDelivery(restaurant: Restaurant) {
    console.log('start_delivery');
    this.deliveryService.setRestaurant(restaurant);
    this.deliveryService.startDelivery();
  }

  viewMenu(restaurant: Restaurant) {
    // // const cuisineTags = restaurant.tags.cuisine!.split(';');
    // // cuisineTags.forEach(tag => this.menuService.getRestaurantMenu(tag).subscribe());
    this.restaurantStateservice.updateExpandMenuHorizontal(true);
    this.router.navigate(['/dashboard', 'restaurants']);
  }
}
