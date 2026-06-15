import { inject, Injectable, signal } from '@angular/core';
import { RoutingService } from './routing-service';
import { Address } from '../model/address';
import { Restaurant } from '../model/restaurant';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private routingService = inject(RoutingService);
  
  private _userAddress = signal<Address | null>(null);
  private _selectedRestaurant = signal<Restaurant | null>(null);
  private _routeCoordinates = signal<[number, number][]>([]);

  userAddress = this._userAddress.asReadonly();
  selectedRestaurant = this._selectedRestaurant.asReadonly();
  routeCoordinates = this._routeCoordinates.asReadonly();

  setUserAddress(address: Address): void {
    this._userAddress.set(address);
  }

  setRestaurant(restaurant: Restaurant): void {
    this._selectedRestaurant.set(restaurant);
  }
}
