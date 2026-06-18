import { inject, Injectable, signal } from '@angular/core';
import { Address } from '../model/address';
import { Restaurant } from '../model/restaurant';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartStateService } from './cart-state-service';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private _userAddress = signal<Address | null>(null);
  private _selectedRestaurant = signal<Restaurant | null>(null);
  private _routeCoordinatesSubject = new BehaviorSubject<[number, number][]>([]);

  private cartStateService = inject(CartStateService);

  userAddress = this._userAddress.asReadonly();
  selectedRestaurant = this._selectedRestaurant.asReadonly();
  routeCoordinates$: Observable<[number, number][]> = this._routeCoordinatesSubject.asObservable();

  setUserAddress(address: Address): void {
    this._userAddress.set(address);
  }

  setRestaurant(restaurant: Restaurant): void {
    if(this.selectedRestaurant()?.id != restaurant.id){
      this.cartStateService.clearCart();
    }

    this._selectedRestaurant.set(restaurant);
  }
}
