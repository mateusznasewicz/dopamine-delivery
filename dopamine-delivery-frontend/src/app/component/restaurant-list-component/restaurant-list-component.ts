import { Component, effect, inject, input, output} from '@angular/core';
import { Restaurant } from '../../model/restaurant';
import { DeliveryService } from '../../service/delivery-service';
import { NgStyle } from '@angular/common';
import { MenuService } from '../../service/menu-service';
import { RestaurantStateService } from '../../service/restaurant-state-service';
import { Router } from '@angular/router';
import { MenuItem } from '../../model/menu-item';
import { forkJoin, map } from 'rxjs';

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
    this.deliveryService.setRestaurant(restaurant);
    // this.deliveryService.startDelivery();
  }

  viewMenu(restaurant: Restaurant) {
    const menu: { [key: string]: MenuItem[] } = {};
    const cuisineTags = restaurant.properties.other_tags.cuisine!.split(';');

    const requests = cuisineTags.map(tag => 
      this.menuService.getRestaurantMenu(tag).pipe(
        map((items: MenuItem[]) => ({ tag, items }))
      )
    );

    forkJoin(requests).subscribe(results => {      
      results.forEach(res => {
        if(res.items.length > 0){
          menu[res.tag] = res.items;
        }
      });

      this.restaurantStateservice.menu.set(menu);
      this.restaurantStateservice.updateExpandMenuHorizontal(true);
      this.router.navigate(['/dashboard', 'menu']);
    });
  }
}
