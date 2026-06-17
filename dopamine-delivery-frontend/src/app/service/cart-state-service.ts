import { Injectable, signal } from '@angular/core';
import { MenuItem } from '../model/menu-item';

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private _cart = signal<MenuItem[]>([]);
  cart = this._cart.asReadonly();

  addToCart(item: MenuItem){
    this._cart.update(items => [...items, item]);
  }
}
