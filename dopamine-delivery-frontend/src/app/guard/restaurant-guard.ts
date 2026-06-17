import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router'; 
import { DeliveryService } from '../service/delivery-service';
import { RestaurantStateService } from '../service/restaurant-state-service';

export const restaurantGuard: CanActivateFn = (route, state) => {
  const restaurantStateService = inject(RestaurantStateService);
  const router = inject(Router);
  const restaurants = restaurantStateService.restaurants()
  const isRestaurantsNotEmpty = restaurants && Object.keys(restaurants).length > 0;

  if (isRestaurantsNotEmpty) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};