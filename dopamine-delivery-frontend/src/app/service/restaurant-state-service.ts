import { Injectable, signal } from '@angular/core';
import { Restaurant } from '../model/restaurant';

@Injectable({
  providedIn: 'root',
})
export class RestaurantStateService {
  private _restaurants = signal<Restaurant[]>([]);
  private _expandMenuHorizontal = signal<boolean>(false);
  private _expandMenuVertical = signal<boolean>(false);

  readonly restaurants = this._restaurants.asReadonly();
  readonly expandMenuHorizontal = this._expandMenuHorizontal.asReadonly();
  readonly expandMenuVertical = this._expandMenuVertical.asReadonly();

  updateRestaurants(data: Restaurant[]) {
    this._restaurants.set(data);
  }

  updateExpandMenuHorizontal(value: boolean){
    this._expandMenuHorizontal.set(value);
  }
  updateExpandMenuVertical(value: boolean){
    this._expandMenuVertical.set(value);
  }
}
