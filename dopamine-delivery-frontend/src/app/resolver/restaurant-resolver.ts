import { ResolveFn } from '@angular/router';
import { DeliveryService } from '../service/delivery-service';
import { GeocodingService } from '../service/geocoding-service';
import { inject } from '@angular/core';
import { of } from 'rxjs';

export const restaurantResolver: ResolveFn<any[]> = (route, state) => {
  const deliveryService = inject(DeliveryService);
  const restaurantService = inject(GeocodingService);

  const address = deliveryService.userAddress();
  if (!address) {
    return of([]);
  }

  return restaurantService.getRestaurantsNearby(+address.lat, +address.lon, 5000);
};
