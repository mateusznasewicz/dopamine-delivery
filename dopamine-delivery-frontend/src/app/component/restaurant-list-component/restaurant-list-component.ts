import { Component, inject, input, output} from '@angular/core';
import { Restaurant } from '../../model/restaurant';
import { DeliveryService } from '../../service/delivery-service';
import { NgStyle } from '@angular/common';
import { MenuService } from '../../service/menu-service';

@Component({
  selector: 'app-restaurant-list-component',
  imports: [NgStyle],
  templateUrl: './restaurant-list-component.html',
  styleUrl: './restaurant-list-component.css',
})
export class RestaurantListComponent{

  private deliveryService = inject(DeliveryService);
  private menuService = inject(MenuService);
  restaurants = input<Restaurant[]>([]);
  expandMenu = output<void>();

  startDelivery(restaurant: Restaurant) {
    console.log('start_delivery');
    this.deliveryService.setRestaurant(restaurant);
    this.deliveryService.startDelivery();
  }

    viewMenu(restaurant: Restaurant) {
      const cuisineTags = restaurant.tags.cuisine!.split(';');
      cuisineTags.forEach(tag => this.menuService.getRestaurantMenu(tag).subscribe());
      this.expandMenu.emit();
    }
}
