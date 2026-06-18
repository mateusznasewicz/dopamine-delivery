import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CartItem } from '../model/cart-item';
import { GuestService } from './guest-service';
import { RestaurantStateService } from './restaurant-state-service';
import { DeliveryService } from './delivery-service';
import { Address } from '../model/address';
import { getLat, getLon } from '../model/restaurant-geometry';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  http = inject(HttpClient)
  guestService = inject(GuestService);
  deliveryService = inject(DeliveryService);

  proceedToPayment(cart: CartItem[]) {
    if (cart.length === 0) return;
    const endpoint = "/api/payment";
    const deliveryAddress: Address = this.deliveryService.userAddress()!
    const restaurantCoordinates = this.deliveryService.selectedRestaurant()!.geometry

    const payload = {
      items: cart,
      guestID: this.guestService.guestID(),
      restaurantCoordinates: { lat: getLat(restaurantCoordinates), lng: getLon(restaurantCoordinates) },
      deliveryCoordinates: { lat: deliveryAddress.lat, lng: deliveryAddress.lon }
    }
    
    this.http.post<{ sessionUrl: string }>(endpoint, payload)
      .subscribe(response => window.location.href = response.sessionUrl);
  }
}
