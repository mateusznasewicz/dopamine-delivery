import { Component, computed, effect, inject, input, signal} from '@angular/core';
import { Restaurant } from '../../model/restaurant';
import { DeliveryService } from '../../service/delivery-service';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-restaurant-list-component',
  imports: [NgStyle],
  templateUrl: './restaurant-list-component.html',
  styleUrl: './restaurant-list-component.css',
})
export class RestaurantListComponent{
  private deliveryService = inject(DeliveryService);
  restaurants = input<Restaurant[]>([]);

  startDelivery(restaurant: Restaurant) {
    console.log('start_delivery');
    this.deliveryService.setRestaurant(restaurant);
    this.deliveryService.startDelivery();
  }

}
