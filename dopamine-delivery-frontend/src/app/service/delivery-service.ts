import { inject, Injectable, signal } from '@angular/core';
import { Address } from '../model/address';
import { Restaurant } from '../model/restaurant';
import { BehaviorSubject, Observable } from 'rxjs';
import { getLat, getLon } from '../model/restaurant-geometry';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private _userAddress = signal<Address | null>(null);
  private _selectedRestaurant = signal<Restaurant | null>(null);
  private _routeCoordinatesSubject = new BehaviorSubject<[number, number][]>([]);

  userAddress = this._userAddress.asReadonly();
  selectedRestaurant = this._selectedRestaurant.asReadonly();
  routeCoordinates$: Observable<[number, number][]> = this._routeCoordinatesSubject.asObservable();

  setUserAddress(address: Address): void {
    this._userAddress.set(address);
  }

  setRestaurant(restaurant: Restaurant): void {
    this._selectedRestaurant.set(restaurant);
  }

  // startDelivery() {
  //   const origin = this._selectedRestaurant();
  //   const destination = this._userAddress();
  //   console.log(origin);
  //   console.log(destination);
  //   if (!origin || !destination) {
  //     console.warn('Brak restauracji lub adresu użytkownika.');
  //     return;
  //   }

  //   this.routingService.getRoute(
  //     [getLon(origin.geometry), getLat(origin.geometry)], 
  //     [+destination.lon, +destination.lat]
  //   ).subscribe({
  //     next: (coordinates) => {
  //       if (coordinates && coordinates.length > 0) {
  //         console.log(coordinates);
  //         this._routeCoordinatesSubject.next(coordinates); 
  //       }
  //     }
  //   });
  // }
}
