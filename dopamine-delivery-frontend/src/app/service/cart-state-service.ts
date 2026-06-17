import { effect, Injectable, signal } from '@angular/core';
import { MenuItem } from '../model/menu-item';

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private getStorageJson<T>(key: string, defaultValue: T): T {
    const value = localStorage.getItem(key);
    if (!value || value.trim() === '') {
      return defaultValue;
    }

    return JSON.parse(value)
  }

  private _cart = signal<MenuItem[]>(this.getStorageJson('state_cart',[]));
  cart = this._cart.asReadonly();

  constructor(){
    effect(() => {
      localStorage.setItem('state_cart', JSON.stringify(this._cart()));
    });
  }

  addToCart(item: MenuItem){
    this._cart.update(items => [...items, item]);
  }

  setCart(cart: MenuItem[]){
    this._cart.set(cart);
  }

  clearCart(){
    this._cart.set([]);
  }
}
